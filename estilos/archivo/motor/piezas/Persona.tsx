// «TÚ»: el muñeco pictograma (como el de las señales de los aseos, pero más redondo), blanco macizo, sin contorno.
// En la cama: cabeza grande con los ojos como dos rayitas y el cuerpo tumbado a lo largo del colchón.
// De pie: cabeza redonda, tronco de una pieza y brazos y piernas gordos con las puntas redondas.
import React from "react";
import { C } from "../estilo";

const B = "url(#blanco)";

/** Ojo de la persona: cerrado = rayita; abierto = punto redondo. `abre` 0-1. */
const Ojo: React.FC<{ x: number; y: number; abre: number; tam?: number }> = ({ x, y, abre, tam = 1 }) => {
  if (abre < 0.5) {
    const w = 38 * tam * (1 - abre * 0.6);
    return <rect x={x - w / 2} y={y - 4.5 * tam} width={w} height={9 * tam} rx={4.5 * tam} fill={C.negro} />;
  }
  const r = 14 * tam * Math.min(1, (abre - 0.5) * 2 + 0.5);
  return <circle cx={x} cy={y} r={r} fill={C.negro} />;
};

/**
 * Persona tumbada en la cama, vista de lado: la cabeza en (x, y) (centro), la cara hacia la izquierda (hacia los pies
 * de la cama, donde está el gato). `ojos` 0 = cerrados, 1 = abiertos. `cuerpo` dibuja el cuerpo tumbado hacia la izquierda.
 * `boca` 0 = nada, 1 = boca abierta (sorpresa). `sudor` = gota.
 */
export const PersonaCama: React.FC<{ x: number; y: number; escala?: number; ojos?: number; cuerpo?: boolean; boca?: number; sudor?: boolean; respira?: number }> = ({ x, y, escala = 1, ojos = 0, cuerpo = true, boca = 0, sudor, respira = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {cuerpo ? (
      <g>
        {/* cuerpo tumbado (bulto redondeado a lo largo del colchón), sube y baja un pelín al respirar */}
        <rect x={-510} y={-4 - respira} width={462} height={84 + respira} rx={42} fill={B} />
        {/* almohada */}
        <rect x={-100} y={46} width={210} height={52} rx={26} fill={B} />
      </g>
    ) : null}
    <circle r={78} fill={B} />
    <Ojo x={-24} y={-16} abre={ojos} />
    <Ojo x={-24} y={18} abre={ojos} />
    {boca > 0 ? <ellipse cx={-50} cy={44} rx={7 * boca} ry={12 * boca} fill={C.negro} /> : null}
    {sudor ? <path d="M 62 -40 q 12 20 0 28 q -12 -8 0 -28 z" fill={C.negro} /> : null}
  </g>
);

/** Solo la cabeza grande (primer plano), mirando a la izquierda. */
export const CabezaGrande: React.FC<{ x: number; y: number; r?: number; ojos?: number; sudor?: boolean; cuello?: boolean }> = ({ x, y, r = 240, ojos = 0, sudor, cuello = true }) => {
  const k = r / 78;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {cuello ? <rect x={-64} y={56} width={128} height={64} rx={30} fill={B} /> : null}
      <circle r={78} fill={B} />
      <Ojo x={-24} y={-16} abre={ojos} />
      <Ojo x={-24} y={18} abre={ojos} />
      {sudor ? <path d="M 62 -40 q 12 20 0 28 q -12 -8 0 -28 z" fill={C.negro} /> : null}
    </g>
  );
};

export type PoseDePie = "quieto" | "anda" | "brazosAbiertos" | "senala" | "inclinado" | "manosCara" | "sentado" | "agachado" | "linterna";

/**
 * Persona de pie (pictograma calcado de la referencia): cabeza redonda, tronco en cápsula con el brazo marcado con
 * una línea oscura, y las piernas como una falda que se abre hacia abajo. Andando, las piernas van sueltas.
 * (x, y) = el suelo entre los pies. Altura ≈ 300 (escala 1). `fase` = ciclo de andar (0-1). `haciaIzquierda` la gira.
 */
