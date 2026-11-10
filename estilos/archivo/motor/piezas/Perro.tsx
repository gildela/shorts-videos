// El perro y lo que hace falta para una escena de «debajo de la cama» (y otros muebles de la casa):
// silueta blanca maciza (sin contorno), orejas caídas marcadas con una línea oscura, hocico largo con la nariz negra
// y los ojos REDONDOS amarillos con halo (como el gato: amarillo = lo inquietante, los ojos que brillan en lo oscuro).
// También: la cama vista desde el suelo (BajoCama), TÚ tumbado boca abajo, la bañera, el armario, el sofá, ondas de
// sonido, el rayo, la oreja, la nariz con el calor, los botes de olor, la manta y el temblor.
import React from "react";
import { C, FUENTE } from "../estilo";

const B = "url(#blanco)";
const LINEA = { stroke: C.negro, strokeWidth: 4, strokeLinejoin: "round" as const };

/** Temblor: desplazamiento pequeño que cambia cada fotograma (para el perro que tiembla). Devuelve [dx, dy]. */
export const temblor = (f: number, amp = 3): [number, number] => [Math.sin(f * 2.7) * amp, Math.cos(f * 3.9) * amp * 0.6];

/** Un ojo de perro: círculo amarillo con pupila redonda y halo. `abre` 0-1, `mira` -1..1. */
export const OjoPerro: React.FC<{ x: number; y: number; r?: number; abre?: number; mira?: [number, number]; halo?: number; pupila?: number }> = ({ x, y, r = 16, abre = 1, mira = [0, 0], halo = 0.5, pupila = 0.5 }) => {
  const ry = r * Math.max(0.06, abre);
  return (
    <g transform={`translate(${x} ${y})`}>
      {halo > 0 ? <ellipse rx={r * 3.2} ry={r * 3} fill="url(#haloAmarillo)" opacity={halo} /> : null}
      <ellipse rx={r} ry={ry} fill={C.amarillo} style={{ filter: `drop-shadow(0 0 ${r * 0.5}px rgba(247,223,58,0.9))` }} />
      {abre > 0.2 ? <circle cx={mira[0] * r * 0.35} cy={mira[1] * ry * 0.3} r={r * (0.3 + 0.35 * pupila) * Math.min(1, abre * 1.2)} fill="#151006" /> : null}
    </g>
  );
};

/** Solo los dos ojos del perro en la oscuridad (más juntos y más redondos que los del gato). (x, y) = punto medio. */
export const OjosPerro: React.FC<{ x: number; y: number; r?: number; sep?: number; abre?: number; mira?: [number, number]; halo?: number; pupila?: number }> = ({ x, y, r = 50, sep = 3.0, abre = 1, mira = [0, 0], halo = 1, pupila = 0.6 }) => (
  <g>
    <OjoPerro x={x - (r * sep) / 2} y={y} r={r} abre={abre} mira={mira} halo={halo} pupila={pupila} />
    <OjoPerro x={x + (r * sep) / 2} y={y} r={r} abre={abre} mira={mira} halo={halo} pupila={pupila} />
  </g>
);

export type PropsPerro = {
  x: number;
  y: number; // y = suelo
  escala?: number;
  f?: number; // fotograma (cola, parpadeo, temblor)
  abre?: number;
  mira?: [number, number];
  halo?: number;
  haciaIzquierda?: boolean;
  cola?: number; // 0 = quieta (y caída), 1 = mueve la cola
  oreja?: number; // 0 = caída, 1 = alerta (levantada hacia atrás)
  cabeza?: number; // giro de la cabeza (grados; negativo = mira arriba)
  tiembla?: number; // amplitud del temblor en píxeles (0 = no)
  oscuro?: boolean; // solo los ojos
  contorno?: boolean; // contorno negro (sobre blanco)
};

