/*
 * Server Express per il sito. Viene copiato in dist/ dalla build e serve la
 * cartella in cui si trova (la build minimizzata) con compressione gzip e cache.
 * Avviato direttamente (`npm start` → node dist/server.mjs) ascolta sulla porta PORT;
 * su Vercel l'app è esportata dalla funzione api/index.mjs (vedi vercel.json).
 */
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import express from "express";

const file = fileURLToPath(import.meta.url);
const root = dirname(file);
const port = Number(process.env.VITE_PORT) || 3000;

const app = express();
app.disable("x-powered-by");
app.use(compression());
// Il server stesso non va servito come file statico
app.get(`/${basename(file)}`, (_req, res) => res.status(404).sendFile(join(root, "index.html")));
app.use(
  express.static(root, {
    extensions: ["html"],
    setHeaders(res, path) {
      // CSS e JS generati da Vite (direttamente in assets/, con hash nel nome: es. style-D6U6YpL5.css)
      // sono in cache per sempre. Gli altri HTML, Markdown, CSS e JS sono sempre rivalidati (ETag),
      // così una modifica è visibile al primo ricaricamento. Immagini e PDF in cache per un giorno.
      if (/^assets[\\/][^\\/]+-[\w-]{8}\.(css|js)$/.test(relative(root, path)))
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      else if (/\.(html|md|css|js)$/i.test(path)) res.setHeader("Cache-Control", "no-cache");
      else res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);
app.use((_req, res) => res.status(404).sendFile(join(root, "index.html")));

// Solo se avviato con `node dist/server.mjs`, non quando importato da api/index.mjs.
if (process.argv[1] && resolve(process.argv[1]) === file) {
  app.listen(port, () => console.log(`Sito disponibile su http://localhost:${port}`));
}

export default app;
