# Certificazioni Anthropic · Materiali di studio

Sito statico in italiano per prepararsi alle certificazioni Anthropic. Per ora è disponibile **Claude Certified Architect — Foundations (CCA-F)**.

## Il sito

La pagina iniziale ([src/index.html](src/index.html)) è il portale di tutte le certificazioni; ognuna ha una propria home (per la CCA-F [src/pages/ccaf.html](src/pages/ccaf.html)) con tre sezioni:

- **Studio** (`studio.html`): lettore dei materiali organizzati per sezione: orientamento (guida d'esame, pre-corso, vocabolario), domini d'esame, domini approfonditi, approfondimenti, esercitazioni, trappole d'esame e riferimenti ufficiali. Per i domini sono disponibili anche le slide in PDF.
- **Simulazione** (`simulazione.html`): test completi a tempo, come all'esame, con correzione, punteggio stimato e storico dei risultati. Si possono caricare anche test propri in Markdown (vedi [formato-test.md](src/assets/ccaf/formato-test.md)).
- **Allenamento** (`allenamento.html`): quiz brevi con domande prese da tutte le banche disponibili, con statistiche sull'andamento (per sessione, scenario e difficoltà).

Le domande sono in inglese, come all'esame reale; tutti gli altri materiali sono in italiano. L'interfaccia ha tema chiaro e scuro ed è pensata anche per smartphone.

## Struttura

| Percorso | Contenuto |
| --- | --- |
| `src/` | Sorgenti del sito (HTML, CSS, JavaScript vanilla) |
| `src/pages/` | Home e pagine di ogni certificazione |
| `src/assets/ccaf/` | Materiali della CCA-F: guide, appunti, slide, trappole d'esame, banche quesiti (`questions/`) e documenti ufficiali |
| `src/server.mjs` | Server Express che serve la build |
| `api/`, `vercel.json` | Pubblicazione su Vercel |

## Avvio

Serve Node.js 20.19 o successivo.

```bash
npm install
npm run dev     # server di sviluppo Vite con ricaricamento automatico
npm run build   # crea dist/ con HTML, CSS e JavaScript minimizzati
npm start       # serve dist/ con Express su http://localhost:3000
npm run serve   # build + start
npm run lint    # controllo con Biome
```

Le pagine caricano i Markdown con `fetch()`: il sito va sempre aperto tramite un server, non con doppio clic sui file. Si modificano solo i file in `src/`; `dist/` è rigenerata a ogni build e non è versionata.

Su **Vercel** `vercel.json` esegue `npm run build` e instrada ogni richiesta all'app Express (`api/index.mjs`), che serve `dist/`.

## Segnalazioni e feedback

Hai trovato un errore o hai un suggerimento? [Apri una segnalazione](https://forms.gle/wuPM9cL7cqiaPzQJ8). Puoi anche compilare il [questionario facoltativo](https://forms.gle/3NvXVDYVc4z3kJVf8). Entrambi i moduli sono disponibili in ogni pagina, dal pulsante **Segnala / Feedback**.

## Nota

Materiale di studio personale, non ufficiale e non affiliato ad Anthropic. Per le informazioni ufficiali sull'esame fanno fede i documenti Anthropic raccolti nella sezione *Riferimenti* del sito.
