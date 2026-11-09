// Tiempos de la voz (el VID-N.tiempos.json que deja herramientas/voz.py): palabras y frases con su segundo.
// Para anclar un plano a una palabra: en("dos puntos amarillos") → segundo en que empieza a decirse.
export type Palabra = { p: string; ini: number; fin: number };
export type Frase = { texto: string; ini: number; fin: number };
export type Tiempos = { duracion: number; capitulos: { titulo: string; ini: number }[]; frases: Frase[]; palabras: Palabra[] };

const limpia = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

export const crearTiempos = (t: Tiempos) => {
  const palabras = t.palabras.map((w) => ({ ...w, l: limpia(w.p).join(" ") }));
  /** Segundo en que empieza a decirse `texto` (una o varias palabras seguidas), buscando desde `desde`. */
  const en = (texto: string, desde = 0): number => {
    const q = limpia(texto);
    for (let i = 0; i < palabras.length; i++) {
      if (palabras[i].ini < desde - 0.01) continue;
      let ok = true;
      for (let k = 0; k < q.length; k++) {
        if (!palabras[i + k] || palabras[i + k].l !== q[k]) {
          ok = false;
          break;
        }
      }
      if (ok) return palabras[i].ini;
    }
    // voz provisional (vídeo recién creado, aún sin voz): no rompe el proyecto; todo cae en el segundo 0
    if ((t as { provisional?: boolean }).provisional) return desde;
    throw new Error(`No encuentro «${texto}» en la voz a partir de ${desde} s`);
  };
  /** Segundo en que termina de decirse `texto`. */
  const fin = (texto: string, desde = 0): number => {
    const t0 = en(texto, desde);
    const n = limpia(texto).length;
    const i = palabras.findIndex((w) => w.ini === t0);
    return palabras[i + n - 1].fin;
  };
  return { en, fin, frases: t.frases, palabras: t.palabras, duracion: t.duracion, capitulos: t.capitulos };
};
