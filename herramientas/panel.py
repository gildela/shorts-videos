"""Panel de la Fábrica de Animaciones: la página del navegador que acompaña al usuario de principio a fin.
Sirve panel/, el estado (config/estado.json) y los archivos del vídeo; recoge lo que el usuario decide (pedido.json),
que Claude recibe con «fabrica escuchar». API completa en ARQUITECTURA.md §5.

    fabrica panel [--sin-abrir]   abre el panel (arranca el servidor local si no está ya)
    fabrica escuchar              espera (hasta ~9 min) a que el usuario decida algo en el panel y lo imprime

El servidor solo escucha en este ordenador (127.0.0.1) y se apaga solo a las 6 horas.
"""
import json
import mimetypes
import os
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import estado  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
CONFIG = RAIZ / "config"
PEDIDO = CONFIG / "pedido.json"
SERVIDOR = CONFIG / "panel.json"
LISTOS = RAIZ / "Vídeos listos"
TU_VOZ = RAIZ / "Pon aquí tu voz"
PUBLICO = RAIZ / "public" / "videos"
WINDOWS = os.name == "nt"
GRATIS = estado.gratis()
ENLACE_COMUNIDAD = "https://www.skool.com/ccia"
ENLACE_ELEVENLABS = "https://elevenlabs.io/app/speech-synthesis/text-to-speech"
ENLACE_CLAUDE = "https://claude.ai/download"
VIDA = 6 * 3600
TIPOS_PEDIDO = ("idea", "lote", "guion_ok", "guion_cambio", "escenas_ok", "escenas_cambio", "otro")
MAX_LOTE = 10


def fab():
    import fabrica

    return fabrica


def datos():
    f = fab()
    lista_estilos = []
    for e in f.estilos():
        foto = e["carpeta"] / "ejemplo" / "portada.jpg"
        lista_estilos.append({
            "id": e["id"], "nombre": e["nombre"], "descripcion": e.get("descripcion", ""),
            "bloqueado": GRATIS and "gratis" not in e.get("niveles", []),
            "foto": f"/api/estilo/{e['id']}/foto" if foto.exists() else None,
            "ejemplo": f"/api/ejemplo/{e['id']}" if (e["carpeta"] / "ejemplo" / "ejemplo.mp4").exists() else None,
            "formatos": {k: {kk: vv for kk, vv in v.items() if kk != "niveles"} | {"bloqueado": GRATIS and "gratis" not in v.get("niveles", [])} for k, v in e.get("formatos", {}).items()},
            "montaje": f.factor_montaje(e),  # minutos de montaje por minuto de vídeo en este ordenador
        })
    comunidad = []
    cat = RAIZ / "panel" / "img" / "estilos" / "catalogo.json"
    if cat.exists():
        try:
            comunidad = [{**e, "foto": f"/panel/img/estilos/{e['foto']}", "bloqueado": True} for e in json.loads(cat.read_text(encoding="utf-8"))["estilos"]]
        except (ValueError, KeyError):
            comunidad = []
    ideas = [{k: v for k, v in i.items()} for i in f.ideas()]
    for i in ideas:
        i["fuentes"] = len(i["fuentes"])
    return {
        "edicion": "gratis" if GRATIS else "completa",
        "carpeta": RAIZ.name,
        "comando": "/animaciones-gratis" if GRATIS else "/animaciones",
        "canal": f.ajustes()["canal"],
        "enlace_comunidad": ENLACE_COMUNIDAD,
        "estilos": lista_estilos,
        "sistema": "windows" if WINDOWS else "mac",
        "comunidad": comunidad,  # escaparate de los estilos de la comunidad (foto y nombre), en los dos niveles
        "ideas": ideas,
        "propia": not GRATIS,
        "listos": len(list(LISTOS.glob("*.mp4"))) if LISTOS.exists() else 0,
    }


def formato_permitido(e, nombre):
    """El formato pedido (largo/corto) existe en el estilo y está en este nivel; sin pedirlo, el primero permitido."""
    formatos = e.get("formatos", {})
    permitidos = [k for k, v in formatos.items() if (not GRATIS) or "gratis" in v.get("niveles", [])]
    if not nombre:
        return (permitidos[0] if permitidos else "largo"), None
    if nombre not in formatos:
        return None, "pedido raro"
    if nombre not in permitidos:
        return None, "ese formato es de la comunidad"
    return nombre, None


