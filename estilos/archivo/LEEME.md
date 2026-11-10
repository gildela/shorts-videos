# Estilo «Archivo» — cómo escribe Claude un vídeo

Esto es para un Claude que no ha visto nunca el motor. Léelo entero antes de tocar `src/videos/<id>/Video.tsx`.
El guion se escribe con `GUION.md` (al lado); aquí va el montaje. Un vídeo de este estilo dura **de 6 a 10 minutos**
(800-1300 palabras, de cinco a siete reglas) y se escribe **por bloques** (§2). El ejemplo entero, que funciona y que
conviene copiar plano a plano, está en `ejemplo/Video.tsx` (es el vídeo registrado `ejemplo-gato`): es la versión
corta del gato (1:38, dos reglas), así que úsalo como muestra de planos y piezas, no de longitud.

## 1. Qué es el estilo en una frase

Un expediente de un departamento inventado (el «Negociado de Asuntos Nocturnos») que te lee, con voz plana de
funcionario, reglas de supervivencia para una situación de casa. Se ve como una cinta VHS: pictogramas blancos
macizos con un halo suave sobre negro puro, cabecera «ARCHIVO 017 // TU CANAL», subtítulos en mayúsculas y cortes
de estática. Lo inquietante es amarillo. Lo demás no tiene color.

## 2. Los archivos de un vídeo

```
src/videos/<id>/Video.tsx        junta los bloques y pone cabecera, sustos, silencios y apagón (esto es lo que escribes)
src/videos/<id>/comun.tsx        los tiempos de la voz (T, E) y las posiciones que se repiten, para todos los bloques
src/videos/<id>/S1.tsx … S7.tsx  los planos, un archivo por bloque (gancho, cada regla o pareja de reglas, giro, cierre)
src/videos/<id>/guion.md         el guion con sus [pausa N]
src/videos/<id>/escenas.json     los 6-8 momentos para las fotos de revisión
src/videos/<id>/subir.txt        título + descripción (con los créditos de la música)
src/videos/<id>/fuentes.md       cada dato con su fuente
public/videos/<id>/voz.mp3       la voz (la deja «fabrica voz-manual» / «fabrica voz»)
public/videos/<id>/voz.tiempos.json   palabras y frases con su segundo (la deja «fabrica transcribir»)
```

`fabrica nuevo <id> --estilo archivo` copia `plantilla/Video.tsx` con el id puesto y registra el vídeo en
`src/videos/lista.ts`. Tú rellenas los planos. El nombre del canal de la cabecera sale solo de `src/ajustes.json`
(`{"canal": "…"}`): **nunca escribas un nombre de canal en el vídeo.**

### Un vídeo de 6-10 minutos se escribe por bloques

Un vídeo de 8 minutos son **60-90 cambios de plano grandes** (uno cada 5-8 s); contando los planos cortos de susto y
los cambios dentro de una escena, la lista `planos` sale más larga (el vídeo largo del gato tiene 129 entradas en
8:08; el corto de ejemplo, 35 en 1:38). En un solo `Video.tsx` eso son más de 2.500 líneas: inabarcable. Haz como el
vídeo largo de referencia: **un archivo por bloque** dentro de `src/videos/<id>/`, cada uno con su lista de planos,
y `Video.tsx` solo los junta.

```tsx
// src/videos/<id>/comun.tsx — lo que comparten todos los bloques
import { crearTiempos } from "../../estilos/archivo/tiempos";
import voz from "../../../public/videos/<id>/voz.tiempos.json";
export const T = crearTiempos(voz);
export const E = T.en;
export const CABEZA = { x: 1050, y: 424 };
export const GATO = { x: 600, y: 500 };

// src/videos/<id>/S2.tsx — un bloque (aquí, la regla uno): importa las piezas que use, como el Video.tsx de la plantilla
import { E, CABEZA, GATO } from "./comun";
export const PLANOS_S2: Plano[] = [ { desde: E("Regla número uno"), entra: "glitch", pinta: (t) => <TarjetaRegla … /> }, … ];

// src/videos/<id>/Video.tsx — junta los bloques y pone lo de todo el vídeo (§7)
import { T, E } from "./comun";
import { PLANOS_S1 } from "./S1";   // … hasta S7
const planos = [...PLANOS_S1, ...PLANOS_S2, /* … */ ...PLANOS_S7].sort((a, b) => a.desde - b.desde);
```

- **Un bloque por regla** (o por pareja de reglas cortas), más el gancho con la apertura, el giro y el cierre: de 5 a 9
  archivos. Usa los títulos `# Regla uno`… del `guion.md` como frontera: cada bloque empieza en la primera palabra de
  su título en la voz.
- **Escribe y comprueba bloque a bloque**: `npx tsc --noEmit -p .` y un par de fotogramas sueltos (`npx remotion
  still … --frame=N`) al acabar cada uno, antes de pasar al siguiente. Un error en el bloque 2 se arregla mejor ahí que
  en el 7.
