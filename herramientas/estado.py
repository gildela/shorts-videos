"""El estado de la Fábrica de Animaciones: config/estado.json, lo que el panel lee cada 2 segundos (ARQUITECTURA.md §3).

Todas las órdenes de `fabrica` pasan por aquí para decir en qué paso está el vídeo. El panel pinta la pantalla SOLO a
partir de `paso` (y de `error`), así que recargar la página aterriza donde estaba.
"""
import json
import os
import tempfile
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
CONFIG = RAIZ / "config"
ARCHIVO = CONFIG / "estado.json"
ESCUCHANDO = CONFIG / "escuchando"  # lo renueva «fabrica escuchar» cada segundo mientras espera un pedido

PASOS = ("conectar", "idea", "guion_escribiendo", "guion", "voz", "voz_recibida", "dibujando", "revisar", "montando", "listo")
# Cuánto puede estar Claude sin dar señal antes de que el panel avise, según lo que está haciendo (segundos).
# Mientras Claude piensa (escribe el guion o las escenas) no corre ninguna orden de la fábrica, así que se le da más margen.
MARGEN = {"guion_escribiendo": 8 * 60, "voz_recibida": 10 * 60, "dibujando": 10 * 60, "montando": 4 * 60, "revisar": 8 * 60}
MARGEN_NORMAL = 90
# Sin vídeo empezado (paso «idea») y tanto tiempo sin Claude (otro día, o al reinstalar encima): el panel vuelve al paso a paso.
VUELVE_A_CONECTAR = 30 * 60


def gratis() -> bool:
    f = CONFIG / "edicion.txt"
    return f.exists() and f.read_text(encoding="utf-8").strip() == "gratis"


def base() -> dict:
    return {
        "version": 1,
        "edicion": "gratis" if gratis() else "completa",
        "carpeta": RAIZ.name,
        "comando": "/animaciones-gratis" if gratis() else "/animaciones",
        "paso": "conectar",
        "latido": 0.0,
        "trabajando": False,
        "video_id": None,
        "estilo": None,
        "idea": None,
        "guion": None,
        "voz": None,
        "fotogramas": [],
        "progreso": None,
        "video": None,
        "error": None,
    }


def leer() -> dict:
    d = base()
    if ARCHIVO.exists():
        try:
            d.update(json.loads(ARCHIVO.read_text(encoding="utf-8")))
        except (ValueError, OSError):
            pass
    # lo que no se guarda, se calcula siempre (por si cambió la edición o el nombre de la carpeta)
    d["edicion"] = "gratis" if gratis() else "completa"
    d["carpeta"] = RAIZ.name
    d["comando"] = "/animaciones-gratis" if gratis() else "/animaciones"
    return d


def escribir(d: dict) -> None:
    CONFIG.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=CONFIG, prefix=".estado-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    os.replace(tmp, ARCHIVO)


def poner(**campos) -> dict:
    """Cambia campos del estado (y renueva el latido). `poner(paso="voz")`, `poner(trabajando=True)`…"""
    if "paso" in campos and campos["paso"] not in PASOS:
        raise ValueError(f"paso desconocido: {campos['paso']}")
    d = leer()
    d.update(campos)
    d["latido"] = time.time()
    escribir(d)
    return d


def latido() -> None:
    poner()


def error(titulo: str, frase: str, detalle: str = "") -> dict:
    return poner(error={"titulo": titulo, "frase": frase, "detalle": detalle[-4000:], "cuando": time.time()}, trabajando=False)


def limpiar_error() -> dict:
    return poner(error=None)


def nuevo_video(video_id: str, estilo: str, idea: dict | None) -> dict:
    return poner(paso="guion_escribiendo", video_id=video_id, estilo=estilo, idea=idea, guion=None, voz=None, fotogramas=[], progreso=None, video=None, error=None, trabajando=False)


def escuchando_vivo() -> bool:
    try:
        return time.time() - ESCUCHANDO.stat().st_mtime < 20
    except OSError:
        return False


def tocar_escuchando() -> None:
    CONFIG.mkdir(parents=True, exist_ok=True)
    ESCUCHANDO.write_text(str(time.time()), encoding="utf-8")


def quitar_escuchando() -> None:
    try:
        ESCUCHANDO.unlink()
    except OSError:
        pass


def para_el_panel() -> dict:
    """El estado tal y como lo sirve GET /api/estado: con lo calculado (escuchando, conectado, sin señal…)."""
    d = leer()
    ahora = time.time()
    sin_senal = max(0.0, ahora - float(d.get("latido") or 0))
    escuchando = escuchando_vivo()
    if d["paso"] == "idea" and not escuchando and not d.get("trabajando") and sin_senal > VUELVE_A_CONECTAR:
        d["paso"] = "conectar"
    margen = MARGEN.get(d["paso"], MARGEN_NORMAL)
    conectado = escuchando or bool(d.get("trabajando")) or (d["paso"] != "conectar" and sin_senal < margen)
    d.update({
        "ahora": ahora,
        "escuchando": escuchando,
        "sin_senal": round(sin_senal),
        "margen": margen,  # el panel avisa «Claude no da señales» cuando sin_senal pasa de aquí
        "conectado": conectado,
        # texto del punto de la barra superior
        "claude": "trabajando" if (conectado and (d.get("trabajando") or d["paso"] in ("guion_escribiendo", "dibujando", "montando")))
        else "escuchando" if conectado else "sin",
    })
    return d