/** La cabeza del perro de perfil, mirando a la derecha: cráneo redondo, hocico largo y recto, nariz negra en la punta,
 * oreja caída (marcada con una línea oscura) y el ojo redondo amarillo. (0,0) = centro del cráneo. */
export const CabezaPerroLado: React.FC<{ abre?: number; mira?: [number, number]; halo?: number; oreja?: number; oscuro?: boolean; contorno?: boolean; boca?: number }> = ({ abre = 1, mira = [0, 0], halo = 0.5, oreja = 0, oscuro, contorno, boca = 0 }) => {
  const fill = oscuro ? "#000" : B;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  return (
    <g>
      {/* cráneo + hocico */}
      <path d="M -62 -10 C -66 -60 -30 -78 6 -74 C 34 -72 52 -54 62 -36 L 118 -30 C 136 -28 142 -12 140 4 C 138 22 126 30 108 30 L 40 32 C 20 46 -20 50 -44 36 C -60 26 -62 10 -62 -10 Z" fill={fill} {...st} />
      {oscuro ? null : (
        <>
          {/* nariz */}
          <ellipse cx={136} cy={-16} rx={14} ry={11} fill={C.negro} />
          {/* boca */}
          {boca > 0 ? <path d={`M 120 22 Q 90 ${30 + boca * 22} 56 26`} fill={C.negro} /> : <path d="M 122 20 Q 96 30 64 24" fill="none" stroke={C.negro} strokeWidth={5} strokeLinecap="round" />}
          {/* oreja caída (o alerta) */}
          <g transform={`rotate(${-oreja * 55} -18 -56)`}>
            <path d="M -18 -60 C 6 -60 12 -40 8 0 C 6 24 -10 34 -24 30 C -38 26 -40 0 -38 -30 C -36 -50 -30 -60 -18 -60 Z" fill={fill} {...LINEA} {...st} />
          </g>
        </>
      )}
      <OjoPerro x={44} y={-34} r={12} abre={abre} mira={mira} halo={halo} />
    </g>
  );
};

const colaPath = (colaA: number, cola: number) => (cola > 0 ? `M -150 -150 C -190 -170 -210 -210 ${-200 + colaA} -250` : `M -150 -140 C -180 -120 -196 -80 -200 -40`);

/** Perro tumbado de lado (el plano principal: debajo de la cama, pegado a la pared). Patas delanteras estiradas hacia
 * delante, cabeza levantada (o apoyada con `cabezaBaja`). Largo ≈ 470, alto ≈ 190 a escala 1. (x, y) = centro de la base. */
export const PerroTumbado: React.FC<PropsPerro & { cabezaBaja?: boolean }> = ({ x, y, escala = 1, f = 0, abre = 1, mira = [0, 0], halo = 0.5, haciaIzquierda, cola = 0, oreja = 0, cabeza = 0, tiembla = 0, oscuro, contorno, cabezaBaja }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const [dx, dy] = tiembla ? temblor(f, tiembla) : [0, 0];
  const colaA = Math.sin(f / 4) * 26 * cola;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  const cy = cabezaBaja ? -78 : -150;
  const cab = (
    <g transform={`translate(${cabezaBaja ? 150 : 120} ${cy}) rotate(${cabeza + (cabezaBaja ? 4 : 0)})`}>
      <CabezaPerroLado abre={abre} mira={mira} halo={halo} oreja={oreja} oscuro={oscuro} contorno={contorno} />
    </g>
  );
  if (oscuro) return <g transform={`translate(${x + dx} ${y + dy}) scale(${sx * escala} ${escala})`}>{cab}</g>;
  return (
    <g transform={`translate(${x + dx} ${y + dy}) scale(${sx * escala} ${escala})`}>
      {cola > 0 ? (
        <path d={`M -180 -60 C -230 -70 -250 -40 ${-262 + colaA * 0.6} ${-20 - Math.abs(colaA) * 0.3}`} fill="none" stroke={C.blanco} strokeWidth={24} strokeLinecap="round" />
      ) : (
        <path d="M -180 -40 C -220 -30 -240 -14 -270 -8" fill="none" stroke={C.blanco} strokeWidth={24} strokeLinecap="round" />
      )}
      {/* cuerpo: barra redondeada tumbada, la cadera más alta detrás */}
      <path d="M -200 0 C -214 -60 -190 -128 -120 -132 L 60 -126 C 110 -124 130 -100 128 -60 L 128 0 Z" fill={B} {...st} />
      {/* pata trasera doblada (marcada) */}
      <path d="M -170 -6 C -170 -60 -120 -80 -80 -60 C -60 -46 -70 -10 -90 0 Z" fill={B} {...LINEA} />
      {/* patas delanteras estiradas */}
      <rect x={60} y={-34} width={190} height={32} rx={16} fill={B} {...st} />
      <rect x={80} y={-30} width={180} height={30} rx={15} fill={B} {...LINEA} />
      {cab}
    </g>
  );
};

