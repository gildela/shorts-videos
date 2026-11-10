// La interfaz del «archivo»: cabecera, subtítulos, tarjetas de regla, casillas, etiquetas, cruces, sellos, logo.
// Todo medido en el vídeo de referencia (Montserrat, mayúsculas, blanco sobre negro).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ALTO, ANCHO, C, FPS, FUENTE, UI } from "../estilo";
import { pop, fade } from "../Plano";

const mayus: React.CSSProperties = { fontFamily: FUENTE, textTransform: "uppercase" };

const tc = (f: number) => {
  const s = Math.floor(f / FPS);
  const ff = f % FPS;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}:${p(ff)}`;
};

/** Casilla de regla pequeña (las de la cabecera y las de la tarjeta). */
const Cajita: React.FC<{ n: number; activa: boolean; hecha: boolean; tam: number; interrogante?: boolean; rojo?: boolean }> = ({ n, activa, hecha, tam, interrogante, rojo }) => (
  <div
    style={{
      ...mayus,
      width: tam,
      height: tam,
      borderRadius: tam * 0.18,
      border: `${Math.max(2, tam * 0.08)}px solid ${rojo ? C.rojo : activa ? C.blanco : hecha ? C.gris : C.grisOscuro}`,
      background: activa && !rojo ? C.blanco : "transparent",
      color: rojo ? C.rojo : activa ? "#000" : hecha ? C.gris : C.grisOscuro,
      fontWeight: 700,
      fontSize: tam * 0.6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      boxShadow: activa ? "0 0 14px rgba(255,255,255,0.55)" : undefined,
    }}
  >
    {interrogante ? "?" : n}
  </div>
);

/** Cabecera: «ARCHIVO 017 // TU CANAL», la barra de las 7 reglas y el código de tiempo. `regla` = la que va (0 = ninguna).
 * `canal` es obligatorio: el nombre del canal del usuario (viene de src/ajustes.json; nunca un nombre fijo aquí). */
export const Cabecera: React.FC<{ f: number; regla: number; archivo: string; canal: string; reglas?: number; hora?: string }> = ({ f, regla, archivo, canal, reglas = 7, hora }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ ...mayus, position: "absolute", left: UI.cabeceraIzq, top: UI.cabeceraY - 30, fontSize: 23, fontWeight: 600, letterSpacing: "0.2em", color: C.gris, opacity: 0.85 }}>
      ARCHIVO {archivo}&nbsp;&nbsp;//&nbsp;&nbsp;{canal.toUpperCase()}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: UI.cabeceraY - 24, display: "flex", justifyContent: "center", gap: 8 }}>
      {Array.from({ length: reglas }, (_, i) => (
        <Cajita key={i} n={i + 1} activa={regla === i + 1} hecha={regla > i + 1} tam={28} rojo={reglas === 8 && i === 7} />
      ))}
    </div>
    <div style={{ ...mayus, position: "absolute", right: UI.cabeceraDer, top: UI.cabeceraY - 30, fontSize: 23, fontWeight: 600, letterSpacing: "0.12em", color: hora ? C.rojo : C.gris, opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>
      {hora ?? tc(f)}
    </div>
  </AbsoluteFill>
);

/** Subtítulo: la frase que se está diciendo, tal cual, en mayúsculas, abajo y centrado. */
export const Subtitulo: React.FC<{ texto: string; k: number }> = ({ texto, k }) => {
  const lineas = partir(texto);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          ...mayus,
          position: "absolute",
          left: 200,
          right: 200,
          top: UI.subtituloY - (lineas.length > 1 ? 62 : 32),
          textAlign: "center",
          fontSize: UI.subtituloTam,
          fontWeight: 600,
          letterSpacing: "0.03em",
          lineHeight: 1.22,
          color: C.blanco,
          opacity: fade(k, 0.12),
          textShadow: "0 0 18px rgba(255,255,255,0.35), 0 0 2px rgba(255,255,255,0.6)",
        }}
      >
        {lineas.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Parte una frase larga en dos líneas parecidas (como hace el vídeo de referencia). */
const partir = (texto: string): string[] => {
  if (texto.length <= 44) return [texto];
  const palabras = texto.split(" ");
  let mejor = 1;
  let dif = Infinity;
  for (let i = 1; i < palabras.length; i++) {
    const a = palabras.slice(0, i).join(" ").length;
    const b = palabras.slice(i).join(" ").length;
    if (Math.abs(a - b) < dif) {
      dif = Math.abs(a - b);
      mejor = i;
    }
  }
  return [palabras.slice(0, mejor).join(" "), palabras.slice(mejor).join(" ")];
};

/** Texto escrito a máquina: `k` segundos desde que empieza, a `vel` letras por segundo. Suena una tecla por letra. */
export const Maquina: React.FC<{ texto: string; k: number; vel?: number; sonido?: boolean }> = ({ texto, k, vel = 22 }) => {
  const n = Math.max(0, Math.min(texto.length, Math.floor(k * vel)));
  return <>{texto.slice(0, n)}</>;
};

/**
 * Tarjeta de regla: «REGLA [1]», raya roja, el título escrito a máquina, la barra 1-7.
 * `k` = segundos desde que aparece la tarjeta; `escribeDesde` = segundo (del plano) en que empieza a escribirse el título.
 */
export const TarjetaRegla: React.FC<{ n: number; titulo: string; k: number; escribeDesde?: number; reglas?: number }> = ({ n, titulo, k, escribeDesde = 0.9, reglas = 7 }) => {
  const e = pop(k, 0.3);
  const ke = k - escribeDesde;
  const letras = Math.max(0, Math.min(titulo.length, Math.floor(ke * 22)));
  return (
    <AbsoluteFill style={{ background: C.fondo, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${0.9 + 0.1 * e})`, opacity: fade(k, 0.12), marginTop: -70 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div style={{ ...mayus, fontSize: 124, fontWeight: 900, letterSpacing: "0.1em", color: C.blanco, textShadow: "0 0 30px rgba(255,255,255,0.45)" }}>REGLA</div>
          <div style={{ ...mayus, width: 178, height: 178, borderRadius: 30, background: C.blanco, color: "#000", fontSize: 130, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 34px rgba(255,255,255,0.55)" }}>{n}</div>
        </div>
        <div style={{ width: 660, height: 7, background: C.rojo, marginTop: 36, borderRadius: 2 }} />
        <div style={{ ...mayus, marginTop: 28, fontSize: 56, fontWeight: 700, letterSpacing: "0.1em", color: C.blanco, minHeight: 70, textShadow: "0 0 18px rgba(255,255,255,0.4)", whiteSpace: "pre" }}>
          {titulo.slice(0, letras)}
          {letras < titulo.length && ke > 0 && Math.floor(k * 6) % 2 === 0 ? "▌" : ""}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 56 }}>
          {Array.from({ length: reglas }, (_, i) => (
            <Cajita key={i} n={i + 1} activa={i + 1 === n} hecha={i + 1 < n} tam={56} />
          ))}
        </div>
      </div>
      {/* teclas: una cada letra mientras se escribe */}
      {Array.from({ length: titulo.length }, (_, i) => (titulo[i] === " " ? null : <Sequence key={i} from={Math.round((escribeDesde + i / 22) * FPS)} durationInFrames={4} layout="none"><Audio src={staticFile("estilos/archivo/sfx/tecla.wav")} volume={0.16} /></Sequence>))}
      <Sequence from={0} durationInFrames={80} layout="none">
        <Audio src={staticFile("estilos/archivo/sfx/impacto.wav")} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Tarjeta de título grande (p. ej. «ARCHIVO 017» con su subtítulo), para los cambios de bloque. */
