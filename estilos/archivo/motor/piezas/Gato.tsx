// El gato: silueta blanca maciza (sin contorno) con los ojos amarillos de pupila vertical y un halo amarillo.
// Sentado de lado (el plano típico, a los pies de la cama), sentado de frente, andando, la cara en primer plano y
// solo los dos ojos en la oscuridad.
import React from "react";
import { C } from "../estilo";

const B = "url(#blanco)";

/** Un ojo de gato: almendra amarilla con pupila vertical. `abre` 0-1, `pupila` 0 = rendija … 1 = redonda, `mira` -1..1. */
export const OjoGato: React.FC<{ x: number; y: number; r?: number; abre?: number; pupila?: number; mira?: [number, number]; halo?: number; giro?: number }> = ({ x, y, r = 22, abre = 1, pupila = 0.25, mira = [0, 0], halo = 0.5, giro = 0 }) => {
  const ry = r * 0.95 * Math.max(0.03, abre);
  const pw = r * (0.16 + 0.7 * pupila);
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      {halo > 0 ? <ellipse rx={r * 3.2} ry={r * 2.8} fill="url(#haloAmarillo)" opacity={halo} /> : null}
      <ellipse rx={r} ry={ry} fill={C.amarillo} style={{ filter: `drop-shadow(0 0 ${r * 0.5}px rgba(247,223,58,0.9))` }} />
      {abre > 0.12 ? <ellipse cx={mira[0] * r * 0.4} cy={mira[1] * ry * 0.3} rx={pw / 2} ry={ry * 0.9} fill="#151006" /> : null}
    </g>
  );
};

/** Solo los dos ojos en la oscuridad. (x, y) = punto medio entre los ojos. */
export const OjosGato: React.FC<{ x: number; y: number; r?: number; sep?: number; abre?: number; pupila?: number; mira?: [number, number]; halo?: number }> = ({ x, y, r = 60, sep = 3.4, abre = 1, pupila = 0.3, mira = [0, 0], halo = 1 }) => (
  <g>
    <OjoGato x={x - (r * sep) / 2} y={y} r={r} abre={abre} pupila={pupila} mira={mira} halo={halo} />
    <OjoGato x={x + (r * sep) / 2} y={y} r={r} abre={abre} pupila={pupila} mira={mira} halo={halo} />
  </g>
);

/** Parpadeo automático (1 = cerrado) cada ~4 s. */
export const parpadeo = (f: number, semilla = 0): number => {
  const ciclo = 118 + (semilla % 3) * 23;
  const k = (f + semilla * 41) % ciclo;
  return k < 3 ? k / 3 : k < 6 ? (6 - k) / 3 : 0;
};

export type PropsGato = {
  x: number;
  y: number; // y = suelo (las patas)
  escala?: number;
  f?: number; // fotograma (cola, parpadeo)
  abre?: number;
  pupila?: number;
  mira?: [number, number];
  halo?: number;
  haciaIzquierda?: boolean;
  cola?: number; // amplitud del vaivén (0 = quieta)
  orejas?: number; // -1 atrás … 0 … 1 adelante
  cabeza?: number; // giro de la cabeza (grados)
  oscuro?: boolean; // solo los ojos (el gato a oscuras)
  contorno?: boolean; // con contorno negro (cuando va sobre blanco)
};

/** La cabeza del gato de perfil (calcada del fotograma de referencia): cuña redondeada con el hocico hacia delante,
 * la nariz como un punto negro, el ojo ovalado y alto, dos orejas altas (la de atrás más grande). (0,0) = centro. */