- `T`, `E` y las posiciones fijas van **solo** en `comun.tsx`; los bloques no leen la voz por su cuenta.
- El vídeo largo del gato está hecho así: `S1.tsx` (gancho y archivo) … `S7.tsx` (giro, regla siete de verdad y
  cierre), de 220 a 640 líneas cada uno.

### Cuánto tarda (honesto)

- **Dibujar las escenas** de un vídeo de 8 minutos le lleva a Claude **bastante más que uno de 1:40**: hay cuatro o
  cinco veces más planos, y cada bloque hay que escribirlo, comprobarlo y mirarlo en fotos. Cuenta con varias horas de
  trabajo, repartidas en varios ratos (un bloque o dos cada vez). No intentes hacerlo de un tirón.
- **El render** tarda unos **4 minutos por minuto de vídeo** en un Mac reciente: unos 30-35 minutos para un vídeo de
  8 minutos (más en un ordenador viejo o en Windows con poca memoria). `fabrica render` pega la voz y normaliza al final.
- Las fotos de revisión (`fabrica fotos`, 6-8 momentos) tardan poco: son fotogramas sueltos.

## 3. La voz manda: anclar un plano a una palabra

En un vídeo por bloques, estas tres líneas van en `comun.tsx` y los bloques importan `E` de ahí.

```ts
import voz from "../../../public/videos/<id>/voz.tiempos.json";
export const T = crearTiempos(voz);
const E = T.en;          // E("dos puntos amarillos") → segundo en que la voz EMPIEZA a decirlo
// T.fin("amarillos")    → segundo en que TERMINA; E("luz", 42) → la primera «luz» a partir del segundo 42
```

- Escribe las palabras como están en `guion.md`; da igual tildes, mayúsculas y puntuación.
- Si una palabra se repite («luz» sale cuatro veces), usa varias seguidas («No enciendas la luz») o el segundo
  parámetro `desde`.
- Si la voz no dice lo que buscas, el vídeo **no se monta** y el error te dice qué palabra falta. Así nada sale a
  destiempo.
- Las frases (`T.frases`) son los subtítulos: el motor pone la frase exacta del guion mientras se dice. Tú no
  escribes subtítulos.

## 4. Un plano

```tsx
const planos: Plano[] = [
  {
    desde: E("Y a los pies"),       // segundo en que empieza (dura hasta el siguiente plano)
    entra: "glitch",                // opcional: "corte" (por defecto) | "glitch" (estática) | "negro" (desde negro)
    pinta: (t, f) => (              // t = segundos desde que empezó el plano; f = fotogramas
      // plano general del dormitorio: zoom de respiración (1,0 → 1,06). Con más zoom la cama cae bajo el
      // subtítulo (y = 820 en pantalla): los primeros planos del dormitorio se encuadran como dice §6.5
      <Lienzo zoom={kf(t, [[0, 1.0], [3.4, 1.06]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <PersonaCama x={1050} y={424} ojos={1} />
          <GatoSentado x={600} y={500} f={f} oscuro halo={1} />
        </Dormitorio>
        <S en={E("dos puntos") - E("Y a los pies")} n="impacto" v={0.4} />
      </Lienzo>
    ),
  },
];
```

- **Las tarjetas (`TarjetaRegla`, `TarjetaTitulo`) SÍ llevan el subtítulo** del motor debajo, como en el ejemplo
  y en el vídeo de referencia: no les pongas `sinSubtitulo`. `sinSubtitulo: true` se reserva para el apagón y para
  los sustos de 1-3 fotogramas (los ojos solos en el negro); `sinInterfaz: true` quita también la cabecera
  (apagones a mitad).
- Dentro de `pinta`, los segundos son **del plano**. Para algo que pasa en una palabra concreta:
  `const k = t - (E("palabra") - E("palabra con la que empieza el plano"))` y luego `pop(k)`, `fade(k)`, `k > 0`.

### `Lienzo`, `kf`, `pop`, `fade`

- `<Lienzo zoom cx cy dx dy suelo>`: el cuadro de 1920×1080 con la cámara y el halo (bloom) en todo lo que haya
  dentro. `zoom` alrededor de (`cx`, `cy`); `dx`/`dy` para sacudidas; `suelo` pinta la línea gris del suelo en
  y = 800 (o `suelo={700}` en otra altura). Todo lo que pintes va en coordenadas del cuadro.
- `kf(t, [[t0, v0], [t1, v1], …])`: movimiento por tramos con suavizado. `kf(t, [[0, 1.0], [3, 1.06]])` es el zoom
  típico (3-6 % en 3 s). `kf(t, puntos, false)` sin suavizar.
- `pop(k)`: aparición con rebote (0 → 1 pasándose un poco), para casillas, cruces, etiquetas, sellos. `k` = segundos
  desde que aparece; si `k ≤ 0` devuelve 0.
