# Fábrica de Animaciones · versión nube

Vídeos animados 2D (estilo «Archivo») hechos de punta a punta en una sesión de Claude en la nube, sin el ordenador
del usuario: guion, voz automática con ElevenLabs, escenas con Remotion, fotos de revisión y vídeo final.

- Sigue SIEMPRE `skill/animaciones-nube/SKILL.md`. En la nube no hay panel: **el hilo del proyecto es el panel**.
- Lo primero de cada sesión: `./preparar-nube.sh` (instala lo que falte y comprueba la clave de ElevenLabs).
- Órdenes: `python3 herramientas/fabrica.py <orden>` (en este documento, «fabrica <orden>»).
- Contrato de archivos: `ARQUITECTURA.md` (las partes del panel local y del instalador no se usan en la nube).
- Cómo se dibuja cada estilo: `estilos/<id>/LEEME.md`; cómo se escribe el guion: `estilos/<id>/GUION.md`.
- Los vídeos terminados van a `/mnt/project-files/Vídeos listos/` (carpeta compartida del proyecto, sobrevive a la sesión).
- La clave de ElevenLabs llega como variable de entorno `ELEVENLABS_API_KEY`. **Nunca la pidas por el chat ni la escribas en un archivo.**
- Habla con el usuario en español llano y en frases cortas.
