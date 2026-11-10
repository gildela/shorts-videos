// El vídeo entero: los planos, la capa de cinta encima, la cabecera, los subtítulos (una frase de la voz cada vez),
// la voz, el drone de fondo (con cortes a silencio) y los «sustos escondidos»: cosas de 1-3 fotogramas que casi nadie
// ve a la primera (los ojos del gato donde no deberían estar, el subtítulo que dice otra cosa, la barra con 8 reglas,
// el reloj que salta a las 03:04).
import React from "react";
import { AbsoluteFill, Audio, Sequence, getRemotionEnvironment, staticFile, useCurrentFrame } from "remotion";
import { ALTO, ANCHO, FPS } from "./estilo";
import { Defs, Plano, Planos, fotogramasGlitch } from "./Plano";
import { ConCinta } from "./piezas/Cinta";
import { Cabecera, Subtitulo } from "./piezas/Interfaz";
import { OjosGato } from "./piezas/Gato";
import { OjosPerro } from "./piezas/Perro";
import { Frase } from "./tiempos";

export type Susto =
  | { en: number; tipo: "ojos"; x: number; y: number; r?: number; fotogramas?: number; redondos?: boolean } // redondos = ojos de perro
  | { en: number; tipo: "subtitulo"; texto: string; fotogramas?: number }
  | { en: number; tipo: "barra8"; fotogramas?: number }
  | { en: number; tipo: "reloj"; hora?: string; fotogramas?: number };

export type PropsVideo = {
  canal: string; // nombre del canal para la cabecera («ARCHIVO 017 // TU CANAL»); viene de src/ajustes.json
  planos: Plano[];
  frases: Frase[];
  duracion: number; // segundos (la voz + el apagón)
  archivo: string; // «017»
  reglas: number[]; // segundo en que empieza cada regla (para la barra de la cabecera)
  voz: string; // ruta en public/ («videos/<id>/voz.mp3»)
  musica?: { archivo: string; volumen?: number; desde?: number }[]; // archivo: nombre dentro de public/estilos/archivo/musica/ (o una ruta con «/» dentro de public/)
  silencios?: [number, number][]; // tramos [desde, hasta] en los que el drone se corta en seco (silencio total)
  apagon?: number; // segundo en que la cinta se va a negro
  glitchesExtra?: number[]; // segundos con corte de estática además de los planos con entra: "glitch"
  sustos?: Susto[];
};

export const Video: React.FC<PropsVideo> = ({ canal, planos, frases, duracion, archivo, reglas, voz, musica = [], silencios = [], apagon, glitchesExtra = [], sustos = [] }) => {
  const f = useCurrentFrame();
  const seg = f / FPS;
  const plano = [...planos].reverse().find((p) => seg >= p.desde);
  const regla = reglas.filter((r) => seg >= r - 0.1).length;
  const i = frases.findIndex((fr, k) => seg >= fr.ini - 0.06 && seg < (frases[k + 1] ? frases[k + 1].ini - 0.06 : fr.fin + 1.2));
  const frase = i >= 0 ? frases[i] : null;
  const glitches = [...fotogramasGlitch(planos), ...glitchesExtra.map((s) => Math.round(s * FPS))].sort((a, b) => a - b);
  const apagado = apagon !== undefined && seg >= apagon;
  const activos = sustos.filter((s) => f >= Math.round(s.en * FPS) && f < Math.round(s.en * FPS) + (s.fotogramas ?? 2));
  const sustoSub = activos.find((s) => s.tipo === "subtitulo") as Extract<Susto, { tipo: "subtitulo" }> | undefined;
  const barra8 = activos.some((s) => s.tipo === "barra8");
  const reloj = activos.find((s) => s.tipo === "reloj") as Extract<Susto, { tipo: "reloj" }> | undefined;
  const ojos = activos.filter((s) => s.tipo === "ojos") as Extract<Susto, { tipo: "ojos" }>[];
  const enSilencio = (t: number) => silencios.some(([a, b]) => t >= a && t < b);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ConCinta glitches={glitches} apagon={apagon !== undefined ? Math.round(apagon * FPS) : undefined}>
        <Planos planos={planos} hasta={duracion} />
        {ojos.length ? (
          <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0 }}>
            <Defs />
            {ojos.map((o, k) =>
              o.redondos ? <OjosPerro key={k} x={o.x} y={o.y} r={o.r ?? 16} halo={0.8} /> : <OjosGato key={k} x={o.x} y={o.y} r={o.r ?? 16} halo={0.8} pupila={0.15} />,
            )}
          </svg>
        ) : null}
        {!apagado && !plano?.sinInterfaz ? <Cabecera f={f} canal={canal} regla={barra8 ? 8 : regla} archivo={archivo} reglas={barra8 ? 8 : 7} hora={reloj ? reloj.hora ?? "03:04:00:00" : undefined} /> : null}
        {!apagado && (frase || sustoSub) && !plano?.sinSubtitulo && !plano?.sinInterfaz ? <Subtitulo texto={sustoSub ? sustoSub.texto : frase!.texto} k={sustoSub ? 1 : seg - frase!.ini + 0.06} /> : null}
      </ConCinta>
      {/* Al renderizar la voz no va aquí: en renders largos Remotion la iba retrasando a saltos (VID-14 acabó 9 s
          tarde). La pega «fabrica render» con ffmpeg en su sitio exacto, desde el segundo 0. En el Studio sí suena. */}
      {getRemotionEnvironment().isRendering ? null : <Audio src={staticFile(voz)} />}
      {musica.map((m, k) => (
        <Sequence key={k} from={Math.round((m.desde ?? 0) * FPS)} layout="none">
          <Audio
            src={staticFile(m.archivo.includes("/") ? m.archivo : `estilos/archivo/musica/${m.archivo}`)}
            volume={(fr) => {
              const t = fr / FPS + (m.desde ?? 0);
              if (apagon !== undefined && t > apagon - 0.3) return 0;
              if (enSilencio(t)) return 0;
              return m.volumen ?? 0.05;
            }}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
