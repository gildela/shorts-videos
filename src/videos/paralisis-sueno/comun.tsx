// Lo que comparten todos los bloques de «paralisis-sueno» (archivo 020): los tiempos de la voz y las piezas propias.
import React from "react";
import { C, FUENTE } from "../../estilos/archivo/estilo";
import { fade } from "../../estilos/archivo/Plano";
import { PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { crearTiempos } from "../../estilos/archivo/tiempos";
import voz from "../../../public/videos/paralisis-sueno/voz.tiempos.json";

export const T = crearTiempos(voz);
export const E = T.en;
/** Segundos entre el comienzo de `inicio` y la palabra `palabra` dicha después (para anclar cosas dentro de un plano). */
export const R = (inicio: string, palabra: string, desde = 0) => {
  const a = E(inicio, desde);
  return E(palabra, a) - a;
};

// Dormitorio (cama en x = 330, suelo 800): la cabeza de TÚ y la puerta, detrás de la cabeza (donde no llegan los ojos)
export const CABEZA = { x: 1050, y: 424 };
export const PUERTA = { x: 1700, y: 800 };

/**
 * La presencia: una silueta alta y gris oscura, sin cara, con dos puntos amarillos redondos.
 * (x, y) = los pies en el suelo; alto ≈ 380 · escala. `ojos` 0-1 enciende los ojos. `k` = funde al aparecer.
 */
export const Presencia: React.FC<{ x: number; y: number; escala?: number; ojos?: number; k?: number; color?: string }> = ({ x, y, escala = 1, ojos = 1, k = 1, color = C.grisOscuro }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={fade(k, 0.6)}>
    <path d="M -70 0 C -80 -120 -92 -220 -66 -280 C -40 -320 40 -320 66 -280 C 92 -220 80 -120 70 0 Z" fill={color} />
    <circle cx={0} cy={-330} r={52} fill={color} />
    {ojos > 0 ? (
      <g opacity={ojos}>
        <circle cx={-18} cy={-334} r={7} fill={C.amarillo} style={{ filter: "drop-shadow(0 0 6px rgba(247,223,58,0.9))" }} />
        <circle cx={18} cy={-334} r={7} fill={C.amarillo} style={{ filter: "drop-shadow(0 0 6px rgba(247,223,58,0.9))" }} />
      </g>
    ) : null}
  </g>
);

/**
 * El que se sienta en el pecho (el íncubo del cuadro): una figura pequeña y encorvada, gris oscura, con los ojos
 * amarillos. (x, y) = donde se apoya; alto ≈ 170 · escala; mira a la izquierda.
 */
export const Encima: React.FC<{ x: number; y: number; escala?: number; ojos?: number; k?: number; color?: string }> = ({ x, y, escala = 1, ojos = 1, k = 1, color = C.grisOscuro }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={fade(k, 0.5)}>
    {/* espalda encorvada, sin orejas: la cabeza hundida entre los hombros y dos brazos largos que bajan al pecho */}
    <path d="M -70 0 C -90 -70 -60 -125 0 -128 C 55 -130 80 -80 74 0 Z" fill={color} />
    <ellipse cx={-34} cy={-138} rx={48} ry={40} fill={color} />
    <path d="M -60 -100 C -110 -70 -118 -30 -112 4" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" />
    <path d="M -30 -90 C -70 -60 -78 -26 -72 4" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" />
    {ojos > 0 ? (
      <g opacity={ojos}>
        <circle cx={-46} cy={-142} r={6} fill={C.amarillo} style={{ filter: "drop-shadow(0 0 5px rgba(247,223,58,0.9))" }} />
        <circle cx={-18} cy={-142} r={6} fill={C.amarillo} style={{ filter: "drop-shadow(0 0 5px rgba(247,223,58,0.9))" }} />
      </g>
    ) : null}
  </g>
);

/** Una fila de la lista de músculos: rótulo + ✕ rojo o ✓ verde. (x, y) = inicio del texto. */
export const FilaMusculo: React.FC<{ x: number; y: number; texto: string; ok: boolean; k: number }> = ({ x, y, texto, ok, k }) => (
  <g opacity={fade(k, 0.2)}>
    <text x={x} y={y} fontFamily={FUENTE} fontWeight={800} fontSize={54} fill={ok ? C.blanco : C.gris}>
      {texto}
    </text>
    {ok ? (
      <path d={`M ${x + 600} ${y - 18} l 22 22 l 40 -46`} fill="none" stroke={C.verde} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d={`M ${x + 600} ${y - 40} l 44 44 M ${x + 644} ${y - 40} l -44 44`} stroke={C.rojo} strokeWidth={14} strokeLinecap="round" />
    )}
  </g>
);

/** Marco de cuadro (el de «La pesadilla»): doble borde blanco. Hijos en coordenadas del cuadro. */
export const Cuadro: React.FC<{ x: number; y: number; w: number; h: number; k?: number; children?: React.ReactNode }> = ({ x, y, w, h, k = 1, children }) => (
  <g opacity={fade(k, 0.4)}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="none" stroke={C.blanco} strokeWidth={18} />
    <rect x={x - w / 2 + 30} y={y - h / 2 + 30} width={w - 60} height={h - 60} fill="none" stroke={C.gris} strokeWidth={6} />
    {children}
  </g>
);

/** Brazo de robot (gris): la base en el suelo a la derecha, el codo arriba y la punta que toca en (x, y). */
export const BrazoRobot: React.FC<{ x: number; y: number; avance?: number }> = ({ x, y, avance = 1 }) => {
  const px = x + 70 * (1 - avance);
  return (
    <g stroke={C.gris} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <rect x={1180} y={720} width={200} height={80} rx={10} fill={C.grisOscuro} strokeWidth={8} />
      <path d={`M 1280 720 L 1220 420 L ${px + 40} ${y}`} strokeWidth={30} />
      <circle cx={1220} cy={420} r={30} fill={C.grisOscuro} strokeWidth={10} />
      <circle cx={px + 16} cy={y} r={18} fill={C.gris} strokeWidth={0} />
    </g>
  );
};

/** TÚ boca arriba en la cama: el cuerpo de siempre con la cabeza girada para que los ojos miren al techo. */
export const BocaArriba: React.FC<{ ojos?: number }> = ({ ojos = 1 }) => (
  <g>
    <PersonaCama {...CABEZA} ojos={ojos} />
    <g transform={`rotate(90 ${CABEZA.x} ${CABEZA.y})`}>
      <PersonaCama {...CABEZA} ojos={ojos} cuerpo={false} />
    </g>
  </g>
);