def pedido_permitido(p):
    if p["tipo"] not in TIPOS_PEDIDO:
        return False, "pedido raro"
    if p["tipo"] in ("idea", "lote"):
        f = fab()
        id_estilo = p.get("estilo") or f.estilos()[0]["id"]
        if not any(x["id"] == id_estilo for x in f.estilos()):
            return False, "pedido raro"
        e = f.estilo(id_estilo)
        if GRATIS and "gratis" not in e.get("niveles", []):
            return False, "ese estilo es de la comunidad"
        _, por_que = formato_permitido(e, p.get("formato"))
        if por_que:
            return False, por_que
    if p["tipo"] == "lote":
        if GRATIS:
            return False, "los lotes son de la comunidad"
        ideas, temas = p.get("ideas") or [], [t for t in (p.get("temas") or []) if t.strip()]
        if not 2 <= len(ideas) + len(temas) <= MAX_LOTE:
            return False, "pedido raro"
        for n in ideas:
            try:
                idea, por_que = fab().idea_permitida(p.get("estilo") or fab().estilos()[0]["id"], int(n))
            except (TypeError, ValueError):
                return False, "pedido raro"
            if idea is None:
                return False, por_que
        return True, None
    if p["tipo"] == "idea":
        f = fab()
        if p.get("idea") is None and p.get("tema"):
            return (not GRATIS), "las ideas propias son de la comunidad"
        try:
            n = int(p.get("idea"))
        except (TypeError, ValueError):
            return False, "falta la idea"
        idea, por_que = f.idea_permitida(p.get("estilo") or f.estilos()[0]["id"], n)
        return (idea is not None), por_que
    return True, None


def items_lote(p):
    """Los vídeos de un pedido de lote, en orden: primero las ideas de la lista y luego los temas propios."""
    f = fab()
    e = f.estilo(p.get("estilo") or f.estilos()[0]["id"])
    items = []
    for n in p.get("ideas") or []:
        i = next((x for x in f.ideas(e["id"]) if x["n"] == int(n)), None)
        if i:
            items.append({"titulo": i["titulo"], "idea": i["n"], "dato": i["dato"], "fuentes": i["fuentes"][:2], "video_id": None, "listo": False})
    for t in p.get("temas") or []:
        if t.strip():
            items.append({"titulo": t.strip(), "tema": t.strip(), "video_id": None, "listo": False})
    return items


