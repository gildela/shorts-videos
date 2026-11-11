// Portada (miniatura de YouTube, 1280×720) del archivo 019. Se saca con:
//   npx remotion still src/videos/tres-noche/portada/index.tsx portada salida/tres-noche-portada.jpg
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { C, FUENTE } from "../../../estilos/archivo/estilo";
import { Lienzo } from "../../../estilos/archivo/Plano";
import { Dormitorio, RelojDigital } from "../../../estilos/archivo/piezas/Casa";
import { PersonaCama } from "../../../estilos/archivo/piezas/Persona";

const Portada: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <Lienzo suelo>
        <g transform="translate(560 120) scale(0.85)">
          <Dormitorio ventana={false}>
            <PersonaCama x={1050} y={424} ojos={1} />
          </Dormitorio>
        </g>
        <RelojDigital x={1500} y={300} hora="03:04" escala={1.4} rojo />
      </Lienzo>
      <div style={{ position: "absolute", left: 70, top: 70, fontFamily: FUENTE, fontWeight: 900, color: C.blanco, fontSize: 132, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 0 30px rgba(255,255,255,.35)" }}>
        NO MIRES
        <br />
        EL RELOJ
      </div>
      <div style={{ position: "absolute", left: 76, top: 360, fontFamily: FUENTE, fontWeight: 800, color: C.amarillo, fontSize: 54, letterSpacing: 6 }}>CADA NOCHE</div>
      <div style={{ position: "absolute", left: 70, bottom: 64, fontFamily: FUENTE, fontWeight: 800, color: C.gris, fontSize: 40, letterSpacing: 8 }}>ARCHIVO 019 · 7 REGLAS</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Raiz: React.FC = () => <Composition id="portada" component={Portada} durationInFrames={1} fps={30} width={1280} height={720} />;
registerRoot(Raiz);
