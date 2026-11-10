// Portada (miniatura de YouTube, 1280×720) del archivo 018. Se saca con:
//   npx remotion still src/videos/perro-esquina/portada/index.tsx portada salida/perro-esquina-portada.jpg
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { C, FUENTE } from "../../../estilos/archivo/estilo";
import { Lienzo } from "../../../estilos/archivo/Plano";
import { OjoPerro, PerroSentado } from "../../../estilos/archivo/piezas/Perro";
import { Esquina } from "../comun";

const Portada: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <Lienzo zoom={1.08} cx={1060} cy={470} suelo>
        <Esquina x={1500} techo={150} y={800} ancho={560} color="#9a9a9a" />
        {/* dos ojos en la esquina vacía */}
        <OjoPerro x={1460} y={420} r={22} halo={1} />
        <OjoPerro x={1540} y={420} r={22} halo={1} />
        <PerroSentado x={800} y={800} f={0} cola={0} oreja={1} halo={0.8} escala={1.0} />
      </Lienzo>
      <div style={{ position: "absolute", left: 70, top: 70, fontFamily: FUENTE, fontWeight: 900, color: C.blanco, fontSize: 132, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 0 30px rgba(255,255,255,.35)" }}>
        NO MIRES
        <br />
        LA ESQUINA
      </div>
      <div style={{ position: "absolute", left: 76, top: 360, fontFamily: FUENTE, fontWeight: 800, color: C.amarillo, fontSize: 54, letterSpacing: 6 }}>03:04</div>
      <div style={{ position: "absolute", left: 70, bottom: 64, fontFamily: FUENTE, fontWeight: 800, color: C.gris, fontSize: 40, letterSpacing: 8 }}>ARCHIVO 018 · 7 REGLAS</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Raiz: React.FC = () => <Composition id="portada" component={Portada} durationInFrames={1} fps={30} width={1280} height={720} />;
registerRoot(Raiz);
