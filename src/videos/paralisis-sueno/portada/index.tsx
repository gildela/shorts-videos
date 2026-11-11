// Portada (miniatura de YouTube, 1280×720) del archivo 020. Se saca con:
//   npx remotion still src/videos/paralisis-sueno/portada/index.tsx portada salida/paralisis-sueno-portada.jpg
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { C, FUENTE } from "../../../estilos/archivo/estilo";
import { Lienzo } from "../../../estilos/archivo/Plano";
import { Cama } from "../../../estilos/archivo/piezas/Casa";
import { PersonaCama } from "../../../estilos/archivo/piezas/Persona";
import { Encima, Presencia } from "../comun";

const Portada: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <Lienzo zoom={1.0} cx={960} cy={540} suelo>
        <Presencia x={1740} y={800} escala={1.25} color="#4a4a4a" />
        <g transform="translate(330 0)">
          <Cama x={330} y={800} w={900} />
          <PersonaCama x={1050} y={424} ojos={1} sudor />
          <Encima x={820} y={422} escala={1.25} color="#4a4a4a" />
        </g>
      </Lienzo>
      <div style={{ position: "absolute", left: 70, top: 64, fontFamily: FUENTE, fontWeight: 900, color: C.blanco, fontSize: 124, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 0 30px rgba(255,255,255,.35)" }}>
        NO TE
        <br />
        MUEVAS
      </div>
      <div style={{ position: "absolute", left: 76, top: 336, fontFamily: FUENTE, fontWeight: 800, color: C.amarillo, fontSize: 54, letterSpacing: 6 }}>03:04</div>
      <div style={{ position: "absolute", left: 70, bottom: 64, fontFamily: FUENTE, fontWeight: 800, color: C.gris, fontSize: 40, letterSpacing: 8 }}>ARCHIVO 020 · 7 REGLAS</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Raiz: React.FC = () => <Composition id="portada" component={Portada} durationInFrames={1} fps={30} width={1280} height={720} />;
registerRoot(Raiz);
