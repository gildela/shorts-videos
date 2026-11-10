// La casa: la cama, la mesilla con el vaso, la ventana con la luna, puertas, el pasillo, el interruptor, el reloj
// digital, la mesa del Negociado, la casa por fuera. Blanco macizo (con el degradado «blanco») o contornos gruesos.
import React from "react";
import { C, FUENTE } from "../estilo";

const B = "url(#blanco)";

/**
 * La cama vista de lado. (x, y) = esquina inferior izquierda (los pies de la cama, en el suelo). Ancho `w` (por defecto 900).
 * El cabecero alto va a la derecha. La persona se pone con PersonaCama en (x + w - 180, y - 250) aprox.
 */
export const Cama: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 900 }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* patas */}
    <rect x={10} y={-120} width={40} height={120} rx={14} fill={B} />
    <rect x={w - 50} y={-120} width={40} height={120} rx={14} fill={B} />
    {/* pie de cama (poste bajo, redondeado) */}
    <rect x={0} y={-330} width={56} height={220} rx={28} fill={B} />
    {/* somier y colchón */}
    <rect x={30} y={-180} width={w - 60} height={70} rx={10} fill={B} />
    <rect x={60} y={-310} width={w - 170} height={140} rx={60} fill={B} />
    {/* cabecero alto */}
    <rect x={w - 70} y={-520} width={70} height={420} rx={35} fill={B} />
  </g>
);

/** Mesilla con un vaso de agua encima. (x, y) = centro de la base en el suelo. */
export const Mesilla: React.FC<{ x: number; y: number; vaso?: boolean; reloj?: string; w?: number }> = ({ x, y, vaso = true, reloj, w = 260 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 20} y={-60} width={32} height={60} rx={10} fill={B} />
    <rect x={w / 2 - 52} y={-60} width={32} height={60} rx={10} fill={B} />
    <rect x={-w / 2} y={-290} width={w} height={236} rx={12} fill="none" stroke={C.blanco} strokeWidth={14} />
    <rect x={-w / 2 - 14} y={-310} width={w + 28} height={34} rx={10} fill={B} />
    {/* cajón con tirador */}
    <rect x={-w / 2 + 28} y={-262} width={w - 56} height={92} rx={8} fill="none" stroke={C.blanco} strokeWidth={10} />
    <rect x={-30} y={-222} width={60} height={12} rx={6} fill={C.blanco} />
    <line x1={-w / 2 + 14} y1={-150} x2={w / 2 - 14} y2={-150} stroke={C.blanco} strokeWidth={10} />
    {vaso ? (
      <g transform="translate(0 -310)">
        <path d="M -34 0 L -30 -110 L 30 -110 L 34 0 Z" fill="none" stroke={C.blanco} strokeWidth={10} strokeLinejoin="round" />
        <rect x={-26} y={-60} width={52} height={54} fill="#9a9a98" />
      </g>
    ) : null}
    {reloj ? <RelojDigital x={0} y={-370} hora={reloj} escala={0.8} /> : null}
  </g>
);

/** Reloj digital: caja redondeada con la hora. (x, y) = centro. */
export const RelojDigital: React.FC<{ x: number; y: number; hora: string; escala?: number; rojo?: boolean }> = ({ x, y, hora, escala = 1, rojo }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-130} y={-56} width={260} height={112} rx={20} fill="#000" stroke={rojo ? C.rojo : C.blanco} strokeWidth={10} />
    <text x={0} y={26} textAnchor="middle" fontFamily={FUENTE} fontWeight={700} fontSize={78} letterSpacing={4} fill={C.blanco}>
      {hora}
    </text>
  </g>
);

/** Ventana con la luna. (x, y) = centro. `encendida` = luz de dentro (amarilla: es de noche y hay alguien);
 * `dia` = luz de fuera (gris, sin luna): en este estilo no hay sol, el día es una ventana clara y nada más. */
