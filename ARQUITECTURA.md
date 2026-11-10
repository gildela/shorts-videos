# Fábrica de Animaciones — arquitectura (contrato entre piezas)

Escrito el 26-10-2026. Es la referencia para todo el que toque la fábrica: el panel, las órdenes, el motor de cada
estilo y la skill de Claude hablan entre sí SOLO a través de lo que dice este documento (archivos y API). Si algo
cambia aquí, cambia en todas las piezas.

Precedente que se reutiliza: la Fábrica de Shorts de Mapas (`~/FabricaShortsMapas-dev`), probada en Mac y Windows:
instalador (Node portátil + uv + faster-whisper), lanzador `fabrica`, órdenes en Python, servidor local del panel,
empaquetado por niveles. Lo que cambia: el motor (Remotion 16:9 estilo «Archivo» en vez de mapas), el panel
(acompaña todo el proceso y lee un archivo de estado) y el capado (por ausencia).

## 1. Carpetas

```
FabricaAnimaciones/                  (instalada en ~/FabricaAnimaciones; la gratis en ~/PlantillaAnimaciones)
  fabrica / fabrica.cmd              lanzador → herramientas/fabrica.py (lo crea el instalador)
  Instalar (Mac).command · Instalar (Windows).cmd · instalador/ (instalar.sh, instalar.ps1, requirements.txt)
  EMPIEZA AQUÍ.txt · LICENCIAS.txt · CLAUDE.md · .claude/settings.json
  herramientas/
    fabrica.py        órdenes (ver §2)
    estado.py         lectura/escritura de config/estado.json (ver §3)
    panel.py          servidor local del panel (ver §5)
    voz.py            SOLO comunidad: voz automática con ElevenLabs (no viaja en la gratis)
  panel/              index.html, app.js, mesa.css, iconos.svg, fuentes/InterVariable.woff2, img/ (capturas)
  estilos/<id>/       un estilo = una carpeta cerrada (ver §6). Gratis: solo estilos/archivo/
    estilo.json       nombre, descripción, formato(s), duración, niveles, ejemplo, música por defecto
    LEEME.md          cómo escribe Claude un vídeo en este estilo (piezas, planos, reglas de puesta en escena)
    GUION.md          fórmula del guion de este estilo (estructura, palabras, pausas, tono)
    IDEAS.md          banco de ideas con el dato comprobado (ver §7)
    motor/            código Remotion del estilo (se importa desde src/)
    plantilla/Video.tsx   esqueleto que copia «fabrica nuevo»
    ejemplo/          el vídeo de ejemplo entero (Video.tsx + guion + voz + tiempos + mp4 final)
  src/
    index.ts · Root.tsx              registran las composiciones de src/videos/lista.ts (1920×1080, 30 fps)
    estilos/<id>/ → enlace a estilos/<id>/motor (el constructor copia; en dev, symlink)
    videos/lista.ts                  lista de vídeos registrados (la toca «fabrica nuevo»)
    videos/<id>/Video.tsx            el vídeo del usuario (lo escribe Claude)
    videos/<id>/guion.md             guion con marcas [pausa N] (lo escribe Claude)
    videos/<id>/escenas.json         los 6 momentos para las fotos: [{"nombre":"Gancho","en":"palabra o segundos"}…]
    videos/<id>/subir.txt            1.ª línea título; luego descripción con capítulos y créditos
    videos/<id>/fuentes.md           cada dato con su fuente
  public/
    estilos/<id>/   recursos del estilo (sfx, grano, música, fuentes…)
    videos/<id>/    voz.mp3, voz.tiempos.json (y voz_original.mp3)
  config/
    estado.json     el estado que lee el panel (§3)
    pedido.json     lo último que el usuario pidió en el panel (§4); «fabrica escuchar» lo recoge
    panel.json      puerto y pid del servidor del panel
    ajustes.json    {"canal": "TU CANAL"} (nombre que sale en la cabecera del vídeo; lo pide la skill la 1.ª vez)
    edicion.txt     «gratis» en la plantilla gratis (lo escribe el constructor)
  Pon aquí tu voz/  carpeta vigilada: el usuario deja el mp3 (gratis y, si quiere, comunidad)
  Vídeos listos/    <título>.mp4 + <título>.txt
  salida/<id>/      fotogramas/N.jpg (6), bruto.mp4, registro.txt
```

## 2. Órdenes de `fabrica`

Todas escriben en `config/estado.json` (§3) el paso en el que dejan el vídeo. Códigos de salida: 0 bien, 1 error
(con el error también en estado.json, en llano y con la frase para Claude).

