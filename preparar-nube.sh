#!/usr/bin/env bash
# Deja la fábrica lista en una sesión de la nube (unos 2 minutos). Se puede ejecutar las veces que haga falta.
#   ./preparar-nube.sh             ElevenLabs (lo normal)
#   ./preparar-nube.sh omnivoice   además, OmniVoice + Whisper (la voz gratis; descarga varios GB la primera vez)
set -e
cd "$(dirname "$0")"
[ -d node_modules/remotion ] || npm ci --no-audit --no-fund
# av 14 o superior quita el argumento que usa faster-whisper (metadata_errors): se fija a <14
python3 -c "import av" 2>/dev/null || pip3 install -q "av<14" imageio-ffmpeg
if [ "$1" = "omnivoice" ] || grep -q '"motor_voz": *"omnivoice"' config/ajustes.json 2>/dev/null; then
  if ! python3 -c "import torch" 2>/dev/null; then
    # torch sin tarjeta gráfica si las ruedas de download.pytorch.org se pueden bajar; si no, cae al de PyPI (más pesado: trae CUDA)
    pip3 install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu 2>/dev/null || true
  fi
  python3 -c "import omnivoice, faster_whisper, soundfile" 2>/dev/null || pip3 install -q omnivoice faster-whisper soundfile "av<14"
fi
python3 herramientas/fabrica.py comprobar
