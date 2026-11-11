// Vídeos registrados (la toca «fabrica nuevo»).
import * as v_ejemplo_gato from "./ejemplo-gato/Video";
import * as v_perro_esquina from "./perro-esquina/Video";
import * as v_paralisis_sueno from "./paralisis-sueno/Video";

export const VIDEOS = [
  { id: v_ejemplo_gato.ID, duracion: v_ejemplo_gato.DURACION, Video: v_ejemplo_gato.Video },
  { id: v_perro_esquina.ID, duracion: v_perro_esquina.DURACION, Video: v_perro_esquina.Video },
  { id: v_paralisis_sueno.ID, duracion: v_paralisis_sueno.DURACION, Video: v_paralisis_sueno.Video },
  // ← fabrica nuevo añade aquí
];
