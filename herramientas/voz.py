"""Voz automática con ElevenLabs para la Fábrica de Animaciones (versión nube).

Genera la voz bloque a bloque (un bloque = el texto entre dos marcas [pausa N] del guion) con el endpoint
`/v1/text-to-speech/{voz}/with-timestamps`, que devuelve el audio y el segundo de cada letra. Así:

- las pausas del guion son silencios exactos (no dependen de que el modelo respete los <break>),
- los tiempos de cada palabra salen de ElevenLabs y no hace falta Whisper (que en la nube no se puede descargar).

Solo usa la biblioteca estándar de Python y ffmpeg.
"""
import base64
import json
import os
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

API = os.environ.get("ELEVENLABS_API_URL", "https://api.elevenlabs.io")
MODELO = "eleven_multilingual_v2"
SALIDA_AUDIO = "mp3_44100_128"
HUECO_PARRAFO = 0.45  # silencio entre bloques seguidos sin marca de pausa (segundos)


class ErrorVoz(Exception):
    pass


def _pedir(ruta, cuerpo, clave, intentos=4):
    datos = json.dumps(cuerpo).encode("utf-8")
    ultimo = None
    for k in range(intentos):
        req = urllib.request.Request(API + ruta, data=datos, method="POST", headers={
            "xi-api-key": clave, "Content-Type": "application/json", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            texto = e.read().decode("utf-8", "replace")[:600]
            if e.code in (401, 403):
                raise ErrorVoz(f"ElevenLabs no acepta la clave (HTTP {e.code}). Revisa ELEVENLABS_API_KEY. {texto}")
            if e.code == 402 or "quota" in texto.lower():
                raise ErrorVoz(f"No quedan créditos en ElevenLabs para esta voz (HTTP {e.code}). {texto}")
            if e.code in (400, 404, 422):
                raise ErrorVoz(f"ElevenLabs rechaza la petición (HTTP {e.code}): {texto}")
            ultimo = f"HTTP {e.code}: {texto}"
        except urllib.error.URLError as e:
            ultimo = f"sin conexión con {API}: {e.reason}"
        time.sleep(2 ** (k + 1))
    raise ErrorVoz(f"No he podido hablar con ElevenLabs ({ultimo}). Si dice «403 Forbidden» en el túnel, la red de la nube no deja pasar a api.elevenlabs.io.")


def _palabras_de_alineacion(al):
    """Letras con su segundo → palabras (separadas por espacios) con inicio y fin."""
    chars = al.get("characters") or []
    ini = al.get("character_start_times_seconds") or []
    fin = al.get("character_end_times_seconds") or []
    palabras, actual, t0, t1 = [], "", None, None
    for c, a, b in zip(chars, ini, fin):
        if c.isspace():
            if actual:
                palabras.append((actual, t0, t1))
            actual, t0, t1 = "", None, None
            continue
        if not actual:
            t0 = a
        actual += c
        t1 = b
    if actual:
        palabras.append((actual, t0, t1))
    return palabras


def _ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def _duracion_wav(f):
    import wave

    with wave.open(str(f), "rb") as w:
        return w.getnframes() / float(w.getframerate())


def bloques(parrafos):
    """Agrupa los párrafos del guion (fabrica.leer_guion) en bloques separados por marcas de pausa.
    Devuelve [(texto, pausa_despues)], con pausa_despues = None si el siguiente bloque va seguido."""
    salida, actual = [], []
    for p in parrafos:
        if isinstance(p, tuple):
            if actual:
                salida.append(["\n\n".join(actual), p[1]])
                actual = []
            elif salida:
                salida[-1][1] = (salida[-1][1] or 0) + p[1]
        else:
            actual.append(p)
    if actual:
        salida.append(["\n\n".join(actual), None])
    return [tuple(b) for b in salida]


def generar(parrafos, clave, voz_id, salida, modelo=None, ajustes_voz=None, aviso=None):
    """Genera la voz del guion entero en `salida` (mp3) y devuelve (palabras, duracion) con
    palabras = [{"p": palabra_tal_cual, "ini": s, "fin": s}, ...] en el orden del guion."""
    modelo = modelo or MODELO
    aviso = aviso or (lambda i, n, texto: print(f"  · Bloque {i + 1} de {n} ({len(texto.split())} palabras)", flush=True))
    trozos = bloques(parrafos)
    if not trozos:
        raise ErrorVoz("El guion no tiene texto.")
    tmp = Path(tempfile.mkdtemp(prefix="voz-"))
    ff = _ffmpeg()
    lista, palabras, t = [], [], 0.0
    textos = [b[0] for b in trozos]
    for i, (texto, pausa) in enumerate(trozos):
        aviso(i, len(trozos), texto)
        cuerpo = {"text": texto, "model_id": modelo}
        if i > 0:
            cuerpo["previous_text"] = textos[i - 1][-600:]
        if i + 1 < len(textos):
            cuerpo["next_text"] = textos[i + 1][:600]
        if ajustes_voz:
            cuerpo["voice_settings"] = ajustes_voz
        r = _pedir(f"/v1/text-to-speech/{voz_id}/with-timestamps?output_format={SALIDA_AUDIO}", cuerpo, clave)
        mp3 = tmp / f"b{i:03d}.mp3"
        mp3.write_bytes(base64.b64decode(r["audio_base64"]))
        wav = tmp / f"b{i:03d}.wav"
        subprocess.run([ff, "-v", "error", "-y", "-i", str(mp3), "-ac", "1", "-ar", "44100", str(wav)], check=True)
        dur = _duracion_wav(wav)
        oidas = _palabras_de_alineacion(r.get("alignment") or r.get("normalized_alignment") or {})
        esperadas = texto.split()
        if len(oidas) == len(esperadas):
            pares = [(w, a, b) for w, (_, a, b) in zip(esperadas, oidas)]
        else:  # raro: reparte por proporción de letras para no romper
            total_letras = sum(len(w) for w in esperadas) or 1
            pares, acc = [], 0.0
            for w in esperadas:
                a = acc / total_letras * dur
                acc += len(w)
                pares.append((w, a, acc / total_letras * dur))
        for w, a, b in pares:
            palabras.append({"p": w, "ini": round(t + float(a), 2), "fin": round(t + float(b), 2)})
        lista.append(wav)
        t += dur
        if i + 1 < len(trozos):
            hueco = max(0.2, (pausa if pausa is not None else HUECO_PARRAFO) - 0.25)
            sil = tmp / f"s{i:03d}.wav"
            subprocess.run([ff, "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{hueco:.3f}", str(sil)], check=True)
            lista.append(sil)
            t += _duracion_wav(sil)
    concat = tmp / "lista.txt"
    concat.write_text("".join(f"file '{p.as_posix()}'\n" for p in lista), encoding="utf-8")
    junto = tmp / "junto.wav"
    subprocess.run([ff, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(junto)], check=True)
    subprocess.run([ff, "-v", "error", "-y", "-i", str(junto), "-ar", "44100", "-b:a", "192k", str(salida)], check=True)
    duracion = _duracion_wav(junto)
    shutil.rmtree(tmp, ignore_errors=True)
    return palabras, round(duracion, 2)