export const Ventana: React.FC<{ x: number; y: number; tam?: number; luna?: boolean; sol?: boolean; encendida?: boolean; dia?: boolean }> = ({ x, y, tam = 200, luna = true, sol, encendida, dia }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-tam / 2} y={-tam / 2} width={tam} height={tam} rx={8} fill={encendida ? C.amarillo : dia ? C.gris : "none"} stroke={C.blanco} strokeWidth={14} />
    <line x1={0} y1={-tam / 2} x2={0} y2={tam / 2} stroke={C.blanco} strokeWidth={12} />
    <line x1={-tam / 2} y1={0} x2={tam / 2} y2={0} stroke={C.blanco} strokeWidth={12} />
    <rect x={-tam / 2 - 16} y={tam / 2 - 2} width={tam + 32} height={18} rx={6} fill={B} />
    {luna && !dia ? <Luna x={tam * 0.18} y={-tam * 0.2} r={tam * 0.16} /> : null}
    {sol ? <circle cx={tam * 0.18} cy={-tam * 0.2} r={tam * 0.15} fill={C.amarillo} /> : null}
  </g>
);

export const Luna: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 40 }) => {
  const id = `luna-${Math.round(x)}-${Math.round(y)}-${r}`;
  return (
    <g transform={`translate(${x} ${y})`} style={{ filter: "drop-shadow(0 0 10px rgba(247,223,58,0.5))" }}>
      <mask id={id}>
        <circle r={r} fill="#fff" />
        <circle cx={r * 0.55} cy={-r * 0.2} r={r * 0.85} fill="#000" />
      </mask>
      <circle r={r} fill={C.amarillo} mask={`url(#${id})`} />
    </g>
  );
};

/**
 * Dormitorio entero montado: cama (x, 900 de ancho), mesilla en x + 1120 y la ventana en (x + 50, y − 570) con 190 de
 * lado (con los valores por defecto: ventana en (380, 230), que va de y = 135 a 325). (x, y) = pies de la cama en el
 * suelo. `ventana={false}` la quita: hace falta cuando hay algo en el techo (la línea de `Techo` está en y = 190 y la
 * cruzaría) o cuando la ventana va aparte (encendida, de día…).
 */
export const Dormitorio: React.FC<{ x?: number; y?: number; reloj?: string; ventana?: boolean; children?: React.ReactNode }> = ({ x = 330, y = 800, reloj, ventana = true, children }) => (
  <g>
    {ventana ? <Ventana x={x + 50} y={y - 570} tam={190} /> : null}
    <Cama x={x} y={y} w={900} />
    <Mesilla x={x + 1120} y={y} reloj={reloj} />
    {children}
  </g>
);

/** La línea del techo del dormitorio (y = 190): por encima de ella «andan» los pasos. */
export const TECHO = 190;
/** El suelo del desván (la habitación de arriba), más alto que el de las habitaciones (800). */
export const SUELO_DESVAN = 700;

/** El techo: la línea gris de pared a pared, como la del suelo pero arriba (en y = TECHO). Para los planos «mirando
 * arriba»: `<Lienzo zoom={2.3} cx={800} cy={170}><Techo /><Pasos … y={TECHO - 22} /></Lienzo>`. */
export const Techo: React.FC<{ y?: number }> = ({ y = TECHO }) => <line x1={-400} y1={y} x2={2320} y2={y} stroke={C.gris} strokeWidth={7} strokeLinecap="round" />;

/** El dormitorio con el techo a la vista y sin ventana: la línea del techo, la cama y la mesilla. (x, y) = pies de la
 * cama en el suelo. TÚ va como hijo (`<PersonaCama x={1050} y={424} …/>`) y los pasos encima del techo (y = TECHO − 22). */
export const DormitorioTecho: React.FC<{ x?: number; y?: number; reloj?: string; techo?: number; children?: React.ReactNode }> = ({ x = 330, y = 800, reloj, techo = TECHO, children }) => (
  <g>
    <Techo y={techo} />
    <Dormitorio x={x} y={y} reloj={reloj} ventana={false}>
      {children}
    </Dormitorio>
  </g>
);

/** El desván: una habitación a dos aguas (el suelo y las dos vertientes del tejado en contorno blanco). (x, y) = centro
 * del suelo; `ancho` entre aleros y `alto` hasta la cumbrera. Va con `<Lienzo suelo={SUELO_DESVAN}>`. */
export const Desvan: React.FC<{ x?: number; y?: number; ancho?: number; alto?: number; children?: React.ReactNode }> = ({ x = 960, y = SUELO_DESVAN, ancho = 1400, alto = 450, children }) => (
  <g>
    <polyline points={`${x - ancho / 2},${y} ${x},${y - alto} ${x + ancho / 2},${y}`} fill="none" stroke={C.blanco} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
    {children}
  </g>
);

/** El corte de una habitación: pared, techo, pared (en contorno blanco), para contar algo entre pared y pared. (x, y) =
 * centro del suelo; `ancho` entre paredes y `alto` del suelo al techo. Los pasos van en y − alto − 22. */
