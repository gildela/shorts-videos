#!/usr/bin/env python3
"""Fábrica de Animaciones — órdenes para hacer un vídeo animado de principio a fin (Mac y Windows).

    fabrica comprobar                       ¿está todo instalado y configurado?
    fabrica panel [--sin-abrir]             abre el panel en el navegador (acompaña al usuario de principio a fin)
    fabrica escuchar                        espera (hasta 9 min) a que el usuario decida algo en el panel y lo imprime
    fabrica ideas                           el banco de ideas de cada estilo, con su número y su dato
    fabrica nuevo <id> --estilo E --idea N [--formato largo|corto]   crea el vídeo (src/videos/<id>/) desde la plantilla del estilo
    fabrica guion <id>                      valida el guion (src/videos/<id>/guion.md) y lo publica en el panel
    fabrica voz <id> [--voz ID] [--modelo M] la voz automática con ElevenLabs (palabras con su segundo, sin Whisper)
    fabrica voz <id> --motor omnivoice [--ref audio.wav --ref-texto "…" | --instruct "male, low pitch"]
                                            la voz con OmniVoice (gratis, en esta máquina) + Whisper para los tiempos
    fabrica voz-id [<id>]                   la voz de ElevenLabs por defecto
    fabrica voz-manual <id>                 coge el audio que el usuario dejó en «Pon aquí tu voz»
    fabrica transcribir <id>                cada palabra con su segundo (para anclar los planos a la voz)
    fabrica fotos <id>                      los fotogramas clave (6-8) de src/videos/<id>/escenas.json, uno a uno
    fabrica planos <id> [--provisional]     vídeos largos de palitos: comprueba src/videos/<id>/planos.tsv contra la voz,
                                            escribe los tiempos de cada sección y (con --provisional) sus archivos
    fabrica revisar <id> "<s1,s2,…>" [--carpeta X]   hoja de fotos de esos segundos (salida/revisar/X/hoja.jpg)
    fabrica render <id>                     el vídeo final, con la voz pegada y a volumen de YouTube, en «Vídeos listos»
    fabrica estado <paso> [--texto …]       cambia a mano el paso que ve el panel
    fabrica error "<título>" "<frase>"      deja un error en llano en el panel (con la frase para pegar en Claude)
    fabrica canal "<nombre>"                el nombre que sale en la cabecera del vídeo (ARCHIVO 001 // TU CANAL)
    fabrica claves                          SOLO Fábrica completa: guardar la clave de ElevenLabs

Los vídeos del usuario viven en src/videos/<id>/ (guion.md, Video.tsx, escenas.json, subir.txt) y public/videos/<id>/ (voz).
"""
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import estado  # noqa: E402

for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8")
    except Exception:
        pass

RAIZ = Path(__file__).resolve().parents[1]
CONFIG = RAIZ / "config"
CLAVES = CONFIG / "claves.env"
AJUSTES = CONFIG / "ajustes.json"
ESTILOS = RAIZ / "estilos"
VIDEOS = RAIZ / "src" / "videos"
PUBLICO = RAIZ / "public" / "videos"
SALIDA = RAIZ / "salida"
# En la nube los vídeos terminados van a la carpeta compartida del proyecto (sobrevive a cada sesión).
_COMPARTIDA = Path("/mnt/project-files")
LISTOS = Path(os.environ["FABRICA_LISTOS"]) if os.environ.get("FABRICA_LISTOS") else (
    _COMPARTIDA / "Vídeos listos" if _COMPARTIDA.is_dir() else RAIZ / "Vídeos listos")
TU_VOZ = RAIZ / "Pon aquí tu voz"
GRATIS = estado.gratis()
WINDOWS = os.name == "nt"
FPS = 30
COMUNIDAD = "https://www.skool.com/ccia"
PPM = 139  # palabras por minuto de la voz plana del estilo Archivo (medido en el vídeo de referencia)


# ---------------------------------------------------------------- utilidades
def fallo(msg, frase=None, titulo=None):
    """Error en consola Y en el panel (en llano, con la frase que el usuario puede pegar en Claude)."""
    print("\n✗ " + msg)
    estado.error(titulo or "Algo ha fallado", frase or f"Ha fallado esto: {msg.splitlines()[0][:160]}. Arréglalo y sigue.", msg)
    sys.exit(1)


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        fallo("No encuentro ffmpeg. Vuelve a ejecutar el instalador.")


def npx():
    exe = shutil.which("npx.cmd" if WINDOWS else "npx") or shutil.which("npx")
    if not exe:
        fallo("No encuentro Node (npx). Vuelve a ejecutar el instalador.")
    return exe


def duracion(audio):
    import av

    with av.open(str(audio)) as c:
        return float(c.duration / 1_000_000) if c.duration else 0.0


def id_valido(id_):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,40}", id_ or ""):
        fallo("El nombre del vídeo solo puede tener letras minúsculas sin tilde, números y guiones (ej.: pasos-techo).")
    return id_