- `fade(k, dur = 0.3)`: fundido 0 → 1. Para `opacity`.
- Las piezas con prop `k` ya llevan la aparición dentro, pero no todas igual. **Rebotan** (`pop`): `Casilla`,
  `FilaCasillas`, `Cruz`, `Tick`, `Sello`, `Bocadillo`, `EtiquetaTu`, `LogoNegociado`, `Documento`, `Marcador`,
  `Monitores`, `Portapapeles`, `Cronometro`, `Pasos`, `Raton`, `Lapiz`, `Agujero`. **Funden** (`fade`, sin rebote):
  `Texto`, `Rotulo`, `TarjetaDato`, `Cota`, `FichaSujeto`, `Recorte`, `PantallaPartida`, `PantallaFinal`; las
  tarjetas de pantalla entera funden con un rebote mínimo. `Huellas` aparece una a una sin rebote. `Ondas` no tiene
  aparición ni giro: su `k` solo mueve los arcos (salen hacia la derecha, o hacia la izquierda con `izq`); para que el
  sonido baje del techo o suba del suelo, envuélvela: `<g transform="rotate(90 960 150)"><Ondas x={960} y={150} k={t} /></g>`.
- `parpadeo(f, semilla)`: 1 cuando el ojo está cerrado, cada ~4 s. `abre={1 - parpadeo(f, 2)}`.

### Efectos de sonido

`<S en={0.55} n="blip_grave" v={0.3} />` dentro del plano: suena 0,55 s después de empezar el plano. Nombres:
`blip` (aparece algo), `blip_grave` (cruz, algo que falla), `impacto` (susto, sello), `latido`, `aliento`,
`suspiro`, `cristal` (vaso que cae), `clic` (interruptor), `golpe`, `golpes` (nudillos), `tecla`, `estatica`,
`estatica_larga`, `cinta_para`. La estática de cada `entra: "glitch"`, el tecleo de la tarjeta de regla y el
apagón final suenan solos. Volumen 0,1-0,2 para los blips, 0,3-0,45 para impactos.

## 5. Las piezas (`src/estilos/archivo/piezas/`)

Todas van **dentro de `<Lienzo>`** (son SVG) salvo las tarjetas (`TarjetaRegla`, `TarjetaTitulo`, `TarjetaPregunta`,
`PantallaCTA`, `PantallaFinal`, `PantallaPartida`), que ocupan la pantalla entera y van solas en `pinta`. Convención: `(x, y)` es la base en el
suelo para muebles y figuras de pie, el centro para caras y objetos; `k` = segundos desde que aparece (rebote);
`f` = fotogramas (para colas, parpadeos, temblores); `escala` multiplica el tamaño.

**Interfaz.tsx** — la gráfica del expediente
- `TarjetaRegla n titulo k escribeDesde?` — «REGLA [n]», raya roja, el título escrito a máquina desde el segundo
  `escribeDesde` del plano (ponlo en la palabra en que la voz dice el título), barra 1-7. Pantalla entera.
- `TarjetaTitulo grande pequeno? k` — «ARCHIVO 017» con subtítulo gris («FELINO DOMÉSTICO»). Pantalla entera.
- `TarjetaPregunta pregunta k escribeDesde? opciones? kOpciones? pie? rotulo?` — las consultas al público
  (`GUION.md` §6): «CONSULTA DEL NEGOCIADO», raya roja, la pregunta escrita a máquina desde `escribeDesde` (la palabra
  en que la voz empieza la pregunta) y, en `kOpciones` (la palabra «comentarios»), las cajas de respuesta
  (`opciones={["MÍO", "LIBRE"]}`, solo en las de «elige uno») y el pie amarillo «RESPONDE EN LOS COMENTARIOS».
  Pantalla entera, `entra: "glitch"`. Aguanta mientras dura la consulta; el remate («Las estamos contando») puede ir
  ya en un dibujo.
- `PantallaCTA k kTick? comenta? kComenta? siguiente? kSiguiente? accion?="SUSCRÍBETE" rotulo?="TRÁMITE FINAL"` — el
  CTA final, obligatorio en todos los vídeos: la casilla grande que se marca con un ✓ verde y un impacto en `kTick`
  (la palabra «suscríbete»), «COMENTA: …» en amarillo en `kComenta` y «SIGUIENTE ARCHIVO: 018» en `kSiguiente`. Va
  entre el cierre y el último plano (`PantallaFinal`, «PSPSPS.»), con `entra: "glitch"`. Ejemplo en
  `estilos/archivo/plantilla/Video.tsx`.
- `EtiquetaTu x y k texto?="TÚ" f?` — etiqueta amarilla con flecha; (x, y) = punta de la flecha. Flota.
- `Casilla x y estado k tam? num?` — `estado`: `"vacia" | "ok" | "no" | "num" | "interrogante"`.
- `FilaCasillas x y marcadas k kMarca? n?=7 tam? ultimaInterrogante?` — las 7 casillas; `kMarca` = segundos desde
  que empiezan a ponerse verdes una a una.