| Orden | Qué hace | Estado que deja |
|---|---|---|
| `fabrica comprobar` | Node, Remotion, Python, Whisper, ffmpeg, estilos | — |
| `fabrica panel [--sin-abrir]` | arranca el servidor local y abre el navegador | `paso: conectar` si no hay vídeo en curso |
| `fabrica escuchar` | bucle: marca «Claude está escuchando» (latido), espera un pedido del panel hasta 9 min y lo imprime (`PEDIDO DEL PANEL …`); al imprimirlo pone el paso que toca («guion_escribiendo», «dibujando»…) | según el pedido |
| `fabrica ideas` | imprime las ideas del estilo con su número y dato (lo que ve el panel) | — |
| `fabrica nuevo <id> --estilo archivo --idea N` | crea `src/videos/<id>/` desde `estilos/<estilo>/plantilla/`, registra en lista.ts, guarda la idea. En la gratis, `--idea` es OBLIGATORIO y tiene que ser de IDEAS.md (si no, error 403 en llano). | `paso: guion_escribiendo`, `video_id` |
| `fabrica guion <id>` | valida `guion.md` (800-1300 palabras (formato largo, 6-10 min; el corto de 170-220 es de la comunidad), marcas [pausa N]), calcula duración estimada, genera el texto para ElevenLabs (`<break time="2.0s" />`) y lo publica en el estado | `paso: guion` |
| `fabrica voz <id>` | SOLO comunidad: ElevenLabs → voz.mp3 + tiempos | `paso: dibujando` tras transcribir |
| `fabrica voz-manual <id>` | coge el audio más reciente de «Pon aquí tu voz» (mp3/m4a/wav), lo normaliza a −20 LUFS → `public/videos/<id>/voz.mp3`; llama a `transcribir` | `paso: voz_recibida` → `dibujando` |
| `fabrica transcribir <id>` | faster-whisper (small, cpu) alineado con las palabras del guion → `voz.tiempos.json` (§8) + `transcripcion.txt`; comprueba que la voz dice el guion (avisa si falta una frase); **mete en el audio las pausas `[pausa N]` que la voz no traiga** (ElevenLabs v4 ignora los `<break>`; Multilingual v2 los respeta): corta tras la última palabra antes de la marca y añade el silencio que falte, desplazando los tiempos → `voz.mp3` final (la voz tal cual queda en `voz_norm.mp3`) | — |
| `fabrica fotos <id>` | renderiza los 6 fotogramas de `escenas.json` UNO A UNO (`remotion still`), escribiendo cada uno en `salida/<id>/fotogramas/N.jpg` y actualizando el estado tras cada uno | `paso: dibujando` → `revisar` |
| `fabrica render <id>` | `remotion render` (sin voz) → pega la voz con ffmpeg desde el segundo 0 → −14 LUFS → `Vídeos listos/<título>.mp4` + `.txt`; latido cada 20 s; estimación de tiempo | `paso: montando` → `listo` |
| `fabrica estado <paso> [--texto …]` | cambia el paso a mano (lo usa la skill para «guion_escribiendo» tras un cambio pedido) | el que se diga |
| `fabrica error "<título en llano>" "<frase para Claude>" [--detalle …]` | deja un error en el estado (también lo hacen solas las órdenes al fallar) | añade `error` |
| `fabrica claves` | SOLO comunidad: guarda la clave de ElevenLabs | — |

Reglas: sin `cd`; rutas relativas a la raíz de la fábrica; Mac `./fabrica`, Windows `.\fabrica.cmd`.

## 3. `config/estado.json` (lo que lee el panel cada 2 s)

```json
{
  "version": 1,
  "edicion": "gratis" | "completa",
  "carpeta": "PlantillaAnimaciones",          // nombre real de la carpeta instalada (para la guía de la 1.ª vez)
  "comando": "/animaciones-gratis",           // lo que el usuario escribe en Claude
  "paso": "conectar" | "idea" | "guion_escribiendo" | "guion" | "voz" | "voz_recibida" | "dibujando" | "revisar" | "montando" | "listo",
  "latido": 1761470000.0,                     // época (segundos) de la última señal de Claude/la fábrica
  "escuchando": true,                         // «fabrica escuchar» está corriendo (archivo config/escuchando reciente)
  "trabajando": false,                        // una orden larga está corriendo (fotos, render, transcribir)
  "video_id": "pasos-techo",
  "estilo": "archivo",
  "idea": {"n": 1, "titulo": "Si oyes pasos en el techo a las 3:00", "dato": "…", "fuentes": 2},
  "guion": {"texto_md": "…con [pausa 2]…", "texto_elevenlabs": "…<break time=\"2.0s\" />…", "palabras": 185, "duracion_estimada": 100},
  "voz": {"archivo": "pasos-techo.mp3", "duracion": 98.4, "dice_el_guion": true, "faltan": []},
  "fotogramas": [{"n": 1, "nombre": "Gancho", "ruta": "salida/pasos-techo/fotogramas/1.jpg", "listo": true}, …],   // 6, en orden
  "progreso": {"texto": "Escena 3 de 6", "hecho": 2, "total": 6, "inicio": 1761469900.0, "estimado": 240},
  "video": {"ruta": "Vídeos listos/Si oyes pasos….mp4", "titulo": "…", "descripcion": "…", "duracion": 100.2},
  "error": null | {"titulo": "Algo ha fallado al dibujar la regla 2", "frase": "Ha fallado el dibujo de la regla 2, arréglalo y sigue.", "detalle": "…técnico…", "cuando": 1761470000.0}
}
```