export const TarjetaTitulo: React.FC<{ grande: string; pequeno?: string; k: number }> = ({ grande, pequeno, k }) => (
  <AbsoluteFill style={{ background: C.fondo, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: fade(k, 0.15), transform: `scale(${0.94 + 0.06 * pop(k, 0.3)})`, marginTop: -60 }}>
      <div style={{ ...mayus, fontSize: 132, fontWeight: 900, letterSpacing: "0.06em", color: C.blanco, textShadow: "0 0 34px rgba(255,255,255,0.45)" }}>{grande}</div>
      {pequeno ? (
        <>
          <div style={{ width: 660, height: 7, background: C.rojo, marginTop: 30 }} />
          <div style={{ ...mayus, marginTop: 30, fontSize: 44, fontWeight: 600, letterSpacing: "0.22em", color: C.gris }}>{pequeno}</div>
        </>
      ) : null}
    </div>
  </AbsoluteFill>
);

// ── piezas SVG (van dentro del Lienzo) ──

/** Etiqueta «TÚ» amarilla con su flecha, encima de algo. (x, y) = punta de la flecha. Flota un poco. */
export const EtiquetaTu: React.FC<{ x: number; y: number; k: number; texto?: string; f?: number; tam?: number }> = ({ x, y, k, texto = "TÚ", f = 0, tam = 1 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  const bob = Math.sin(f / 9) * 4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${tam * e})`}>
      <polygon points="-15,-16 15,-16 0,2" fill={C.amarillo} />
      <text x={0} y={-30} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={40} letterSpacing={6} fill={C.amarillo} style={{ filter: "drop-shadow(0 0 10px rgba(247,223,58,0.6))" }}>
        {texto}
      </text>
    </g>
  );
};

/** Casilla grande: `estado` vacia | ok | no | num | interrogante. `k` segundos desde que aparece (rebote). */
export const Casilla: React.FC<{ x: number; y: number; tam?: number; estado: "vacia" | "ok" | "no" | "num" | "interrogante"; num?: number; k: number }> = ({ x, y, tam = 86, estado, num, k }) => {
  const e = pop(k);
  if (e <= 0) return null;
  const r = tam * 0.18;
  const fondo = estado === "ok" ? C.verde : estado === "no" ? C.rojo : "transparent";
  const borde = estado === "ok" ? C.verde : estado === "no" ? C.rojo : C.blanco;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <rect x={-tam / 2} y={-tam / 2} width={tam} height={tam} rx={r} fill={fondo} stroke={borde} strokeWidth={tam * 0.07} />
      {estado === "ok" ? <polyline points={`${-tam * 0.26},${0} ${-tam * 0.08},${tam * 0.2} ${tam * 0.28},${-tam * 0.22}`} fill="none" stroke="#fff" strokeWidth={tam * 0.1} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {estado === "no" ? (
        <g stroke="#fff" strokeWidth={tam * 0.1} strokeLinecap="round">
          <line x1={-tam * 0.22} y1={-tam * 0.22} x2={tam * 0.22} y2={tam * 0.22} />
          <line x1={tam * 0.22} y1={-tam * 0.22} x2={-tam * 0.22} y2={tam * 0.22} />
        </g>
      ) : null}
      {estado === "num" || estado === "interrogante" ? (
        <text x={0} y={tam * 0.24} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={tam * 0.62} fill={C.blanco}>
          {estado === "num" ? num : "?"}
        </text>
      ) : null}
    </g>
  );
};

/** Fila de casillas de reglas: las primeras `marcadas` en verde (van apareciendo una a una desde `k`). */
export const FilaCasillas: React.FC<{ x: number; y: number; n?: number; marcadas: number; k: number; kMarca?: number; tam?: number; paso?: number; ultimaInterrogante?: boolean }> = ({ x, y, n = 7, marcadas, k, kMarca = -1, tam = 86, paso = 0.12, ultimaInterrogante }) => {
  const sep = tam * 1.22;
  const x0 = x - ((n - 1) * sep) / 2;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const marcada = kMarca >= 0 && i < marcadas && kMarca - i * 0.28 > 0;
        return <Casilla key={i} x={x0 + i * sep} y={y} tam={tam} estado={marcada ? "ok" : ultimaInterrogante && i === n - 1 ? "interrogante" : "num"} num={i + 1} k={marcada ? kMarca - i * 0.28 : k - i * paso} />;
      })}
    </g>
  );
};

/** Cruz roja encima de algo (prohibido). */
export const Cruz: React.FC<{ x: number; y: number; k: number; tam?: number; color?: string }> = ({ x, y, k, tam = 90, color = C.rojo }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`} stroke={color} strokeWidth={14} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <line x1={-tam / 2} y1={-tam / 2} x2={tam / 2} y2={tam / 2} />
      <line x1={tam / 2} y1={-tam / 2} x2={-tam / 2} y2={tam / 2} />
    </g>
  );
};

