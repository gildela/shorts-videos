// Objetos sueltos que no son ni casa ni animal de compañía: los pasos (puntos que van apareciendo en fila), el ratón,
// el lápiz, la cota (la medida de algo con sus marcas y el texto) y el agujero. Mismo lenguaje que el resto: blanco
// macizo con la luz de arriba (url(#blanco)), gris para lo secundario (bigotes, la cota), negro para ojos y la mina.
// Nada de amarillo: aquí no hay nada inquietante por sí mismo.
import React from "react";
import { C } from "../estilo";
import { fade, pop } from "../Plano";
import { Texto } from "./Interfaz";

const B = "url(#blanco)";

/**
 * Los pasos: puntos blancos que van apareciendo uno a uno (con rebote) en fila, de izquierda a derecha.
 * (x, y) = centro del primer punto; `n` puntos cada `sep` px; `cada` = segundos entre un paso y el siguiente;
 * `k` = segundos desde el primero (99 = todos puestos); `pendiente` inclina la fila (−0,8 = suben por un tejado);
 * `escala` multiplica el radio (11 px). Van sobre la línea del techo (y = TECHO − 22) o de un tejado.
 */
export const Pasos: React.FC<{ x: number; y: number; n?: number; sep?: number; cada?: number; k?: number; pendiente?: number; escala?: number; color?: string }> = ({
  x,
  y,
  n = 5,
  sep = 70,
  cada = 0.5,
  k = 99,
  pendiente = 0,
  escala = 1,
  color = C.blanco,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const e = pop(k - i * cada);
      if (e <= 0) return null;
      return <circle key={i} cx={x + i * sep} cy={y + i * sep * pendiente + (i % 2 ? -4 : 4)} r={11 * escala * e} fill={color} />;
    })}
  </g>
);

/** El ratón, de lado, mirando a la derecha (o a la izquierda con `haciaIzquierda`). (x, y) = centro del cuerpo; los pies
 * quedan 50 por debajo (para ponerlo en un suelo: y = suelo − 52). Mide unos 330 × 110 a escala 1. `k` = rebote. */
export const Raton: React.FC<{ x: number; y: number; escala?: number; haciaIzquierda?: boolean; k?: number }> = ({ x, y, escala = 1, haciaIzquierda, k = 1 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  const sx = haciaIzquierda ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * escala * e} ${escala * e})`}>
      {/* cola */}
      <path d="M -88 8 q -70 40 -130 -14" fill="none" stroke={C.blanco} strokeWidth={12} strokeLinecap="round" />
      {/* patas */}
      <ellipse cx={-38} cy={50} rx={20} ry={9} fill={B} />
      <ellipse cx={42} cy={50} rx={20} ry={9} fill={B} />
      {/* cuerpo y cabeza */}
      <ellipse cx={0} cy={0} rx={96} ry={52} fill={B} />
      <circle cx={96} cy={-8} r={44} fill={B} />
      <circle cx={76} cy={-50} r={21} fill={B} />
      <circle cx={110} cy={-44} r={16} fill={B} />
      {/* ojo, hocico y bigotes */}
      <circle cx={114} cy={-12} r={7} fill={C.negro} />
      <circle cx={138} cy={-2} r={7} fill={C.negro} />
      <g stroke={C.gris} strokeWidth={4} strokeLinecap="round">
        <line x1={128} y1={4} x2={176} y2={-8} />
        <line x1={128} y1={10} x2={176} y2={20} />
      </g>
    </g>
  );
};

/** Un lápiz tumbado, con la punta a la derecha. (x, y) = centro; `largo` de goma a punta (sin la goma), `grosor` lo que
 * mide de alto (los «6 mm» a tamaño de pantalla). `k` = rebote. */
export const Lapiz: React.FC<{ x: number; y: number; largo?: number; grosor?: number; k?: number; escala?: number }> = ({ x, y, largo = 1000, grosor = 64, k = 1, escala = 1 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  const punta = 130;
  return (
    <g transform={`translate(${x} ${y}) scale(${e * escala})`}>
      {/* goma y virola */}
      <rect x={-largo / 2 - 80} y={-grosor / 2} width={90} height={grosor} rx={16} fill="#9a9a98" />
      <rect x={-largo / 2 - 4} y={-grosor / 2 - 3} width={34} height={grosor + 6} rx={6} fill={C.gris} />
      {/* cuerpo con sus aristas */}
      <rect x={-largo / 2} y={-grosor / 2} width={largo - punta} height={grosor} fill={B} />
      <line x1={-largo / 2 + 30} y1={-grosor / 6} x2={largo / 2 - punta} y2={-grosor / 6} stroke="#bdbdbb" strokeWidth={3} />
      <line x1={-largo / 2 + 30} y1={grosor / 6} x2={largo / 2 - punta} y2={grosor / 6} stroke="#bdbdbb" strokeWidth={3} />
      {/* punta y mina */}
      <polygon points={`${largo / 2 - punta},${-grosor / 2} ${largo / 2},0 ${largo / 2 - punta},${grosor / 2}`} fill={B} />
      <polygon points={`${largo / 2 - 34},${-grosor * 0.13} ${largo / 2},0 ${largo / 2 - 34},${grosor * 0.13}`} fill={C.negro} />
    </g>
  );
};

/**
 * Cota: la medida de algo. Una raya gris con dos marcas en los extremos y el texto al lado («6 MM»). (x, y) = centro de
 * la raya; `largo` lo que mide (en vertical por defecto; `horizontal` la tumba y pone el texto debajo). Funde (`fade`),
 * no rebota: es una anotación, no un objeto. `k` = segundos desde que aparece.
 */
export const Cota: React.FC<{ x: number; y: number; largo: number; texto: string; k: number; horizontal?: boolean; tam?: number }> = ({ x, y, largo, texto, k, horizontal, tam = 60 }) => {
  if (k <= 0) return null;
  const m = 22; // media marca
  return (
    <g opacity={fade(k, 0.2)}>
      <g stroke={C.gris} strokeWidth={5} strokeLinecap="round">
        {horizontal ? (
          <>
            <line x1={x - largo / 2} y1={y} x2={x + largo / 2} y2={y} />
            <line x1={x - largo / 2} y1={y - m} x2={x - largo / 2} y2={y + m} />
            <line x1={x + largo / 2} y1={y - m} x2={x + largo / 2} y2={y + m} />
          </>
        ) : (
          <>
            <line x1={x} y1={y - largo / 2} x2={x} y2={y + largo / 2} />
            <line x1={x - m} y1={y - largo / 2} x2={x + m} y2={y - largo / 2} />
            <line x1={x - m} y1={y + largo / 2} x2={x + m} y2={y + largo / 2} />
          </>
        )}
      </g>
      {horizontal ? <Texto x={x} y={y + m + tam} texto={texto} tam={tam} k={k} /> : <Texto x={x + 50} y={y + Math.round(tam * 0.37)} texto={texto} tam={tam} ancla="start" k={k} />}
    </g>
  );
};

/** Un agujero en una pared o un suelo: círculo negro con borde blanco. (x, y) = centro; `k` = rebote. */
export const Agujero: React.FC<{ x: number; y: number; r?: number; k?: number }> = ({ x, y, r = 40, k = 1 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return <circle cx={x} cy={y} r={r * e} fill="#000" stroke={C.blanco} strokeWidth={r * 0.3} />;
};