/** Perro sentado de lado mirando a la derecha. Alto ≈ 330 a escala 1. */
export const PerroSentado: React.FC<PropsPerro> = ({ x, y, escala = 1, f = 0, abre = 1, mira = [0, 0], halo = 0.5, haciaIzquierda, cola = 1, oreja = 0, cabeza = 0, tiembla = 0, oscuro, contorno }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const [dx, dy] = tiembla ? temblor(f, tiembla) : [0, 0];
  const colaA = Math.sin(f / 4) * 20 * cola;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  const cab = (
    <g transform={`translate(40 -300) rotate(${cabeza})`}>
      <CabezaPerroLado abre={abre} mira={mira} halo={halo} oreja={oreja} oscuro={oscuro} contorno={contorno} />
    </g>
  );
  if (oscuro) return <g transform={`translate(${x + dx} ${y + dy}) scale(${sx * escala} ${escala})`}>{cab}</g>;
  return (
    <g transform={`translate(${x + dx} ${y + dy}) scale(${sx * escala} ${escala})`}>
      <path d={cola > 0 ? `M -100 -24 C -150 -20 -180 -40 ${-190 + colaA} -80` : "M -100 -10 C -140 -6 -170 -4 -200 0"} fill="none" stroke={C.blanco} strokeWidth={24} strokeLinecap="round" />
      {/* cuerpo: pecho recto delante, lomo inclinado */}
      <path d="M 70 0 L 70 -200 C 70 -250 50 -280 10 -290 C -50 -270 -110 -170 -120 -70 C -124 -30 -116 -8 -104 0 Z" fill={B} {...st} />
      {/* muslo trasero marcado */}
      <path d="M -116 -4 C -126 -70 -80 -110 -30 -96 C 0 -84 0 -20 -20 0 Z" fill={B} {...LINEA} />
      {/* pata delantera */}
      <rect x={34} y={-170} width={36} height={170} rx={18} fill={B} {...LINEA} />
      <rect x={30} y={-24} width={66} height={24} rx={12} fill={B} {...st} />
      {cab}
    </g>
  );
};

