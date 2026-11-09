// Piezas «de archivo»: la ficha del sujeto, los monitores de vigilancia, el portapapeles con casillas, la pantalla
// partida, la prueba (recorte de documento con sello), el cronómetro y la pantalla final. Calcadas de la referencia.
import React from "react";
import { C, FUENTE } from "../estilo";
import { fade, pop } from "../Plano";
import { OjoGato } from "./Gato";

const B = "url(#blanco)";

/** Ficha del sujeto: pestaña «ARCHIVO 017», marco grande, recuadro de foto a la izquierda, «SUJETO:» y el valor
 * (escrito a máquina), y debajo una lista de casillas que se van marcando. (x, y) = centro del marco. */
export const FichaSujeto: React.FC<{
  x: number;
  y: number;
  archivo: string;
  valor: string; // lo que va escrito en «SUJETO:» (p. ej. «UN HUMANO ADULTO»)
  letras?: number; // cuántas letras del valor se ven (máquina de escribir)
  tachado?: string; // texto tachado en rojo antes del valor (p. ej. «EL GATO»)
  lineas?: { texto: string; ok: boolean }[]; // la lista de abajo
  foto?: React.ReactNode; // lo que va en el recuadro de foto (coordenadas con centro en 0,0; caben 200×200)
  k: number;
}> = ({ x, y, archivo, valor, letras, tachado, lineas = [], foto, k }) => {
  const w = 1200;
  const h = lineas.length ? 400 + lineas.length * 54 : 330;
  const n = letras ?? valor.length;
  return (
    <g transform={`translate(${x} ${y})`} opacity={fade(k, 0.2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#0d0d0d" stroke={C.blanco} strokeWidth={8} />
      <rect x={-w / 2 + 8} y={-h / 2 - 60} width={330} height={64} rx={10} fill={B} />
      <text x={-w / 2 + 173} y={-h / 2 - 14} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={34} letterSpacing={5} fill={C.negro}>
        ARCHIVO {archivo}
      </text>
      {/* recuadro de la foto */}
      <rect x={-w / 2 + 50} y={-h / 2 + 50} width={240} height={240} rx={10} fill="#000" stroke={C.gris} strokeWidth={6} />
      <g transform={`translate(${-w / 2 + 170} ${-h / 2 + 170})`}>{foto}</g>
      <text x={-w / 2 + 350} y={-h / 2 + 110} fontFamily={FUENTE} fontWeight={700} fontSize={40} letterSpacing={6} fill={C.blanco}>
        SUJETO:
      </text>
      {tachado ? (
        <g>
          <text x={-w / 2 + 350} y={-h / 2 + 200} fontFamily={FUENTE} fontWeight={800} fontSize={60} letterSpacing={4} fill={C.blanco}>
            {tachado}
          </text>
          <rect x={-w / 2 + 340} y={-h / 2 + 176} width={tachado.length * 44 + 20} height={10} fill={C.rojo} transform={`rotate(-3 ${-w / 2 + 340} ${-h / 2 + 176})`} />
        </g>
      ) : (
        <text x={-w / 2 + 350} y={-h / 2 + 200} fontFamily={FUENTE} fontWeight={800} fontSize={60} letterSpacing={4} fill={C.blanco}>
          {valor.slice(0, Math.max(0, n))}
        </text>
      )}
      <rect x={-w / 2 + 350} y={-h / 2 + 224} width={w - 420} height={4} fill={C.gris} />
      {lineas.map((l, i) => (
        <g key={i} transform={`translate(${-w / 2 + 50} ${-h / 2 + 340 + i * 54})`}>
          <circle cx={20} cy={0} r={18} fill={l.ok ? C.verde : "none"} stroke={l.ok ? C.verde : C.gris} strokeWidth={4} />
          {l.ok ? <polyline points="11,0 17,7 30,-7" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /> : null}
          <text x={60} y={12} fontFamily={FUENTE} fontWeight={700} fontSize={30} letterSpacing={3} fill={C.blanco}>
            {l.texto}
          </text>
        </g>
      ))}
    </g>
  );
};

/** Monitores de vigilancia: una rejilla de pantallas con lo mismo dentro. `pinta` dibuja el contenido de una pantalla
 * (en coordenadas 0..1920 × 0..1080, se reduce). (x, y) = centro de la rejilla. */
export const Monitores: React.FC<{ x: number; y: number; filas?: number; columnas?: number; w?: number; pinta: (i: number) => React.ReactNode; k: number; f?: number }> = ({ x, y, filas = 2, columnas = 4, w = 330, pinta, k, f = 0 }) => {
  const h = (w * 9) / 16;
  const sep = 16;
  const x0 = x - (columnas * (w + sep) - sep) / 2;
  const y0 = y - (filas * (h + sep) - sep) / 2;
  return (
    <g>
      {Array.from({ length: filas * columnas }, (_, i) => {
        const cx = x0 + (i % columnas) * (w + sep);
        const cy = y0 + Math.floor(i / columnas) * (h + sep);
        const e = pop(k - i * 0.06);
        if (e <= 0) return null;
        return (
          <g key={i} transform={`translate(${cx + w / 2} ${cy + h / 2}) scale(${e}) translate(${-w / 2} ${-h / 2})`}>
            <rect x={0} y={0} width={w} height={h} rx={8} fill="#000" stroke={C.gris} strokeWidth={4} />
            <svg x={4} y={4} width={w - 8} height={h - 8} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" overflow="hidden">
              {pinta(i)}
            </svg>
            <circle cx={18} cy={18} r={5} fill={C.rojo} opacity={Math.floor(f / 15 + i) % 2 ? 1 : 0.3} />
          </g>
        );
      })}
    </g>
  );
};

/** Portapapeles con título y filas de (casilla + icono + raya). `filas[i].ok` marca la casilla. (x, y) = centro. */
export const Portapapeles: React.FC<{ x: number; y: number; titulo?: string; filas: { ok: boolean; icono?: React.ReactNode }[]; k: number; escala?: number }> = ({ x, y, titulo, filas, k, escala = 1 }) => {
  const w = 300;
  const h = 120 + filas.length * 70 + (titulo ? 50 : 0);
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${e * escala})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#0d0d0d" stroke={C.blanco} strokeWidth={7} />
      <rect x={-60} y={-h / 2 - 16} width={120} height={34} rx={10} fill={B} />
      {titulo ? (
        <text x={0} y={-h / 2 + 62} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={28} letterSpacing={3} fill={C.blanco}>
          {titulo}
        </text>
      ) : null}
      {filas.map((fi, i) => {
        const yy = -h / 2 + 100 + (titulo ? 44 : 0) + i * 70;
        return (
          <g key={i} transform={`translate(0 ${yy})`}>
            <rect x={-w / 2 + 30} y={-20} width={40} height={40} rx={8} fill={fi.ok ? C.verde : "none"} stroke={fi.ok ? C.verde : C.gris} strokeWidth={5} />
            {fi.ok ? <polyline points={`${-w / 2 + 40},0 ${-w / 2 + 48},8 ${-w / 2 + 62},-8`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
            <g transform={`translate(${-w / 2 + 120} 0)`}>{fi.icono}</g>
            <rect x={-w / 2 + 170} y={-6} width={w - 210} height={12} rx={6} fill={C.grisOscuro} />
          </g>
        );
      })}
    </g>
  );
};

/** Pantalla partida: dos paneles con su rótulo arriba. `izquierda` y `derecha` pintan en coordenadas centradas (0,0). */
export const PantallaPartida: React.FC<{ rotuloIzq: string; rotuloDer: string; izquierda: React.ReactNode; derecha: React.ReactNode; k: number; colorIzq?: string; colorDer?: string }> = ({ rotuloIzq, rotuloDer, izquierda, derecha, k, colorIzq = C.amarillo, colorDer = C.blanco }) => (
  <g opacity={fade(k, 0.2)}>
    <line x1={960} y1={180} x2={960} y2={820} stroke={C.gris} strokeWidth={5} strokeDasharray="14 14" />
    <text x={480} y={220} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={44} letterSpacing={8} fill={colorIzq}>
      {rotuloIzq}
    </text>
    <text x={1440} y={220} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={44} letterSpacing={8} fill={colorDer}>
      {rotuloDer}
    </text>
    <g transform="translate(480 540)">{izquierda}</g>
    <g transform="translate(1440 540)">{derecha}</g>
  </g>
);

/** Prueba: recorte gris de un documento (con una línea escrita a máquina) dentro de un marco con esquinas. */
export const Recorte: React.FC<{ x: number; y: number; w?: number; h?: number; texto: string; etiqueta?: string; k: number }> = ({ x, y, w = 1500, h = 240, texto, etiqueta = "ASUNTO:", k }) => {
  if (k <= 0) return null;
  const esq = 40;
  return (
    <g transform={`translate(${x} ${y})`} opacity={fade(k, 0.2)}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <polyline key={i} points={`${sx * (w / 2 + 30)},${sy * (h / 2 + 30 - esq)} ${sx * (w / 2 + 30)},${sy * (h / 2 + 30)} ${sx * (w / 2 + 30 - esq)},${sy * (h / 2 + 30)}`} fill="none" stroke={C.gris} strokeWidth={5} />
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#6b6b69" stroke={C.blanco} strokeWidth={8} />
      <text x={-w / 2 + 60} y={12} fontFamily="'Courier New', Courier, monospace" fontWeight={700} fontSize={40} fill="#111">
        {etiqueta}
      </text>
      <rect x={-w / 2 + 520} y={-34} width={texto.length * 24 + 40} height={64} fill="#f4f4f2" />
      <text x={-w / 2 + 540} y={14} fontFamily="'Courier New', Courier, monospace" fontWeight={700} fontSize={40} fill="#111">
        {texto}
      </text>
    </g>
  );
};

/** Cronómetro. (x, y) = centro. `aguja` 0-1 = vuelta. */
export const Cronometro: React.FC<{ x: number; y: number; r?: number; aguja?: number; k?: number }> = ({ x, y, r = 120, aguja = 0, k = 1 }) => {
  const e = pop(k);
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <rect x={-18} y={-r - 40} width={36} height={30} rx={6} fill={B} />
      <rect x={r * 0.62} y={-r - 14} width={40} height={16} rx={8} fill={B} transform={`rotate(45 ${r * 0.62} ${-r - 14})`} />
      <circle r={r} fill="#000" stroke={C.blanco} strokeWidth={16} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-r + 24} x2={0} y2={-r + (i % 3 ? 40 : 52)} stroke={C.blanco} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-r + 44} stroke={C.blanco} strokeWidth={10} strokeLinecap="round" transform={`rotate(${aguja * 360})`} />
      <circle r={12} fill={C.blanco} />
    </g>
  );
};

