// Archivo 020 · «Si te despiertas y no puedes moverte» (estilo «Archivo», largo). Los planos van por bloques
// (S1-S4); aquí se juntan y se pone lo de todo el vídeo: cabecera, reglas, sustos, silencios, música y apagón.
import React from "react";
import ajustes from "../../ajustes.json";
import { Plano } from "../../estilos/archivo/Plano";
import { Video as VideoArchivo } from "../../estilos/archivo/Video";
import { E, T } from "./comun";
import { PLANOS_S1 } from "./S1";
import { PLANOS_S2 } from "./S2";
import { PLANOS_S3 } from "./S3";
import { PLANOS_S4 } from "./S4";

export const ID = "paralisis-sueno";
export { T };

const planos: Plano[] = [...PLANOS_S1, ...PLANOS_S2, ...PLANOS_S3, ...PLANOS_S4].sort((a, b) => a.desde - b.desde);

export const DURACION = T.duracion + 1.6;

export const Video: React.FC = () => (
  <VideoArchivo
    canal={ajustes.canal}
    planos={planos}
    frases={T.frases}
    duracion={DURACION}
    archivo="020"
    reglas={[E("Regla número uno"), E("Regla número dos"), E("Regla número tres"), E("Regla número cuatro"), E("Regla número cinco"), E("Regla número seis"), E("Regla número siete")]}
    voz="videos/paralisis-sueno/voz.mp3"
    musica={[
      { archivo: "dark-tension-eerie-drone--shadowlands-1-horizon.mp3", volumen: 0.05 },
      { archivo: "mystery-eerie-ambient-drone--penumbra.mp3", volumen: 0.05, desde: E("Regla número cuatro") },
    ]}
    silencios={[
      [E("Esperaremos") + 0.9, E("Gracias", E("Esperaremos")) - 0.1],
      [E("La presencia eres tú") + 1.8, E("Regla número siete", E("Este archivo no va")) - 0.1],
      [E("Respira", E("Queda un trámite")) + 1.2, 999],
    ]}
    sustos={[
      { en: E("Úsalos para otra cosa") + 1.3, tipo: "ojos", x: 960, y: 400, r: 16, redondos: true },
      { en: E("El mismo peso") + 1.4, tipo: "subtitulo", texto: "EL MISMO QUE TIENES ENCIMA." },
      { en: E("Lo revisaremos uno a uno") + 1.2, tipo: "reloj", hora: "03:04:00:00" },
      { en: E("Seis reglas") + 0.8, tipo: "barra8" },
      { en: E("Dice que todavía no ha vuelto nadie") + 2.4, tipo: "ojos", x: 1168, y: 371, r: 12, redondos: true },
    ]}
    apagon={T.duracion + 0.7}
  />
);
