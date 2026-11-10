// Lo que comparten todos los bloques de «perro-esquina» (archivo 018): los tiempos de la voz y las posiciones fijas.
import React from "react";
import { C, FUENTE } from "../../estilos/archivo/estilo";
import { fade } from "../../estilos/archivo/Plano";
import { crearTiempos } from "../../estilos/archivo/tiempos";
import voz from "../../../public/videos/perro-esquina/voz.tiempos.json";

export const T = crearTiempos(voz);
export const E = T.en;
/** Segundos entre el comienzo de `inicio` y la palabra `palabra` dicha después (para anclar cosas dentro de un plano). */
export const R = (inicio: string, palabra: string, desde = 0) => {
  const a = E(inicio, desde);
  return E(palabra, a) - a;
};

// Dormitorio (cama en x = 330, suelo 800): la cabeza de TÚ
export const CABEZA = { x: 1050, y: 424 };
// Pasillo: el perro sentado mirando a la esquina de la derecha
export const PERRO = { x: 780, y: 800 };
export const ESQUINA_X = 1420;

/** La esquina vacía de una habitación vista de frente: la arista vertical y las líneas de techo y suelo que se abren.
 * (x) = la arista; suelo en `y`, techo en `techo`. Gris: es el sitio, no una cosa. */
export const Esquina: React.FC<{ x?: number; y?: number; techo?: number; ancho?: number; k?: number; color?: string }> = ({ x = ESQUINA_X, y = 800, techo = 170, ancho = 520, k = 1, color = C.gris }) => (
  <g opacity={fade(k, 0.3)} stroke={color} strokeWidth={10} strokeLinecap="round" fill="none">
    <line x1={x} y1={techo} x2={x} y2={y - 60} />
    <line x1={x} y1={y - 60} x2={x - ancho} y2={y} />
    <line x1={x} y1={y - 60} x2={x + ancho * 0.7} y2={y} />
    <line x1={x} y1={techo} x2={x - ancho} y2={techo - 60} />
    <line x1={x} y1={techo} x2={x + ancho * 0.7} y2={techo - 60} />
  </g>
);

/** Signo de interrogación grande y gris, para lo que no se sabe. */
export const Interrogante: React.FC<{ x: number; y: number; tam?: number; k?: number; color?: string }> = ({ x, y, tam = 200, k = 1, color = C.gris }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FUENTE} fontWeight={900} fontSize={tam} fill={color} opacity={fade(k, 0.3)}>
    ?
  </text>
);

/** Brújula: círculo con la aguja (rojo = norte). (x, y) = centro; `giro` en grados. */
export const Brujula: React.FC<{ x: number; y: number; r?: number; giro?: number }> = ({ x, y, r = 150, giro = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="none" stroke={C.blanco} strokeWidth={12} />
    <text x={0} y={-r - 24} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={44} fill={C.blanco}>
      N
    </text>
    <text x={0} y={r + 62} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={44} fill={C.gris}>
      S
    </text>
    <g transform={`rotate(${giro})`}>
      <path d={`M 0 ${-r * 0.8} L ${r * 0.14} 0 L ${-r * 0.14} 0 Z`} fill={C.blanco} />
      <path d={`M 0 ${r * 0.8} L ${r * 0.14} 0 L ${-r * 0.14} 0 Z`} fill={C.grisOscuro} />
    </g>
    <circle r={12} fill={C.negro} stroke={C.blanco} strokeWidth={6} />
  </g>
);

/** Escáner de resonancia visto de lado: el anillo grande y la camilla. (x, y) = centro del anillo. */
export const Escaner: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <circle r={230} fill="none" stroke={C.blanco} strokeWidth={60} />
    <rect x={-520} y={90} width={760} height={34} rx={14} fill="url(#blanco)" />
    <rect x={-480} y={124} width={30} height={176} fill={C.gris} />
  </g>
);

/** Correa: una línea que cuelga desde la mano (x0, y0) hasta el collar (x1, y1). */
export const Correa: React.FC<{ x0: number; y0: number; x1: number; y1: number; tensa?: number }> = ({ x0, y0, x1, y1, tensa = 0 }) => (
  <path d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${Math.max(y0, y1) + 120 * (1 - tensa)} ${x1} ${y1}`} fill="none" stroke={C.gris} strokeWidth={8} strokeLinecap="round" />
);
