// Archivo 021 · «Si oyes pasos en el techo de noche» (estilo «Archivo», largo). Los planos van por bloques
// (S1-S3); aquí se juntan y se pone lo de todo el vídeo: cabecera, reglas, sustos, silencios, música y apagón.
import React from "react";
import ajustes from "../../ajustes.json";
import { Plano } from "../../estilos/archivo/Plano";
import { Video as VideoArchivo } from "../../estilos/archivo/Video";
import { E, T } from "./comun";
import { PLANOS_S1 } from "./S1";
import { PLANOS_S2 } from "./S2";
import { PLANOS_S3 } from "./S3";

export const ID = "pasos-techo";
export { T };

const planos: Plano[] = [...PLANOS_S1, ...PLANOS_S2, ...PLANOS_S3].sort((a, b) => a.desde - b.desde);

export const DURACION = T.duracion + 1.6;

export const Video: React.FC = () => (
  <VideoArchivo
    canal={ajustes.canal}
    planos={planos}
    frases={T.frases}
    duracion={DURACION}
    archivo="021"
    reglas={[
      E("Regla número uno"),
      E("Regla número dos"),
      E("Regla número tres"),
      E("Regla número cuatro"),
      E("Regla número cinco"),
      E("Regla número seis"),
      E("Regla número siete", E("Los pasos en el techo de alguien")),
    ]}
    voz="videos/pasos-techo/voz.mp3"
    musica={[
      { archivo: "dark-tension-eerie-drone--shadowlands-1-horizon.mp3", volumen: 0.05 },
      { archivo: "mystery-eerie-ambient-drone--penumbra.mp3", volumen: 0.05, desde: E("Regla número cuatro") },
    ]}
    silencios={[
      [E("Esperaremos") + 0.9, E("Gracias", E("Esperaremos")) - 0.1],
      [E("Los pasos en el techo de alguien") + 1.8, E("Regla número siete", E("Los pasos en el techo de alguien")) - 0.1],
      [E("Escucha", E("Queda un trámite")) + 1.2, 999],
    ]}
    sustos={[
      { en: E("Se paran justo encima") + 1.0, tipo: "ojos", x: 960, y: 120, r: 14, redondos: true },
      { en: E("Seis reglas") + 0.8, tipo: "barra8" },
      { en: E("ahora los oye ella") + 1.0, tipo: "reloj", hora: "03:04:00:00" },
    ]}
    apagon={T.duracion + 0.7}
  />
);