/** Perro de pie / andando de lado (hacia la derecha). `fase` 0-1 = zancada (0 y `anda` false = quieto). Alto ≈ 300. */
export const PerroAnda: React.FC<PropsPerro & { fase?: number; anda?: boolean }> = ({ x, y, escala = 1, f = 0, fase = 0, anda = true, abre = 1, mira = [0, 0], halo = 0.4, haciaIzquierda, cola = 1, oreja = 0, cabeza = 0, tiembla = 0, oscuro, contorno }) => {
  const sx = haciaIzquierda ? -1 : 1;
  const [dx, dy] = tiembla ? temblor(f, tiembla) : [0, 0];
  const a = anda ? Math.sin(fase * Math.PI * 2) : 0;
  const colaA = Math.sin(f / 4) * 18 * cola;
  const st = contorno ? { stroke: C.negro, strokeWidth: 10, strokeLinejoin: "round" as const } : {};
  const pata = (px: number, d: number, marca = false) => (
    <g transform={`translate(${px} -130) rotate(${d * 14})`}>
      <rect x={-17} y={0} width={34} height={132} rx={17} fill={B} {...(marca ? LINEA : {})} />
    </g>
  );
  const cab = (
    <g transform={`translate(130 -220) rotate(${cabeza})`}>
      <CabezaPerroLado abre={abre} mira={mira} halo={halo} oreja={oreja} oscuro={oscuro} contorno={contorno} />
    </g>
  );
  if (oscuro) return <g transform={`translate(${x + dx} ${y + dy}) scale(${sx * escala} ${escala})`}>{cab}</g>;
  return (
    <g transform={`translate(${x + dx} ${y + dy}) scale(${sx * escala} ${escala})`}>
      <path d={cola > 0 ? `M -140 -180 C -180 -200 -200 -230 ${-190 + colaA} -270` : "M -140 -170 C -170 -150 -186 -120 -190 -90"} fill="none" stroke={C.blanco} strokeWidth={24} strokeLinecap="round" />
      {pata(-104, -a)}
      {pata(84, a)}
      <path d="M -150 -130 C -164 -190 -120 -214 -40 -212 L 90 -214 C 140 -214 156 -180 150 -130 C 120 -112 -120 -112 -150 -130 Z" fill={B} {...st} />
      {pata(-80, a, true)}
      {pata(108, -a, true)}
      {cab}
    </g>
  );
};

/** La cara del perro en primer plano, de frente: cabeza redonda, dos orejas caídas, hocico con la nariz y los ojos
 * redondos amarillos. (x, y) = centro de la cabeza. `boca` 0-1 = bostezo. */
export const CaraPerro: React.FC<{ x: number; y: number; r?: number; abre?: number; mira?: [number, number]; halo?: number; oreja?: number; boca?: number; oscuro?: boolean }> = ({ x, y, r = 230, abre = 1, mira = [0, 0], halo = 0.6, oreja = 0, boca = 0, oscuro }) => {
  const k = r / 230;
  if (oscuro)
    return (
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <OjoPerro x={-80} y={-30} r={40} abre={abre} mira={mira} halo={halo} />
        <OjoPerro x={80} y={-30} r={40} abre={abre} mira={mira} halo={halo} />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {/* orejas caídas a los lados */}
      <g transform={`rotate(${oreja * 30} -170 -120)`}>
        <path d="M -170 -150 C -250 -150 -280 -40 -260 60 C -250 110 -200 120 -180 80 C -160 30 -150 -60 -150 -120 Z" fill={B} {...LINEA} />
      </g>
      <g transform={`rotate(${-oreja * 30} 170 -120)`}>
        <path d="M 170 -150 C 250 -150 280 -40 260 60 C 250 110 200 120 180 80 C 160 30 150 -60 150 -120 Z" fill={B} {...LINEA} />
      </g>
      {/* cabeza */}
      <path d="M -190 -40 C -200 -170 -100 -220 0 -220 C 100 -220 200 -170 190 -40 C 184 60 120 110 0 110 C -120 110 -184 60 -190 -40 Z" fill={B} />
      {/* hocico */}
      <path d="M -110 60 C -120 0 -60 -10 0 -10 C 60 -10 120 0 110 60 C 104 140 50 170 0 170 C -50 170 -104 140 -110 60 Z" fill={B} {...LINEA} />
      <ellipse cx={0} cy={30} rx={46} ry={32} fill={C.negro} />
      <line x1={0} y1={62} x2={0} y2={104} stroke={C.negro} strokeWidth={7} strokeLinecap="round" />
      {boca > 0 ? <ellipse cx={0} cy={124} rx={56} ry={40 * boca} fill={C.negro} /> : <path d="M -50 112 Q -24 132 0 104 Q 24 132 50 112" fill="none" stroke={C.negro} strokeWidth={7} strokeLinecap="round" />}
      <OjoPerro x={-80} y={-70} r={34} abre={abre} mira={mira} halo={halo} />
      <OjoPerro x={80} y={-70} r={34} abre={abre} mira={mira} halo={halo} />
    </g>
  );
};

