/*
 * Server Express per il sito. Serve la build minimizzata in dist/
 * (generata con `npm run build`) con compressione gzip e cache.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import express from "express";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const port = Number(process.env.PORT) || 3001;

if (!existsSync(dist)) {
  console.error("Cartella dist/ mancante: esegui prima `npm run build`.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(
  express.static(dist, {
    extensions: ["html"],
    setHeaders(res, path) {
      // HTML, Markdown, CSS e JS non hanno nomi versionati: sempre rivalidati (ETag),
      // così una modifica è visibile al primo ricaricamento. Immagini e PDF in cache per un giorno.
      if (/\.(html|md|css|js)$/i.test(path)) res.setHeader("Cache-Control", "no-cache");
      else res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);
app.use((req, res) => res.status(404).sendFile(join(dist, "index.html")));

app.listen(port, () => console.log(`Sito disponibile su http://localhost:${port}`));
