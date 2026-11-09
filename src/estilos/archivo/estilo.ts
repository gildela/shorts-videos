// Lenguaje visual del estilo «Archivo» (sacado del vídeo de referencia de Bradikinin
// «If Your Cat Ever Watches You Sleep», analizado fotograma a fotograma el 21-10-2026).
// Los recursos del estilo (efectos, grano, música) viven en public/estilos/archivo/.
//
// Reglas de color (las de verdad, medidas en el vídeo):
//   - Fondo negro puro con viñeta. Todo lo que existe es BLANCO macizo con un brillo suave alrededor (bloom).
//   - AMARILLO solo para lo inquietante: los ojos del gato, la luna, las ventanas encendidas, la etiqueta «TÚ».
//   - VERDE solo para las casillas marcadas (✓) y los sellos «COMPROBADO». ROJO solo para la raya de la tarjeta de
//     regla, las cruces (✕), los sellos y lo que falla. GRIS para lo secundario: la línea del suelo, huellas, texto pequeño.
//   - Nada de otros colores. Nada de degradados de color (solo el gris-blanco del bloom).
import { continueRender, delayRender } from "remotion";
import { FUENTES } from "./fuentes-embebidas";

export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

export const C = {
  fondo: "#000000",
  blanco: "#f4f4f2",
  gris: "#8a8a88", // línea del suelo, texto pequeño de la cabecera, huellas
  grisOscuro: "#3a3a3a", // casillas apagadas, rayas de documento
  negro: "#0a0a0a", // ojos y boca del muñeco, tinta de documentos
  amarillo: "#f7df3a",
  verde: "#3ec25c",
  rojo: "#e8252b",
} as const;

export const FUENTE = "Montserrat, sans-serif";

// Medidas de la interfaz, copiadas del vídeo de referencia (1920×1080)
export const UI = {
  cabeceraY: 82, // línea base de la cabecera
  cabeceraIzq: 96,
  cabeceraDer: 96,
  subtituloY: 905, // centro vertical del subtítulo (una línea); con dos líneas sube
  subtituloTam: 50,
  sueloY: 800, // la línea del suelo de las escenas de habitación
  trazo: 14, // grosor de los contornos de muebles (la cama, la mesilla…) en mitad del cuadro
} as const;

export const s = (segundos: number) => Math.round(segundos * FPS);

if (typeof document !== "undefined") {
  // Las fuentes van en data: y tardan nada; aun así, si una pestaña del render se queda colgada cargándolas,
  // seguimos a los 15 s (con la fuente de reserva) antes que tirar el render entero.
  const espera = delayRender("fuentes", { timeoutInMilliseconds: 60000, retries: 2 });
  const carga = Promise.all(
    FUENTES.map(([familia, archivo, peso]) =>
      new FontFace(familia, `url(${archivo})`, { weight: peso }).load().then((f) => {
        (document.fonts as unknown as { add: (fuente: FontFace) => void }).add(f);
      }),
    ),
  );
  Promise.race([carga, new Promise((ok) => setTimeout(ok, 15000))])
    .then(() => continueRender(espera))
    .catch((e) => {
      console.error(e);
      continueRender(espera);
    });
}