/** Pata del perro entrando por un lado (la que «te tira de la manga»). (x, y) = punta; viene desde la izquierda. */
export const PataPerro: React.FC<{ x: number; y: number; largo?: number; escala?: number; giro?: number; dedos?: number }> = ({ x, y, largo = 600, escala = 1, giro = 0, dedos = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
    <rect x={-largo} y={-46} width={largo} height={92} rx={46} fill={B} />
    <ellipse cx={-6} cy={0} rx={72} ry={62} fill={B} />
    {[-34, -10, 14, 38].map((dy, i) => (
      <ellipse key={i} cx={50 - (i === 0 || i === 3 ? 12 : 0) + dedos * 10} cy={dy * 0.95} rx={18} ry={12} fill={B} {...LINEA} />
    ))}
  </g>
);

/** Huellas de perro en línea (grises), más grandes que las del gato y con uñas. */
export const HuellasPerro: React.FC<{ x: number; y: number; n?: number; sep?: number; k?: number }> = ({ x, y, n = 4, sep = 90, k = 99 }) => (
  <g fill={C.gris}>
    {Array.from({ length: n }, (_, i) =>
      k > i * 0.15 ? (
        <g key={i} transform={`translate(${x + i * sep} ${y + (i % 2 ? -14 : 0)})`}>
          <path d="M -16 6 C -18 -8 -6 -14 0 -14 C 6 -14 18 -8 16 6 C 14 16 -14 16 -16 6 Z" />
          <ellipse cx={-18} cy={-22} rx={6} ry={8} />
          <ellipse cx={-6} cy={-30} rx={6} ry={8} />
          <ellipse cx={6} cy={-30} rx={6} ry={8} />
          <ellipse cx={18} cy={-22} rx={6} ry={8} />
        </g>
      ) : null,
    )}
  </g>
);

/**
 * La cama vista DESDE EL SUELO (el sitio del vídeo): la parte de abajo del somier como una losa blanca arriba, las
 * patas a los lados, el suelo en `y` y la pared a la derecha. Dentro queda un hueco negro de unos 330 px de alto
 * donde caben el perro tumbado (escala ≈ 1) y TÚ boca abajo.
 * (x, y) = esquina inferior izquierda (la pata de los pies, en el suelo). `w` = ancho. `hunde` 0-1 = el colchón se
 * hunde en `hundeX` (alguien se sienta encima). `pared` dibuja la pared a la derecha.
 */
export const BajoCama: React.FC<{ x?: number; y?: number; w?: number; alto?: number; hunde?: number; hundeX?: number; pared?: boolean; children?: React.ReactNode }> = ({ x = 160, y = 800, w = 1600, alto = 340, hunde = 0, hundeX = 0.35, pared = true, children }) => {
  const top = y - alto; // parte de abajo del somier
  const hx = x + w * hundeX;
  const d = 60 * hunde;
  return (
    <g>
      {pared ? <line x1={x + w + 40} y1={top - 330} x2={x + w + 40} y2={y} stroke={C.gris} strokeWidth={8} strokeLinecap="round" /> : null}
      {children}
      {/* somier (losa) con la deformación del peso */}
      <path
        d={`M ${x - 20} ${top - 70} L ${x + w + 20} ${top - 70} L ${x + w + 20} ${top} L ${hx + 260} ${top} C ${hx + 120} ${top} ${hx + 90} ${top + d} ${hx} ${top + d} C ${hx - 90} ${top + d} ${hx - 120} ${top} ${hx - 260} ${top} L ${x - 20} ${top} Z`}
        fill={B}
      />
      {/* colchón asomando por arriba */}
      <rect x={x + 10} y={top - 220} width={w - 20} height={140} rx={60} fill={B} opacity={0.9} />
      {/* listones del somier (rayas grises por debajo) */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={x + 60 + (i * (w - 120)) / 8} y1={top - 60} x2={x + 60 + (i * (w - 120)) / 8} y2={top - 10} stroke={C.gris} strokeWidth={6} opacity={0.6} />
      ))}
      {/* patas */}
      <rect x={x} y={top - 10} width={56} height={alto + 10} rx={18} fill={B} />
      <rect x={x + w - 56} y={top - 10} width={56} height={alto + 10} rx={18} fill={B} />
    </g>
  );
};

