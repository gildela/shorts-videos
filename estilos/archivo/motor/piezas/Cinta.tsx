// La capa de «cinta» que va encima de todo (medida en el vídeo de referencia). El grano son seis imágenes en
// public/estilos/archivo/grano/ y los sonidos están en public/estilos/archivo/sfx/.
//   - viñeta fuerte: las esquinas casi negras, el centro limpio
//   - grano muy fino y muy flojo (se nota en las superficies blancas grandes, no en el negro)
//   - líneas de televisor casi invisibles (2 px, 6 % de negro)
//   - rayas de cinta: trazos horizontales finos, blancos, cortos, que aparecen sueltos (uno cada ~2 s) y en racimo en los cortes
//   - cortes de estática (GLITCH): 4-6 fotogramas en que la imagen se parte en franjas desplazadas, con los colores
//     separados (rojo a un lado, cian al otro) y racimo de rayas; suena «estatica». Sirve para los cortes fuertes.
//   - apagón: la cinta se va a negro (con «cinta_para»)
//
// Se usa así: <ConCinta glitches={[fotogramas]}>{montaje}</ConCinta>. Los planos van dentro y se duplican en franjas
// solo durante los fotogramas del corte.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ALTO, ANCHO } from "../estilo";

const DUR_GLITCH = 5; // fotogramas que dura un corte

const azar = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Fuerza del corte en el fotograma f (1 al empezar, baja a 0). */
export const fuerzaGlitch = (f: number, glitches: number[]): number => {
  for (const g of glitches) if (f >= g && f < g + DUR_GLITCH) return 1 - (f - g) / (DUR_GLITCH + 1);
  return 0;
};

/** Rayas de cinta: trazos horizontales finos. `n` cuántas, `semilla` para que cambien. */
const Rayas: React.FC<{ n: number; semilla: number; arriba?: boolean; opacidad?: number }> = ({ n, semilla, arriba, opacidad = 0.7 }) => (
  <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => {
      const y = (arriba ? 60 + azar(semilla + i * 3) * 300 : azar(semilla + i * 3) * ALTO) | 0;
      const x = (azar(semilla + i * 7 + 1) * ANCHO) | 0;
      const w = 40 + azar(semilla + i * 11 + 2) * 420;
      const h = azar(semilla + i * 5 + 9) > 0.7 ? 3 : 2;
      return <rect key={i} x={x} y={y} width={w} height={h} fill="#fff" opacity={opacidad * (0.35 + 0.65 * azar(semilla + i * 13))} />;
    })}
  </svg>
);

/** Franjas desplazadas de la imagen (solo en los cortes). */
const Franjas: React.FC<{ fuerza: number; f: number; children: React.ReactNode }> = ({ fuerza, f, children }) => {
  const n = 7;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const y0 = (i / n) * ALTO + azar(f * 3 + i) * 40 - 20;
        const y1 = ((i + 1) / n) * ALTO + azar(f * 3 + i + 50) * 40 - 20;
        const dx = (azar(f * 7 + i * 3) - 0.5) * 140 * fuerza * (azar(f + i) > 0.35 ? 1 : 0);
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${Math.max(0, y0)}px 0 ${Math.max(0, ALTO - y1)}px 0)`, transform: `translateX(${dx}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Separación de colores (rojo a un lado, cian al otro). */
const Cromatico: React.FC<{ desplaza: number; children: React.ReactNode }> = ({ desplaza, children }) => (
  <AbsoluteFill>
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <filter id="cinta-cromatico" x="-2%" y="0" width="104%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={desplaza} dy={0} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feOffset in="gb" dx={-desplaza} dy={0} result="gb2" />
          <feBlend in="r2" in2="gb2" mode="screen" />
        </filter>
      </defs>
    </svg>
    <AbsoluteFill style={{ filter: desplaza > 0 ? "url(#cinta-cromatico)" : undefined }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

export const ConCinta: React.FC<{ glitches: number[]; apagon?: number; children: React.ReactNode }> = ({ glitches, apagon, children }) => {
  const f = useCurrentFrame();
  const g = fuerzaGlitch(f, glitches);
  const negro = apagon !== undefined ? Math.max(0, Math.min(1, (f - apagon) / 8)) : 0;
  const contenido = g > 0 ? <Cromatico desplaza={4 + 14 * g}><Franjas fuerza={g} f={f}>{children}</Franjas></Cromatico> : children;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {contenido}
      {/* grano: seis imágenes de ruido pre-hechas (public/grano) que se van alternando; mucho más barato que calcularlo */}
      <Img src={staticFile(`estilos/archivo/grano/g${(f % 6) + 1}.png`)} style={{ position: "absolute", inset: 0, width: ANCHO, height: ALTO, opacity: 0.05 + 0.14 * g, mixBlendMode: "screen", pointerEvents: "none", transform: f % 2 ? "scaleX(-1)" : undefined }} />
      {/* líneas de televisor */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
      {/* viñeta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 68% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.92) 100%)" }} />
      {/* rayas sueltas: una cada ~2 s, durante 2-3 fotogramas */}
      {azar(Math.floor(f / 58)) > 0.55 && f % 58 < 3 ? <Rayas n={2} semilla={Math.floor(f / 58)} opacidad={0.5} /> : null}
      {/* racimo de rayas en los cortes */}
      {g > 0 ? <Rayas n={Math.round(10 + 30 * g)} semilla={f} arriba={azar(f) > 0.5} /> : null}
      {g > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: 0.06 * g }} /> : null}
      {glitches.map((gf, i) => (
        <Sequence key={i} from={gf} durationInFrames={14} layout="none">
          <Audio src={staticFile("estilos/archivo/sfx/estatica.wav")} volume={0.32} />
        </Sequence>
      ))}
      {negro > 0 ? <AbsoluteFill style={{ background: "#000", opacity: negro }} /> : null}
      {apagon !== undefined ? (
        <Sequence from={apagon - 6} durationInFrames={30} layout="none">
          <Audio src={staticFile("estilos/archivo/sfx/cinta_para.wav")} volume={0.35} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