/** Círculo verde con ✓ (correcto). */
export const Tick: React.FC<{ x: number; y: number; k: number; tam?: number }> = ({ x, y, k, tam = 64 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`} style={{ filter: `drop-shadow(0 0 12px ${C.verde})` }}>
      <circle r={tam / 2} fill={C.verde} />
      <polyline points={`${-tam * 0.24},${tam * 0.02} ${-tam * 0.07},${tam * 0.2} ${tam * 0.26},${-tam * 0.2}`} fill="none" stroke="#fff" strokeWidth={tam * 0.12} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** Sello girado (rojo o verde) con un texto: «COMPROBADO», «NO PRÁCTICO»… */
export const Sello: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; giro?: number; tam?: number }> = ({ x, y, texto, k, color = C.rojo, giro = -8, tam = 1 }) => {
  const e = k <= 0 ? 0 : Math.min(1, 1.6 - 0.6 * Math.min(1, k / 0.18));
  if (k <= 0) return null;
  const w = texto.length * 30 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${e * tam})`} opacity={Math.min(1, k / 0.1)}>
      <rect x={-w / 2} y={-44} width={w} height={88} rx={10} fill="#fff" stroke={color} strokeWidth={7} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={46} letterSpacing={4} fill={color}>
        {texto}
      </text>
    </g>
  );
};