- `Cruz x y k tam?` (roja, prohibido) · `Tick x y k tam?` (verde, correcto).
- `Sello x y texto k color? giro?` — sello girado («COMPROBADO» en `C.verde`, «NO PRÁCTICO» en rojo).
- `Bocadillo x y texto k haciaIzquierda? tam? ancho?` — bocadillo blanco; (x, y) = la punta.
- `LogoNegociado x y r? texto? k?` — círculo con las gafas; `texto` añade «NEGOCIADO DE ASUNTOS NOCTURNOS».
- `Marcador x y rotulo valor k` — número gigante con rótulo encima («VECES QUE HA FUNCIONADO · 0»).
- `Documento x y titulo? lineas? giro? k w? h?` — hoja blanca con título y rayas; admite hijos (coordenadas
  centradas en la hoja).
- `TarjetaDato x y fuente k w? h?` — marco con esquinas y la fuente en pequeño debajo («SCIENTIFIC REPORTS · 2020»);
  admite hijos.
- `Rotulo x y grande pequeno? k` — raya roja vertical + texto («VISTA DEL GATO» / «03:04 · DORMITORIO»).
- `Texto x y texto tam? color? peso? k? ancla? esp?` — texto suelto en mayúsculas («× 6», «REC»).

**Persona.tsx** — TÚ (pictograma blanco, sin contorno)
- `PersonaCama x y ojos? boca? sudor? respira? cuerpo?` — tumbado de lado; (x, y) = centro de la cabeza, mira a la
  izquierda. `ojos` 0 cerrados … 1 abiertos.
- `CabezaGrande x y r? ojos? sudor? cuello?` — solo la cabeza, en primer plano.
- `PersonaDePie x y pose? fase? haciaIzquierda? ojos? frente? enMano? escala?` — poses: `quieto | anda |
  brazosAbiertos | senala | inclinado | manosCara | sentado | agachado | linterna`; `fase` 0-1 = ciclo de andar
  (`fase={(t * 1.4) % 1}`). Alto ≈ 300.
- `PersonaInclinada x y grados? haciaIzquierda?` · `Empleado x y cabeza? escribe?` (el del Negociado, tras la mesa) ·
  `Mano x y giro? escala?`.

**Gato.tsx** — el gato (silueta blanca, ojos amarillos de pupila vertical)
- Props comunes (`PropsGato`): `x y escala f abre pupila mira=[dx,dy] halo haciaIzquierda cola orejas cabeza oscuro
  contorno`. `oscuro` = solo los ojos (el gato a oscuras); `contorno` = con borde negro (cuando va sobre blanco);
  `pupila` 0 rendija … 1 redonda (el miedo es rendija).
- `GatoSentado` (de lado, el plano típico a los pies de la cama; alto ≈ 300) · `GatoFrente` · `GatoTumbado
  dormido?` · `GatoAnda fase corre?` · `CaraGato x y r? abre pupila mira halo orejas boca` (primer plano con
  bigotes) · `OjosGato x y r? sep? abre pupila mira halo` (solo los dos ojos en el negro: el susto) · `OjoGato` ·
  `Pata x y largo? giro? garra?` (entra por la izquierda) · `Huellas x y n? sep? k?`.

**Casa.tsx** — muebles y sitios (contorno blanco grueso o macizos)
- `Dormitorio x?=330 y?=800 reloj? ventana?=true` con hijos: cama (de x = 330 a 1230, colchón entre y = 490 y 630,
  patas hasta 800), mesilla en x = 1450 y la **ventana en (380, 230)**, de 190 de lado (ocupa de y = 135 a 325). La
  cabeza de TÚ queda en (1050, 424) y el sitio del gato en (600, 500). **La línea del techo (`Techo`) está en
  y = 190 y cruzaría la ventana**: si hay algo en el techo, `ventana={false}` o directamente `DormitorioTecho`.
  `ventana={false}` también si la ventana va aparte (encendida, de día, en otro sitio).
- `Cama x y w?` · `Mesilla x y vaso? reloj?` · `RelojDigital x y hora escala? rojo?` · `Ventana x y tam? luna?
  encendida? dia?` (`encendida` = luz amarilla de dentro, de noche; `dia` = gris claro sin luna; no uses `sol`) ·
  `Luna x y r?`.
- `Techo y?=190` (la línea gris del techo, como la del suelo) · `DormitorioTecho x? y? reloj? techo?` con hijos (el
  dormitorio sin ventana y con la línea del techo; TÚ va dentro como hijo) · `Desvan x?=960 y?=700 ancho?=1400
  alto?=450` con hijos (la habitación a dos aguas; va con `<Lienzo suelo={SUELO_DESVAN}>`) · `CorteParedes x?=960
  y?=800 ancho?=1260 alto?=500` con hijos (pared-techo-pared, para contar algo entre pared y pared). Constantes
  `TECHO = 190` y `SUELO_DESVAN = 700`.