export const CabezaGatoLado: React.FC<{ abre?: number; pupila?: number; mira?: [number, number]; halo?: number; orejas?: number; oscuro?: boolean; contorno?: boolean }> = ({ abre = 1, pupila = 0.25, mira = [0, 0], halo = 0.5, orejas = 0, oscuro, contorno }) => {
  const fill = oscuro ? "#000" : B;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  return (
    <g>
      {/* orejas: la de atrás grande y vertical, la de delante más corta e inclinada */}
      <path d={`M -52 -34 L ${-64 - orejas * 8} -118 L -6 -58 Z`} fill={fill} {...st} />
      <path d={`M 10 -56 L ${40 + orejas * 8} -104 L 54 -36 Z`} fill={fill} {...st} />
      {/* cabeza: cuña redondeada con el hocico a la derecha */}
      <path d="M -60 -40 C -66 -70 -30 -72 10 -66 C 50 -60 78 -34 84 -4 C 88 14 80 26 62 28 C 40 30 10 44 -12 44 C -50 44 -64 10 -60 -40 Z" fill={fill} {...st} />
      {oscuro ? null : <circle cx={70} cy={14} r={6} fill={C.negro} />}
      <g transform="translate(34 -22) rotate(-12)">
        <OjoGato x={0} y={0} r={12} abre={abre} pupila={pupila} mira={mira} halo={halo} />
      </g>
    </g>
  );
};

/** Gato sentado de lado, mirando hacia la derecha (o a la izquierda con `haciaIzquierda`). Alto ≈ 300 a escala 1.
 * Pecho recto delante, lomo en arco detrás, la cola sube por detrás. Con `oscuro`, solo se ven los ojos. */
export const GatoSentado: React.FC<PropsGato> = ({ x, y, escala = 1, f = 0, abre = 1, pupila = 0.25, mira = [0, 0], halo = 0.5, haciaIzquierda, cola = 1, orejas = 0, cabeza = 0, oscuro, contorno }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const k = escala * 0.78;
  const colaA = Math.sin(f / 14) * 18 * cola;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  const cab = (
    <g transform={`translate(34 -318) rotate(${cabeza})`}>
      <CabezaGatoLado abre={abre} pupila={pupila} mira={mira} halo={halo} orejas={orejas} oscuro={oscuro} contorno={contorno} />
    </g>
  );
  if (oscuro) return <g transform={`translate(${x} ${y}) scale(${sx * k} ${k})`}>{cab}</g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * k} ${k})`}>
      <path d={`M -92 -22 C -160 -26 -196 -100 ${-172 + colaA} -196`} fill="none" stroke={C.blanco} strokeWidth={28} strokeLinecap="round" />
      {/* cuerpo: pecho vertical, lomo en arco, base plana; el cuello sube hasta la cabeza */}
      <path d="M 56 0 L 56 -210 C 56 -250 40 -280 10 -300 C -54 -290 -104 -190 -112 -84 C -116 -40 -110 -12 -98 0 Z" fill={B} {...st} />
      <rect x={14} y={-30} width={50} height={30} rx={15} fill={B} {...st} />
      <rect x={-66} y={-26} width={54} height={26} rx={13} fill={B} {...st} />
      {cab}
    </g>
  );
};

/** Gato tumbado hecho una bola (durmiendo o encima del pecho), de lado. (x, y) = base. Alto ≈ 150. */
export const GatoTumbado: React.FC<PropsGato & { dormido?: boolean }> = ({ x, y, escala = 1, f = 0, abre = 1, pupila = 0.25, mira = [0, 0], halo = 0.4, haciaIzquierda, cola = 1, dormido, cabeza = 0 }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const colaA = Math.sin(f / 16) * 10 * cola;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * escala} ${escala})`}>
      <path d={`M -150 -20 C -210 -24 -230 -70 ${-200 + colaA} -96`} fill="none" stroke={C.blanco} strokeWidth={26} strokeLinecap="round" />
      <path d="M -160 0 C -170 -90 -110 -150 -20 -150 L 60 -150 C 110 -150 150 -110 150 -60 L 150 0 Z" fill={B} />
      <g transform={`translate(96 -140) rotate(${cabeza})`}>
        <CabezaGatoLado abre={dormido ? 0 : abre} pupila={pupila} mira={mira} halo={dormido ? 0 : halo} />
      </g>
    </g>
  );
};

