#!/usr/bin/env bash
# Instala y compila el servidor MCP de video-vision (hace falta una vez por contenedor).
set -e
cd "$(dirname "$0")/mcp-server"
npm ci --ignore-scripts --no-audit --no-fund
npm run build
echo "OK: $(pwd)/dist/index.js"