- `Puerta x y abierta? luz? hueco?` · `Pasillo y?` con hijos · `Escalera x y n?` · `Interruptor x y encendido?
  escala?` · `Bombilla x y encendida? escala?` · `Linterna x y haz? giro?` · `Mesa x y carpeta?` (la del
  Negociado) · `CasaFuera x y ventanas=[bool,bool] luna? ojos?` · `CasaCorte x y luz? gato? f?` (la casa por
  dentro, 4 habitaciones) · `Cuenco x y lleno?` · `Vaso x y giro?` · `Inodoro` · `Nevera`.

**Objetos.tsx** — objetos sueltos (blanco macizo; gris para lo secundario; sin amarillo)
- `Pasos x y n?=5 sep?=70 cada?=0.5 k?=99 pendiente? escala?` — puntos que aparecen uno a uno con rebote, de
  izquierda a derecha; (x, y) = centro del primero; `cada` = segundos entre pasos; `pendiente` inclina la fila
  (−0,8 = suben por un tejado). Sobre el techo van en `y={TECHO - 22}`.
- `Raton x y escala? haciaIzquierda? k?` — el ratón de lado; (x, y) = centro del cuerpo, los pies 50 más abajo.
- `Lapiz x y largo?=1000 grosor?=64 k? escala?` — lápiz tumbado con la punta a la derecha; (x, y) = centro.
- `Cota x y largo texto k horizontal? tam?` — la medida de algo: raya gris con marcas y el texto («6 MM»); (x, y) =
  centro de la raya; funde, no rebota.
- `Agujero x y r?=40 k?` — círculo negro con borde blanco (un agujero en la pared o el suelo).

**Archivo.tsx** — papeleo del expediente
- `FichaSujeto x y archivo valor letras? tachado? lineas? foto? k` — la ficha («SUJETO: UN HUMANO ADULTO»).
- `Monitores x y pinta=(i)=>… k filas? columnas?` (rejilla de pantallas con lo mismo dentro) · `Portapapeles x y
  titulo filas=[{ok, icono}] k` · `PantallaPartida rotuloIzq rotuloDer izquierda derecha k` (pantalla entera) ·
  `Recorte x y texto etiqueta? k` (prueba documental con una línea a máquina) · `Cronometro x y aguja?` ·
  `PantallaFinal texto siguiente? k kSiguiente?` («PSPSPS.» / «SIGUIENTE ARCHIVO: 018») · `SelloNegociado` ·
  iconos `IconoOjo`, `IconoPata`, `IconoNariz`.

**Perro.tsx** — el perro y más casa
- `PerroSentado`, `PerroTumbado`, `PerroAnda`, `CaraPerro`, `OjosPerro`, `PataPerro`, `HuellasPerro` (mismas props
  que el gato, con `oreja` y `tiembla`) · `BajoCama` (la cama vista desde el suelo) · `PersonaBocaAbajo` · `Banera`,
  `Armario abierta?`, `Sofa`, `CamaPerro` · `Ondas x y k` (sonido), `Rayo`, `Oreja`, `NarizPerro calor?`, `Bote`,
  `Manta tiembla?`, `Estallido`, `temblor(f)`.

Si falta una pieza, dibújala en SVG dentro del plano con `fill="url(#blanco)"` (blanco macizo con la luz de
arriba) o `stroke={C.blanco} strokeWidth={14}` para contornos, y `C.negro` para ojos y detalles. Colores en `C`:
`blanco gris grisOscuro negro amarillo verde rojo`. Si la vas a usar en más de un plano, mejor como componente con
`x`, `y`, `escala` y `k` (como las de `Objetos.tsx`), para que se pueda pasar al motor después.

## 6. Reglas de puesta en escena (las de verdad, medidas en la referencia)

1. **Blanco con halo sobre negro.** Todo lo que existe es blanco macizo. Nada de otros colores, fotos ni texturas.
2. **Amarillo solo para lo inquietante**: los ojos del gato, la luna, la ventana encendida (la luz de dentro, de
   noche: `Ventana encendida`, las de `CasaFuera`), el haz de la `Linterna` y la `Bombilla` encendida, la etiqueta
   «TÚ». Nunca de adorno. **El sol de día no existe en este estilo**: de día, la ventana va clara y sin luna
   (`Ventana dia`, gris; o blanca), nunca amarilla ni con un sol dentro (no uses el prop `sol`).
3. **Verde y rojo solo son señales**: verde = ✓ y «COMPROBADO»; rojo = ✕, la raya de la tarjeta de regla, los
   sellos de fallo, el «8» de la barra.
4. **Un dibujo por frase.** La escena aguanta 6-10 s mientras cambian los subtítulos; dentro pasan cosas pequeñas
   (una ✕, un ✓, la cola, la cabeza que gira). Un corte grande cada 3-6 s. El ritmo lo marca el subtítulo, no el
   corte.