export const CorteParedes: React.FC<{ x?: number; y?: number; ancho?: number; alto?: number; children?: React.ReactNode }> = ({ x = 960, y = 800, ancho = 1260, alto = 500, children }) => (
  <g>
    <g stroke={C.blanco} strokeWidth={14} strokeLinecap="round" fill="none">
      <line x1={x - ancho / 2} y1={y - alto} x2={x - ancho / 2} y2={y} />
      <line x1={x + ancho / 2} y1={y - alto} x2={x + ancho / 2} y2={y} />
      <line x1={x - ancho / 2} y1={y - alto} x2={x + ancho / 2} y2={y - alto} />
    </g>
    {children}
  </g>
);

/**
 * Puerta vista de frente. (x, y) = centro de la base (en el suelo). `abierta` 0 = cerrada … 1 = abierta del todo
 * (la hoja gira hacia nosotros, a la derecha). `luz` pinta el hueco en amarillo (luz encendida detrás).
 */
export const Puerta: React.FC<{ x: number; y: number; w?: number; h?: number; abierta?: number; luz?: boolean; hueco?: boolean }> = ({ x, y, w = 220, h = 460, abierta = 0, luz, hueco }) => {
  const ang = abierta * 55;
  const ancho = w * Math.cos((ang * Math.PI) / 180);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 14} y={-h - 14} width={w + 28} height={h + 14} rx={6} fill={luz ? C.amarillo : hueco ? "#000" : "none"} stroke={C.blanco} strokeWidth={14} />
      {/* la hoja */}
      <g transform={`translate(${-w / 2} 0)`}>
        <rect x={0} y={-h} width={Math.max(8, ancho)} height={h} rx={4} fill={B} />
        {ancho > 60 ? <circle cx={ancho - 30} cy={-h / 2} r={9} fill={C.negro} /> : null}
      </g>
    </g>
  );
};

/** Pasillo: dos puertas a los lados y el suelo en medio (el sitio donde «te lo encuentras de noche»). */
export const Pasillo: React.FC<{ y?: number; children?: React.ReactNode }> = ({ y = 800, children }) => (
  <g>
    <Puerta x={520} y={y} />
    <Puerta x={1400} y={y} />
    {children}
  </g>
);

/** Interruptor de la luz. (x, y) = centro. `encendido` sube la tecla. */
export const Interruptor: React.FC<{ x: number; y: number; encendido?: boolean; escala?: number }> = ({ x, y, encendido, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-70} y={-90} width={140} height={180} rx={14} fill="none" stroke={C.blanco} strokeWidth={12} />
    <rect x={-32} y={encendido ? -62 : -2} width={64} height={64} rx={8} fill={encendido ? C.amarillo : C.blanco} />
    <rect x={-32} y={encendido ? 2 : -62} width={64} height={60} rx={8} fill="none" stroke={C.blanco} strokeWidth={8} />
  </g>
);