def normal(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", s)


def opcion(args, nombre, por_defecto=None):
    if nombre in args:
        i = args.index(nombre)
        return args[i + 1] if i + 1 < len(args) else por_defecto
    return por_defecto


def leer_claves():
    """Claves de ElevenLabs: primero las variables de entorno (en la nube, las del entorno), luego config/claves.env."""
    d = {k: os.environ[k] for k in ("ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "ELEVENLABS_MODEL") if os.environ.get(k)}
    if CLAVES.exists():
        for linea in CLAVES.read_text(encoding="utf-8").splitlines():
            linea = linea.strip()
            if linea and not linea.startswith("#") and "=" in linea:
                k, v = linea.split("=", 1)
                d.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return d


VOZ_POR_DEFECTO = "6xftrpatV0jGmFHxDjUv"  # «Martin Osborne 1»: castellano, grave y pausado (cámbiala con  fabrica voz-id <id>)


def voz_elegida(c=None):
    c = c if c is not None else leer_claves()
    return c.get("ELEVENLABS_VOICE_ID") or ajustes().get("voz_id") or VOZ_POR_DEFECTO


def navegador():
    """Chrome para Remotion: REMOTION_BROWSER o el Chromium que trae la nube."""
    if os.environ.get("REMOTION_BROWSER"):
        return os.environ["REMOTION_BROWSER"]
    # primero el «headless shell» (con el Chrome completo, los renders largos se quedaban colgados en la nube)
    for patron in ("/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux*/chrome-headless-shell", "/opt/pw-browsers/chromium-*/chrome-linux*/chrome"):
        hallados = sorted(Path("/").glob(patron.lstrip("/")))
        if hallados:
            return str(hallados[-1])
    return None


def ajustes():
    d = {"canal": "TU CANAL"}
    if AJUSTES.exists():
        try:
            d.update(json.loads(AJUSTES.read_text(encoding="utf-8")))
        except ValueError:
            pass
    return d


# ---------------------------------------------------------------- estilos e ideas
def estilos():
    lista = []
    for f in sorted(ESTILOS.glob("*/estilo.json")):
        e = json.loads(f.read_text(encoding="utf-8"))
        e["carpeta"] = f.parent
        lista.append(e)
    if not lista:
        fallo("No hay ningún estilo en estilos/. Vuelve a ejecutar el instalador.")
    return lista


def estilo(id_):
    e = next((x for x in estilos() if x["id"] == id_), None)
    if not e:
        fallo(f"No existe el estilo «{id_}». Los que hay: {', '.join(x['id'] for x in estilos())}.")
    return e


def ideas(id_estilo=None):
    """Banco de ideas de cada estilo (IDEAS.md, ARQUITECTURA.md §7). En la gratis solo cuentan las de «Se puede ya»."""
    lista = []
    for e in estilos():
        if id_estilo and e["id"] != id_estilo:
            continue
        f = e["carpeta"] / "IDEAS.md"
        if not f.exists():
            continue
        seccion = None
        for linea in f.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^## (.+?)(?: \((.+)\))?\s*$", linea)
            if m:
                seccion = {"titulo": m.group(1).strip(), "formato": (m.group(2) or "corto").strip().lower()}
                continue
            m = re.match(r"^(\d+)\.\s+\*\*(.+?)\*\*\s+—\s+(.+)$", linea.strip())
            if m and seccion:
                dato = m.group(3).strip()
                ejemplo = re.search(r"\(Hecho: `([^`]+)`[^)]*\)", dato)
                dato = re.sub(r"\s*\(Hecho: `[^`]+`[^)]*\)", "", dato).strip()
                icono = re.search(r"\(Icono: ([a-z0-9-]+)\)", dato)
                dato = re.sub(r"\s*\(Icono: [a-z0-9-]+\)", "", dato).strip()
                fuentes = []
                if "· Fuentes:" in dato or "Fuentes:" in dato:
                    dato, _, fu = dato.partition("Fuentes:")
                    dato = dato.rstrip(" ·").strip()
                    fuentes = [u.strip() for u in re.split(r"[,\s]+", fu) if u.strip().startswith("http")]
                gratis_ok = seccion["titulo"].lower().startswith("se puede ya")
                lista.append({
                    "n": int(m.group(1)), "estilo": e["id"], "titulo": m.group(2).strip(), "dato": dato, "fuentes": fuentes,
                    "formato": seccion["formato"], "ejemplo": ejemplo.group(1) if ejemplo else None, "icono": icono.group(1) if icono else None,
                    "bloqueado": GRATIS and not gratis_ok,
                })
    return lista


def estilo_de_video(id_):
    """El estilo de un vídeo: el de su idea.json o, si es el ejemplo de un estilo (no lleva idea.json), ese estilo."""
    f = VIDEOS / id_ / "idea.json"
    if f.exists():
        try:
            return estilo(json.loads(f.read_text(encoding="utf-8"))["estilo"])
        except (ValueError, KeyError):
            pass
    return next((e for e in estilos() if e.get("ejemplo") == id_), {})


def factor_montaje(e):
    """Minutos de montaje por minuto de vídeo en ESTE ordenador con ESTE estilo: lo último medido aquí con el estilo; si
    no, lo medido en otro estilo escalado por cómo de rápido es este ordenador; si no, lo que dice estilo.json."""
    d = estado.leer()
    por_estilo = d.get("calibracion_estilos") or {}
    plataforma = "windows" if WINDOWS else "mac"
    base = (e.get("render_factor") or {}).get(plataforma) or (10 if WINDOWS else 4)
    if e.get("id") in por_estilo:
        return por_estilo[e["id"]]["render_factor"]
    for otro_id, med in por_estilo.items():  # este ordenador ya ha montado otro estilo: cuánto más rápido o lento va
        otro = next((x for x in estilos() if x["id"] == otro_id), None)
        ref = (otro or {}).get("render_factor", {}).get(plataforma)
        if ref:
            return round(base * med["render_factor"] / ref, 2)
    return base


def idea_permitida(id_estilo, n):
    i = next((x for x in ideas(id_estilo) if x["n"] == n), None)
    if i is None:
        return None, "esa idea no está en la lista"
    if i["bloqueado"]:
        return None, "esa idea es de la comunidad"
    e = estilo(id_estilo)
    if GRATIS and "gratis" not in e.get("niveles", []):
        return None, "ese estilo es de la comunidad"
    return i, None


# ---------------------------------------------------------------- comprobar
def cmd_comprobar(args):
    ok = True

    def linea(bien, texto):
        nonlocal ok
        ok = ok and bien
        print(("  ✓ " if bien else "  ✗ ") + texto)

    print("Fábrica de Animaciones" + (" (plantilla gratis)" if GRATIS else "") + " — comprobación\n")
    node = shutil.which("node")
    linea(bool(node), f"Node: {node or 'no encontrado'}")
    linea((RAIZ / "node_modules" / "remotion").exists(), "Motor de vídeo (Remotion) instalado")
    linea(bool(shutil.which("ffmpeg")) or _hay_modulo("imageio_ffmpeg"), "ffmpeg")
    linea(_hay_modulo("av"), "Lectura de audio (av)")
    print(("  ✓ " if _hay_modulo("faster_whisper") else "  · ") + "Transcripción local (faster-whisper): " + ("instalada" if _hay_modulo("faster_whisper") else "no hace falta con la voz automática; solo para voz-manual"))
    linea(bool(navegador()), f"Navegador para dibujar: {navegador() or 'no encontrado (pon REMOTION_BROWSER)'}")
    print(f"  · Los vídeos terminados van a: {LISTOS}")
    for e in estilos():
        motor = (e["carpeta"] / "motor").exists() or (e.get("biblioteca") and (RAIZ / "src" / "estilos" / e["biblioteca"]).exists())
        linea(bool(motor) and (e["carpeta"] / "LEEME.md").exists() and (e["carpeta"] / "plantilla" / "Video.tsx").exists(), f"Estilo «{e['nombre']}» ({e['id']})")
    linea(True, f"Canal en la cabecera: {ajustes()['canal']}")
    if not GRATIS:
        c = leer_claves()
        hay = bool(c.get("ELEVENLABS_API_KEY"))
        print(("  ✓ " if hay else "  ✗ ") + "Clave de ElevenLabs (ELEVENLABS_API_KEY): " + ("puesta" if hay else "falta; ponla como variable del entorno de la nube"))
        print("  ✓ Voz de ElevenLabs: " + voz_elegida(c))
    else:
        linea(True, f"Voz: a mano (déjala en la carpeta «{TU_VOZ.name}»)")
    print("\n" + ("Todo listo." if ok else "Falta algo: vuelve a ejecutar el instalador."))
    sys.exit(0 if ok else 1)


def _hay_modulo(nombre):
    try:
        __import__(nombre)
        return True
    except Exception:
        return False


# ---------------------------------------------------------------- ideas, nuevo, guion
def cmd_ideas(args):
    for e in estilos():
        print(f"\n== {e['nombre']} ({e['id']}) ==")
        for i in ideas(e["id"]):
            marca = " [comunidad]" if i["bloqueado"] else (" (hecho: " + i["ejemplo"] + ")" if i["ejemplo"] else "")
            print(f"{i['n']:>2}. {i['titulo']}{marca}\n    Dato: {i['dato']}")


def cmd_nuevo(args):
    id_ = id_valido(args[0] if args else "")
    id_estilo = opcion(args, "--estilo", estilos()[0]["id"])
    e = estilo(id_estilo)
    n = opcion(args, "--idea")
    tema = opcion(args, "--tema")
    idea = None
    if n is not None:
        idea, por_que = idea_permitida(id_estilo, int(n))
        if idea is None:
            fallo(f"No se puede hacer esa idea: {por_que}. " + (f"En la comunidad sí: {COMUNIDAD}" if GRATIS else ""), titulo="Esa idea no está en la lista", frase="Elige una idea de la lista del panel.")
    elif GRATIS:
        fallo(f"En la plantilla gratis el vídeo tiene que ser una idea de la lista: fabrica nuevo {id_} --estilo {id_estilo} --idea N (ver fabrica ideas). Las ideas propias están en la comunidad: {COMUNIDAD}", titulo="Las ideas propias son de la comunidad", frase="Elige una idea de la lista del panel.")
    elif tema:
        idea = {"n": 0, "titulo": tema, "dato": "", "fuentes": []}
    formato = opcion(args, "--formato")
    formatos = e.get("formatos", {})
    if formato and formato not in formatos:
        fallo(f"El estilo «{id_estilo}» no tiene el formato «{formato}». Tiene: {', '.join(formatos)}.")
    if formato and GRATIS and "gratis" not in formatos[formato].get("niveles", []):
        fallo(f"El formato «{formato}» es de la comunidad: {COMUNIDAD}", titulo="Ese formato es de la comunidad", frase="Haz el vídeo en el formato de la plantilla gratis.")
    carpeta = VIDEOS / id_
    if carpeta.exists():
        fallo(f"Ya existe el vídeo «{id_}».")
    plantilla = e["carpeta"] / "plantilla"
    if not (plantilla / "Video.tsx").exists():
        fallo(f"Al estilo «{id_estilo}» le falta plantilla/Video.tsx.")
    carpeta.mkdir(parents=True)
    # la plantilla entera (Video.tsx y, en los estilos de palitos, comun.tsx y las secciones), con su id puesto
    for f_ in sorted(plantilla.rglob("*")):
        if f_.is_file() and f_.name != ".DS_Store":
            destino = carpeta / f_.relative_to(plantilla)
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(f_.read_text(encoding="utf-8").replace("__ID__", id_), encoding="utf-8")
    (carpeta / "guion.md").write_text("", encoding="utf-8")
    nombres = e.get("escenas") or ["Gancho", "Archivo", "Regla 1", "Dato", "Regla 3", "Regla 5", "Giro", "Cierre"]
    (carpeta / "escenas.json").write_text(json.dumps([{"nombre": n_, "en": ""} for n_ in nombres], ensure_ascii=False, indent=1), encoding="utf-8")
    (carpeta / "subir.txt").write_text("TÍTULO\n\nDESCRIPCIÓN\n", encoding="utf-8")
    (carpeta / "fuentes.md").write_text(f"# Fuentes del vídeo «{id_}»\n\n- (cada dato con su fuente)\n", encoding="utf-8")
    (carpeta / "idea.json").write_text(json.dumps({"estilo": id_estilo, "idea": idea, "formato": formato}, ensure_ascii=False, indent=1), encoding="utf-8")
    (PUBLICO / id_).mkdir(parents=True, exist_ok=True)
    # tiempos provisionales hasta que llegue la voz: sin ellos el import de voz.tiempos.json rompe TODOS los vídeos
    # (Remotion junta todas las composiciones), y un vídeo a medias dejaría la fábrica entera sin poder dibujar
    provisional = PUBLICO / id_ / "voz.tiempos.json"
    if not provisional.exists():
        provisional.write_text(json.dumps({"provisional": True, "duracion": 1.0, "capitulos": [], "frases": [], "palabras": []}), encoding="utf-8")
    # registrar la composición
    lista = VIDEOS / "lista.ts"
    s = lista.read_text(encoding="utf-8")
    var = "v_" + id_.replace("-", "_")
    s = s.replace("\nexport const VIDEOS", f'import * as {var} from "./{id_}/Video";\n\nexport const VIDEOS', 1).replace(";\n\nimport * as", ";\nimport * as")
    s = s.replace("  // ← fabrica nuevo añade aquí", f"  {{ id: {var}.ID, duracion: {var}.DURACION, Video: {var}.Video }},\n  // ← fabrica nuevo añade aquí", 1)
    lista.write_text(s, encoding="utf-8")
    estado.nuevo_video(id_, id_estilo, idea)
    # en un lote (pedido del panel), este vídeo es el siguiente que falta: se apunta para que el panel lo enseñe
    lote = estado.leer().get("lote")
    if lote and not lote.get("terminado"):
        pendiente = next((k for k, it in enumerate(lote["items"]) if not it.get("video_id")), None)
        if pendiente is not None:
            lote["items"][pendiente]["video_id"] = id_
            lote["actual"] = pendiente
            estado.poner(lote=lote)
    print(f"✓ Vídeo «{id_}» creado en src/videos/{id_}/ (estilo {e['nombre']}" + (f", idea {idea['n']}: {idea['titulo']}" if idea else "") + ")")
    print(f"  Siguiente: escribe el guion en src/videos/{id_}/guion.md (ver estilos/{id_estilo}/GUION.md) y ejecuta  fabrica guion {id_}")


PAUSA = re.compile(r"^\s*\[pausa\s+([\d.,]+)\]\s*$", re.IGNORECASE)


def leer_guion(id_):
    f = VIDEOS / id_ / "guion.md"
    if not f.exists() or not f.read_text(encoding="utf-8").strip():
        fallo(f"El guion está vacío: src/videos/{id_}/guion.md")
    texto = f.read_text(encoding="utf-8")
    parrafos, pausas, actual = [], [], []
    for linea in texto.splitlines():
        m = PAUSA.match(linea)
        if m:
            if actual:
                parrafos.append(" ".join(actual))
                actual = []
            pausas.append(min(3.0, float(m.group(1).replace(",", "."))))
            parrafos.append(("__pausa__", pausas[-1]))
        elif linea.strip():
            if linea.strip().startswith("#"):
                continue
            actual.append(linea.strip())
        elif actual:
            parrafos.append(" ".join(actual))
            actual = []
    if actual:
        parrafos.append(" ".join(actual))
    solo_texto = [p for p in parrafos if not isinstance(p, tuple)]
    palabras = [w for p in solo_texto for w in p.split()]
    return parrafos, solo_texto, palabras, pausas


def texto_elevenlabs(parrafos):
    """El guion tal y como se pega en ElevenLabs: las marcas [pausa N] pasan a <break time="N.Ns" />."""
    salida = []
    for p in parrafos:
        if isinstance(p, tuple):
            if salida:
                salida[-1] = salida[-1] + f' <break time="{p[1]:.1f}s" />'
            else:
                salida.append(f'<break time="{p[1]:.1f}s" />')
        else:
            salida.append(p)
    return "\n\n".join(salida)


def cmd_guion(args):
    id_ = id_valido(args[0] if args else "")
    e = estilo(json.loads((VIDEOS / id_ / "idea.json").read_text(encoding="utf-8"))["estilo"]) if (VIDEOS / id_ / "idea.json").exists() else estilos()[0]
    parrafos, solo_texto, palabras, pausas = leer_guion(id_)
    formatos = e.get("formatos", {})
    permitidos = [k for k, v in formatos.items() if (not GRATIS) or "gratis" in v.get("niveles", [])] or list(formatos)
    elegido = json.loads((VIDEOS / id_ / "idea.json").read_text(encoding="utf-8")).get("formato") if (VIDEOS / id_ / "idea.json").exists() else None
    nombre_formato = elegido if elegido in permitidos else next((k for k in permitidos if formatos[k].get("palabras", [0, 10**6])[0] <= len(palabras) <= formatos[k].get("palabras", [0, 10**6])[1]), permitidos[0] if permitidos else "largo")
    formato = formatos.get(nombre_formato, {})
    lo, hi = formato.get("palabras", [800, 1300])
    avisos = []
    if len(palabras) < lo or len(palabras) > hi:
        avisos.append(f"el guion tiene {len(palabras)} palabras y el formato pide entre {lo} y {hi}")
    if not pausas and e.get("pausas", True):
        avisos.append("no hay ninguna marca [pausa N] (el estilo necesita silencios de 1,5-3 s entre bloques)")
    duracion_est = round(len(palabras) / e.get("ppm", PPM) * 60 + sum(pausas))
    estado.poner(paso="guion", formato=nombre_formato, guion={
        "texto_md": (VIDEOS / id_ / "guion.md").read_text(encoding="utf-8"),
        "parrafos": [p if not isinstance(p, tuple) else {"pausa": p[1]} for p in parrafos],
        "texto_elevenlabs": texto_elevenlabs(parrafos),
        "palabras": len(palabras), "duracion_estimada": duracion_est, "avisos": avisos,
    }, error=None)
    print(f"✓ Guion publicado en el panel: {len(palabras)} palabras, {len(pausas)} pausas, ≈ {duracion_est // 60}:{duracion_est % 60:02d}")
    for a in avisos:
        print("  ⚠ " + a)
    print("  Siguiente: fabrica escuchar (el usuario dirá «Me vale» o pedirá un cambio)")


# ---------------------------------------------------------------- voz
def cmd_voz(args):
    """Voz automática: ElevenLabs lee el guion bloque a bloque, con las pausas exactas y el segundo de cada palabra."""
    if GRATIS:
        fallo(f"La voz automática es de la Fábrica completa de la comunidad: {COMUNIDAD}. Aquí la voz va a mano: déjala en «{TU_VOZ.name}» y usa  fabrica voz-manual <id>", titulo="La voz automática es de la comunidad", frase="Haz la voz a mano con ElevenLabs y déjala en la carpeta «Pon aquí tu voz».")
    import voz as voz_mod  # herramientas/voz.py

    id_ = id_valido(args[0] if args else "")
    parrafos, _, guion, _ = leer_guion(id_)
    motor = (opcion(args, "--motor") or ajustes().get("motor_voz") or "elevenlabs").lower()
    if motor == "omnivoice":
        return _voz_omnivoice(id_, parrafos, args)
    if motor != "elevenlabs":
        fallo(f"No conozco el motor de voz «{motor}». Usa --motor elevenlabs o --motor omnivoice.")
    c = leer_claves()
    if not c.get("ELEVENLABS_API_KEY"):
        fallo("Falta la clave de ElevenLabs: ponla como variable ELEVENLABS_API_KEY en el entorno de la nube (o en config/claves.env).", titulo="Falta la clave de ElevenLabs", frase="Pon la clave de ElevenLabs en el entorno y vuelve a pedir la voz.")
    voz_id = opcion(args, "--voz") or voz_elegida(c)
    modelo = opcion(args, "--modelo") or c.get("ELEVENLABS_MODEL") or voz_mod.MODELO
    (PUBLICO / id_).mkdir(parents=True, exist_ok=True)
    original = PUBLICO / id_ / "voz_original.mp3"
    n_bloques = len(voz_mod.bloques(parrafos))
    inicio = time.time()
    estado.poner(paso="voz_recibida", trabajando=True, progreso={"texto": "Generando la voz", "hecho": 0, "total": n_bloques, "inicio": inicio, "estimado": 8 * n_bloques})
    print(f"Generando la voz con ElevenLabs ({len(guion)} palabras en {n_bloques} bloques, voz {voz_id}, modelo {modelo})…", flush=True)

    def aviso(i, n, texto):
        print(f"  · Bloque {i + 1} de {n} ({len(texto.split())} palabras)", flush=True)
        estado.poner(progreso={"texto": f"Generando la voz · bloque {i + 1} de {n}", "hecho": i, "total": n, "inicio": inicio, "estimado": 8 * n})

    try:
        palabras, total = voz_mod.generar(parrafos, c["ELEVENLABS_API_KEY"], voz_id, original, modelo=modelo, aviso=aviso)
    except voz_mod.ErrorVoz as e:
        fallo(str(e), titulo="ElevenLabs no ha podido hacer la voz", frase=f"Ha fallado fabrica voz {id_}: {str(e)[:120]}")
    # a −20 LUFS (la música y los efectos del estilo están medidos para eso); no mueve ningún tiempo
    final = PUBLICO / id_ / "voz.mp3"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(original), "-af", "loudnorm=I=-20:TP=-2:LRA=11", "-ar", "44100", "-b:a", "192k", str(final)], check=True)
    shutil.copy(final, PUBLICO / id_ / "voz_norm.mp3")
    if len(palabras) != len(guion):
        fallo(f"La voz tiene {len(palabras)} palabras y el guion {len(guion)}: no cuadran.")
    estado.poner(voz={"archivo": original.name, "duracion": round(total, 1), "dice_el_guion": True, "faltan": [], "voz_id": voz_id, "modelo": modelo})
    guardar_tiempos(id_, palabras, total)
    print(f"✓ Voz lista: public/videos/{id_}/voz.mp3 ({total:.1f} s, {len(palabras)} palabras con su segundo)")
    print(f"  Transcripción: src/videos/{id_}/transcripcion.txt · Siguiente: escribe las escenas y ejecuta  fabrica fotos {id_}")


def _voz_omnivoice(id_, parrafos, args):
    """OmniVoice (gratis, en esta máquina): la voz bloque a bloque y luego Whisper para el segundo de cada palabra."""
    import voz_omnivoice as om

    conf = ajustes().get("omnivoice") or {}
    ref = opcion(args, "--ref") or conf.get("ref_audio")
    ref_texto = opcion(args, "--ref-texto") or conf.get("ref_texto")
    instruct = opcion(args, "--instruct") or conf.get("instruct")
    if ref and not Path(ref).is_absolute():
        ref = str(RAIZ / ref)
    (PUBLICO / id_).mkdir(parents=True, exist_ok=True)
    original = PUBLICO / id_ / "voz_original.mp3"
    n = len(om.bloques(parrafos))
    inicio = time.time()
    estado.poner(paso="voz_recibida", trabajando=True, progreso={"texto": "Generando la voz (OmniVoice)", "hecho": 0, "total": n, "inicio": inicio, "estimado": 30 * n})
    print(f"Generando la voz con OmniVoice ({n} bloques, " + (f"copiando {Path(ref).name}" if ref else f"diseñada: {instruct}") + ")…", flush=True)

    def aviso(i, total, texto):
        print(f"  · Bloque {i + 1} de {total} ({len(texto.split())} palabras) · {time.time() - inicio:.0f} s", flush=True)
        estado.poner(progreso={"texto": f"Generando la voz · bloque {i + 1} de {total}", "hecho": i, "total": total, "inicio": inicio, "estimado": 30 * total})

    try:
        total = om.generar(parrafos, original, ref_audio=ref, ref_texto=ref_texto, instruct=None if ref else instruct, aviso=aviso)
    except om.ErrorVoz as e:
        fallo(str(e), titulo="OmniVoice no ha podido hacer la voz", frase=f"Ha fallado fabrica voz {id_} --motor omnivoice: {str(e)[:120]}")
    print(f"✓ Voz generada ({total:.1f} s en {time.time() - inicio:.0f} s). Ahora, el segundo de cada palabra (Whisper)…", flush=True)
    _preparar_voz(id_, original, original.name)


def guardar_tiempos(id_, palabras, total):
    """voz.tiempos.json + transcripcion.txt a partir de las palabras del guion con su segundo (ARQUITECTURA §8)."""
    frases, actual, ini = [], [], None
    for p in palabras:
        if ini is None:
            ini = p["ini"]
        actual.append(p["p"])
        if re.search(r"[.?!…]$", p["p"]):
            frases.append({"texto": " ".join(actual), "ini": ini, "fin": p["fin"]})
            actual, ini = [], None
    if actual:
        frases.append({"texto": " ".join(actual), "ini": ini, "fin": palabras[-1]["fin"]})
    datos = {"duracion": round(total, 2), "capitulos": [], "frases": frases, "palabras": palabras}
    (PUBLICO / id_ / "voz.tiempos.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    (VIDEOS / id_ / "transcripcion.txt").write_text("\n".join(f"[{f['ini']:7.2f}] {f['texto']}" for f in frases) + "\n", encoding="utf-8")
    estado.poner(trabajando=False, progreso=None, paso="voz_recibida")


def cmd_voz_id(args):
    """Elige la voz de ElevenLabs por defecto (se guarda en config/ajustes.json)."""
    if not args:
        print(f"Voz actual: {voz_elegida()}\nUso: fabrica voz-id <id de la voz de ElevenLabs>")
        return
    d = ajustes()
    d["voz_id"] = args[0].strip()
    CONFIG.mkdir(exist_ok=True)
    AJUSTES.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ Voz por defecto: {d['voz_id']}")


def cmd_voz_manual(args):
    """Coge el audio que el usuario ha dejado en «Pon aquí tu voz» (el más reciente) y lo pone como voz del vídeo."""
    id_ = id_valido(args[0] if args else "")
    TU_VOZ.mkdir(exist_ok=True)
    carpetas = [c for c in RAIZ.iterdir() if c.is_dir() and normal(c.name) == normal(TU_VOZ.name)]
    audios = sorted([p for c in carpetas for p in c.iterdir() if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac") and not p.name.startswith(".")], key=lambda p: p.stat().st_mtime, reverse=True)
    if not audios:
        fallo(f"No hay ningún audio en la carpeta «{TU_VOZ.name}». Genera la voz (por ejemplo en elevenlabs.io), descárgala y déjala ahí.", titulo="Falta tu voz", frase="Deja el mp3 de la voz en la carpeta «Pon aquí tu voz».")
    (PUBLICO / id_).mkdir(parents=True, exist_ok=True)
    original = PUBLICO / id_ / "voz_original.mp3"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(audios[0]), "-vn", "-ar", "44100", "-b:a", "192k", str(original)], check=True)
    if len(audios) > 1:
        print(f"  (hay {len(audios)} audios en la carpeta; se usa el más reciente: {audios[0].name})")
    print(f"✓ Voz del vídeo: «{audios[0].name}» ({duracion(original):.1f} s)")
    _preparar_voz(id_, original, audios[0].name)


def _preparar_voz(id_, original, nombre):
    # 1) la voz a −20 LUFS (la música y los efectos del estilo están medidos para eso)
    voz = PUBLICO / id_ / "voz_norm.mp3"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(original), "-af", "loudnorm=I=-20:TP=-2:LRA=11", "-ar", "44100", "-b:a", "192k", str(voz)], check=True)
    estado.poner(paso="voz_recibida", trabajando=True, voz={"archivo": nombre, "duracion": round(duracion(voz), 1), "dice_el_guion": None, "faltan": []}, progreso={"texto": "Escuchando la voz palabra a palabra", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": 60})
    # 2) cada palabra con su segundo (y las pausas del guion metidas en el audio si la voz no las trae)
    cmd_transcribir([id_])


def cmd_transcribir(args):
    id_ = id_valido(args[0] if args else "")
    voz = PUBLICO / id_ / "voz_norm.mp3"
    if not voz.exists() and (PUBLICO / id_ / "voz.mp3").exists():
        shutil.copy(PUBLICO / id_ / "voz.mp3", voz)  # voces de antes de meter las pausas en la fábrica
    if not voz.exists():
        fallo(f"Falta la voz. Ejecuta antes:  fabrica voz-manual {id_}")
    parrafos, solo_texto, guion, _ = leer_guion(id_)
    print("Escuchando la voz palabra a palabra (la primera vez descarga el modelo, ~500 MB)…", flush=True)
    estado.poner(trabajando=True)
    parar = threading.Event()
    threading.Thread(target=_latir, args=(parar,), daemon=True).start()
    try:
        from faster_whisper import WhisperModel

        modelo = WhisperModel(os.environ.get("FABRICA_WHISPER", "small"), device="cpu", compute_type="int8")
        segs, _ = modelo.transcribe(str(voz), language="es", word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
        oidas = [(w.word.strip(), float(w.start), float(w.end)) for s in segs for w in (s.words or []) if w.word.strip()]
    finally:
        parar.set()
    if not oidas:
        fallo("No se ha oído ninguna palabra en la voz.", titulo="La voz está vacía", frase="El audio de la carpeta «Pon aquí tu voz» no tiene voz; vuelve a generarlo.")
    # las palabras del GUION (con su puntuación) con los tiempos que se han oído; las que Whisper se come, en su hueco
    a = [normal(w) for w in guion]
    b = [normal(w) for w, _, _ in oidas]
    tiempos = [None] * len(guion)
    for blq in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blq.size):
            tiempos[blq.a + k] = (oidas[blq.b + k][1], oidas[blq.b + k][2])
    total = duracion(voz)
    oidas_ok = sum(1 for t in tiempos if t is not None)
    i = 0
    while i < len(guion):
        if tiempos[i] is None:
            j = i
            while j < len(guion) and tiempos[j] is None:
                j += 1
            t0 = tiempos[i - 1][1] if i > 0 else 0.0
            t1 = tiempos[j][0] if j < len(guion) else total
            paso = max(t1 - t0, 0.05) / (j - i)
            for k in range(i, j):
                tiempos[k] = (t0 + paso * (k - i), t0 + paso * (k - i + 1))
            i = j
        else:
            i += 1
    palabras = [{"p": w, "ini": round(t[0], 2), "fin": round(t[1], 2)} for w, t in zip(guion, tiempos)]
    # Las pausas del guion ([pausa N]) van en el audio: si la voz no las trae (ElevenLabs v4 ignora los <break>),
    # se mete el silencio que falta justo después de la última palabra de antes de la marca y se desplazan los tiempos.
    voz_final = PUBLICO / id_ / "voz.mp3"
    palabras, total = insertar_pausas(voz, voz_final, parrafos, palabras, total)
    # frases: se cortan por . ? ! … del guion
    frases, actual, ini = [], [], None
    for p in palabras:
        if ini is None:
            ini = p["ini"]
        actual.append(p["p"])
        if re.search(r"[.?!…]$", p["p"]):
            frases.append({"texto": " ".join(actual), "ini": ini, "fin": p["fin"]})
            actual, ini = [], None
    if actual:
        frases.append({"texto": " ".join(actual), "ini": ini, "fin": palabras[-1]["fin"]})
    datos = {"duracion": round(total, 2), "capitulos": [], "frases": frases, "palabras": palabras}
    (PUBLICO / id_ / "voz.tiempos.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    # transcripción legible: [segundo] frase
    (VIDEOS / id_ / "transcripcion.txt").write_text("\n".join(f"[{f['ini']:7.2f}] {f['texto']}" for f in frases) + "\n", encoding="utf-8")
    # ¿dice el guion entero? (frases con menos de la mitad de palabras oídas)
    faltan = []
    k = 0
    for f in frases:
        n = len(f["texto"].split())
        oidas_f = sum(1 for t in range(k, k + n) if t < len(a) and a[t] in set(b))
        # Whisper escribe los números con cifras («017» por «cero diecisiete»): solo se avisa de frases largas casi sin oír
        if n >= 5 and oidas_f < n * 0.4:
            faltan.append(f["texto"])
        k += n
    dice = oidas_ok >= 0.6 * len(guion) and not faltan
    d = estado.leer()
    v = d.get("voz") or {}
    v.update({"duracion": round(total, 1), "dice_el_guion": dice, "faltan": faltan[:5]})
    estado.poner(voz=v, trabajando=False, progreso=None, paso="voz_recibida" if d["paso"] in ("voz", "voz_recibida") else d["paso"])
    print(f"✓ {len(palabras)} palabras en {total:.1f} s ({oidas_ok} oídas claras)")
    if faltan:
        print("  ⚠ Parece que la voz NO dice estas frases del guion:\n    - " + "\n    - ".join(faltan[:5]))
    print(f"  Transcripción: src/videos/{id_}/transcripcion.txt · Tiempos: public/videos/{id_}/voz.tiempos.json")
    print(f"  Siguiente: escribe src/videos/{id_}/Video.tsx y escenas.json, y ejecuta  fabrica fotos {id_}")


def insertar_pausas(entrada, salida, parrafos, palabras, total):
    """Mete en el audio las pausas marcadas en el guion que la voz no trae. Devuelve las palabras con los tiempos
    desplazados y la duración nueva. Si no falta ninguna pausa, copia el audio tal cual."""
    cortes = []  # (segundo del corte, silencio que falta)
    i = 0
    for p in parrafos:
        if isinstance(p, tuple):
            if 0 < i <= len(palabras):
                fin = palabras[i - 1]["fin"]
                siguiente = palabras[i]["ini"] if i < len(palabras) else total
                falta = p[1] - max(0.0, siguiente - fin)
                if falta > 0.25:
                    cortes.append((min(fin + 0.08, siguiente), round(falta, 2)))
        else:
            i += len(p.split())
    if not cortes:
        shutil.copy(entrada, salida)
        return palabras, total
    # ffmpeg: trozos de la voz + silencios, concatenados
    filtro, etiquetas, t0 = [], [], 0.0
    for k, (t, d) in enumerate(cortes):
        filtro.append(f"[0:a]atrim=start={t0:.3f}:end={t:.3f},asetpts=PTS-STARTPTS[s{k}]")
        filtro.append(f"anullsrc=r=44100:cl=mono,atrim=0:{d:.3f},asetpts=PTS-STARTPTS[p{k}]")
        etiquetas += [f"[s{k}]", f"[p{k}]"]
        t0 = t
    filtro.append(f"[0:a]atrim=start={t0:.3f},asetpts=PTS-STARTPTS[s{len(cortes)}]")
    etiquetas.append(f"[s{len(cortes)}]")
    filtro.append("".join(etiquetas) + f"concat=n={len(etiquetas)}:v=0:a=1,aformat=sample_rates=44100:channel_layouts=mono[a]")
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(entrada), "-filter_complex", ";".join(filtro), "-map", "[a]", "-b:a", "192k", str(salida)], check=True)
    # desplazar los tiempos
    nuevas = []
    for w in palabras:
        desp = sum(d for t, d in cortes if w["ini"] >= t - 0.001)
        nuevas.append({"p": w["p"], "ini": round(w["ini"] + desp, 2), "fin": round(w["fin"] + desp, 2)})
    print(f"  ✓ {len(cortes)} pausas del guion metidas en la voz (+{sum(d for _, d in cortes):.1f} s)")
    return nuevas, round(duracion(salida), 2)


def _latir(parar, cada=15):
    while not parar.wait(cada):
        try:
            estado.latido()
        except Exception:
            pass


# ---------------------------------------------------------------- fotos y render
def opciones_navegador():
    b = navegador()
    return [f"--browser-executable={b}"] if b else []


def bundle():
    salida = RAIZ / "salida" / "bundle"
    subprocess.run([npx(), "remotion", "bundle", "src/index.ts", "--out-dir", str(salida), "--log=error"], cwd=RAIZ, check=True)
    return salida


def leer_tiempos(id_):
    f = PUBLICO / id_ / "voz.tiempos.json"
    t = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {"provisional": True}
    if t.get("provisional"):
        fallo(f"Falta la voz con sus tiempos. Ejecuta antes:  fabrica voz-manual {id_}" + ("" if GRATIS else f"  (o  fabrica voz {id_})"))
    return t


def _limpia(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return [w for w in re.sub(r"[^a-z0-9ñ ]+", " ", s).split() if w]


def segundo_de(tiempos, texto, desde=0.0):
    """El mismo E("…") del motor, en Python: segundo en que empieza a decirse `texto`."""
    if isinstance(texto, (int, float)):
        return float(texto)
    try:
        return float(str(texto).replace(",", "."))
    except ValueError:
        pass
    q = _limpia(texto)
    ps = [(" ".join(_limpia(p["p"])), p["ini"]) for p in tiempos["palabras"]]
    for i in range(len(ps)):
        if ps[i][1] < desde - 0.01:
            continue
        if all(i + k < len(ps) and ps[i + k][0] == q[k] for k in range(len(q))):
            return ps[i][1]
    return None


def cmd_fotos(args):
    id_ = id_valido(args[0] if args else "")
    t = leer_tiempos(id_)
    f_esc = VIDEOS / id_ / "escenas.json"
    try:
        escenas = json.loads(f_esc.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        fallo(f"Falta o está mal src/videos/{id_}/escenas.json (los 6-8 momentos de las fotos).")
    if not isinstance(escenas, list) or not 6 <= len(escenas) <= 8:
        fallo("escenas.json tiene que tener entre 6 y 8 momentos (p. ej. Gancho, Regla 1, Regla 2, Dato, Regla 4, Regla 6, Cierre).")
    # el 3D (Tinta plana) puede pedir otro motor gráfico en Chrome sin ventana: el mismo --gl que su render
    e = estilo_de_video(id_)
    gl = [f"--gl={e['render']['--gl']}"] if e.get("render", {}).get("--gl") else []
    segundos = []
    for esc in escenas:
        en = esc.get("en", "")
        s = segundo_de(t, en)
        if s is None:
            fallo(f"En escenas.json, «{esc.get('nombre')}» está anclado a «{en}», que no se dice en la voz. Usa palabras de src/videos/{id_}/transcripcion.txt.")
        # ancla por palabra: 0,6 s después (que la pieza ya haya aparecido); ancla por número: el segundo exacto
        es_numero = isinstance(en, (int, float)) or re.fullmatch(r"[\d.,]+", str(en).strip() or "x") is not None
        segundos.append(min(t["duracion"] - 0.1, s if es_numero else s + 0.6))
    carpeta = SALIDA / id_ / "fotogramas"
    shutil.rmtree(carpeta, ignore_errors=True)
    carpeta.mkdir(parents=True)
    fot = [{"n": i + 1, "nombre": esc.get("nombre") or f"Escena {i + 1}", "ruta": f"salida/{id_}/fotogramas/{i + 1}.jpg", "listo": False} for i, esc in enumerate(escenas)]
    inicio = time.time()
    n_esc = len(escenas)
    estado.poner(paso="dibujando", trabajando=True, fotogramas=fot, progreso={"texto": "Preparando el motor", "hecho": 0, "total": n_esc, "inicio": inicio, "estimado": 25 * n_esc}, error=None)
    print("Preparando el motor…", flush=True)
    parar = threading.Event()
    threading.Thread(target=_latir, args=(parar,), daemon=True).start()
    try:
        b = bundle()
        for i, s in enumerate(segundos):
            estado.poner(progreso={"texto": f"Escena {i + 1} de {n_esc} · {fot[i]['nombre']}", "hecho": i, "total": n_esc, "inicio": inicio, "estimado": 25 * n_esc})
            fr = max(0, round(s * FPS))
            r = subprocess.run([npx(), "remotion", "still", str(b), id_, str(carpeta / f"{i + 1}.jpg"), f"--frame={fr}", "--scale=0.5", "--image-format=jpeg", "--jpeg-quality=85", "--timeout=300000", *gl, *opciones_navegador(), "--log=error"], cwd=RAIZ, capture_output=True, text=True)
            if r.returncode != 0:
                fallo(f"No se ha podido dibujar «{fot[i]['nombre']}»:\n{(r.stderr or r.stdout)[-1500:]}", titulo=f"Algo ha fallado al dibujar «{fot[i]['nombre']}»", frase=f"Ha fallado el dibujo de «{fot[i]['nombre']}» (fabrica fotos {id_}), arréglalo y sigue.")
            fot[i]["listo"] = True
            estado.poner(fotogramas=fot, progreso={"texto": f"Escena {i + 1} de {n_esc} · {fot[i]['nombre']}", "hecho": i + 1, "total": n_esc, "inicio": inicio, "estimado": 25 * n_esc})
            print(f"  ✓ {i + 1} · {fot[i]['nombre']} (segundo {s:.1f})", flush=True)
    finally:
        parar.set()
    # hoja de contacto para que Claude la mire de un vistazo
    entradas = sum([["-i", str(carpeta / f"{i + 1}.jpg")] for i in range(n_esc)], [])
    filas = (n_esc + 2) // 3
    filtro = "".join(f"[{i}]scale=640:360[s{i}];" for i in range(n_esc))
    for r in range(filas):
        idx = list(range(r * 3, min(r * 3 + 3, n_esc)))
        while len(idx) < 3:
            filtro += f"color=black:s=640x360:d=1[v{r}_{len(idx)}];"
            idx.append(f"v{r}_{len(idx)}")
        filtro += "".join(f"[s{i}]" if isinstance(i, int) else f"[{i}]" for i in idx) + f"hstack=3[f{r}];"
    filtro += "".join(f"[f{r}]" for r in range(filas)) + (f"vstack={filas}" if filas > 1 else "null")
    subprocess.run([ffmpeg(), "-v", "error", "-y", *entradas, "-filter_complex", filtro, "-frames:v", "1", str(carpeta / "hoja.jpg")], check=True)
    estado.poner(paso="revisar", trabajando=False, progreso=None)
    print(f"✓ Fotogramas listos: salida/{id_}/fotogramas/ (hoja: hoja.jpg). Míralos y, si están bien, ejecuta  fabrica escuchar")


def nombre_de_archivo(texto):
    texto = re.sub(r'[\\/:*?"<>|]', "", texto).strip()
    return texto[:90] or "video"


def leer_subir(id_):
    f = VIDEOS / id_ / "subir.txt"
    titulo, descripcion = id_, ""
    if f.exists():
        lineas = f.read_text(encoding="utf-8").strip().splitlines()
        if lineas and lineas[0].strip() and lineas[0].strip().upper() != "TÍTULO":
            titulo = lineas[0].strip()
            descripcion = "\n".join(lineas[1:]).strip()
    return titulo, descripcion


def cmd_render(args):
    id_ = id_valido(args[0] if args else "")
    t = leer_tiempos(id_)
    voz = PUBLICO / id_ / "voz.mp3"
    (SALIDA / id_).mkdir(parents=True, exist_ok=True)
    bruto = SALIDA / id_ / "bruto.mp4"
    registro = SALIDA / id_ / "registro-render.txt"
    # estimación: lo que tarda este ordenador con este estilo (factor_montaje)
    e_video = estilo_de_video(id_)
    estimado = int(t["duracion"] * factor_montaje(e_video)) if e_video else int(t["duracion"] * (10 if WINDOWS else 4))
    inicio = time.time()
    estado.poner(paso="montando", trabajando=True, progreso={"texto": "Montando el vídeo", "hecho": 0, "total": 1, "inicio": inicio, "estimado": estimado}, error=None)
    print(f"Haciendo el vídeo (suele tardar unos {max(1, estimado // 60)} minutos)…", flush=True)
    parar = threading.Event()
    threading.Thread(target=_latir, args=(parar,), daemon=True).start()
    try:
        with open(registro, "w", encoding="utf-8") as reg:
            e = estilo_de_video(id_)
            opciones = {"--concurrency": str(max(1, (os.cpu_count() or 2) - 1)),  # en la nube «75%» se quedaba colgado
                        "--crf": "20", "--jpeg-quality": "80", "--timeout": "120000", **e.get("render", {})}  # p. ej. el grano del terror pide --crf=23 --jpeg-quality=70
            r = subprocess.run([npx(), "remotion", "render", "src/index.ts", id_, str(bruto), *[f"{k}={v}" for k, v in opciones.items()], *opciones_navegador(), "--log=error"], cwd=RAIZ, stdout=reg, stderr=subprocess.STDOUT)
        if r.returncode != 0 or not bruto.exists():
            fallo(f"El motor no ha podido hacer el vídeo. Registro: salida/{id_}/registro-render.txt\n" + registro.read_text(encoding="utf-8")[-1500:], titulo="Algo ha fallado al montar el vídeo", frase=f"Ha fallado fabrica render {id_}; mira salida/{id_}/registro-render.txt, arréglalo y sigue.")
        # la voz entra aquí con ffmpeg desde el segundo 0 (en renders largos Remotion la retrasaba a saltos) y todo a −14 LUFS
        estado.poner(progreso={"texto": "Pegando la voz y ajustando el volumen", "hecho": 0, "total": 1, "inicio": inicio, "estimado": estimado})
        tiene_audio = subprocess.run([ffmpeg().replace("ffmpeg", "ffprobe") if shutil.which("ffprobe") else "ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type", "-of", "csv=p=0", str(bruto)], capture_output=True, text=True).stdout.strip() != "" if shutil.which("ffprobe") else True
        titulo, descripcion = leer_subir(id_)
        LISTOS.mkdir(parents=True, exist_ok=True)
        final = LISTOS / f"{nombre_de_archivo(titulo)}.mp4"
        if tiene_audio:
            filtro = "[1:a]aresample=48000,aformat=channel_layouts=stereo[voz];[0:a][voz]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
            orden = [ffmpeg(), "-v", "error", "-y", "-i", str(bruto), "-i", str(voz), "-filter_complex", filtro, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", str(final)]
        else:
            orden = [ffmpeg(), "-v", "error", "-y", "-i", str(bruto), "-i", str(voz), "-filter_complex", "[1:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=11[a]", "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", str(final)]
        subprocess.run(orden, check=True)
    finally:
        parar.set()
    if descripcion:
        final.with_suffix(".txt").write_text(f"{titulo}\n\n{descripcion}\n", encoding="utf-8")
    dur_final = duracion(final)
    real = time.time() - inicio
    medida = {"render_factor": round(max(0.5, real / max(1.0, t["duracion"])), 2), "render_segundos": round(real), "cuando": time.time()}
    cal_estilos = estado.leer().get("calibracion_estilos") or {}
    if e_video:
        cal_estilos[e_video["id"]] = medida
    estado.poner(calibracion=medida, calibracion_estilos=cal_estilos)
    video = {"ruta": f"{LISTOS.name}/{final.name}", "archivo": final.name, "titulo": titulo, "descripcion": descripcion, "duracion": round(dur_final, 1)}
    lote = estado.leer().get("lote")
    if lote and not lote.get("terminado") and any(it.get("video_id") == id_ for it in lote["items"]):
        for it in lote["items"]:
            if it.get("video_id") == id_:
                it["listo"], it["archivo"] = True, final.name
        quedan = [it for it in lote["items"] if not it.get("listo")]
        if quedan:
            lote["actual"] = lote["items"].index(quedan[0])
            estado.poner(lote=lote, paso="guion_escribiendo", trabajando=False, video_id=None, idea=None, guion=None, voz=None, fotogramas=[], video=None,
                         progreso={"texto": f"Claude empieza el vídeo {lote['actual'] + 1} de {len(lote['items'])}", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": 120})
            print(f"✓ Vídeo listo: {LISTOS.name}/{final.name} ({dur_final:.0f} s)")
            print(f"  Lote: {len(lote['items']) - len(quedan)} de {len(lote['items'])} hechos. Siguiente, sin preguntar: «{quedan[0]['titulo']}»")
            return
        lote["terminado"] = True
        estado.poner(lote=lote)
    estado.poner(paso="listo", trabajando=False, progreso=None, video=video)
    print(f"✓ Vídeo listo: {LISTOS.name}/{final.name} ({dur_final:.0f} s)")
    if lote and lote.get("terminado"):
        print(f"  Lote terminado: {len(lote['items'])} vídeos en «{LISTOS.name}». Ejecuta  fabrica escuchar")
    if GRATIS:
        print(f"\nEn la comunidad tienes los demás estilos, tus propias ideas, la voz automática y lotes de vídeos: {COMUNIDAD}")


# ---------------------------------------------------------------- vídeos largos por secciones (estilos de palitos)
def _planos_tsv(id_):
    f = VIDEOS / id_ / "planos.tsv"
    if not f.exists():
        fallo(f"Falta src/videos/{id_}/planos.tsv (columnas con tabulador: seccion, nombre, ancla, entra, descripcion; con cabecera).")
    filas = [l.split("\t") for l in f.read_text(encoding="utf-8").strip().splitlines()[1:] if l.strip()]
    if not filas or any(len(x) < 3 for x in filas):
        fallo(f"src/videos/{id_}/planos.tsv: cada fila necesita al menos seccion, nombre y ancla (separadas por tabuladores).")
    return filas


def cmd_planos(args):
    """Comprueba ANTES de dibujar que cada ancla de planos.tsv existe en la voz y en orden (como enOrden() de Video.tsx),
    avisa de planos de más de 4,6 s o de menos de 1 s y escribe src/videos/<id>/tiempos/<Sección>.txt (desde, duración,
    fotogramas y el fotograma para la foto de revisión). Con --provisional crea los archivos de sección que falten con
    planos provisionales (`provisional` de comun.tsx), para repartir el dibujo por secciones (un agente por sección)."""
    id_ = id_valido(args[0] if args else "")
    t = leer_tiempos(id_)
    filas = _planos_tsv(id_)
    antes, desde = 0.0, []
    for i, f in enumerate(filas):
        s_ = 0.0 if i == 0 else segundo_de(t, f[2], antes + 0.05)
        if s_ is None:
            fallo(f"planos.tsv, plano «{f[1]}»: no encuentro «{f[2]}» en la voz después del segundo {antes:.1f}. Usa palabras de src/videos/{id_}/transcripcion.txt, en orden.")
        antes = s_
        desde.append(0.0 if i == 0 else max(0.0, s_ - 0.1))
    fin = t["duracion"] + 1.5
    desde.append(fin)
    secciones = {}
    for i, f in enumerate(filas):
        dur = desde[i + 1] - desde[i]
        if dur > 4.6 or dur < 1.0:
            print(f"  ⚠ {'LARGO' if dur > 4.6 else 'CORTO'}: {f[1]} (segundo {desde[i]:.1f}, {dur:.2f} s)")
        secciones.setdefault(f[0], []).append(f"{f[1]}\tdesde {desde[i]:.2f} s\tdura {dur:.2f} s\tfotogramas {round(desde[i] * FPS)}–{round(desde[i + 1] * FPS) - 1}\tfoto de revisión: segundo {(desde[i] + desde[i + 1]) / 2:.1f}")
    (VIDEOS / id_ / "tiempos").mkdir(exist_ok=True)
    for sec, lineas in secciones.items():
        (VIDEOS / id_ / "tiempos" / f"{sec}.txt").write_text("\n".join(lineas) + "\n", encoding="utf-8")
    print(f"✓ {len(filas)} planos, {fin / len(filas):.1f} s de media; secciones: " + ", ".join(f"{k} ({len(v)})" for k, v in secciones.items()))
    print(f"  Tiempos de cada sección en src/videos/{id_}/tiempos/")
    if "--provisional" in args:
        for sec in secciones:
            archivo = VIDEOS / id_ / f"{sec}.tsx"
            if archivo.exists() and "provisional(" not in archivo.read_text(encoding="utf-8"):
                print(f"  {archivo.name} ya está dibujado: no lo toco")
                continue
            lineas = [f"// {sec} — PROVISIONAL: cada plano se sustituye por el dibujado de verdad (ver planos.tsv y tiempos/{sec}.txt).", 'import { Def, provisional } from "./comun";', "", f"export const PLANOS_{normal(sec).upper().replace(' ', '_').replace('-', '_')}: Def[] = ["]
            for f in filas:
                if f[0] != sec:
                    continue
                ex = f', {{ entra: "{f[3]}" }}' if len(f) > 3 and f[3].strip() else ""
                lineas.append(f"  [{json.dumps(f[1])}, {json.dumps(f[2], ensure_ascii=False)}, provisional({json.dumps(f[1])}, {json.dumps(f[2], ensure_ascii=False)}){ex}],")
            archivo.write_text("\n".join(lineas) + "\n];\n", encoding="utf-8")
            print(f"  provisional: src/videos/{id_}/{archivo.name}")


def cmd_revisar(args):
    """Hoja de fotos de unos segundos del vídeo (sin renderizarlo entero): para revisar una sección mientras se dibuja.
    Varios agentes a la vez: cada uno con su --carpeta (la hoja recuerda lo ya visto y solo enseña lo que cambia)."""
    id_ = id_valido(args[0] if args else "")
    libres = [a for i, a in enumerate(args[1:], 1) if not a.startswith("--") and args[i - 1] not in ("--carpeta", "--escala")]
    if not libres:
        fallo(f'Dime qué segundos: fabrica revisar {id_} "3.5,12,20.2" [--carpeta {id_}-gancho]')
    try:  # segundos con punto decimal, separados por comas: "3.5,12,20.2"
        fotogramas = ",".join(str(max(0, round(float(x) * FPS))) for x in re.split(r"[,;\s]+", libres[0]) if x.strip())
    except ValueError:
        fallo(f'Los segundos van con punto decimal y separados por comas: fabrica revisar {id_} "3.5,12,20.2"')
    carpeta = opcion(args, "--carpeta", id_)
    orden = [shutil.which("node") or "node", str(RAIZ / "herramientas" / "fotos.cjs"), id_, fotogramas, "--carpeta", carpeta, "--bundle", "bundle-" + carpeta]
    if opcion(args, "--escala"):
        orden += ["--escala", opcion(args, "--escala")]
    entorno = dict(os.environ, FFMPEG=ffmpeg(), NPX=npx(), **({"REMOTION_BROWSER": navegador()} if navegador() else {}))
    r = subprocess.run(orden, cwd=RAIZ, env=entorno)
    if r.returncode != 0:
        fallo(f"No se han podido sacar las fotos de «{id_}» (mira el error de arriba).")


# ---------------------------------------------------------------- estado, error, canal, claves
def cmd_estado(args):
    paso = args[0] if args else ""
    if paso not in estado.PASOS:
        fallo(f"Pasos válidos: {', '.join(estado.PASOS)}")
    campos = {"paso": paso}
    texto = opcion(args, "--texto")
    if texto:
        campos["progreso"] = {"texto": texto, "hecho": 0, "total": 1, "inicio": time.time(), "estimado": int(opcion(args, "--estimado", 240))}
    if paso in ("idea",):
        campos.update(video_id=None, idea=None, guion=None, voz=None, fotogramas=[], progreso=None, video=None)
    estado.poner(**campos, error=None)
    print(f"✓ Paso: {paso}")


def cmd_error(args):
    if len(args) < 2:
        fallo('Uso: fabrica error "<título en llano>" "<frase para Claude>" [--detalle …]')
    estado.error(args[0], args[1], opcion(args, "--detalle", ""))
    print("✓ Error publicado en el panel")


def cmd_canal(args):
    nombre = " ".join(a for a in args if not a.startswith("--")).strip()
    if not nombre:
        print(f"Canal actual: {ajustes()['canal']}\nUso: fabrica canal \"Nombre de tu canal\"")
        return
    nombre = nombre[:28].upper()
    d = ajustes()
    d["canal"] = nombre
    CONFIG.mkdir(exist_ok=True)
    AJUSTES.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    (RAIZ / "src" / "ajustes.json").write_text(json.dumps({"canal": nombre}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ En la cabecera de los vídeos saldrá: ARCHIVO 001 // {nombre}")


def cmd_claves(args):
    if GRATIS:
        fallo(f"La voz automática es de la Fábrica completa de la comunidad: {COMUNIDAD}", titulo="La voz automática es de la comunidad", frase="Haz la voz a mano y déjala en «Pon aquí tu voz».")
    d = leer_claves()
    print("Voz automática con ElevenLabs. Consigue la clave en elevenlabs.io → tu perfil → API Keys (empieza por sk_).")
    k = input(f"Clave de ElevenLabs [{'guardada' if d.get('ELEVENLABS_API_KEY') else 'ninguna'}]: ").strip()
    if k:
        d["ELEVENLABS_API_KEY"] = k
    v = input(f"ID de la voz [{d.get('ELEVENLABS_VOICE_ID', 'ninguno')}]: ").strip()
    if v:
        d["ELEVENLABS_VOICE_ID"] = v
    CONFIG.mkdir(exist_ok=True)
    CLAVES.write_text("# Claves de la Fábrica de Animaciones (no las compartas con nadie)\n" + "\n".join(f"{a}={b}" for a, b in d.items()) + "\n", encoding="utf-8")
    print("✓ Guardado en config/claves.env")


# ---------------------------------------------------------------- panel y escuchar
def cmd_panel(args):
    import panel

    panel.cmd_panel(args)


def cmd_escuchar(args):
    import panel

    panel.cmd_escuchar(args)


ORDENES = {
    "comprobar": cmd_comprobar,
    "panel": cmd_panel,
    "escuchar": cmd_escuchar,
    "pedido": cmd_escuchar,
    "ideas": cmd_ideas,
    "nuevo": cmd_nuevo,
    "guion": cmd_guion,
    "voz": cmd_voz,
    "voz-manual": cmd_voz_manual,
    "voz-id": cmd_voz_id,
    "transcribir": cmd_transcribir,
    "fotos": cmd_fotos,
    "render": cmd_render,
    "planos": cmd_planos,
    "revisar": cmd_revisar,
    "estado": cmd_estado,
    "error": cmd_error,
    "canal": cmd_canal,
    "claves": cmd_claves,
}

if __name__ == "__main__":
    orden = sys.argv[1] if len(sys.argv) > 1 else ""
    if orden not in ORDENES:
        print(__doc__)
        sys.exit(0 if orden in ("", "-h", "--help", "ayuda") else 1)
    try:
        ORDENES[orden](sys.argv[2:])
    except subprocess.CalledProcessError as e:
        fallo(f"Ha fallado una herramienta ({e.cmd[0] if isinstance(e.cmd, list) else e.cmd}, código {e.returncode}).")
    except KeyboardInterrupt:
        print("\n(interrumpido)")
        sys.exit(130)
