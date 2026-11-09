---
name: animaciones-nube
description: Fábrica de Animaciones en la nube — hace un vídeo animado 1920×1080 (estilo «Archivo») de principio a fin desde un hilo de Claude, con la voz automática de ElevenLabs. Activar cuando el usuario pida un vídeo animado, «un vídeo de reglas», «la fábrica» o «animación 2D». Responder siempre en español llano.
---

# Fábrica de Animaciones en la nube

El usuario lo sigue todo desde el hilo: tú le enseñas el guion, las fotos de revisión y el vídeo final, y él dice
«me vale» o qué cambiar. No hay panel ni carpetas que vigilar. Las órdenes son `python3 herramientas/fabrica.py <orden>`
(abajo, «fabrica …»), siempre desde la raíz del repo.

## 0. Al empezar la sesión

`./preparar-nube.sh`. Si dice que falta `ELEVENLABS_API_KEY` o la voz falla con «403 Forbidden» en el túnel, la sesión
no puede hacer la voz: díselo al usuario en una línea (falta la clave en el entorno, o el dominio `api.elevenlabs.io`
en los dominios permitidos del entorno) y sigue con lo que no dependa de la voz (guion, fuentes).
Si es la primera vez y el canal es «TU CANAL», pregúntale el nombre de su canal y guárdalo con `fabrica canal "NOMBRE"`.

## 1. La idea y el guion

1. Si el usuario no trae idea, enséñale 3-5 de `fabrica ideas` (o de `estilos/archivo/IDEAS.md`) y que elija. Puede
   traer una idea propia.
2. Comprueba el dato central en 2 fuentes fiables (búsqueda web). Nunca inventes una cifra.
3. `fabrica nuevo <id> --estilo archivo` (id corto: minúsculas y guiones; con `--idea N` si es del banco).
4. Escribe `src/videos/<id>/guion.md` con la fórmula de `estilos/archivo/GUION.md` (marcas `[pausa N]` en su propia
   línea) y `src/videos/<id>/fuentes.md`.
5. `fabrica guion <id>` (cuenta palabras y duración). Corrige si avisa.
6. **Pásale el guion al usuario en el hilo** (adjunta `guion.md` copiado a `/mnt/project-files/videos/<id>/`) con la
   duración estimada y pregunta si vale. Si pide cambios, reescribe y repite.

## 2. La voz (automática)

Cuando el guion vale: `fabrica voz <id>`. ElevenLabs lee el guion bloque a bloque (cada `[pausa N]` es un silencio
exacto) y devuelve el segundo de cada palabra, así que **no hace falta transcribir**. Deja `public/videos/<id>/voz.mp3`,
`voz.tiempos.json` y `src/videos/<id>/transcripcion.txt`.
- Voz por defecto: `fabrica voz-id` la dice y la cambia; una vez: `fabrica voz <id> --voz <ID>`.
- Gasta créditos de ElevenLabs: **no repitas la orden** salvo que el usuario pida otra voz o cambie el guion.
- Copia `voz.mp3` a `/mnt/project-files/videos/<id>/` y adjúntala en el hilo para que la escuche.

## 3. Las escenas

1. Lee `src/videos/<id>/transcripcion.txt` y `estilos/archivo/LEEME.md` entero.
2. Escribe los planos como dice el LEEME (vídeo largo: `comun.tsx` + un archivo por bloque + `Video.tsx`), copiando
   la estructura de `estilos/archivo/ejemplo/Video.tsx`. Cada plano anclado a una palabra con `E("…")`.
3. Comprueba bloque a bloque: `npx tsc --noEmit -p .` y `fabrica revisar <id> "s1,s2,…"` (hoja en
   `salida/revisar/<id>/hoja.jpg`; mírala).
4. `src/videos/<id>/escenas.json`: 6-8 momentos anclados a palabras de la transcripción.
5. `fabrica fotos <id>` → `salida/<id>/fotogramas/hoja.jpg`. MÍRALA y arregla lo que se pise o no cuadre (máx. 2 vueltas).
6. Escribe `src/videos/<id>/subir.txt` (1.ª línea título; descripción, capítulos y créditos de
   `public/estilos/archivo/musica/CREDITOS.tsv`).
7. Copia la hoja y los fotogramas a `/mnt/project-files/videos/<id>/fotos/` y **adjunta la hoja en el hilo**:
   «¿Me gusta, hago el vídeo, o cambio algo?».

## 4. El vídeo

Cuando el usuario aprueba: `fabrica render <id>` en segundo plano (en la nube tarda unos 7-8 minutos por minuto de
vídeo; un vídeo de 8 minutos, alrededor de una hora). El mp4 y su .txt quedan en `/mnt/project-files/Vídeos listos/`.
Adjunta el mp4 en el hilo con el título y la descripción.

## 5. Guardar el trabajo

La sesión de la nube se borra: al acabar cada paso grande, haz commit y push del vídeo (`src/videos/<id>/`,
`public/videos/<id>/voz.tiempos.json`, `voz.mp3`) a la rama de trabajo. `salida/` y los mp4 no van al repo.

## Si algo falla

- «No encuentro «…» en la voz»: usa otra palabra de `transcripcion.txt`.
- La voz no cuadra con el guion (número de palabras): vuelve a `fabrica guion <id>` y revisa que no haya texto raro.
- Errores de ElevenLabs: el mensaje dice si es la clave (401), los créditos (402) o la red (403 en el túnel).
- Nunca borres voces ni vídeos terminados del usuario.