export const PersonaDePie: React.FC<{ x: number; y: number; escala?: number; pose?: PoseDePie; fase?: number; haciaIzquierda?: boolean; ojos?: number; frente?: boolean; enMano?: React.ReactNode }> = ({ x, y, escala = 1, pose = "quieto", fase = 0, haciaIzquierda, ojos = 1, frente, enMano }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const anda = pose === "anda";
  const a = anda ? Math.sin(fase * Math.PI * 2) : 0;
  const bob = anda ? Math.abs(Math.sin(fase * Math.PI * 2)) * 5 : 0;
  const inclina = pose === "inclinado" ? 42 : pose === "agachado" ? 20 : 0;
  // ángulo del brazo delantero (0 = colgando; negativo = hacia delante y arriba)
  const brazo = pose === "senala" ? -80 : pose === "linterna" ? -60 : pose === "brazosAbiertos" ? -90 : pose === "manosCara" ? -140 : pose === "inclinado" ? -70 : anda ? -a * 24 : 0;
  const pierna = (ang: number) => <rect x={-17} y={0} width={34} height={104} rx={17} fill={B} transform={`rotate(${ang})`} />;
  if (pose === "sentado") {
    return (
      <g transform={`translate(${x} ${y}) scale(${sx * escala} ${escala})`}>
        <circle cx={0} cy={-212} r={36} fill={B} />
        {!frente ? <Ojo x={14} y={-218} abre={ojos} tam={0.5} /> : null}
        <rect x={-32} y={-176} width={64} height={110} rx={28} fill={B} />
        <rect x={-30} y={-96} width={120} height={34} rx={17} fill={B} />
        <rect x={66} y={-96} width={32} height={96} rx={16} fill={B} />
        <rect x={-6} y={-160} width={26} height={90} rx={13} fill={B} stroke={C.negro} strokeWidth={3} transform="rotate(-50 7 -160)" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${sx * escala} ${escala})`}>
      {anda ? (
        <g>
          <g transform="translate(-14 -104)">{pierna(-a * 26)}</g>
          <g transform="translate(14 -104)">{pierna(a * 26)}</g>
        </g>
      ) : (
        <path d="M -30 -110 L 30 -110 L 44 0 L -44 0 Z" fill={B} />
      )}
      <g transform={`rotate(${inclina} 0 -110)`}>
        <rect x={-36} y={-214} width={72} height={120} rx={36} fill={B} />
        <rect x={-36} y={-140} width={72} height={40} rx={10} fill={B} />
        {/* brazo delantero marcado con una línea oscura */}
        <g transform={`translate(10 -196) rotate(${brazo})`}>
          <rect x={-13} y={0} width={26} height={100} rx={13} fill={B} stroke={C.negro} strokeWidth={3} />
          {enMano ? <g transform="translate(0 104)">{enMano}</g> : null}
        </g>
        {pose === "brazosAbiertos" || pose === "manosCara" ? (
          <g transform={`translate(-10 -196) rotate(${-brazo})`}>
            <rect x={-13} y={0} width={26} height={100} rx={13} fill={B} stroke={C.negro} strokeWidth={3} />
          </g>
        ) : null}
        <circle cx={0} cy={-254} r={40} fill={B} />
        {frente ? (
          <>
            <Ojo x={-14} y={-258} abre={ojos} tam={0.5} />
            <Ojo x={14} y={-258} abre={ojos} tam={0.5} />
          </>
        ) : (
          <Ojo x={16} y={-258} abre={ojos} tam={0.5} />
        )}
      </g>
    </g>
  );
};

/** Persona inclinada hacia delante sobre algo (mirando si respira). (x, y) = pies; se inclina hacia la derecha. */
export const PersonaInclinada: React.FC<{ x: number; y: number; escala?: number; haciaIzquierda?: boolean; grados?: number }> = ({ x, y, escala = 1, haciaIzquierda, grados = 50 }) => {
  const sx = haciaIzquierda ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * escala} ${escala})`}>
      <path d="M -30 -110 L 30 -110 L 44 0 L -44 0 Z" fill={B} />
      <g transform={`rotate(${grados} 0 -110)`}>
        <rect x={-36} y={-214} width={72} height={120} rx={36} fill={B} />
        <rect x={-36} y={-140} width={72} height={40} rx={10} fill={B} />
        <g transform="translate(10 -196) rotate(-30)">
          <rect x={-13} y={0} width={26} height={100} rx={13} fill={B} stroke={C.negro} strokeWidth={3} />
        </g>
        <circle cx={0} cy={-254} r={40} fill={B} />
        <Ojo x={16} y={-258} abre={1} tam={0.5} />
      </g>
    </g>
  );
};

/** El empleado del Negociado: busto con gafas oscuras y corbata, detrás de la mesa. (x, y) = centro del pecho. */
export const Empleado: React.FC<{ x: number; y: number; escala?: number; cabeza?: number; brazo?: number; escribe?: number }> = ({ x, y, escala = 1, cabeza = 0, brazo = 0, escribe = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {/* hombros y pecho */}
    <path d="M -120 60 Q -120 -40 -60 -56 L -30 -64 L 30 -64 L 60 -56 Q 120 -40 120 60 Z" fill={B} />
    {/* corbata y camisa */}
    <path d="M -22 -64 L 22 -64 L 0 -30 Z" fill={C.negro} />
    <path d="M -9 -36 L 9 -36 L 14 40 L 0 52 L -14 40 Z" fill={C.negro} />
    {/* brazo escribiendo (si escribe) */}
    {escribe > 0 ? <rect x={-150 + Math.sin(escribe * 20) * 3} y={30} width={130} height={30} rx={15} fill={B} transform={`rotate(${brazo})`} /> : null}
    {/* cabeza */}
    <g transform={`rotate(${cabeza} 0 -120)`}>
      <circle cx={0} cy={-120} r={62} fill={B} />
      <rect x={-54} y={-140} width={46} height={28} rx={10} fill={C.negro} />
      <rect x={8} y={-140} width={46} height={28} rx={10} fill={C.negro} />
      <rect x={-10} y={-132} width={20} height={6} fill={C.negro} />
    </g>
  </g>
);

/** Mano abierta (de frente), para el «MÍO» y el frotarse. (x, y) = base de la muñeca. */
export const Mano: React.FC<{ x: number; y: number; escala?: number; giro?: number; children?: React.ReactNode }> = ({ x, y, escala = 1, giro = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
    <rect x={-70} y={0} width={140} height={240} rx={60} fill={B} />
    <rect x={-120} y={-150} width={240} height={200} rx={70} fill={B} />
    {[-96, -48, 0, 48, 96].map((dx, i) => (
      <rect key={i} x={dx - 22} y={-150 - (i === 0 ? 60 : i === 1 ? 120 : i === 2 ? 140 : i === 3 ? 120 : 80)} width={44} height={200} rx={22} fill={B} />
    ))}
    {children}
  </g>
);
