// El lienzo de cada plano y la lista de planos.
//
// <Lienzo> es un SVG de 1920×1080 con la cámara (zoom alrededor de un punto) y el bloom: todo lo blanco lleva un halo
// suave, como en el vídeo de referencia (donde el blanco macizo «quema» un poco sobre el negro). Dentro se dibuja en
// coordenadas del cuadro: el suelo de las habitaciones está en y = 800.
//
// Un plano es { desde, dura?, pinta, entra? }: `pinta` recibe el tiempo t (segundos desde que empieza el plano) y los
// fotogramas f. `entra` dice cómo se entra: "corte" (por defecto), "glitch" (fogonazo de estática), "negro" (desde negro).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ALTO, ANCHO, C, FPS } from "./estilo";

export type Entrada = "corte" | "glitch" | "negro";
export type Plano = {
  desde: number; // segundo en que empieza
  pinta: (t: number, f: number) => React.ReactNode;
  entra?: Entrada;
  sinSubtitulo?: boolean; // solo para el apagón y los sustos de 1-3 fotogramas (las tarjetas SÍ llevan subtítulo)
  sinInterfaz?: boolean; // los apagones: ni cabecera ni subtítulo
};

/** Tiempo dentro del plano. */
export const usePlano = () => {
  const f = useCurrentFrame();
  return { f, t: f / FPS };
};

// Movimiento: interpolación por tramos con suavizado (easeInOut) entre puntos [t, valor].
export const kf = (t: number, puntos: [number, number][], suave = true): number => {
  if (t <= puntos[0][0]) return puntos[0][1];
  for (let i = 1; i < puntos.length; i++) {
    const [t0, v0] = puntos[i - 1];
    const [t1, v1] = puntos[i];
    if (t <= t1) {
      let k = (t - t0) / (t1 - t0);
      if (suave) k = k * k * (3 - 2 * k);
      return v0 + (v1 - v0) * k;
    }
  }
  return puntos[puntos.length - 1][1];
};

/** Aparición con rebote (0 → 1 con un pequeño pasarse): para casillas, cruces, etiquetas. `k` = segundos desde que aparece. */
export const pop = (k: number, dur = 0.28): number => {
  if (k <= 0) return 0;
  if (k >= dur) return 1;
  const x = k / dur;
  return 1 + 2.2 * Math.pow(1 - x, 2) * Math.sin(x * Math.PI * 2.1) * x - Math.pow(1 - x, 3);
};

/** Fundido 0→1 en `dur` segundos desde `k`. */
export const fade = (k: number, dur = 0.3): number => Math.max(0, Math.min(1, k / dur));

export const Defs: React.FC = () => (
  <defs>
    {/* bloom: el blanco se desborda un poco sobre el negro */}
    <filter id="bloom" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b2" />
      <feComponentTransfer in="b1" result="b1b">
        <feFuncA type="linear" slope="0.55" />
      </feComponentTransfer>
      <feComponentTransfer in="b2" result="b2b">
        <feFuncA type="linear" slope="0.22" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="b2b" />
        <feMergeNode in="b1b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    {/* el blanco de las superficies grandes: un pelín más gris abajo, como una cartulina con luz de arriba */}
    <linearGradient id="blanco" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor="#d9d9d7" />
    </linearGradient>
    <linearGradient id="blancoH" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor="#dcdcda" />
    </linearGradient>
    <radialGradient id="haloAmarillo">
      <stop offset="0" stopColor={C.amarillo} stopOpacity="0.55" />
      <stop offset="0.55" stopColor={C.amarillo} stopOpacity="0.18" />
      <stop offset="1" stopColor={C.amarillo} stopOpacity="0" />
    </radialGradient>
  </defs>
);

/**
 * Lienzo del plano: cámara con `zoom` alrededor de (cx, cy) y, opcionalmente, un desplazamiento `dx`/`dy` (sacudidas).
 * `suelo` pinta la línea gris del suelo (la de las habitaciones).
 */
export const Lienzo: React.FC<{
  zoom?: number;
  cx?: number;
  cy?: number;
  dx?: number;
  dy?: number;
  suelo?: boolean | number; // true = en UI.sueloY; número = en esa y
  children: React.ReactNode;
}> = ({ zoom = 1, cx = ANCHO / 2, cy = ALTO / 2, dx = 0, dy = 0, suelo = false, children }) => {
  const tx = ANCHO / 2 - cx * zoom + dx;
  const ty = ALTO / 2 - cy * zoom + dy;
  const ys = suelo === true ? 800 : typeof suelo === "number" ? suelo : null;
  return (
    <AbsoluteFill style={{ background: C.fondo }}>
      <svg width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <g transform={`translate(${tx} ${ty}) scale(${zoom})`}>
          {ys !== null ? <line x1={-400} y1={ys} x2={ANCHO + 400} y2={ys} stroke={C.gris} strokeWidth={7} strokeLinecap="round" /> : null}
          <g filter="url(#bloom)">{children}</g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Reproduce la lista de planos: cada uno dura hasta que empieza el siguiente (o `hasta`). */
export const Planos: React.FC<{ planos: Plano[]; hasta: number }> = ({ planos, hasta }) => (
  <AbsoluteFill style={{ background: C.fondo }}>
    {planos.map((p, i) => {
      const fin = planos[i + 1] ? planos[i + 1].desde : hasta;
      const desde = Math.round(p.desde * FPS);
      const dur = Math.max(1, Math.round(fin * FPS) - desde);
      return (
        <Sequence key={i} from={desde} durationInFrames={dur} layout="none">
          <Cuadro pinta={p.pinta} entra={p.entra} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

const Cuadro: React.FC<{ pinta: Plano["pinta"]; entra?: Entrada }> = ({ pinta, entra }) => {
  const { t, f } = usePlano();
  const velo = entra === "negro" ? 1 - fade(t, 0.5) : 0;
  return (
    <AbsoluteFill>
      {pinta(t, f)}
      {velo > 0 ? <AbsoluteFill style={{ background: "#000", opacity: velo }} /> : null}
    </AbsoluteFill>
  );
};

/** Dónde empieza cada plano con entrada «glitch» (en fotogramas), para la capa de cinta. */
export const fotogramasGlitch = (planos: Plano[]): number[] => planos.filter((p) => p.entra === "glitch").map((p) => Math.round(p.desde * FPS));
