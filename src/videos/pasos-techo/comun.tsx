// Lo que comparten todos los bloques de «pasos-techo» (archivo 021): los tiempos de la voz y las piezas propias.
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { crearTiempos } from "../../estilos/archivo/tiempos";
import voz from "../../../public/videos/pasos-techo/voz.tiempos.json";

export const T = crearTiempos(voz);
export const E = T.en;
/** Segundos entre el comienzo de `inicio` y la palabra `palabra` dicha después (para anclar cosas dentro de un plano). */
export const R = (inicio: string, palabra: string, desde = 0) => {
  const a = E(inicio, desde);
  return E(palabra, a) - a;
};

// Dormitorio (cama en x = 330, suelo 800): la cabeza de TÚ y la puerta del pasillo
export const CABEZA = { x: 1050, y: 424 };
export const PUERTA = { x: 1700, y: 800 };
/** Encima del techo, con los pies sobre la línea (y = TECHO − 22): donde andan los pasos. */
export const SOBRE_TECHO = 168;
export const COLOR_AVISO = C.amarillo;
