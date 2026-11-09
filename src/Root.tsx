// Registra una composición por cada vídeo de src/videos/lista.ts: 1920×1080 a 30 fps, con la duración que exporta
// cada vídeo (la de su voz más la cola del apagón). La composición se llama como el id del vídeo.
import React from "react";
import { Composition } from "remotion";
import { ALTO, ANCHO, FPS } from "./estilos/archivo/estilo";
import { VIDEOS } from "./videos/lista";

export const Root: React.FC = () => (
  <>
    {VIDEOS.map(({ id, duracion, Video }) => (
      <Composition key={id} id={id} component={Video} durationInFrames={Math.max(1, Math.round(duracion * FPS))} fps={FPS} width={ANCHO} height={ALTO} />
    ))}
  </>
);