/** TÚ tumbado boca abajo en el suelo, visto de lado: la cabeza en (x, y) mirando a la IZQUIERDA (a la puerta), el
 * cuerpo hacia la derecha. `brazo` = ángulo del brazo (0 = estirado hacia delante por el suelo, 90 = hacia arriba,
 * 130 = hacia atrás y arriba: la mano en el lomo del perro que está detrás, en PERRO_BAJO). `ojos` 0-1.
 * `cabeza` = giro (positivo = mira arriba). */
export const PersonaBocaAbajo: React.FC<{ x: number; y: number; escala?: number; ojos?: number; brazo?: number; cabeza?: number; haciaDerecha?: boolean; respira?: number; sudor?: boolean }> = ({ x, y, escala = 1, ojos = 1, brazo = 10, cabeza = 0, haciaDerecha, respira = 0, sudor }) => {
  const sx = haciaDerecha ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * escala} ${escala})`}>
      {/* piernas y cuerpo, a lo largo del suelo hacia la derecha */}
      <rect x={250} y={10} width={300} height={56} rx={28} fill={B} />
      <rect x={40} y={-6 - respira} width={250} height={76 + respira} rx={38} fill={B} />
      {/* brazo */}
      <g transform={`translate(150 6) rotate(${90 + brazo})`}>
        <rect x={-14} y={0} width={28} height={140} rx={14} fill={B} stroke={C.negro} strokeWidth={4} />
      </g>
      {/* cabeza apoyada (barbilla en el suelo), cara a la izquierda */}
      <g transform={`rotate(${cabeza} 0 20)`}>
        <circle cx={0} cy={0} r={50} fill={B} />
        {ojos < 0.5 ? <rect x={-34} y={-12} width={22} height={7} rx={3.5} fill={C.negro} /> : <circle cx={-24} cy={-8} r={8} fill={C.negro} />}
        {sudor ? <path d="M 30 -46 q 9 15 0 21 q -9 -6 0 -21 z" fill={C.negro} /> : null}
      </g>
    </g>
  );
};

/** La bañera vista de lado. (x, y) = centro de la base. Con `perro` dentro asoma la cabeza (escondido). */
export const Banera: React.FC<{ x: number; y: number; escala?: number; children?: React.ReactNode }> = ({ x, y, escala = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {children}
    <path d="M -330 -260 L 330 -260 L 310 -80 C 300 -30 260 -10 210 -10 L -210 -10 C -260 -10 -300 -30 -310 -80 Z" fill={B} />
    <rect x={-350} y={-282} width={700} height={34} rx={14} fill={B} />
    <rect x={-250} y={-12} width={40} height={12} rx={6} fill={B} />
    <rect x={210} y={-12} width={40} height={12} rx={6} fill={B} />
    {/* grifo */}
    <path d="M 290 -282 L 290 -360 Q 290 -390 250 -390 L 220 -390" fill="none" stroke={C.blanco} strokeWidth={18} strokeLinecap="round" />
  </g>
);

/** Armario de frente con dos puertas. (x, y) = centro de la base. `abierta` 0-1 abre la puerta derecha (hueco negro). */
export const Armario: React.FC<{ x: number; y: number; escala?: number; abierta?: number; children?: React.ReactNode }> = ({ x, y, escala = 1, abierta = 0, children }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-220} y={-560} width={440} height={540} rx={10} fill="none" stroke={C.blanco} strokeWidth={14} />
    <g>{children}</g>
    <rect x={-210} y={-550} width={206} height={520} rx={6} fill={B} />
    <rect x={4} y={-550} width={206 * (1 - abierta * 0.85)} height={520} rx={6} fill={B} />
    <rect x={-36} y={-320} width={14} height={70} rx={7} fill={C.negro} />
    {abierta < 0.3 ? <rect x={22} y={-320} width={14} height={70} rx={7} fill={C.negro} /> : null}
    <rect x={-200} y={-20} width={30} height={20} rx={6} fill={B} />
    <rect x={170} y={-20} width={30} height={20} rx={6} fill={B} />
  </g>
);

/** Sofá visto de frente. (x, y) = centro de la base. */
export const Sofa: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-300} y={-300} width={600} height={170} rx={50} fill={B} />
    <rect x={-360} y={-200} width={100} height={180} rx={40} fill={B} />
    <rect x={260} y={-200} width={100} height={180} rx={40} fill={B} />
    <rect x={-270} y={-150} width={540} height={110} rx={30} fill={B} {...LINEA} />
    <rect x={-300} y={-30} width={30} height={30} rx={8} fill={B} />
    <rect x={270} y={-30} width={30} height={30} rx={8} fill={B} />
  </g>
);

/** La cama del perro (cojín redondo) vista de lado. (x, y) = centro de la base. */
export const CamaPerro: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <path d="M -200 0 C -220 -40 -210 -110 -170 -110 C -140 -110 -140 -60 -100 -60 L 100 -60 C 140 -60 140 -110 170 -110 C 210 -110 220 -40 200 0 Z" fill="none" stroke={C.blanco} strokeWidth={14} strokeLinejoin="round" />
  </g>
);

/** Ondas de sonido (arcos que salen de (x, y) hacia la derecha, o la izquierda con `izq`). `k` = segundos (se mueven). */
export const Ondas: React.FC<{ x: number; y: number; n?: number; k?: number; tam?: number; izq?: boolean; color?: string }> = ({ x, y, n = 4, k = 0, tam = 1, izq, color = C.blanco }) => (
  <g transform={`translate(${x} ${y}) scale(${izq ? -tam : tam} ${tam})`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const fase = ((k * 0.8 + i / n) % 1 + 1) % 1;
      const r = 40 + fase * 160;
      return <path key={i} d={`M ${r * Math.cos(-0.7)} ${r * Math.sin(-0.7)} A ${r} ${r} 0 0 1 ${r * Math.cos(0.7)} ${r * Math.sin(0.7)}`} opacity={1 - fase} />;
    })}
  </g>
);

/** Rayo (blanco). (x, y) = punta de arriba. */
export const Rayo: React.FC<{ x: number; y: number; escala?: number; k?: number }> = ({ x, y, escala = 1, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={k}>
    <path d="M 0 0 L -60 160 L -10 160 L -50 320 L 70 120 L 20 120 L 60 0 Z" fill={C.blanco} />
  </g>
);

/** Oreja humana de perfil (para la comparación de lo que oyes). (x, y) = centro. */
export const Oreja: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <path d="M -40 -110 C 40 -130 90 -60 70 10 C 56 60 20 70 10 110 C 0 140 -40 140 -50 110 C -60 80 -30 70 -36 40 C -44 10 -80 -10 -76 -60 C -74 -90 -60 -104 -40 -110 Z" fill={B} />
    <path d="M -30 -70 C 20 -84 46 -40 34 0 C 26 26 0 30 -6 50" fill="none" stroke={C.negro} strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** Oreja de perro levantada (alerta), para la comparación. (x, y) = base. */
export const OrejaPerro: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <path d="M -70 0 C -80 -120 -40 -220 10 -250 C 60 -200 80 -100 70 0 Z" fill={B} />
    <path d="M -30 -20 C -36 -100 -10 -170 12 -190 C 30 -150 36 -90 30 -20" fill="none" stroke={C.negro} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** La nariz del perro en primer plano con el «sensor» de calor: ondas amarillas que suben hacia arriba. (x, y) = centro. */
export const NarizPerro: React.FC<{ x: number; y: number; escala?: number; calor?: number; k?: number }> = ({ x, y, escala = 1, calor = 0, k = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {calor > 0
      ? Array.from({ length: 3 }, (_, i) => {
          const fase = ((k * 0.7 + i / 3) % 1 + 1) % 1;
          return <path key={i} d={`M -80 ${-130 - fase * 200} q 40 -30 80 0 q 40 30 80 0`} fill="none" stroke={C.amarillo} strokeWidth={10} strokeLinecap="round" opacity={calor * (1 - fase)} />;
        })
      : null}
    <path d="M -160 60 C -170 -40 -100 -110 0 -110 C 100 -110 170 -40 160 60 C 150 120 90 140 0 140 C -90 140 -150 120 -160 60 Z" fill={B} />
    <path d="M -120 20 C -120 -60 -60 -80 0 -80 C 60 -80 120 -60 120 20 C 120 70 60 90 0 90 C -60 90 -120 70 -120 20 Z" fill={C.negro} />
    <ellipse cx={-50} cy={20} rx={26} ry={36} fill="#000" stroke="#3a3a3a" strokeWidth={4} transform="rotate(-20 -50 20)" />
    <ellipse cx={50} cy={20} rx={26} ry={36} fill="#000" stroke="#3a3a3a" strokeWidth={4} transform="rotate(20 50 20)" />
    <line x1={0} y1={50} x2={0} y2={90} stroke="#3a3a3a" strokeWidth={6} />
  </g>
);

/** Bote de laboratorio (para la prueba de los siete botes). (x, y) = centro de la base. `marcado` = el bueno (tick). */
export const Bote: React.FC<{ x: number; y: number; escala?: number; texto?: string }> = ({ x, y, escala = 1, texto }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-50} y={-150} width={100} height={150} rx={16} fill="none" stroke={C.blanco} strokeWidth={10} />
    <rect x={-60} y={-180} width={120} height={36} rx={10} fill={B} />
    {texto ? (
      <text x={0} y={-60} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={44} fill={C.blanco}>
        {texto}
      </text>
    ) : null}
  </g>
);

/** Manta tapando a alguien (bulto con pliegues). (x, y) = centro de la base. */
export const Manta: React.FC<{ x: number; y: number; escala?: number; tiembla?: number; f?: number }> = ({ x, y, escala = 1, tiembla = 0, f = 0 }) => {
  const [dx] = tiembla ? temblor(f, tiembla) : [0, 0];
  return (
    <g transform={`translate(${x + dx} ${y}) scale(${escala})`}>
      <path d="M -200 0 C -210 -120 -120 -230 0 -230 C 120 -230 210 -120 200 0 Z" fill={B} />
      <path d="M -120 -20 C -110 -100 -70 -160 -30 -180 M 40 -20 C 50 -90 80 -140 110 -160" fill="none" stroke={C.negro} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

/** Fuegos artificiales / petardo: estallido de rayitas blancas. (x, y) = centro. `k` 0-1 = apertura. */
export const Estallido: React.FC<{ x: number; y: number; r?: number; k?: number; color?: string }> = ({ x, y, r = 120, k = 1, color = C.blanco }) => (
  <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth={9} strokeLinecap="round" opacity={Math.max(0, Math.min(1, 1.6 - k))}>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r0 = r * 0.35 * Math.min(1, k);
      const r1 = r * Math.min(1, k);
      return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} />;
    })}
  </g>
);
