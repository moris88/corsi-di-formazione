/*
 * Build del sito: copia le parti pubbliche in dist/ minimizzando
 * HTML (con CSS e JS inline), CSS e JS. Gli altri file (Markdown, PDF,
 * immagini) vengono copiati così come sono.
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import CleanCSS from "clean-css";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
const buildId = Date.now().toString(36);
// Pagine pubbliche: portale, sorgenti condivisi (src: CSS e JS), file statici (public) e una cartella per certificazione
const entries = ["index.html", "src", "public", "CCA-F"];

const terserOptions = {
  ecma: 2020,
  compress: { passes: 3, drop_debugger: true },
  mangle: true,
  format: { comments: false },
};

const css = new CleanCSS({ level: 2 });

const htmlOptions = {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  collapseBooleanAttributes: true,
  decodeEntities: true,
  sortAttributes: true,
  sortClassName: true,
  minifyCSS: { level: 2 },
  minifyJS: terserOptions,
};

let saved = 0;
let original = 0;

async function processFile(src, dest) {
  const ext = extname(src).toLowerCase();
  if (![".html", ".css", ".js"].includes(ext)) {
    await cp(src, dest);
    return;
  }
  const input = await readFile(src, "utf8");
  let output;
  if (ext === ".html") {
    // Versione nei link a CSS/JS di src/: a ogni build il browser scarica i file nuovi
    output = (await minifyHtml(input, htmlOptions)).replace(/((?:href|src)="[^"]*src\/[^"?]+\.(?:css|js))"/g, `$1?v=${buildId}"`);
  } else if (ext === ".css") {
    const result = css.minify(input);
    if (result.errors.length) throw new Error(`${src}: ${result.errors.join(", ")}`);
    output = result.styles;
  } else {
    output = (await minifyJs(input, terserOptions)).code;
  }
  await writeFile(dest, output);
  original += Buffer.byteLength(input);
  saved += Buffer.byteLength(input) - Buffer.byteLength(output);
  console.log(`  ${relative(root, src)}  ${input.length} → ${output.length}`);
}

async function walk(src, dest) {
  if ((await stat(src)).isDirectory()) {
    await mkdir(dest, { recursive: true });
    for (const name of await readdir(src)) await walk(join(src, name), join(dest, name));
  } else {
    await processFile(src, dest);
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of entries) await walk(join(root, entry), join(out, entry));
console.log(`\nMinimizzati ${(original / 1024).toFixed(0)} KB → ${((original - saved) / 1024).toFixed(0)} KB in dist/`);