def texto_pedido(p):
    f = fab()
    d = estado.leer()
    vid = d.get("video_id") or "<id>"
    if p["tipo"] == "idea":
        e = f.estilo(p.get("estilo") or f.estilos()[0]["id"])
        if p.get("idea") is not None:
            idea = next(i for i in f.ideas(e["id"]) if i["n"] == int(p["idea"]))
            linea_idea = f"- Idea {idea['n']}: {idea['titulo']} — Dato: {idea['dato']} (compruébalo igualmente en 2 fuentes: {', '.join(idea['fuentes'][:2]) or 'busca tú'})"
            orden = f"fabrica nuevo <id> --estilo {e['id']} --idea {idea['n']} --formato {formato_permitido(e, p.get('formato'))[0]}"
        else:
            linea_idea = f"- Tema propio del usuario: {p.get('tema', '').strip()} (busca el dato y compruébalo en 2 fuentes)"
            orden = f"fabrica nuevo <id> --estilo {e['id']} --tema \"{p.get('tema', '').strip()}\" --formato {formato_permitido(e, p.get('formato'))[0]}"
        nombre_formato, _ = formato_permitido(e, p.get("formato"))
        formato = e.get("formatos", {}).get(nombre_formato, {})
        lineas = [
            "PEDIDO DEL PANEL · idea (el usuario ya ha elegido: no vuelvas a preguntarlo)",
            f"- Estilo: {e['id']} ({e['nombre']}) → lee estilos/{e['id']}/LEEME.md y copia la estructura de estilos/{e['id']}/ejemplo/Video.tsx",
            linea_idea,
            f"- Formato: {nombre_formato} ({formato.get('estructura', 'gancho + archivo + 5-7 reglas + cierre')}, {'-'.join(map(str, formato.get('palabras', [800, 1300])))} palabras, {'-'.join(str(x // 60) for x in formato.get('duracion', [360, 600]))} min de vídeo) según estilos/{e['id']}/GUION.md",
            "- Voz: la pone el usuario a mano (cuando apruebe el guion, el panel le guía; tú esperas con fabrica escuchar)" if GRATIS else "- Voz: automática (fabrica voz <id>) cuando apruebe el guion",
            f"Siguiente: {orden} · escribe src/videos/<id>/guion.md · fabrica guion <id> · fabrica escuchar",
        ]
        return "\n".join(lineas)
    if p["tipo"] == "lote":
        e = f.estilo(p.get("estilo") or f.estilos()[0]["id"])
        nombre_formato, _ = formato_permitido(e, p.get("formato"))
        formato = e.get("formatos", {}).get(nombre_formato, {})
        items = items_lote(p)
        lineas = [
            f"PEDIDO DEL PANEL · lote de {len(items)} vídeos (el usuario ya ha elegido y no quiere aprobar nada: hazlos todos SIN PREGUNTAR, uno detrás de otro)",
            f"- Estilo: {e['id']} ({e['nombre']}) → lee estilos/{e['id']}/LEEME.md una vez y copia la estructura de estilos/{e['id']}/ejemplo/",
            f"- Formato: {nombre_formato} ({formato.get('estructura', '')}, {'-'.join(map(str, formato.get('palabras', [800, 1300])))} palabras) según estilos/{e['id']}/GUION.md",
        ]
        for k, it in enumerate(items, 1):
            if "idea" in it:
                lineas.append(f"- Vídeo {k}: idea {it['idea']} · {it['titulo']} — Dato: {it['dato']} (compruébalo en 2 fuentes: {', '.join(it['fuentes']) or 'busca tú'})  →  fabrica nuevo <id> --estilo {e['id']} --idea {it['idea']} --formato {nombre_formato}")
            else:
                lineas.append(f"- Vídeo {k}: tema propio · {it['titulo']} (busca el dato y compruébalo en 2 fuentes)  →  fabrica nuevo <id> --estilo {e['id']} --tema \"{it['titulo']}\" --formato {nombre_formato}")
        lineas.append("Por cada vídeo, en orden: fabrica nuevo · guion.md · fabrica guion · fabrica voz · Video.tsx y escenas.json · fabrica fotos (mira la hoja y arregla, 1 vuelta) · subir.txt · fabrica render. El panel enseña el progreso solo. Al acabar el último, fabrica escuchar.")
        return "\n".join(lineas)
    if p["tipo"] == "guion_ok":
        return ("PEDIDO DEL PANEL · el guion vale\n" + (f"- El usuario va a hacer la voz a mano. Espera a que caiga el archivo: fabrica escuchar (avisa solo cuando esté)\n- Cuando salga «VOZ RECIBIDA», ejecuta  fabrica voz-manual {vid}  y sigue con las escenas." if GRATIS else f"- Ejecuta  fabrica voz {vid}  y sigue con las escenas."))
    if p["tipo"] == "guion_cambio":
        return f"PEDIDO DEL PANEL · cambiar el guion\n- El usuario pide: «{p.get('texto', '').strip()}»\n- Reescribe src/videos/{vid}/guion.md con ese cambio (misma fórmula) y ejecuta  fabrica guion {vid}  · fabrica escuchar"
    if p["tipo"] == "escenas_ok":
        return f"PEDIDO DEL PANEL · las escenas gustan\n- Ejecuta  fabrica render {vid}  (tarda unos minutos; el panel enseña el progreso). Al acabar, fabrica escuchar."
    if p["tipo"] == "escenas_cambio":
        return f"PEDIDO DEL PANEL · cambiar las escenas\n- El usuario pide: «{p.get('texto', '').strip()}»\n- Cambia solo lo que toca en src/videos/{vid}/Video.tsx (y escenas.json si hace falta) y ejecuta  fabrica fotos {vid}  · fabrica escuchar"
    if p["tipo"] == "otro":
        return "PEDIDO DEL PANEL · otro vídeo\n- El usuario quiere hacer otro: espera su idea con  fabrica escuchar"
    return "PEDIDO DEL PANEL · " + p["tipo"]