5. **Nada por debajo de y = 820 en pantalla**: ahí van los subtítulos (blanco sobre blanco si algo cae debajo).
   La regla es en **coordenadas de pantalla**: con zoom, lo que dibujas en `y` se ve en
   `y_pantalla = 540 + (y − cy) · zoom` (y en x, `960 + (x − cx) · zoom`). Sin zoom, el suelo de las habitaciones
   (y = 800) queda justo encima; sitúa lo importante entre y = 150 y 780. Con zoom en el dormitorio, la parte baja
   de la cama (somier 620-690, patas hasta 800; con más zoom también el colchón, 490-630) cae bajo el subtítulo en
   cuanto `zoom ≥ 1,2` con el `cy` típico (520-560): por eso el plano general va a 1,0-1,06. **En primeros planos
   del dormitorio, o dejas la cama fuera del cuadro** (mirando al techo: `zoom 2.3, cx 800, cy 170` con `Techo`;
   la cara sola con `CabezaGrande` en negro; los ojos solos) **o subes `cy`** hasta que el suelo quede en 820:
   `cy ≥ 800 − 280 / zoom` (zoom 1,3 → cy ≥ 585; 1,55 → 620; 2 → 660), y comprueba que lo de arriba sigue bajo
   la cabecera (`y_pantalla ≥ 120`). Siempre míralo en las fotos de revisión (6-8).
6. **La cámara respira.** Zooms lentísimos (`kf(t, [[0, 1.0], [3, 1.05]])`), algún acercamiento a un ojo. Nunca
   un zoom rápido ni paneos.
7. **Las cosas entran con `pop` o aparecen en el corte.** Nada de deslizarse desde fuera (salvo la pata del gato,
   que entra despacio por la izquierda).
8. **`entra: "glitch"` solo** en los cambios de bloque (cada tarjeta de regla, el título del archivo) y en los
   sustos. No en todos los cortes.
9. **Los sustos aguantan quietos 2-4 s**: solo los dos ojos en el negro (`OjosGato` grande), o el gato oscuro
   detrás de la ventana. Sin texto, sin movimiento.
10. **Lo prohibido se dibuja grande y en el centro**, y la cruz roja cae encima con `blip_grave` medio segundo
    después de que la voz diga el «no».
11. **El dato real lleva su tarjeta**: `TarjetaDato` con la fuente en pequeño y el sello verde «COMPROBADO» en la
    palabra en que la voz dice que está comprobado.
12. **Música: solo el drone al 5 %** (`musica={[{ archivo: "…", volumen: 0.05 }]}`). Nada de ambientes (viento,
    grillos), nada de melodía. Las tres músicas que hay están en `public/estilos/archivo/musica/` con sus créditos
    en `CREDITOS.tsv`: el crédito es obligatorio en la descripción (Kevin MacLeod, CC BY 4.0).

## 7. La cabecera, la barra de reglas, los sustos escondidos y el apagón

- **Cabecera**: la pone el motor: «ARCHIVO 017 // TU CANAL» (el canal, de `src/ajustes.json`), la barra con las 7
  casillas y el código de tiempo. Tú le das `archivo="017"` y un segundo por cada regla que dice la voz:
  `reglas={[E("Regla número uno"), E("Regla número dos"), …, E("Regla número siete")]}`. A partir de esos segundos la
  casilla de la regla se ilumina y las anteriores quedan hechas. El vídeo tiene **de 5 a 7 reglas**, pero la barra
  enseña siempre **7 casillas** y va marcando las que llegan: si el vídeo cuenta cinco, las dos últimas se quedan
  apagadas (el archivo tiene siete). Con la regla siete «clasificada», la casilla 7 se ilumina la primera vez que la
  voz dice «Regla número siete» y así se queda. (El corto de la comunidad cuenta 2 reglas con la misma barra de 7.)
- **Sustos escondidos** (`sustos={[…]}`): cosas de 2 fotogramas que casi nadie ve a la primera y que la gente
  comenta. Tipos: `{ en, tipo: "ojos", x, y, r? }` (los ojos del gato donde no deberían), `{ en, tipo:
  "subtitulo", texto }` (el subtítulo dice otra cosa un instante), `{ en, tipo: "barra8" }` (la barra tiene 8
  reglas y la 8.ª es roja), `{ en, tipo: "reloj", hora? }` (el código de tiempo salta a 03:04 en rojo); todos admiten
  `fotogramas` (2 por defecto, 3 como mucho). **De 3 a 5 por vídeo** (uno o dos en un corto), repartidos: ninguno en la
  primera frase, como mucho uno por bloque, y mezclando tipos. Los mejores van en las frases que el guion deja con doble
  sentido (`GUION.md` §5) y en los momentos tranquilos (el interludio, una regla sin susto propio).
- **Silencios** (`silencios={[[a, b], …]}`): el drone se corta en seco (silencio digital) en ese tramo. **2-3 cortes por
  vídeo**: el «Esperaremos.» de la regla clasificada (`[E("Esperaremos") + 0.9, E("Gracias") - 0.1]`), el remate más
  fuerte del giro («Para un gato, pareces muerto.») y el final, desde la última palabra hasta el apagón
  (`[E("Pspsps") + 1.2, 999]`). Más de tres y deja de dar miedo.