/** Bocadillo de texto (p. ej. «PSPSPS», «?»). (x, y) = punta del bocadillo. */
export const Bocadillo: React.FC<{ x: number; y: number; texto: string; k: number; ancho?: number; tam?: number; haciaIzquierda?: boolean }> = ({ x, y, texto, k, ancho, tam = 44, haciaIzquierda }) => {
  const e = pop(k);
  if (e <= 0) return null;
  const w = ancho ?? texto.length * tam * 0.7 + 50;
  const h = tam * 1.9;
  const sx = haciaIzquierda ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <path d={`M ${sx * 24} -18 L ${sx * 48} -18 L 0 0 Z`} fill="#fff" />
      <rect x={haciaIzquierda ? -w - 10 : 10} y={-18 - h} width={w} height={h} rx={14} fill="#fff" stroke={C.negro} strokeWidth={4} />
      <text x={haciaIzquierda ? -w / 2 - 10 : 10 + w / 2} y={-18 - h / 2 + tam * 0.36} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={tam} fill={C.negro}>
        {texto}
      </text>
    </g>
  );
};

/** Logo del Negociado: un círculo con las gafas oscuras. */
export const LogoNegociado: React.FC<{ x: number; y: number; r?: number; texto?: boolean; k?: number }> = ({ x, y, r = 60, texto, k = 1 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <circle r={r} fill="none" stroke={C.blanco} strokeWidth={r * 0.09} />
      <circle r={r * 0.82} fill="none" stroke={C.blanco} strokeWidth={r * 0.04} />
      <g transform={`scale(${r / 60})`}>
        <rect x={-30} y={-10} width={26} height={18} rx={7} fill={C.blanco} />
        <rect x={4} y={-10} width={26} height={18} rx={7} fill={C.blanco} />
        <rect x={-4} y={-6} width={8} height={4} fill={C.blanco} />
      </g>
      {texto ? (
        <text x={0} y={r + 34} textAnchor="middle" fontFamily={FUENTE} fontWeight={600} fontSize={16} letterSpacing={3} fill={C.gris}>
          NEGOCIADO DE ASUNTOS NOCTURNOS
        </text>
      ) : null}
    </g>
  );
};

/** Número gigante con rótulo pequeño encima y raya roja (p. ej. «VECES QUE HA FUNCIONADO · 0»). */
export const Marcador: React.FC<{ x: number; y: number; rotulo: string; valor: string; k: number }> = ({ x, y, rotulo, valor, k }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={fade(k, 0.15)}>
      <text x={0} y={-110} textAnchor="middle" fontFamily={FUENTE} fontWeight={700} fontSize={28} letterSpacing={6} fill={C.blanco}>
        {rotulo}
      </text>
      <text x={0} y={60} textAnchor="middle" fontFamily={FUENTE} fontWeight={900} fontSize={200 * e} fill={C.blanco} style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))" }}>
        {valor}
      </text>
      <rect x={-130} y={84} width={260} height={7} fill={C.rojo} />
    </g>
  );
};

