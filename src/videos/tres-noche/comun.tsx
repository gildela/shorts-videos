// Lo que comparten todos los bloques de «tres-noche» (archivo 019): los tiempos de la voz y las piezas propias.
import React from "react";
import { C, FUENTE } from "../../estilos/archivo/estilo";
import { fade } from "../../estilos/archivo/Plano";
import { crearTiempos } from "../../estilos/archivo/tiempos";
import voz from "../../../public/videos/tres-noche/voz.tiempos.json";

export const T = crearTiempos(voz);
export const E = T.en;
/** Segundos entre el comienzo de `inicio` y la palabra `palabra` dicha después (para anclar cosas dentro de un plano). */
export const R = (inicio: string, palabra: string, desde = 0) => {
  const a = E(inicio, desde);
  return E(palabra, a) - a;
};

// Dormitorio (cama en x = 330, suelo 800): la cabeza de TÚ
export const CABEZA = { x: 1050, y: 424 };

/** Las vueltas del sueño: una línea que baja y sube `n` veces (lo profundo abajo). Hasta `k` (0-1) dibujada.
 * (x, y) = arriba a la izquierda; `marca` = índice de la cresta que se marca en amarillo (el despertar de ahora). */
export const Vueltas: React.FC<{ x: number; y: number; w?: number; h?: number; n?: number; k?: number; marca?: number }> = ({ x, y, w = 1400, h = 300, n = 5, k = 1, marca = -1 }) => {
  const pts: string[] = [];
  const N = 200;
  const hasta = Math.max(0, Math.min(1, k));
  for (let i = 0; i <= N * hasta; i++) {
    const u = i / N;
    const prof = (1 - Math.cos(u * n * 2 * Math.PI)) / 2; // 0 arriba, 1 abajo
    pts.push(`${x + u * w},${y + prof * h * (1 - 0.25 * u)}`);
  }
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.grisOscuro} strokeWidth={4} strokeDasharray="14 14" />
      <polyline points={pts.join(" ")} fill="none" stroke={C.blanco} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
      {Array.from({ length: n - 1 }, (_, i) => {
        const u = (i + 1) / n;
        if (u > hasta) return null;
        return <circle key={i} cx={x + u * w} cy={y} r={i === marca ? 26 : 14} fill={i === marca ? C.amarillo : C.gris} />;
      })}
    </g>
  );
};

/** Termómetro vertical. (x, y) = centro del bulbo; `nivel` 0-1 de la columna. */
export const Termometro: React.FC<{ x: number; y: number; nivel?: number; escala?: number }> = ({ x, y, nivel = 0.6, escala = 1 }) => {
  const alto = 420;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <rect x={-34} y={-alto} width={68} height={alto} rx={34} fill="none" stroke={C.blanco} strokeWidth={12} />
      <circle r={70} fill="url(#blanco)" />
      <rect x={-16} y={-30 - (alto - 60) * nivel} width={32} height={30 + (alto - 60) * nivel} rx={16} fill="url(#blanco)" />
      {[0.2, 0.4, 0.6, 0.8].map((u) => (
        <line key={u} x1={44} x2={84} y1={-30 - (alto - 60) * u} y2={-30 - (alto - 60) * u} stroke={C.gris} strokeWidth={8} />
      ))}
    </g>
  );
};

/** Una vela encendida (la luz de antes). (x, y) = base. La llama tiembla con `f`. */
export const Vela: React.FC<{ x: number; y: number; f?: number; escala?: number; encendida?: boolean }> = ({ x, y, f = 0, escala = 1, encendida = true }) => {
  const tb = Math.sin(f / 4) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <rect x={-34} y={-200} width={68} height={200} rx={8} fill="url(#blanco)" />
      <line x1={0} y1={-200} x2={0} y2={-222} stroke={C.gris} strokeWidth={6} />
      {encendida ? <path d={`M 0 ${-300 + tb} Q 30 -245 0 -222 Q -30 -245 0 ${-300 + tb} Z`} fill={C.amarillo} /> : null}
    </g>
  );
};

/** Hoguera/chimenea sencilla: dos troncos y llamas amarillas. (x, y) = base. */
export const Fuego: React.FC<{ x: number; y: number; f?: number; escala?: number; vivo?: number }> = ({ x, y, f = 0, escala = 1, vivo = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-150} y={-40} width={300} height={40} rx={18} fill="url(#blanco)" transform="rotate(-8)" />
    <rect x={-150} y={-40} width={300} height={40} rx={18} fill="url(#blanco)" transform="rotate(8)" />
    {[-60, 0, 60].map((dx, i) => {
      const h = (110 + 50 * Math.sin(f / 5 + i * 2)) * vivo;
      return <path key={i} d={`M ${dx - 40} -40 Q ${dx} ${-40 - h * 1.6} ${dx + 40} -40 Z`} fill={C.amarillo} opacity={0.9} />;
    })}
  </g>
);

/** Signo de interrogación grande y gris, para lo que no se sabe. */
export const Interrogante: React.FC<{ x: number; y: number; tam?: number; k?: number; color?: string }> = ({ x, y, tam = 200, k = 1, color = C.gris }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FUENTE} fontWeight={900} fontSize={tam} fill={color} opacity={fade(k, 0.3)}>
    ?
  </text>
);

/** Una ventana pequeña de una casa del bloque: oscura o con luz (amarilla, la casa despierta). */
export const VentanaBloque: React.FC<{ x: number; y: number; luz?: boolean; tam?: number }> = ({ x, y, luz, tam = 70 }) => (
  <rect x={x - tam / 2} y={y - tam / 2} width={tam} height={tam} rx={4} fill={luz ? C.amarillo : "#000"} stroke={C.gris} strokeWidth={5} />
);