- **Música en un largo**: un drone para la primera mitad y otro desde la mitad (`musica={[{ archivo: "…horizon.mp3",
  volumen: 0.05 }, { archivo: "…penumbra.mp3", volumen: 0.05, desde: 215 }]}`), para que ocho minutos del mismo
  zumbido no cansen. Siempre al 0,05.
- **Apagón** (`apagon={T.duracion + 0.7}`): la cinta se va a negro con el sonido de la cinta frenando; la
  composición dura `T.duracion + 1.6`. El último plano debe aguantar quieto hasta ahí (los ojos, un latido).

## 8. `escenas.json`: las 6-8 fotos de revisión

De **6 a 8 momentos** repartidos por todo el vídeo (`fabrica fotos` no acepta menos de 6 ni más de 8; `fabrica nuevo`
ya deja los nombres puestos: Gancho, Archivo, Regla 1, Dato, Regla 3, Regla 5, Giro, Cierre). Un momento por bloque
importante; los bloques que no salen en las fotos míralos tú con `npx remotion still` mientras los escribes.

```json
[{ "nombre": "Gancho", "en": "amarillos" }, { "nombre": "Archivo", "en": 48.5 }, { "nombre": "Regla 1", "en": "ventanas" },
 { "nombre": "Dato", "en": "no práctico" }, { "nombre": "Regla 3", "en": "cronometrando" }, { "nombre": "Regla 5", "en": "Una a una" },
 { "nombre": "Giro", "en": "pareces muerto" }, { "nombre": "Cierre", "en": "cerrada por dentro" }]
```

`en` es una palabra de la voz (se busca igual que `E`) o un número de segundos. **Cuándo se saca la foto**: si el
ancla es una palabra, `fabrica fotos` la saca **0,6 s después** de que la voz empiece a decirla (para que la pieza
que entra en esa palabra ya haya aparecido: el `pop` dura 0,3 s); si el ancla es un número, la saca **en ese segundo
exacto**. Elige palabras que caigan **a mitad** de un plano, no en su primer fotograma (ahí todo está aún
apareciendo o con la estática del glitch) ni en el último medio segundo (la foto saldría ya del plano siguiente).
Para una tarjeta (de regla o de título) usa un número: un segundo en que el título ya esté escrito y que quede
**al menos 0,8 s antes del plano siguiente** (p. ej. `E("Regla número uno") + 2.5` calculado a mano desde
`transcripcion.txt`).

## 9. Lista de comprobación antes de dar por bueno un vídeo

- [ ] `npx tsc --noEmit -p .` sin errores y `npx remotion compositions src/index.ts` lista el id.
- [ ] Todas las `E("…")` existen en la voz (si no, el render falla al momento con la palabra que falta).
- [ ] Hay un plano por frase o por pareja de frases; ningún plano dura más de 10 s sin que pase nada dentro.
- [ ] Nada blanco queda **en pantalla** por debajo de y = 820 (`540 + (y − cy) · zoom`): en los planos generales a
      zoom 1,0-1,06 la cama y la línea del suelo quedan justo encima; en los primeros planos del dormitorio la cama
      está fuera del cuadro o `cy` subido (§6.5). Míralo en las fotos de revisión: el subtítulo no pisa el dibujo. Textos y
      piezas nunca se pisan entre sí.
- [ ] Mira `salida/<id>/fotogramas/hoja.jpg` y comprueba que los golpes y efectos (`<S …>`, cruces, ticks, sellos)
      caen en su palabra: la foto de una palabra se saca 0,6 s después de ella, así que la pieza ya tiene que estar.
- [ ] Solo hay amarillo en ojos, luna, ventanas encendidas (luz de dentro), haz de linterna, bombilla y «TÚ»; de día
      no hay sol ni ventana amarilla. Solo hay verde en ✓/sellos y rojo en ✕/rayas/sellos.
- [ ] `entra: "glitch"` solo en las tarjetas (título del archivo y cada regla) y en los sustos grandes: en un largo,
      unas 12-20 veces en total (el largo del gato lleva 19); nunca dos seguidos.
- [ ] El vídeo tiene de 5 a 7 reglas, `reglas` tiene un segundo por cada una y la barra se ve con sus 7 casillas.
- [ ] Hay de 3 a 5 sustos escondidos repartidos (ninguno en la primera frase), 2-3 silencios del drone y el apagón.
- [ ] Los bloques (`S1.tsx`…) leen la voz solo a través de `comun.tsx`; `Video.tsx` los junta todos y los ordena.
- [ ] Las tarjetas de regla escriben el título cuando la voz lo dice (`escribeDesde`), no antes.
- [ ] `archivo` es un número de tres cifras.
- [ ] La música es un drone de `public/estilos/archivo/musica/` al 0,05 y su crédito está en `subir.txt`.
- [ ] `fuentes.md` tiene una fuente por dato; `subir.txt` empieza por el título y lleva capítulos y créditos.
      `subir.txt` se escribe **después** de las fotos (igual que hace la skill: `Video.tsx` → `escenas.json` →
      `fabrica fotos` → mirar la hoja → `subir.txt` → `fabrica escuchar`), no antes.
