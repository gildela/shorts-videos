#!/usr/bin/env bash
# Deja la fábrica lista en una sesión de la nube (unos 2 minutos). Se puede ejecutar las veces que haga falta.
#   ./preparar-nube.sh             ElevenLabs (lo normal)
#   ./preparar-nube.sh omnivoice   además, OmniVoice + Whisper (la voz gratis; descarga varios GB la primera vez)
set -e
cd "$(dirname "$0")"
[ -d node_modules/remotion ] || npm ci --no-audit --no-fund
python3 -c "import av" 2>/dev/null || pip3 install -q av imageio-ffmpeg
if [ "$1" = "omnivoice" ] || grep -q '"motor_voz": *"omnivoice"' config/ajustes.json 2>/dev/null; then
  if ! python3 -c "import torch" 2>/dev/null; then
    # torch sin tarjeta gráfica (mucho más ligero) si la red deja pasar a download.pytorch.org; si no, el de PyPI
    pip3 install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu 2>/dev/null || true
  fi
  python3 -c "import omnivoice, faster_whisper, soundfile" 2>/dev/null || pip3 install -q omnivoice faster-whisper soundfile
fi
python3 herramientas/fabrica.py comprobar
