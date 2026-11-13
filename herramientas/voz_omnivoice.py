"""Voz con OmniVoice (k2-fsa, abierto y gratis) para la Fábrica de Animaciones.

Como la voz de ElevenLabs, se genera bloque a bloque (el texto entre dos marcas [pausa N] del guion) y las pausas son
silencios exactos. OmniVoice no da el segundo de cada palabra: eso lo saca después «fabrica transcribir» (Whisper).

Dos maneras de elegir la voz:
- copiarla de un audio corto (3-10 s, en español) con lo que dice escrito: `ref_audio` + `ref_texto`;
- diseñarla con una descripción en inglés: `instruct` («male, low pitch, middle-aged»…).

El modelo (k2-fsa/OmniVoice) se descarga de Hugging Face la primera vez. Sin tarjeta gráfica va con el procesador.
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from voz import HUECO_PARRAFO, ErrorVoz, bloques, _ffmpeg, _duracion_wav

MODELO = os.environ.get("OMNIVOICE_MODELO", "k2-fsa/OmniVoice")
MUESTREO = 24000


def _cargar():
    try:
        import torch
        from omnivoice import OmniVoice
    except ImportError as e:
        raise ErrorVoz(f"OmniVoice no está instalado ({e}). Ejecuta:  pip3 install omnivoice soundfile")
    if torch.cuda.is_available():
        disp, tipo = "cuda:0", torch.float16
    elif getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        disp, tipo = "mps", torch.float16
    else:
        disp, tipo = "cpu", torch.float32
        torch.set_num_threads(max(1, os.cpu_count() or 1))
    try:
        modelo = OmniVoice.from_pretrained(MODELO, device_map=disp, dtype=tipo)
    except Exception as e:  # sobre todo: Hugging Face bloqueado por la red
        raise ErrorVoz(f"No he podido cargar {MODELO} ({type(e).__name__}: {str(e)[:300]}). "
                       "Si es un error de red, el entorno tiene que dejar pasar a huggingface.co y *.hf.co.")
    return modelo, disp


def generar(parrafos, salida, ref_audio=None, ref_texto=None, instruct=None, aviso=None):
    """Genera la voz del guion entero en `salida` (mp3). Devuelve la duración en segundos."""
    import numpy as np
    import soundfile as sf

    if not (ref_audio or instruct):
        raise ErrorVoz("Falta la voz de OmniVoice: un audio de referencia (--ref) o una descripción (--instruct).")
    if ref_audio and not Path(ref_audio).exists():
        raise ErrorVoz(f"No encuentro el audio de referencia: {ref_audio}")
    trozos = bloques(parrafos)
    if not trozos:
        raise ErrorVoz("El guion no tiene texto.")
    aviso = aviso or (lambda i, n, texto: print(f"  · Bloque {i + 1} de {n} ({len(texto.split())} palabras)", flush=True))
    modelo, disp = _cargar()
    print(f"  (OmniVoice en {disp})", flush=True)
    extra = {}
    if ref_audio:
        prompt = modelo.create_voice_clone_prompt(ref_audio=str(ref_audio), ref_text=ref_texto or None)
        extra["voice_clone_prompt"] = prompt
    else:
        extra["instruct"] = instruct
    tmp = Path(tempfile.mkdtemp(prefix="omnivoice-"))
    ff = _ffmpeg()
    lista = []
    for i, (texto, pausa) in enumerate(trozos):
        aviso(i, len(trozos), texto)
        audio = modelo.generate(text=texto.replace("\n\n", " "), **extra)
        wav = tmp / f"b{i:03d}.wav"
        sf.write(str(wav), np.asarray(audio[0], dtype="float32"), MUESTREO)
        wav44 = tmp / f"b{i:03d}_44.wav"
        subprocess.run([ff, "-v", "error", "-y", "-i", str(wav), "-ac", "1", "-ar", "44100", str(wav44)], check=True)
        lista.append(wav44)
        if i + 1 < len(trozos):
            hueco = max(0.2, (pausa if pausa is not None else HUECO_PARRAFO) - 0.25)
            sil = tmp / f"s{i:03d}.wav"
            subprocess.run([ff, "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{hueco:.3f}", str(sil)], check=True)
            lista.append(sil)
    concat = tmp / "lista.txt"
    concat.write_text("".join(f"file '{p.as_posix()}'\n" for p in lista), encoding="utf-8")
    junto = tmp / "junto.wav"
    subprocess.run([ff, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(junto)], check=True)
    subprocess.run([ff, "-v", "error", "-y", "-i", str(junto), "-ar", "44100", "-b:a", "192k", str(salida)], check=True)
    dur = _duracion_wav(junto)
    shutil.rmtree(tmp, ignore_errors=True)
    return round(dur, 2)
