import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify } from "terser";
import { defineConfig } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "src");
const out = resolve(root, "../dist");

// File che Vite elabora da sé partendo dagli HTML: tutti gli altri sono copiati
const bundled = new Set([".html", ".css", ".js", ".mjs"]);
// Script copiati a parte e minimizzati con Terser (percorso relativo a src/ → modulo ES?)
const scripts = { "js/theme.js": false, "server.mjs": true };

async function files(dir) {
  const list = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) list.push(...(await files(path)));
    else list.push(path);
  }
  return list;
}

const htmlOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: false,
  useShortDoctype: true,
  collapseBooleanAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

function copyStatic() {
  return {
    name: "copy-static",
    apply: "build",
    async closeBundle() {
      for (const file of await files(root)) {
        if (bundled.has(extname(file).toLowerCase())) continue;
        const dest = join(out, relative(root, file));
        await mkdir(dirname(dest), { recursive: true });
        await cp(file, dest);
      }
      for (const file of await files(out)) {
        if (extname(file) !== ".html") continue;
        await writeFile(file, await minifyHtml(await readFile(file, "utf8"), htmlOptions));
      }
      for (const [path, module] of Object.entries(scripts)) {
        const input = await readFile(join(root, path), "utf8");
        const { code } = await minify(input, {
          ecma: 2020,
          module,
          compress: { passes: 3 },
          format: { comments: false },
        });
        await mkdir(dirname(join(out, path)), { recursive: true });
        await writeFile(join(out, path), code);
      }
    },
  };
}

const pages = (await files(root)).filter((file) => extname(file) === ".html");

export default defineConfig({
  root,
  publicDir: false,
  plugins: [copyStatic()],
  server: {
    port: Number(process.env.VITE_PORT) || 3000,
    open: true,
  },
  build: {
    outDir: out,
    emptyOutDir: true,
    rollupOptions: {
      input: pages,
      // Immagini e altri file linkati dagli HTML (src/assets/) tengono il loro nome, senza hash:
      // coincidono con le copie di copy-static invece di comparire due volte. CSS e JS restano con hash.
      output: {
        assetFileNames: (info) =>
          /\.css$/.test(info.names?.[0] ?? "") ? "assets/[name]-[hash][extname]" : "assets/[name][extname]",
      },
    },
  },
});