def aplicar_pedido(p):
    """Lo que cambia en el estado en cuanto se recoge el pedido (antes de que Claude haga nada)."""
    d = estado.leer()
    if p["tipo"] == "idea":
        f = fab()
        e = f.estilo(p.get("estilo") or f.estilos()[0]["id"])
        idea = None
        if p.get("idea") is not None:
            idea = next((i for i in f.ideas(e["id"]) if i["n"] == int(p["idea"])), None)
        elif p.get("tema"):
            idea = {"n": 0, "titulo": p["tema"].strip(), "dato": "", "fuentes": []}
        if idea is not None:
            idea = {**idea, "fuentes": len(idea["fuentes"]) if isinstance(idea.get("fuentes"), list) else idea.get("fuentes", 0)}
        estado.poner(paso="guion_escribiendo", estilo=e["id"], idea=idea, video_id=None, guion=None, voz=None, fotogramas=[], video=None, error=None, lote=None, formato=formato_permitido(e, p.get("formato"))[0],
                     progreso={"texto": "Claude está escribiendo el guion", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": 90})
    elif p["tipo"] == "lote":
        f = fab()
        e = f.estilo(p.get("estilo") or f.estilos()[0]["id"])
        nombre_formato, _ = formato_permitido(e, p.get("formato"))
        estado.poner(paso="guion_escribiendo", estilo=e["id"], idea=None, video_id=None, guion=None, voz=None, fotogramas=[], video=None, error=None,
                     lote={"estilo": e["id"], "formato": nombre_formato, "items": items_lote(p), "actual": 0, "terminado": False},
                     progreso={"texto": "Claude está empezando el lote", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": 120})
    elif p["tipo"] == "guion_ok":
        c = fab().leer_claves() if not GRATIS else {}
        if c.get("ELEVENLABS_API_KEY") and c.get("ELEVENLABS_VOICE_ID"):
            # Fábrica completa con la voz configurada: no se le pide nada al usuario; Claude la genera
            estado.poner(paso="voz_recibida", error=None, voz={"archivo": "ElevenLabs", "duracion": None, "dice_el_guion": None, "faltan": []},
                         progreso={"texto": "Claude está generando la voz", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": 60})
        else:
            estado.poner(paso="voz", error=None, progreso=None)
    elif p["tipo"] == "guion_cambio":
        estado.poner(paso="guion_escribiendo", error=None, progreso={"texto": "Claude está reescribiendo el guion", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": 90, "cambio": p.get("texto", "")})
    elif p["tipo"] == "escenas_ok":
        f = fab()
        e = f.estilo_de_video(d["video_id"]) if d.get("video_id") else {}
        factor = f.factor_montaje(e) if e else (10 if WINDOWS else 4)
        estado.poner(paso="montando", error=None, progreso={"texto": "Claude va a montar el vídeo", "hecho": 0, "total": 1, "inicio": time.time(), "estimado": int(((d.get("voz") or {}).get("duracion") or 100) * factor)})
    elif p["tipo"] == "escenas_cambio":
        estado.poner(paso="dibujando", error=None, progreso={"texto": "Claude está cambiando las escenas", "hecho": 0, "total": 6, "inicio": time.time(), "estimado": 240, "cambio": p.get("texto", "")})
    elif p["tipo"] == "otro":
        estado.poner(paso="idea", video_id=None, idea=None, guion=None, voz=None, fotogramas=[], progreso=None, video=None, error=None, lote=None)


def voz_nueva():
    """Un audio nuevo en «Pon aquí tu voz» mientras el panel está en el paso «voz»."""
    d = estado.leer()
    if d["paso"] != "voz":
        return None
    f = fab()
    carpetas = [c for c in RAIZ.iterdir() if c.is_dir() and f.normal(c.name) == f.normal(TU_VOZ.name)]
    audios = [p for c in carpetas for p in c.iterdir() if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac") and not p.name.startswith(".")]
    if not audios:
        return None
    reciente = max(audios, key=lambda p: p.stat().st_mtime)
    marca = (d.get("guion") or {}).get("publicado") or d.get("latido_guion") or 0
    # vale cualquier audio dejado después de aprobar el guion (o, si no sabemos cuándo, en la última hora)
    desde = d.get("voz_desde") or (time.time() - 3600)
    if reciente.stat().st_mtime < desde - 5:
        return None
    # esperar a que el archivo termine de copiarse (que no cambie de tamaño en 2 s)
    t1 = reciente.stat().st_size
    time.sleep(2)
    if reciente.stat().st_size != t1:
        return None
    return reciente


# ---------------------------------------------------------------- servidor
class Manejador(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def responder(self, codigo, cuerpo, tipo="application/json; charset=utf-8"):
        if isinstance(cuerpo, (dict, list)):
            cuerpo = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(cuerpo)

    def archivo(self, ruta: Path, cache=False):
        if not ruta.is_file():
            return self.responder(404, {"error": "no existe"})
        tam = ruta.stat().st_size
        tipo = mimetypes.guess_type(ruta.name)[0] or "application/octet-stream"
        if ruta.suffix == ".woff2":
            tipo = "font/woff2"
        rango = self.headers.get("Range")
        with open(ruta, "rb") as f:
            if rango and rango.startswith("bytes="):
                a, _, b = rango[6:].partition("-")
                a = int(a or 0)
                b = min(int(b) if b else tam - 1, tam - 1)
                f.seek(a)
                datos_ = f.read(b - a + 1)
                self.send_response(206)
                self.send_header("Content-Range", f"bytes {a}-{b}/{tam}")
            else:
                datos_ = f.read()
                self.send_response(200)
            self.send_header("Content-Type", tipo)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(len(datos_)))
            self.send_header("Cache-Control", "max-age=3600" if cache else "no-store")
            self.end_headers()
            try:
                self.wfile.write(datos_)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def seguro(self, carpeta: Path, nombre: str):
        f = (carpeta / urllib.request.url2pathname(nombre)).resolve()
        try:
            f.relative_to(carpeta.resolve())
        except ValueError:
            return None
        return f if f.is_file() else None

    def do_GET(self):
        ruta = self.path.split("?")[0]
        if ruta in ("/", "/index.html"):
            return self.archivo(RAIZ / "panel" / "index.html")
        if ruta.startswith("/panel/"):
            f = self.seguro(RAIZ / "panel", ruta[len("/panel/"):])
            return self.archivo(f, cache=ruta.endswith((".woff2", ".png", ".jpg"))) if f else self.responder(404, {"error": "no existe"})
        if ruta == "/api/hola":
            return self.responder(200, {"ok": True, "raiz": str(RAIZ)})
        if ruta == "/api/estado":
            d = estado.para_el_panel()
            d["enlace_comunidad"] = ENLACE_COMUNIDAD
            return self.responder(200, d)
        if ruta == "/api/datos":
            try:
                return self.responder(200, datos())
            except (SystemExit, Exception) as e:  # noqa: BLE001
                return self.responder(500, {"error": str(e)})
        partes = ruta.strip("/").split("/")
        if len(partes) == 4 and partes[:2] == ["api", "fotograma"]:
            f = self.seguro(RAIZ / "salida", f"{partes[2]}/fotogramas/{partes[3]}.jpg")
            return self.archivo(f) if f else self.responder(404, {"error": "no existe"})
        if len(partes) == 3 and partes[:2] == ["api", "voz"]:
            f = self.seguro(PUBLICO, f"{partes[2]}/voz.mp3")
            return self.archivo(f) if f else self.responder(404, {"error": "no existe"})
        if len(partes) == 3 and partes[:2] == ["api", "video"]:
            d = estado.leer()
            v = d.get("video") or {}
            if d.get("video_id") == partes[2] and v.get("archivo"):
                f = self.seguro(LISTOS, v["archivo"])
                if f:
                    return self.archivo(f)
            return self.responder(404, {"error": "no existe"})
        if len(partes) == 3 and partes[:2] == ["api", "ejemplo"]:
            f = self.seguro(RAIZ / "estilos", f"{partes[2]}/ejemplo/ejemplo.mp4")
            return self.archivo(f, cache=True) if f else self.responder(404, {"error": "no existe"})
        if len(partes) == 4 and partes[:2] == ["api", "estilo"] and partes[3] == "foto":
            f = self.seguro(RAIZ / "estilos", f"{partes[2]}/ejemplo/portada.jpg")
            return self.archivo(f, cache=True) if f else self.responder(404, {"error": "no existe"})
        self.responder(404, {"error": "no existe"})

    def do_POST(self):
        largo = int(self.headers.get("Content-Length") or 0)
        cuerpo = self.rfile.read(largo) if largo else b"{}"
        try:
            p = json.loads(cuerpo.decode("utf-8") or "{}")
        except ValueError:
            return self.responder(400, {"error": "pedido raro"})
        if self.path == "/api/pedido":
            p = {k: (str(v)[:600] if isinstance(v, str) else v) for k, v in p.items() if k in ("tipo", "estilo", "idea", "tema", "texto", "formato", "ideas", "temas")}
            for k in ("ideas", "temas"):  # lote: listas cortas de números o de textos
                if k in p:
                    p[k] = [x if k == "ideas" else str(x)[:300] for x in (p[k] if isinstance(p[k], list) else [])][:MAX_LOTE]
            p["tipo"] = str(p.get("tipo", ""))
            try:
                ok, por_que = pedido_permitido(p)
                if not ok:
                    return self.responder(403 if por_que != "pedido raro" else 400, {"error": por_que, "enlace": ENLACE_COMUNIDAD})
                CONFIG.mkdir(exist_ok=True)
                PEDIDO.write_text(json.dumps({**p, "hora": time.time()}, ensure_ascii=False, indent=1), encoding="utf-8")
                # el estado cambia ya (el panel no espera a Claude para enseñar «Claude está escribiendo…»)
                aplicar_pedido(p)
            except SystemExit as e:  # un fallo() de la fábrica (falta un estilo, etc.) no debe tumbar el servidor
                return self.responder(500, {"error": str(e)})
            if p["tipo"] == "guion_ok":
                estado.poner(voz_desde=time.time())
            return self.responder(200, {"ok": True, "claude": estado.escuchando_vivo()})
        if self.path == "/api/abrir":
            que = str(p.get("que", ""))
            if que == "voz":
                TU_VOZ.mkdir(exist_ok=True)
                abrir_carpeta(TU_VOZ)
            elif que == "listos":
                LISTOS.mkdir(exist_ok=True)
                abrir_carpeta(LISTOS)
            elif que == "elevenlabs":
                webbrowser.open(ENLACE_ELEVENLABS)
            elif que == "comunidad":
                webbrowser.open(ENLACE_COMUNIDAD)
            elif que == "claude":
                webbrowser.open(ENLACE_CLAUDE)
            else:
                return self.responder(400, {"error": "no sé abrir eso"})
            return self.responder(200, {"ok": True})
        if self.path == "/api/canal":
            nombre = str(p.get("canal", "")).strip()
            if not nombre:
                return self.responder(400, {"error": "falta el nombre"})
            fab().cmd_canal([nombre])
            return self.responder(200, {"ok": True, "canal": fab().ajustes()["canal"]})
        self.responder(404, {"error": "no existe"})


def abrir_carpeta(p: Path):
    if WINDOWS:
        os.startfile(str(p))  # noqa
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(p)])
    else:
        subprocess.Popen(["xdg-open", str(p)])


def puerto_libre():
    for p in range(8790, 8810):
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    raise SystemExit("✗ No hay ningún puerto libre entre 8790 y 8809.")


def servidor_vivo():
    if not SERVIDOR.exists():
        return None
    try:
        puerto = json.loads(SERVIDOR.read_text(encoding="utf-8"))["puerto"]
        with urllib.request.urlopen(f"http://127.0.0.1:{puerto}/api/hola", timeout=2) as r:
            if json.loads(r.read()).get("raiz") == str(RAIZ):
                return puerto
    except Exception:
        return None
    return None


class Servidor(ThreadingHTTPServer):
    """Sin la búsqueda de nombre (DNS) al arrancar: en redes lentas o con antivirus tardaba minutos."""

    daemon_threads = True

    def server_bind(self):
        import socketserver

        socketserver.TCPServer.server_bind(self)
        self.server_name, self.server_port = "127.0.0.1", self.server_address[1]


def vigilar_voz(srv):
    """Mientras el servidor vive: si el usuario deja su audio en la carpeta en el paso «voz», el estado pasa a «voz_recibida»
    (con nombre y duración provisional) para que el panel cambie solo; Claude lo recoge en «fabrica escuchar»."""
    while True:
        time.sleep(3)
        try:
            a = voz_nueva()
            if a:
                try:
                    dur = fab().duracion(a)
                except Exception:
                    dur = None
                estado.poner(paso="voz_recibida", voz={"archivo": a.name, "duracion": round(dur, 1) if dur else None, "dice_el_guion": None, "faltan": []}, voz_archivo=str(a))
        except Exception:
            pass


def servir():
    puerto = puerto_libre()
    srv = Servidor(("127.0.0.1", puerto), Manejador)
    CONFIG.mkdir(exist_ok=True)
    SERVIDOR.write_text(json.dumps({"puerto": puerto, "pid": os.getpid()}), encoding="utf-8")
    threading.Timer(VIDA, srv.shutdown).start()
    threading.Thread(target=vigilar_voz, args=(srv,), daemon=True).start()
    srv.serve_forever()


def cmd_panel(args):
    puerto = servidor_vivo()
    if not puerto:
        SERVIDOR.unlink(missing_ok=True)
        orden = [sys.executable, str(Path(__file__).resolve()), "servir"]
        if WINDOWS:
            subprocess.Popen(orden, creationflags=0x00000008 | 0x00000200, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, close_fds=True)
        else:
            subprocess.Popen(orden, start_new_session=True, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            time.sleep(0.2)
            puerto = servidor_vivo()
            if puerto:
                break
        if not puerto:
            raise SystemExit("✗ El panel no ha arrancado. Prueba otra vez con  fabrica panel")
    d = estado.leer()
    if d["paso"] == "conectar" and estado.escuchando_vivo():
        estado.poner(paso="idea")
    url = f"http://127.0.0.1:{puerto}/"
    if "--sin-abrir" not in args:
        webbrowser.open(url)
    print(f"✓ Panel abierto en el navegador: {url}")
    print("  Siguiente:  fabrica escuchar")


def cmd_escuchar(args):
    """Espera un pedido del panel (o la voz del usuario) y lo imprime. Mientras tanto, el panel ve «Claude está escuchando»."""
    esperar = "--ya" not in args
    fin = time.time() + 540
    CONFIG.mkdir(exist_ok=True)
    d = estado.leer()
    if d["paso"] == "conectar":
        estado.poner(paso="idea")  # primera vez: Claude ya está aquí → el panel pasa solo a las ideas
    else:
        estado.poner(trabajando=False)
    if esperar:
        print("Esperando a que el usuario decida en el panel…", flush=True)
    try:
        while True:
            estado.tocar_escuchando()
            if PEDIDO.exists():
                try:
                    p = json.loads(PEDIDO.read_text(encoding="utf-8"))
                except ValueError:
                    p = None
                PEDIDO.replace(CONFIG / "pedido-anterior.json")
                if p:
                    print(texto_pedido(p))
                    return
            d = estado.leer()
            if d["paso"] == "voz_recibida" and d.get("voz_archivo"):
                a = d["voz_archivo"]
                estado.poner(voz_archivo=None)
                print(f"VOZ RECIBIDA · {Path(a).name}\n- Ejecuta  fabrica voz-manual {d.get('video_id') or '<id>'}  (la coge de «Pon aquí tu voz», la transcribe y comprueba que dice el guion) y sigue con las escenas (Video.tsx + escenas.json → fabrica fotos).")
                return
            if not esperar or time.time() > fin:
                print("Aún no ha decidido nada." + (" Vuelve a ejecutar  fabrica escuchar  para seguir esperando." if esperar else ""))
                return
            if int(time.time()) % 10 == 0:
                estado.latido()
            time.sleep(1)
    finally:
        estado.quitar_escuchando()


if __name__ == "__main__":
    if sys.argv[1:2] == ["servir"]:
        servir()