/** Gato sentado de frente (como en la hoja de la regla 8): cuerpo de pera, cabeza redonda, dos ojos. Alto ≈ 300. */
export const GatoFrente: React.FC<PropsGato> = ({ x, y, escala = 1, f = 0, abre = 1, pupila = 0.3, mira = [0, 0], halo = 0.5, cola = 1, orejas = 0, oscuro, contorno }) => {
  const colaA = Math.sin(f / 14) * 20 * cola;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  const fill = oscuro ? "#000" : B;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <path d={`M 80 -40 C 150 -30 170 -90 ${150 + colaA} -150`} fill="none" stroke={contorno ? C.negro : oscuro ? "#000" : C.blanco} strokeWidth={contorno ? 44 : 30} strokeLinecap="round" />
      {contorno ? <path d={`M 80 -40 C 150 -30 170 -90 ${150 + colaA} -150`} fill="none" stroke={C.blanco} strokeWidth={30} strokeLinecap="round" /> : null}
      <path d="M -100 0 C -120 -120 -70 -200 0 -205 C 70 -200 120 -120 100 0 Z" fill={fill} {...st} />
      <rect x={-78} y={-70} width={52} height={74} rx={24} fill={fill} {...st} />
      <rect x={26} y={-70} width={52} height={74} rx={24} fill={fill} {...st} />
      <g transform="translate(0 -250)">
        <path d={`M -70 10 L ${-76 - orejas * 8} -70 L -20 -50 Z`} fill={fill} {...st} />
        <path d={`M 70 10 L ${76 + orejas * 8} -70 L 20 -50 Z`} fill={fill} {...st} />
        <circle r={74} fill={fill} {...st} />
        {oscuro ? null : <path d="M -8 26 L 8 26 L 0 36 Z" fill={C.negro} />}
        <OjoGato x={-30} y={-6} r={15} abre={abre} pupila={pupila} mira={mira} halo={halo} />
        <OjoGato x={30} y={-6} r={15} abre={abre} pupila={pupila} mira={mira} halo={halo} />
      </g>
    </g>
  );
};