/** Bombilla. (x, y) = centro del globo. `encendida` la pone amarilla con rayos. */
export const Bombilla: React.FC<{ x: number; y: number; encendida?: boolean; escala?: number }> = ({ x, y, encendida, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {encendida ? <circle r={120} fill="url(#haloAmarillo)" /> : null}
    <circle r={60} fill={encendida ? C.amarillo : "none"} stroke={C.blanco} strokeWidth={12} />
    <rect x={-26} y={44} width={52} height={40} rx={8} fill={B} />
    <rect x={-18} y={84} width={36} height={14} rx={6} fill={B} />
    {encendida
      ? [0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={0} y1={-80} x2={0} y2={-105} stroke={C.amarillo} strokeWidth={8} strokeLinecap="round" transform={`rotate(${a})`} />)
      : null}
  </g>
);

/** Linterna de mano con su haz amarillo. (x, y) = centro de la linterna; apunta hacia la derecha. */
export const Linterna: React.FC<{ x: number; y: number; haz?: number; escala?: number; giro?: number }> = ({ x, y, haz = 1, escala = 1, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
    {haz > 0 ? <path d={`M 70 -34 L ${70 + 520 * haz} ${-34 - 120 * haz} L ${70 + 520 * haz} ${34 + 120 * haz} L 70 34 Z`} fill={C.amarillo} opacity={0.55} /> : null}
    <rect x={-120} y={-26} width={160} height={52} rx={14} fill={B} />
    <path d="M 40 -34 L 76 -46 L 76 46 L 40 34 Z" fill={B} />
    {haz > 0 ? <rect x={70} y={-40} width={10} height={80} rx={4} fill={C.amarillo} /> : null}
  </g>
);

/** La mesa del Negociado: tablero, teléfono y carpeta. (x, y) = centro del borde delantero (abajo). */
export const Mesa: React.FC<{ x: number; y: number; w?: number; carpeta?: string }> = ({ x, y, w = 1100, carpeta }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-200} width={w} height={200} rx={6} fill="#9a9a98" />
    <rect x={-w / 2 - 20} y={-230} width={w + 40} height={44} rx={12} fill={B} />
    {/* teclado */}
    <rect x={-w / 2 + 120} y={-250} width={180} height={18} rx={6} fill={C.blanco} />
    {carpeta ? (
      <g transform={`translate(${-w / 2 + 420} -300)`}>
        <rect x={-110} y={-70} width={220} height={120} rx={8} fill={B} />
        <text x={0} y={-18} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={30} letterSpacing={3} fill={C.negro}>
          {carpeta}
        </text>
        <g transform="translate(0 20)" fill={C.negro}>
          <ellipse rx={12} ry={10} />
          <circle cx={-14} cy={-12} r={5} />
          <circle cx={-5} cy={-18} r={5} />
          <circle cx={5} cy={-18} r={5} />
          <circle cx={14} cy={-12} r={5} />
        </g>
      </g>
    ) : null}
  </g>
);

/** La casa por fuera, de noche: tejado, puerta, dos ventanas (amarillas si están encendidas). (x, y) = centro de la base. */
export const CasaFuera: React.FC<{ x: number; y: number; escala?: number; ventanas?: [boolean, boolean]; luna?: boolean; ojos?: boolean }> = ({ x, y, escala = 1, ventanas = [true, true], luna = true, ojos }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {luna ? <Luna x={-520} y={-560} r={38} /> : null}
    <path d="M -300 -260 L 0 -500 L 300 -260 Z" fill={B} />
    <rect x={130} y={-470} width={50} height={110} fill={B} />
    <rect x={-250} y={-270} width={500} height={270} fill={B} />
    <rect x={-50} y={-180} width={100} height={180} rx={4} fill="#000" />
    <rect x={-200} y={-200} width={90} height={90} rx={4} fill={ventanas[0] ? C.amarillo : "#000"} />
    <rect x={110} y={-200} width={90} height={90} rx={4} fill={ventanas[1] ? C.amarillo : "#000"} />
    {ojos ? (
      <g>
        <OjoCasa x={135} y={-155} />
        <OjoCasa x={175} y={-155} />
      </g>
    ) : null}
  </g>
);
const OjoCasa: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse rx={11} ry={10} fill={C.amarillo} />
    <ellipse rx={3} ry={8} fill="#151006" />
  </g>
);

