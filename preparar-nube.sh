#!/usr/bin/env bash
# Deja la fábrica lista en una sesión de la nube (unos 2 minutos). Se puede ejecutar las veces que haga falta.
set -e
cd "$(dirname "$0")"
[ -d node_modules/remotion ] || npm ci --no-audit --no-fund
python3 -c "import av" 2>/dev/null || pip3 install -q av imageio-ffmpeg
python3 herramientas/fabrica.py comprobar
