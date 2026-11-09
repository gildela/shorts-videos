import { Config } from "@remotion/cli/config";

// Todo es 2D (teselas, SVG e imágenes): no hace falta tarjeta gráfica y renderiza igual de rápido en Windows.
Config.setVideoImageFormat("jpeg");
// a calidad 100 los textos y las costas no se ablandan
Config.setJpegQuality(100);
// en ordenadores lentos las teselas del mapa tardan en cargar
Config.setDelayRenderTimeoutInMilliseconds(300000);
// En desarrollo, src/estilos/<id> es un enlace a estilos/<id>/motor: sin esto, webpack sigue el enlace y un motor que
// importa la biblioteca común («../palitos/…») la busca junto a estilos/<id>/ y no la encuentra. En el ZIP no hay enlaces.
Config.overrideWebpackConfig((c) => ({ ...c, resolve: { ...c.resolve, symlinks: false } }));
// En la nube no se puede descargar el Chrome de Remotion: se usa el que ya trae la máquina (o el de REMOTION_BROWSER),
// mejor el «headless shell» (con el Chrome completo los renders largos se quedaban colgados). En un ordenador normal no se toca nada.
import { existsSync, readdirSync } from "fs";
const chromeDeLaNube = (): string | null => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const base = "/opt/pw-browsers";
  if (!existsSync(base)) return null;
  const candidatos: string[] = [];
  for (const d of readdirSync(base).sort().reverse()) {
    if (/^chromium_headless_shell-\d+$/.test(d)) candidatos.push(`${base}/${d}/chrome-headless-shell-linux64/chrome-headless-shell`);
  }
  for (const d of readdirSync(base).sort().reverse()) {
    if (/^chromium-\d+$/.test(d)) candidatos.push(`${base}/${d}/chrome-linux64/chrome`);
  }
  return candidatos.find((c) => existsSync(c)) ?? null;
};
const chrome = chromeDeLaNube();
if (chrome) Config.setBrowserExecutable(chrome);
