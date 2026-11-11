// Portada (miniatura de YouTube, 1280×720) del archivo 021. Se saca con:
//   npx remotion still src/videos/pasos-techo/portada/index.tsx portada salida/pasos-techo-portada.jpg
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { C, FUENTE } from "../../../estilos/archivo/estilo";
import { Lienzo } from "../../../estilos/archivo/Plano";
import { DormitorioTecho, Techo } from "../../../estilos/archivo/piezas/Casa";
import { PersonaCama } from "../../../estilos/archivo/piezas/Persona";
import { Pasos, Raton } from "../../../estilos/archivo/piezas/Objetos";

const Portada: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <Lienzo zoom={1.0} cx={960} cy={540} suelo>
        <g transform="translate(480 0)">
          <DormitorioTecho reloj="03:04">
            <PersonaCama x={1050} y={424} ojos={1} sudor />
          </DormitorioTecho>
        </g>
        <Pasos x={1150} y={168} n={5} sep={130} k={99} escala={1.5} />
        <Raton x={1560} y={118} escala={1.5} k={1} />
      </Lienzo>
      <div style={{ position: "absolute", left: 70, top: 300, fontFamily: FUENTE, fontWeight: 900, color: C.blanco, fontSize: 124, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 0 30px rgba(255,255,255,0.25)" }}>
        NO SUBAS
        <br />
        A MIRAR
      </div>
      <div style={{ position: "absolute", left: 76, top: 40, fontFamily: FUENTE, fontWeight: 800, color: C.amarillo, fontSize: 54, letterSpacing: 6 }}>03:04</div>
      <div style={{ position: "absolute", left: 70, bottom: 64, fontFamily: FUENTE, fontWeight: 800, color: C.gris, fontSize: 40, letterSpacing: 8 }}>ARCHIVO 021 · 7 REGLAS</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Raiz: React.FC = () => <Composition id="portada" component={Portada} durationInFrames={1} fps={30} width={1280} height={720} />;
registerRoot(Raiz);