- `herramientas/estado.py` expone `leer()`, `poner(**campos)` (fusiona y escribe de forma atómica), `latido()`,
  `error(titulo, frase, detalle)`, `limpiar_error()`.
- Latido: toda orden larga lo renueva al menos cada 20 s. El panel: latido < `margen` (lo manda `/api/estado` según
  el paso: `MARGEN` de `estado.py`, 8-10 min mientras Claude piensa el guion o las escenas, 90 s en los demás) → «Claude está trabajando» (si
  `trabajando`) o «Claude está escuchando» (si `escuchando`); si no, «Claude no está conectado» → guía de la 1.ª vez.
- El panel pinta la pantalla SOLO a partir de `paso` (+ `error`): recargar aterriza donde estaba. Excepción: en «idea»
  (sin vídeo empezado), sin escuchar y con más de 30 min sin señal, `/api/estado` sirve `paso: conectar` (vuelve al
  paso a paso: otro día, o al reinstalar encima de una prueba); `estado.json` no se toca.

## 4. `config/pedido.json` (lo que el usuario decide en el panel)

```json
{"tipo": "idea", "estilo": "archivo", "idea": 1, "hora": 1761469000.0}
{"tipo": "guion_ok"}                                   // «Me vale»
{"tipo": "guion_cambio", "texto": "la regla dos más corta"}
{"tipo": "escenas_ok"}                                 // «Me gusta, haz el vídeo»
{"tipo": "escenas_cambio", "texto": "el gato más grande"}
{"tipo": "otro"}                                       // «Hacer otro vídeo» → paso idea
```

`fabrica escuchar` lo recoge, lo mueve a `pedido-anterior.json`, cambia el paso y lo imprime así:

```
PEDIDO DEL PANEL · idea
- Estilo: archivo (Archivo) → lee estilos/archivo/LEEME.md y copia la estructura de estilos/archivo/ejemplo/Video.tsx
- Idea 1: Si oyes pasos en el techo a las 3:00 — Dato: … (compruébalo en 2 fuentes)
- Formato: largo (gancho + archivo + 5-7 reglas + cierre, 800-1300 palabras, 6-10 min de vídeo)
- Voz: la pone el usuario a mano (paso «voz» cuando apruebe el guion)
Siguiente: fabrica nuevo <id> --estilo archivo --idea 1 · escribe el guion · fabrica guion <id> · fabrica escuchar
```

En la gratis, el servidor rechaza con 403 cualquier pedido con un estilo o una idea que no sean gratis.

## 5. API del panel (`herramientas/panel.py`, solo 127.0.0.1, puerto 8790-8809)

| Método y ruta | Devuelve / hace |
|---|---|
| `GET /` | `panel/index.html` |
| `GET /panel/<archivo>` | app.js, mesa.css, iconos.svg, fuentes/, img/ (solo esa carpeta) |
| `GET /api/estado` | el estado (§3) + `escuchando`/`trabajando` calculados + `enlace_comunidad` + `ahora` |
| `GET /api/datos` | `{edicion, carpeta, comando, estilos:[{id,nombre,descripcion,bloqueado,foto}], ideas:[{n,estilo,titulo,dato,fuentes,ejemplo,bloqueado}], listos:N}` |
| `GET /api/fotograma/<id>/<n>` | `salida/<id>/fotogramas/<n>.jpg` |
| `GET /api/voz/<id>` | `public/videos/<id>/voz.mp3` (con Range) |
| `GET /api/video/<id>` | el mp4 de «Vídeos listos» (con Range) |
| `GET /api/ejemplo/<estilo>` | el mp4 del ejemplo del estilo (con Range), para la portada |
| `GET /api/estilo/<estilo>/foto` | fotograma de portada del estilo (jpg) |
| `POST /api/pedido` | cuerpo §4; 403 si no está permitido; `{ok, claude: escuchando}` |
| `POST /api/abrir` | `{"que": "voz" | "listos" | "elevenlabs" | "comunidad" | "claude"}` → abre carpeta o web |
| `POST /api/canal` | `{"canal": "…"}` → config/ajustes.json |

