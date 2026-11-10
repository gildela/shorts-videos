// Fotos sueltas de un vídeo (para revisar una sección sin renderizar el vídeo entero). Lo lanza «fabrica revisar».
// Uso: node herramientas/fotos.cjs <composición> "<fotogramas, p. ej. 0,120,450>" [--escala 0.5] [--reusar] [--todas] [--carpeta <nombre>] [--bundle <nombre>] [--entrada src/otro.ts]
//   → salida/revisar/<carpeta>/f_<fotograma>.jpg y una hoja con todas (hoja.jpg)
// Traído de la fábrica de palitos (pruebas/fotos.cjs) el 27-10-2026; ffmpeg y npx los pasa «fabrica revisar» (FFMPEG, NPX).
//   --carpeta / --bundle: carpeta de salida y del bundle propias (varios agentes revisando a la vez sin pisarse)
//   --entrada: otro punto de entrada de Remotion (por defecto src/index.ts), p. ej. una prueba aislada del resto
// Gastar menos de la cuenta de Claude al revisar (18-10-2026, como Creatorize):
//   - Cada imagen que mira Claude se vuelve a pagar en cada paso siguiente. La hoja sale del tamaño justo: cuantas
//     más fotos, más pequeña cada una, y nunca más de ~1,15 Mpx (lo que Claude lee como mucho por imagen).
//   - Memoria: una foto IGUAL que la última vez que se miró (en esta --carpeta) no se vuelve a poner en la hoja;
//     se dice «sin cambios». Si nada ha cambiado no hay hoja nueva. --todas la pone igual.
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");
const RAIZ = path.resolve(__dirname, "..");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const NPX = process.env.NPX || "npx";
const { selectComposition, renderStill, openBrowser } = require(require.resolve("@remotion/renderer", { paths: [RAIZ] }));

// Lo más que Claude lee de una imagen (lado largo y megapíxeles): más grande, la reduce y se paga igual.
const HOJA_ANCHO = 1568;
const HOJA_PX = 1150000;
// Dos renders del mismo fotograma sin cambios difieren a lo sumo en 4-5 niveles de gris (ruido del JPEG);
// cualquier cambio de verdad (un brazo, un rótulo) pasa de 100.
const TOLERANCIA = 24;

// ¿La foto nueva es la misma que la última que se miró? Mismo archivo, o ningún píxel distinto en más de TOLERANCIA.
function igual(a, b) {
  const sha = (p) => crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex");
  if (sha(a) === sha(b)) return true;
  try {
    const out = execSync(
      `"${FFMPEG}" -loglevel error -i "${a}" -i "${b}" -lavfi "[0:v][1:v]blend=all_mode=difference,format=gray,signalstats,metadata=mode=print:key=lavfi.signalstats.YMAX:file=-" -f null -`,
      { encoding: "utf8" },
    );
    const m = out.match(/YMAX=(\d+)/);
    return !!m && Number(m[1]) <= TOLERANCIA;
  } catch {
    return false;
  }
}

