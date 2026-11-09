// Efectos de sonido del estilo (public/estilos/archivo/sfx/, fabricados por síntesis; sin licencia que citar).
// Dentro de un plano: <S en={0.4} n="blip" v={0.2} /> → suena «blip» 0,4 s después de empezar el plano.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "./estilo";

/** Los catorce efectos que hay. */
export type Sfx =
  | "blip" // pitido corto de interfaz: aparece una casilla, un tick, una etiqueta
  | "blip_grave" // pitido grave: una cruz roja, algo que falla
  | "tecla" // una tecla (el texto que se escribe a máquina; la TarjetaRegla ya lo pone sola)
  | "impacto" // golpe grave con cola: un susto, un sello, la tarjeta de regla
  | "estatica" // corte de estática (la cinta lo pone sola en cada entra: "glitch")
  | "estatica_larga" // estática de 1 s, para apagones a mitad
  | "cinta_para" // la cinta frenando (el apagón final lo pone solo)
  | "latido" // un latido de corazón
  | "aliento" // una inspiración brusca
  | "suspiro" // el suspiro del empleado
  | "cristal" // un vaso que cae y se rompe
  | "clic" // el clic de un interruptor
  | "golpe" // un golpe de nudillos en madera
  | "golpes"; // tres golpes de nudillos, despacio

/** Efecto de sonido en el segundo `en` del plano (t = 0 es cuando empieza el plano). `v` = volumen 0-1 (0,3 por defecto). */
export const S: React.FC<{ en: number; n: Sfx; v?: number }> = ({ en, n, v = 0.3 }) => {
  if (en < 0) return null;
  return (
    <Sequence from={Math.round(en * FPS)} durationInFrames={90} layout="none">
      <Audio src={staticFile(`estilos/archivo/sfx/${n}.wav`)} volume={v} />
    </Sequence>
  );
};