/** Escalera vista de lado, bajando hacia la derecha. (x, y) = arriba a la izquierda. */
export const Escalera: React.FC<{ x: number; y: number; n?: number; paso?: number; alto?: number }> = ({ x, y, n = 7, paso = 120, alto = 70 }) => {
  let d = `M ${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` h ${paso} v ${alto}`;
  d += ` h ${paso}`;
  return <path d={d} fill="none" stroke={C.blanco} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />;
};

/** El cuenco de comida visto desde arriba (lleno de pienso). (x, y) = centro. */
export const Cuenco: React.FC<{ x: number; y: number; r?: number; lleno?: number }> = ({ x, y, r = 170, lleno = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={B} />
    <circle r={r * 0.78} fill="#141414" />
    {lleno > 0
      ? Array.from({ length: 70 }, (_, i) => {
          const a = (i * 2.399) % (Math.PI * 2);
          const rr = r * 0.74 * Math.sqrt(((i * 7919) % 100) / 100);
          if (rr < r * 0.78 * (1 - lleno)) return null;
          return <ellipse key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} rx={r * 0.05} ry={r * 0.04} fill="#cfcfcd" transform={`rotate(${a * 57} ${Math.cos(a) * rr} ${Math.sin(a) * rr})`} />;
        })
      : null}
    <circle r={r * 0.22} fill="#111" />
    <g transform={`scale(${r / 170})`} fill="#cfcfcd">
      <ellipse rx={14} ry={11} />
      <circle cx={-16} cy={-13} r={6} />
      <circle cx={-5} cy={-20} r={6} />
      <circle cx={6} cy={-20} r={6} />
      <circle cx={16} cy={-13} r={6} />
    </g>
  </g>
);

/** Inodoro visto de lado (hacia la izquierda). (x, y) = base en el suelo. */
export const Inodoro: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-10} y={-300} width={90} height={170} rx={14} fill={B} />
    <path d="M -130 -150 C -140 -90 -100 -60 -40 -60 L 60 -60 L 70 -150 Z" fill={B} />
    <rect x={-70} y={-62} width={80} height={62} rx={10} fill={B} />
    <rect x={-140} y={-170} width={210} height={26} rx={13} fill={B} />
  </g>
);

/** Nevera. (x, y) = base en el suelo. */
export const Nevera: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-110} y={-460} width={220} height={460} rx={16} fill={B} />
    <line x1={-110} y1={-310} x2={110} y2={-310} stroke="#000" strokeWidth={8} />
    <rect x={70} y={-400} width={14} height={60} rx={7} fill="#000" />
    <rect x={70} y={-270} width={14} height={110} rx={7} fill="#000" />
  </g>
);

/** Vaso solo (para la mesilla y para el que cae). (x, y) = base. `giro` lo tumba. */
export const Vaso: React.FC<{ x: number; y: number; escala?: number; giro?: number; agua?: boolean }> = ({ x, y, escala = 1, giro = 0, agua = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
    <path d="M -34 0 L -30 -110 L 30 -110 L 34 0 Z" fill="none" stroke={C.blanco} strokeWidth={10} strokeLinejoin="round" />
    {agua ? <rect x={-26} y={-60} width={52} height={54} fill="#9a9a98" /> : null}
  </g>
);

/** La casa en corte (vista por dentro): cuatro habitaciones con sus muebles en gris. (x, y) = centro de la base.
 * `luz` = en qué habitación hay alguien con la linterna (0-3) o -1. `gato` = en cuál está el gato (0-3) o -1. */
export const CasaCorte: React.FC<{ x: number; y: number; escala?: number; luz?: number; gato?: number; f?: number }> = ({ x, y, escala = 1, luz = -1, gato = -1, f = 0 }) => {
  const hab = [
    [-440, -520],
    [20, -520],
    [-440, -260],
    [20, -260],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <path d="M -520 -560 L 0 -820 L 520 -560 Z" fill={B} />
      <rect x={-470} y={-540} width={940} height={540} fill="none" stroke={C.blanco} strokeWidth={12} />
      <line x1={-470} y1={-270} x2={470} y2={-270} stroke={C.blanco} strokeWidth={10} />
      <line x1={0} y1={-540} x2={0} y2={0} stroke={C.blanco} strokeWidth={10} />
      {/* muebles en gris: cama, sofá, mesa, armario */}
      <g fill={C.gris}>
        <rect x={-420} y={-330} width={200} height={50} rx={10} />
        <rect x={-420} y={-400} width={30} height={120} rx={8} />
        <rect x={120} y={-350} width={240} height={70} rx={16} />
        <rect x={-300} y={-120} width={200} height={20} rx={6} />
        <rect x={-290} y={-100} width={16} height={90} />
        <rect x={-130} y={-100} width={16} height={90} />
        <rect x={260} y={-200} width={120} height={190} rx={8} />
      </g>
      {hab.map(([hx, hy], i) =>
        luz === i ? (
          <g key={i} transform={`translate(${hx + 120} ${hy + 240})`}>
            <path d="M 0 -60 L 260 -140 L 260 20 Z" fill={C.amarillo} opacity={0.5} />
            <circle cx={-20} cy={-140} r={18} fill={B} />
            <rect x={-36} y={-120} width={32} height={60} rx={12} fill={B} />
            <path d="M -34 -60 L 0 -60 L 6 0 L -40 0 Z" fill={B} />
          </g>
        ) : null,
      )}
      {gato >= 0 ? (
        <g transform={`translate(${hab[gato][0] + 330} ${hab[gato][1] + 70})`}>
          <OjoGatoMini x={-10} y={0} />
          <OjoGatoMini x={10} y={0} />
        </g>
      ) : null}
    </g>
  );
};
const OjoGatoMini: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse rx={7} ry={6} fill={C.amarillo} />
    <ellipse rx={2} ry={5} fill="#151006" />
  </g>
);