- [ ] Las tarjetas no llevan `sinSubtitulo` (solo el apagón y los sustos de 1-3 fotogramas).
- [ ] El último plano aguanta hasta el apagón; el vídeo dura `T.duracion + 1.6`.
- [ ] Ningún nombre de canal real en el código: la cabecera sale de `src/ajustes.json`.

## 10. Órdenes útiles

```
npx tsc --noEmit -p .                                              comprobar tipos
npx remotion compositions src/index.ts                             ver los vídeos registrados
npx remotion still src/index.ts <id> salida/foto.jpg --frame=900   un fotograma (30 fotogramas = 1 s)
npx remotion render src/index.ts <id> salida/<id>-bruto.mp4 --concurrency=75% --crf=20 --jpeg-quality=80
```

El render sale **sin voz** a propósito (en renders largos Remotion la retrasaba a saltos); `fabrica render` la pega
después con ffmpeg desde el segundo 0 y normaliza a −14 LUFS. A mano:

```
ffmpeg -y -i salida/<id>-bruto.mp4 -i public/videos/<id>/voz.mp3 -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo[voz];[0:a][voz]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -shortest salida/<id>.mp4
```

## 11. Piezas nuevas (26-10)

Salieron del vídeo `pasos-techo` (archivo 001): allí estaban dibujadas en SVG dentro del plano y ahora viven en el
motor. Todas van dentro de `<Lienzo>`; `k` = segundos desde que aparecen.

- `Pasos` (Objetos.tsx): `<Pasos x={500} y={TECHO - 22} n={3} cada={0.55} k={t - (E("pasos") - E("Oyes pasos"))} />`
  — tres pasos sobre el techo, uno cada 0,55 s desde la palabra «pasos»; pon un `<S n="golpe" />` por paso. Subiendo
  por un tejado: `<Pasos x={700} y={492} n={5} sep={55} pendiente={-0.8} cada={0.45} k={k} />`.
- `Raton` (Objetos.tsx): `<Raton x={-300} y={60} escala={1.1} k={kRaton} />` dentro de una `TarjetaDato`;
  cruzando el desván: `<Raton x={kf(t, [[0.4, 1320], [3.6, 640]])} y={SUELO_DESVAN - 52} haciaIzquierda />`.
- `Lapiz` (Objetos.tsx): `<Lapiz x={880} y={470} largo={1000} grosor={64} k={t} />` con su medida al lado:
  `<Cota x={1480} y={470} largo={64} texto="6 MM" k={t - (E("lápiz") - E("El grosor"))} />`.
- `Cota` (Objetos.tsx): `<Cota x={150} y={0} largo={60} texto="6 MM" k={kSeis} />` (vertical, texto a la derecha);
  `<Cota x={960} y={600} largo={400} texto="2 M" horizontal k={k} />` (tumbada, texto debajo).
- `Agujero` (Objetos.tsx): `<Agujero x={1250} y={560} r={40} k={t - (E("agujero") - E("Por la mañana"))} />`; grande
  en el centro para taparlo: `<Agujero x={700} y={500} r={120} />`.
- `Techo` (Casa.tsx): plano mirando arriba, con la cama fuera del cuadro:
  `<Lienzo zoom={kf(t, [[0, 2.3], [4, 2.4]])} cx={800} cy={170}><Techo /><Pasos x={710} y={TECHO - 22} n={5} cada={0.8} k={t - 0.3} /></Lienzo>`.
- `DormitorioTecho` (Casa.tsx): `<DormitorioTecho reloj="09:30"><PersonaCama x={1050} y={424} ojos={1} sudor /></DormitorioTecho>`
  y encima `<Pasos x={520} y={TECHO - 22} n={8} cada={0.4} k={k} />`; con `<Lienzo … suelo>`.
- `Desvan` (Casa.tsx): `<Lienzo suelo={SUELO_DESVAN}><Desvan /><PersonaDePie x={760} y={SUELO_DESVAN} pose="linterna" /><Linterna x={840} y={520} haz={0.5} escala={0.8} giro={-12} /></Lienzo>`.
- `CorteParedes` (Casa.tsx): `<Lienzo suelo><CorteParedes /><Pasos x={400} y={278} n={26} sep={46} cada={0.2} k={t - 0.5} /><Texto x={1300} y={640} texto="10" tam={220} peso={900} /></Lienzo>`
  (los pasos van en `y − alto − 22` = 278 con los valores por defecto).
- `Dormitorio ventana={false}` y `Ventana dia` (Casa.tsx): `<Dormitorio ventana={false}>…</Dormitorio>` más
  `<Ventana x={1720} y={430} tam={170} dia />` para la ventana de día (gris, sin luna, sin amarillo).