(async () => {
  const args = process.argv.slice(2);
  const opcion = (n) => {
    const i = args.indexOf(n);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const [id, fotogramas] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && ["--escala", "--carpeta", "--bundle", "--entrada"].includes(args[i - 1])));
  const pedidos = [...new Set(fotogramas.split(",").map(Number).filter((n) => Number.isFinite(n)))];
  // Sin --escala, 0,3 (576×324): la hoja las reduce después si hace falta. Para ver un detalle, --escala 0.5 con 1-2 fotos.
  const escala = Number(opcion("--escala") ?? 0.3);
  const carpeta = path.join(RAIZ, "salida/revisar", opcion("--carpeta") ?? id);
  fs.mkdirSync(carpeta, { recursive: true });
  const bundle = path.join(RAIZ, "salida/revisar", opcion("--bundle") ?? "bundle");
  if (!(args.includes("--reusar") && fs.existsSync(bundle))) {
    fs.rmSync(bundle, { recursive: true, force: true });
    execSync(`"${NPX}" remotion bundle ${opcion("--entrada") ?? "src/index.ts"} --out-dir "${bundle}" --log=error`, { cwd: RAIZ, stdio: ["ignore", "pipe", "inherit"] });
  }
  const memoriaRuta = path.join(carpeta, "vistas.json");
  let memoria = {};
  try {
    memoria = JSON.parse(fs.readFileSync(memoriaRuta, "utf8"));
  } catch {}
  const gl = { gl: "angle" };
  const browser = await openBrowser("chrome", { chromiumOptions: gl, browserExecutable: process.env.REMOTION_BROWSER || null });
  const composition = await selectComposition({ serveUrl: bundle, id, puppeteerInstance: browser, chromiumOptions: gl });
  const hechas = [];
  const iguales = [];
  for (const fr of pedidos) {
    const frame = Math.min(Math.max(fr, 0), composition.durationInFrames - 1);
    const salida = path.join(carpeta, `f_${String(frame).padStart(5, "0")}.jpg`);
    const t = Date.now();
    await renderStill({ composition, serveUrl: bundle, frame, output: salida, imageFormat: "jpeg", jpegQuality: 88, scale: escala, puppeteerInstance: browser, chromiumOptions: gl, timeoutInMilliseconds: 240000 });
    const clave = `${id}:${frame}@${escala}`;
    const vista = path.join(carpeta, ".vistas", `${clave.replace(/[^\w.@-]/g, "_")}.jpg`);
    if (!args.includes("--todas") && memoria[clave] && fs.existsSync(vista) && igual(salida, vista)) {
      iguales.push(frame);
      console.log(`${frame} → sin cambios desde la última vez que la miraste (no va en la hoja)`);
      continue;
    }
    fs.mkdirSync(path.dirname(vista), { recursive: true });
    fs.copyFileSync(salida, vista);
    memoria[clave] = Date.now();
    console.log(`${frame} → ${path.relative(RAIZ, salida)} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
    hechas.push({ frame, salida });
  }
  await browser.close({ silent: true });
  fs.writeFileSync(memoriaRuta, JSON.stringify(memoria));
  const hoja = path.join(carpeta, "hoja.jpg");
  if (!hechas.length) {
    fs.rmSync(hoja, { force: true });
    console.log(`Ninguna foto ha cambiado desde la última vez (${iguales.join(", ")}): no hay hoja nueva, no hace falta mirar nada.`);
    return;
  }
  // Columnas según cuántas, y cada foto del tamaño justo para que la hoja quepa entera en lo que lee Claude.
  const n = hechas.length;
  const cols = n === 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const filas = Math.ceil(n / cols);
  const anchoFoto = Math.round(composition.width * escala);
  const altoFoto = Math.round(composition.height * escala);
  let w = Math.min(anchoFoto, Math.floor(HOJA_ANCHO / cols), Math.floor(Math.sqrt((HOJA_PX * anchoFoto) / (altoFoto * cols * filas))));
  w -= w % 2;
  const alto = Math.round((w * altoFoto) / anchoFoto / 2) * 2;
  const lista = hechas.map((h) => `-i "${h.salida}"`).join(" ");
  const escalar = hechas.map((_, i) => `[${i}:v]scale=${w}:${alto}[v${i}]`).join(";");
  const capa = hechas.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * alto}`).join("|");
  const entradas = hechas.map((_, i) => `[v${i}]`).join("");
  const filtro = n === 1 ? `[0:v]scale=${w}:${alto}` : `${escalar};${entradas}xstack=inputs=${n}:layout=${capa}:fill=white`;
  execSync(`"${FFMPEG}" -loglevel error -y ${lista} -filter_complex "${filtro}" -q:v 3 "${hoja}"`, { cwd: RAIZ });
  const hojaAncho = Math.min(n, cols) * w;
  const tokens = Math.round((hojaAncho * filas * alto) / 750);
  console.log(
    `hoja → ${path.relative(RAIZ, hoja)} (${n} foto${n > 1 ? "s" : ""} en este orden: ${hechas.map((h) => h.frame).join(", ")}; ${cols}×${filas}, ${hojaAncho}×${filas * alto} px ≈ ${tokens} tokens)` +
      (iguales.length ? ` · sin cambios (no van en la hoja): ${iguales.join(", ")}` : ""),
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
