// Vídeo «tres-noche» en el estilo «Archivo». Lo copia «fabrica nuevo tres-noche --estilo archivo» y lo rellena Claude.
//
// CÓMO FUNCIONA (lo largo está en estilos/archivo/LEEME.md; el ejemplo entero en estilos/archivo/ejemplo/Video.tsx):
//   - La voz manda. `E("palabras")` devuelve el segundo en que la voz empieza a decir esas palabras (tal cual están
//     en guion.md, sin importar tildes ni mayúsculas). Si la voz no las dice, el vídeo no se monta y avisa.
//   - Un plano = { desde: E("…"), pinta: (t, f) => <Lienzo>…</Lienzo> }. `t` son los segundos desde que empezó el
//     plano y `f` los fotogramas. El plano dura hasta que empieza el siguiente.
//   - Un dibujo por frase. La escena aguanta 6-10 s mientras cambian los subtítulos (los pone el motor solo, con la
//     frase exacta del guion). Dentro pasan cosas pequeñas: una cruz, un tick, la cola del gato, un zoom lento.
//   - Nada por debajo de y = 820: ahí van los subtítulos. El suelo de las habitaciones está en y = 800.
//   - Blanco con halo sobre negro. Amarillo SOLO para lo inquietante (ojos, luna, ventanas encendidas, «TÚ»).
//     Verde solo ✓ y «COMPROBADO»; rojo solo ✕, la raya de la regla y lo que falla.
import React from "react";
import ajustes from "../../ajustes.json";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { crearTiempos } from "../../estilos/archivo/tiempos";
import { Video as VideoArchivo } from "../../estilos/archivo/Video";
// Piezas: añade aquí las que uses (lista completa con sus props en estilos/archivo/LEEME.md).
import { Dormitorio, Interruptor, Mesa } from "../../estilos/archivo/piezas/Casa";
import { GatoSentado } from "../../estilos/archivo/piezas/Gato";
import { Empleado, PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { Cruz, LogoNegociado, PantallaCTA, TarjetaPregunta, TarjetaRegla, TarjetaTitulo } from "../../estilos/archivo/piezas/Interfaz";
import { PantallaFinal } from "../../estilos/archivo/piezas/Archivo";
// La voz y sus tiempos: los deja «fabrica voz-manual» / «fabrica voz» en public/videos/tres-noche/.
import voz from "../../../public/videos/tres-noche/voz.tiempos.json";

export const ID = "tres-noche";

export const T = crearTiempos(voz);
const E = T.en; // E("dos puntos amarillos") → segundo en que empieza a decirse

// Posiciones que se repiten (el Dormitorio pone la cama en x = 330 con el suelo en 800; la cabeza de TÚ queda aquí)
const CABEZA = { x: 1050, y: 424 };
const GATO = { x: 600, y: 500 };

const planos: Plano[] = [
  // ── GANCHO (0:00-0:30): la situación en 2-3 frases, TÚ en la cama, lo raro aparece cuando la voz lo nombra ──
  {
    desde: 0,
    entra: "negro", // el primer plano entra desde negro
    pinta: (t, f) => (
      // zoom lentísimo (3-6 % en 3 s): la cámara respira, nunca salta
      <Lienzo zoom={kf(t, [[0, 1.0], [3.2, 1.06]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
          {/* lo inquietante aparece en la palabra exacta: antes no está */}
          {t > E("PALABRA DEL GANCHO") ? <GatoSentado {...GATO} f={f} oscuro halo={1} abre={Math.min(1, (t - E("PALABRA DEL GANCHO")) / 0.25)} pupila={0.2} cola={0} /> : null}
        </Dormitorio>
        <S en={E("PALABRA DEL GANCHO")} n="impacto" v={0.4} />
      </Lienzo>
    ),
  },

  // ── ARCHIVO: tarjeta de título («ARCHIVO 0XX» + la categoría) y el empleado del Negociado ──
  {
    desde: E("Archivo cero"),
    entra: "glitch", // corte de estática SOLO en los cambios de bloque y en los sustos
    // el subtítulo pequeño aparece en la palabra en que la voz dice la categoría, no a un segundo fijo
    pinta: (t) => <TarjetaTitulo grande="ARCHIVO 0XX" pequeno={t > E("PALABRA DE LA CATEGORÍA") - E("Archivo cero") ? "CATEGORÍA DEL ARCHIVO" : undefined} k={t} />,
  },
  {
    desde: E("Negociado"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 0XX" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} />
        <LogoNegociado x={1560} y={300} r={70} texto k={t - 0.3} />
        <S en={0.3} n="blip" v={0.2} />
      </Lienzo>
    ),
  },

  // ── CONSULTA 1 (justo después de la apertura): la pregunta al público, escrita a máquina mientras la voz la dice ──
  {
    desde: E("El Negociado necesita un dato"),
    entra: "glitch",
    pinta: (t) => (
      <TarjetaPregunta
        pregunta="¿A QUÉ HORA TE DESPERTÓ A TI?" // la pregunta tal cual, corta (cabe en dos líneas)
        // opciones={["MÍO", "LIBRE"]}           // solo en las consultas de «elige uno» (una palabra o un número cada una)
        k={t}
        escribeDesde={E("A qué hora") - E("El Negociado necesita un dato")}
        kOpciones={E("comentarios") - E("El Negociado necesita un dato")}
      />
    ),
  },

  // ── REGLA 1: la tarjeta (el título se escribe a máquina cuando la voz lo dice) y después un dibujo por frase ──
  {
    desde: E("Regla número uno"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={1} titulo="TÍTULO DE LA REGLA UNO" k={t} escribeDesde={E("PRIMERA PALABRA DEL TÍTULO") - E("Regla número uno")} />,
  },
  {
    desde: E("PRIMERA FRASE DE LA EXPLICACIÓN"),
    pinta: (t) => (
      <Lienzo>
        {/* lo prohibido: la cosa grande en el centro y la cruz roja encima, con su blip grave */}
        <Interruptor x={960} y={520} escala={2.2} />
        <Cruz x={960} y={520} k={t - 0.55} tam={300} />
        <S en={0.55} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },

  // ── REGLA 2: igual que la 1 (tarjeta con entra: "glitch" + dibujos) ──
  // ── CIERRE: el empleado, la puerta, «Gracias por su cooperación» (dibujos como siempre) ──

  // ── CTA FINAL (obligatorio): la casilla «SUSCRÍBETE» se marca cuando la voz lo dice ──
  {
    desde: E("Queda un trámite"),
    entra: "glitch",
    pinta: (t) => (
      <PantallaCTA
        k={t}
        kTick={E("suscríbete al canal") - E("Queda un trámite")}
        comenta="¿QUÉ PASA EN TU CASA A LAS 3:04?" // la pregunta del CTA, en corto
        kComenta={E("cuéntanos en los comentarios") - E("Queda un trámite")}
        siguiente="SIGUIENTE ARCHIVO: 0XX"
        kSiguiente={E("El próximo archivo") - E("Queda un trámite")}
      />
    ),
  },
  // ── ÚLTIMA PALABRA: quieta hasta el apagón ──
  { desde: E("PALABRA FINAL"), pinta: (t) => <PantallaFinal texto="PALABRA FINAL." k={t} /> },
];

/** Duración total: la voz más la cola del apagón (no la toques). */
export const DURACION = T.duracion + 1.6;

export const Video: React.FC = () => (
  <VideoArchivo
    canal={ajustes.canal} // nombre del canal en la cabecera (src/ajustes.json)
    planos={planos}
    frases={T.frases} // los subtítulos: una frase del guion cada vez
    duracion={DURACION}
    archivo="0XX" // el número del archivo: «017», «023»… (tres cifras)
    reglas={[E("Regla número uno"), E("Regla número dos")]} // segundo en que empieza cada regla (barra de la cabecera)
    voz="videos/tres-noche/voz.mp3"
    musica={[{ archivo: "dark-tension-eerie-drone--shadowlands-1-horizon.mp3", volumen: 0.05 }]} // solo el drone al 5 %
    apagon={T.duracion + 0.7} // la cinta se va a negro 0,7 s después de la última palabra
    // silencios={[[E("Esperaremos"), E("Esperaremos") + 2.5]]}   // tramos en que el drone se corta en seco
    // sustos={[{ en: E("alguna palabra"), tipo: "ojos", x: 1500, y: 300 }]}   // 2 fotogramas que casi nadie ve
  />
);
