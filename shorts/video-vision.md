# Ver vídeos con video-vision (claude-video-vision v1.4.0, MIT)

Herramienta para que Claude «vea» un mp4: extrae fotogramas con ffmpeg y se los pasa como imágenes (+ metadatos). Código revisado el 2026-11-10: solo ejecuta ffmpeg/ffprobe (y yt-dlp/whisper si se piden), sin red salvo backends opcionales (Gemini/OpenAI/descarga de modelos Whisper). Instalada en `.claude/skills/video-vision/`, registrada en `.mcp.json`.

## Uso (en cualquier hilo con el repo)
1. Una vez por contenedor: `bash .claude/skills/video-vision/setup.sh` (npm ci + build, ~20 s; necesita Node ≥22 y ffmpeg).
2. Las herramientas MCP `video_info`, `video_analyze`, `video_watch`, `video_detail` salen del servidor `video-vision` (.mcp.json; hay que reiniciar/aprobar el MCP del proyecto tras el setup). Flujo: `video_info` → `video_analyze` (si >30 s) → `video_watch` (en Shorts <2 min: `fps:"auto"`) → `video_detail` para ampliar momentos.
3. Si el MCP no está cargado en el hilo, se puede usar igual por script (probado): cliente stdio del SDK MCP contra `node .claude/skills/video-vision/mcp-server/dist/index.js` llamando a `video_watch` con `{path, fps, resolution}`.

## Límites
- Los mp4 deben estar en disco: YouTube está bloqueado (403) desde los hilos, así que el `path` es el mp4 de la carpeta compartida (`/mnt/project-files/...`), no una URL.
- Sin transcripción de audio por defecto (backend «none»): huggingface.co está bloqueado, Whisper local no puede bajar modelos. Gemini/OpenAI requieren API key. Para voz/guion de la competencia, pedir a rafa el texto o usar otra vía; los fotogramas sí funcionan.
- Probado con `shorts/ref-analisis-2026-11-08/prueba-fotogramas-repetidos.mp4` (16 s, 1080x1920): `video_info` y `video_watch` OK.