/** Pantalla final: «PSPSPS.» grande y «SIGUIENTE ARCHIVO: 018» pequeño debajo. */
export const PantallaFinal: React.FC<{ texto: string; siguiente?: string; k: number; kSiguiente?: number }> = ({ texto, siguiente, k, kSiguiente = 0 }) => (
  <g>
    <text x={960} y={590} textAnchor="middle" fontFamily={FUENTE} fontWeight={900} fontSize={150} letterSpacing={10} fill={C.blanco} opacity={fade(k, 0.3)} style={{ filter: "drop-shadow(0 0 30px rgba(255,255,255,0.4))" }}>
      {texto}
    </text>
    {siguiente ? (
      <text x={960} y={690} textAnchor="middle" fontFamily={FUENTE} fontWeight={600} fontSize={24} letterSpacing={8} fill={C.gris} opacity={fade(kSiguiente, 0.3)}>
        {siguiente}
      </text>
    ) : null}
  </g>
);

/** Sello circular con las gafas, pequeño, para los documentos. */
export const SelloNegociado: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 40 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="none" stroke={C.negro} strokeWidth={r * 0.1} />
    <g transform={`scale(${r / 60})`}>
      <rect x={-30} y={-10} width={26} height={18} rx={7} fill={C.negro} />
      <rect x={4} y={-10} width={26} height={18} rx={7} fill={C.negro} />
      <rect x={-4} y={-6} width={8} height={4} fill={C.negro} />
    </g>
  </g>
);

/** Un ojo de gato suelto dentro de un icono (para el portapapeles): se usa como icono de fila. */
export const IconoOjo: React.FC = () => <OjoGato x={0} y={0} r={16} halo={0} />;
export const IconoPata: React.FC = () => (
  <g fill={C.blanco}>
    <ellipse rx={13} ry={10} />
    <circle cx={-14} cy={-12} r={5} />
    <circle cx={-5} cy={-18} r={5} />
    <circle cx={5} cy={-18} r={5} />
    <circle cx={14} cy={-12} r={5} />
  </g>
);
export const IconoNariz: React.FC = () => (
  <g>
    <path d="M -14 -6 L 14 -6 L 0 10 Z" fill={C.blanco} />
    <path d="M -22 14 Q -11 22 0 12 Q 11 22 22 14" fill="none" stroke={C.blanco} strokeWidth={4} strokeLinecap="round" />
  </g>
);