El panel copia al portapapeles con `navigator.clipboard` (localhost cuenta como seguro). Aviso al terminar: cambia el
título de la pestaña y reproduce un sonido corto (el usuario ya hizo clic antes). Sin notificaciones del sistema.

## 6. Un estilo = una carpeta cerrada (`estilos/<id>/`)

- `estilo.json`: `{"id":"archivo","nombre":"Archivo","descripcion":"…","niveles":["gratis","comunidad"],"formatos":{"largo":{"niveles":["gratis","comunidad"],"palabras":[800,1300],"duracion":[360,600],"estructura":"gancho + archivo + 5-7 reglas + cierre"},"corto":{"niveles":["comunidad"],"palabras":[170,220]}},"ejemplo":"ejemplo-gato","musica":"…"}`
- El motor NO sabe nada del panel ni de la fábrica: recibe tiempos de voz, planos y ajustes, y pinta.
- Nunca nombres de canales reales: la cabecera lee `canal` de `config/ajustes.json` (por defecto «TU CANAL»).
- **Capado por ausencia:** el constructor (`empaquetar/construir.py`, con `empaquetar/niveles.json`) solo mete en el
  ZIP gratis `estilos/archivo/` y `public/estilos/archivo/`, quita `herramientas/voz.py`, la orden `claves`, la
  orden `voz`, el formato largo del LEEME y las ideas de otros estilos; escribe `config/edicion.txt` = gratis. Además
  `panel.py` (403) y `fabrica nuevo` (idea obligatoria y de la lista) no dependen de ningún texto para Claude.

## 7. `IDEAS.md` de un estilo

```
## Se puede ya (largo)
1. **Si oyes pasos en el techo a las 3:00** — La madera del tejado cruje al enfriarse… · Fuentes: <url>, <url>
2. **Si tu gato te mira mientras duermes** — … (Hecho: `ejemplo-gato`)
## Ideas de la comunidad (corto y lotes)
…
```
El panel y `fabrica ideas` leen este archivo; `(Hecho: \`id\`)` marca la que tiene ejemplo.

## 8. `voz.tiempos.json` (lo que anclan los planos)

El mismo formato que el motor de Stick Explica (`crearTiempos`):
```json
{"duracion": 98.4,
 "capitulos": [],
 "frases": [{"texto": "Son las tres y cuatro minutos de la madrugada.", "ini": 0.21, "fin": 2.9}, …],
 "palabras": [{"p": "Son", "ini": 0.21, "fin": 0.35}, …]}
```
- `palabras` son las del guion (con su puntuación) con los tiempos que se han oído; las que Whisper se come se
  reparten en su hueco (como en mapas). `frases` se cortan por `. ? ! …` del guion. Las marcas `[pausa N]` no son
  palabras.
- El plano se ancla con `E("texto")` (segundo en que empieza a decirse) y el subtítulo es la frase exacta del guion.

## 9. El guion (`src/videos/<id>/guion.md`)

Texto plano con párrafos y marcas `[pausa 2]` / `[pausa 1.5]` en su propia línea (igual que `herramientas/voz.py`
de Canales). `fabrica guion` lo convierte para ElevenLabs: cada marca → `<break time="2.0s" />` en línea (ElevenLabs
admite hasta 3 s por marca). Lo que el panel copia es ese texto convertido. 800-1300 palabras (formato largo, 6-10 min; el corto de 170-220 es de la comunidad) en el formato corto.

## 10. Lo que el panel enseña en cada paso (resumen; el diseño está en maquetas/panel2)

conectar → guía de 4 pasos + ejemplo en bucle · idea → rejilla de ideas (+ «Tus propias ideas» con candado en la
gratis) y barra «Escribir el guion» · guion_escribiendo → tarjeta de guion con esqueleto y reloj · guion → guion de
lectura + «Me vale» / «Pedir cambios» · voz → tres pasos (copiar, ElevenLabs, carpeta) con el azul en el que toca +
punto de espera · voz_recibida → «Voz recibida · archivo · duración» y pasa solo · dibujando → fotograma grande +
tira de 6 que se rellena + segmentos · revisar → grande + tira + «Me gusta, haz el vídeo» / «Cambiar algo» ·
montando → tira fija + barra + aviso de no cerrar el portátil · listo → vídeo + acciones + estilos de la comunidad ·
error (en cualquier paso) → hoja con la frase para Claude.