/** Documento: una hoja blanca con título y rayas de texto (gris), girada un poco. */
export const Documento: React.FC<{ x: number; y: number; w?: number; h?: number; titulo?: string; lineas?: number; giro?: number; k: number; children?: React.ReactNode }> = ({ x, y, w = 560, h = 680, titulo, lineas = 9, giro = -2, k, children }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${e})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="url(#blanco)" />
      {titulo ? (
        <>
          <text x={0} y={-h / 2 + 100} textAnchor="middle" fontFamily={FUENTE} fontWeight={900} fontSize={66} letterSpacing={6} fill={C.negro}>
            {titulo}
          </text>
          <rect x={-w / 2 + 50} y={-h / 2 + 128} width={w - 100} height={8} fill={C.negro} />
        </>
      ) : null}
      {Array.from({ length: lineas }, (_, i) => (
        <rect key={i} x={-w / 2 + 50} y={-h / 2 + 170 + i * 44} width={(w - 100) * (i === lineas - 1 ? 0.55 : 0.94)} height={16} rx={4} fill={i === 0 ? C.negro : "#bdbdbb"} />
      ))}
      {children}
    </g>
  );
};

/** Tarjeta de dato: marco con esquinas, texto pequeño de la fuente debajo (p. ej. «SCIENTIFIC REPORTS, 2019»). */
export const TarjetaDato: React.FC<{ x: number; y: number; w?: number; h?: number; fuente?: string; k: number; children?: React.ReactNode }> = ({ x, y, w = 900, h = 420, fuente, k, children }) => {
  const e = fade(k, 0.2);
  if (k <= 0) return null;
  const esq = 34;
  return (
    <g transform={`translate(${x} ${y})`} opacity={e}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#111" stroke={C.blanco} strokeWidth={6} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <polyline key={i} points={`${sx * (w / 2 + 26)},${sy * (h / 2 + 26 - esq)} ${sx * (w / 2 + 26)},${sy * (h / 2 + 26)} ${sx * (w / 2 + 26 - esq)},${sy * (h / 2 + 26)}`} fill="none" stroke={C.gris} strokeWidth={5} />
      ))}
      {children}
      {fuente ? (
        <text x={-w / 2} y={h / 2 + 54} fontFamily={FUENTE} fontWeight={600} fontSize={20} letterSpacing={4} fill={C.gris}>
          {fuente}
        </text>
      ) : null}
    </g>
  );
};

/** Rótulo de pieza (como «EXHIBIT A»): raya roja vertical, texto grande y línea pequeña debajo. */
export const Rotulo: React.FC<{ x: number; y: number; grande: string; pequeno?: string; k: number }> = ({ x, y, grande, pequeno, k }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={fade(k, 0.2)}>
      <rect x={0} y={-36} width={9} height={46} fill={C.rojo} />
      <text x={34} y={0} fontFamily={FUENTE} fontWeight={800} fontSize={44} letterSpacing={5} fill={C.blanco}>
        {grande}
      </text>
      {pequeno ? (
        <text x={34} y={44} fontFamily={FUENTE} fontWeight={600} fontSize={22} letterSpacing={4} fill={C.gris}>
          {pequeno}
        </text>
      ) : null}
    </g>
  );
};

/** Rótulo de texto suelto dentro del lienzo (blanco, mayúsculas). */
export const Texto: React.FC<{ x: number; y: number; texto: string; tam?: number; color?: string; peso?: number; k?: number; ancla?: "start" | "middle" | "end"; esp?: number }> = ({ x, y, texto, tam = 40, color = C.blanco, peso = 700, k = 1, ancla = "middle", esp = 4 }) => (
  <text x={x} y={y} textAnchor={ancla} fontFamily={FUENTE} fontWeight={peso} fontSize={tam} letterSpacing={esp} fill={color} opacity={fade(k, 0.15)} style={{ textTransform: "uppercase" }}>
    {texto.toUpperCase()}
  </text>
);

export const Negro: React.FC = () => <AbsoluteFill style={{ background: "#000" }} />;
export { ANCHO, ALTO };