/** Gato andando de lado (hacia la derecha). `fase` 0-1 = ciclo de la zancada. Alto ≈ 200. */
export const GatoAnda: React.FC<PropsGato & { fase?: number; corre?: boolean }> = ({ x, y, escala = 1, f = 0, fase = 0, abre = 1, pupila = 0.25, mira = [0, 0], halo = 0.4, haciaIzquierda, cola = 1, cabeza = 0, corre, oscuro }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const a = Math.sin(fase * Math.PI * 2);
  const b = -a;
  const amp = corre ? 34 : 22;
  const colaA = Math.sin(f / 10) * 10 * cola;
  const pata = (px: number, d: number, atras = false) => (
    <g transform={`translate(${px} -118) rotate(${d * (atras ? -1 : 1) * (amp / 2)})`}>
      <rect x={-16} y={0} width={32} height={122} rx={16} fill={B} />
    </g>
  );
  if (oscuro) {
    return (
      <g transform={`translate(${x} ${y}) scale(${sx * escala} ${escala})`}>
        <g transform={`translate(132 -190) rotate(${cabeza})`}>
          <CabezaGatoLado abre={abre} pupila={pupila} mira={mira} halo={halo} oscuro />
        </g>
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * escala} ${escala})`}>
      <path d={`M -120 -140 C -170 -150 -200 -200 ${-186 + colaA} -240`} fill="none" stroke={C.blanco} strokeWidth={26} strokeLinecap="round" />
      {pata(-86, b, true)}
      {pata(76, a)}
      <path d="M -130 -120 C -150 -200 -90 -210 0 -208 L 90 -208 C 130 -208 140 -170 134 -120 Z" fill={B} />
      {pata(-62, a, true)}
      {pata(100, b)}
      <g transform={`translate(132 -196) rotate(${cabeza})`}>
        <CabezaGatoLado abre={abre} pupila={pupila} mira={mira} halo={halo} />
      </g>
    </g>
  );
};

/** La cara del gato en primer plano, de frente: cabeza grande, bigotes, nariz y los dos ojos. (x, y) = centro. */
export const CaraGato: React.FC<{ x: number; y: number; r?: number; abre?: number; pupila?: number; mira?: [number, number]; halo?: number; orejas?: number; boca?: number }> = ({ x, y, r = 230, abre = 1, pupila = 0.3, mira = [0, 0], halo = 0.6, orejas = 0, boca = 0 }) => {
  const k = r / 230;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {/* bigotes */}
      <g stroke={C.blanco} strokeWidth={9} strokeLinecap="round">
        <line x1={-150} y1={30} x2={-330} y2={0} />
        <line x1={-150} y1={60} x2={-330} y2={70} />
        <line x1={150} y1={30} x2={330} y2={0} />
        <line x1={150} y1={60} x2={330} y2={70} />
      </g>
      <path d={`M -200 -60 L ${-215 - orejas * 20} -270 L -60 -190 Z`} fill={B} />
      <path d={`M 200 -60 L ${215 + orejas * 20} -270 L 60 -190 Z`} fill={B} />
      <path d="M -210 -40 C -225 -170 -100 -230 0 -225 C 100 -230 225 -170 210 -40 C 200 90 110 160 0 160 C -110 160 -200 90 -210 -40 Z" fill={B} />
      <path d="M -22 60 L 22 60 L 0 84 Z" fill={C.negro} />
      {boca > 0 ? <ellipse cx={0} cy={112} rx={22} ry={16 * boca} fill={C.negro} /> : <path d="M -26 104 Q 0 120 26 104" fill="none" stroke={C.negro} strokeWidth={6} strokeLinecap="round" />}
      <OjoGato x={-85} y={-20} r={48} abre={abre} pupila={pupila} mira={mira} halo={halo} />
      <OjoGato x={85} y={-20} r={48} abre={abre} pupila={pupila} mira={mira} halo={halo} />
    </g>
  );
};

/** Pata del gato entrando por un lado (para tocar la cara). (x, y) = punta de la pata; viene desde la izquierda. */
export const Pata: React.FC<{ x: number; y: number; largo?: number; escala?: number; giro?: number; garra?: boolean }> = ({ x, y, largo = 700, escala = 1, giro = 0, garra }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
    <rect x={-largo} y={-52} width={largo} height={104} rx={52} fill={B} />
    <circle cx={-10} cy={0} r={68} fill={B} />
    {[-40, -14, 14, 40].map((dy, i) => (
      <ellipse key={i} cx={34 + (i === 0 || i === 3 ? -14 : 0)} cy={dy} rx={16} ry={11} fill={B} />
    ))}
    {garra ? <path d="M 48 -20 L 78 -30 L 56 -4 Z" fill={C.blanco} /> : null}
  </g>
);

/** Huellas de gato en línea (grises). */
export const Huellas: React.FC<{ x: number; y: number; n?: number; sep?: number; k?: number }> = ({ x, y, n = 4, sep = 70, k = 99 }) => (
  <g fill={C.gris}>
    {Array.from({ length: n }, (_, i) =>
      k > i * 0.15 ? (
        <g key={i} transform={`translate(${x + i * sep} ${y + (i % 2 ? -10 : 0)}) scale(0.9)`}>
          <ellipse rx={12} ry={10} />
          <circle cx={-14} cy={-12} r={5} />
          <circle cx={-5} cy={-18} r={5} />
          <circle cx={5} cy={-18} r={5} />
          <circle cx={14} cy={-12} r={5} />
        </g>
      ) : null,
    )}
  </g>
);
