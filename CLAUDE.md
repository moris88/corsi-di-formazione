# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cos'è questo repository

Materiali di studio in italiano sui corsi Anthropic. La parte "applicativa" è un piccolo sito statico per la preparazione alla certificazione **Claude Certified Architect — Foundations (CCA-F)**; le altre cartelle tematiche (`Sviluppo con l'API di Claude/`, `Introduzione agli agent skills/`, ecc.) contengono solo appunti Markdown, PDF e notebook.

Tutti i contenuti e i testi dell'interfaccia sono in **italiano**; le banche quesiti in `src/assets/ccaf/questions/` sono in **inglese** (come l'esame reale).

## Esecuzione

HTML/CSS/JS vanilla, nessun framework UI e nessun test. Strumenti: **Vite** (dev server e build), **Biome** (lint e formattazione), Express per servire la build.

```bash
npm install
npm run dev        # Vite su src/ (con hot reload); le pagine caricano i Markdown con fetch(), quindi serve sempre un server
npm run build      # vite build: src/ → dist/ minimizzata
npm start          # Express su dist/ (http://localhost:3001, porta da PORT)
npm run serve      # build + start
npm run check      # Biome: lint + formattazione (npm run lint / npm run format per i singoli passi)
```

**Build** (`vite.config.mjs`, root `src/`, uscita `dist/` non versionata): ogni `.html` di `src/` è un input. Vite raggruppa e minimizza CSS e gli script `type="module"` in `dist/assets/` con hash nel nome; immagini linkate dagli HTML finiscono anch'esse in `assets/`. Un plugin (`copy-static`) poi minimizza gli HTML con html-minifier-terser, copia con lo stesso percorso tutti gli altri file di `src/` (Markdown, PDF, immagini, banche quesiti: letti a runtime con `fetch()` o link, Vite non li vede) e minimizza con Terser `js/theme.js` e `server.mjs`. `publicDir` è disattivato: `src/assets/` (logo, icona, Markdown, PDF, banche quesiti) è copiata così com'è in `dist/assets/`, accanto a CSS e JS con hash generati da Vite; le immagini linkate dagli HTML tengono il nome originale (`assetFileNames`), così non compaiono doppie.
- `src/js/theme.js` resta uno **script classico nel `<head>`** (deve applicare il tema prima del rendering): Vite avvisa che non lo può raggruppare, è voluto. Gli script delle pagine sono invece moduli ES (`type="module"`), quindi senza variabili globali condivise.
- Biome (`biome.json`) controlla `src/` e `vite.config.mjs`, escludendo i Markdown e `src/others/`; formattazione dell'HTML disattivata.

**Server**: `src/server.mjs` viene copiato in `dist/` e serve la cartella in cui si trova: gzip, CSS e JS con hash generati da Vite in `assets/` in cache per un anno (`immutable`), `no-cache` per HTML/MD/CSS/JS, un giorno per immagini e PDF, 404 con la pagina `404.html` (file in `/assets/` mancanti: 404 semplice, mai in cache); `/server.mjs` non è scaricabile. Esporta l'app e chiama `listen` solo se avviato direttamente.

**Vercel**: `api/index.mjs` riesporta l'app di `dist/server.mjs` come funzione serverless e `vercel.json` (`framework: null`, `buildCommand: npm run build`) instrada con `routes` ogni richiesta a quella funzione, includendo `dist/**` nel suo bundle (`includeFiles`). Il sito pubblica e serve solo `dist/`; `.vercelignore` esclude `dist/` e `node_modules/` (ricreate da Vercel con install e build).

Si modificano sempre i sorgenti in `src/`, mai `dist/`. I percorsi negli HTML e nei JS sono relativi alla pagina (es. da `src/pages/ccaf/studio.html`: `../../css/style.css`, `../../assets/ccaf/guide/…`); i link `./studio.html?doc=…` nei Markdown restano relativi alla pagina che li mostra. `dist/` e `node_modules/` sono in `.gitignore`.

I Markdown dei materiali non hanno più un PDF accanto: gli unici PDF rimasti sono le slide (`appunti/presentazioni/`) e i documenti ufficiali Anthropic in `src/assets/ccaf/`.

## Architettura

- `src/index.html` — **portale** di tutte le certificazioni (`body.page-home.page-portal`): una scheda `.path` per ogni certificazione. Ogni certificazione ha una home `src/pages/<sigla>.html` (oggi solo `src/pages/ccaf.html`) e le sue pagine in `src/pages/<sigla>/`; i suoi Markdown e PDF stanno in `src/assets/<sigla>/`. Per aggiungerne una: nuova home e cartella in `src/pages/`, nuova scheda nel portale.
- `src/pages/ccaf.html` — home della certificazione CCA-F (`body.page-home`): avviso fisso sugli aggiornamenti d'esame (`.home-alert`, non chiudibile; titolo e testo dalle variabili d'ambiente `BANNER_TITLE` e `BANNER_CONTENT`, inserite in build dal plugin `banner` di `vite.config.mjs`; senza `BANNER_TITLE` il banner è rimosso), logo e titolo, dati riassuntivi (domini, scenari, durata, numero di domande, scritti a mano) e i link alle tre pagine.
- **Header**: nel portale solo la scritta "Certificazioni Anthropic", senza logo. Nelle pagine di una certificazione logo + nome esteso (es. "Claude Certified Architect<br />Foundations"); su mobile il nome è sostituito via CSS (`::after` con `attr(data-short)`) dalla sigla indicata in `data-short` sullo `.brand-name` (es. `data-short="CCA-F"`). Il logo porta sempre al portale.
- `src/css/style.css` — stili **condivisi** (usati da più pagine), divisi in sezioni numerate (token, componenti condivisi, home, elementi comuni studio/esame, pagine d'esame `page-exam`, tema scuro `:root[data-theme="dark"]`, stampa). Le regole che valgono per **una sola pagina** (anche le loro varianti per tema scuro, `@media` e stampa) vanno in `src/css/ccaf/<pagina>.css` (`studio.css`, `allenamento.css`, `simulazione.css`). Ogni CSS di pagina comincia con `@import "../style.css";` e la pagina collega **solo** il proprio CSS: così Vite produce un unico file con le regole condivise prima di quelle della pagina. Con due `<link>` separati, nella build Vite caricherebbe il CSS condiviso (chunk comune) *dopo* quello della pagina, invertendo la cascata. Le home (`index.html`, `pages/ccaf.html`) collegano direttamente `style.css`.
  - **Colori**: il colore principale è il coral (`--coral: #b85a43`), esposto come `--primary`, `--primary-dark`, `--primary-pale`; usare questi token per link, pulsanti e stati attivi. Il verde (`--green*`) è riservato a risposte corrette ed esito superato. Entrambi i temi usano grigi neutri (header `--forest`, grigio scuro), senza tinte verdi.
  - **Pulsanti**: `.button` è il principale (coral pieno); `.button.secondary` è trasparente con bordo e testo coral. Non introdurre varianti di colore per singole pagine o schede.
  - **Responsive**: breakpoint a 1080, 760 e 480 px. Sotto 760 px i pulsanti Home/Feedback diventano solo icone.
- `src/js/theme.js` — incluso da ogni pagina. Gestisce il tema chiaro/scuro (salvato in `localStorage`) e **inietta nella `.topbar-actions` gli elementi comuni** (link **Home**: nelle pagine di una certificazione porta alla sua home, indicata da `data-home` sul `<body>`; nella home della certificazione porta al portale; assente nel portale (`page-portal`); pulsante tema; pulsante "Segnala / Feedback" che apre un popup per scegliere tra il modulo di segnalazione/feedback e il questionario facoltativo, entrambi Google Forms con account Google per poter rispondere via email; elenco in `FEEDBACK_FORMS`). Gli elementi che devono essere identici in tutte le pagine vanno aggiunti qui, non duplicati nei singoli HTML.
- `src/js/dialog.js` — modulo ES con `confirmDialog()` e `alertDialog()` (Promise) basati su `<dialog>`, con lo stile del sito (`.site-dialog` in `style.css`). Va usato **al posto di `window.alert` / `window.confirm`**: `if (await confirmDialog({ title, message, confirmLabel })) …`; Esc o clic fuori annullano.
- `src/assets/` — file statici condivisi senza elaborazione (immagini come il logo `ccaf.png`), copiati così come sono nella build.

Ogni pagina di `src/pages/ccaf/` (studio, simulazione, allenamento) è autonoma e ha `data-home="../ccaf.html"` sul `<body>`: il markup è nell’HTML e la logica parte da un punto d’ingresso snello `src/js/ccaf/<pagina>.js` (modulo ES, `<script type="module">` in fondo al `<body>`) che importa i moduli della cartella `src/js/ccaf/<pagina>/` (uno per responsabilità, max 300 righe; lo stato condiviso è un unico oggetto `state` in `state.js`), con il proprio parser Markdown minimale (non una libreria). Le utilità identiche tra pagine (`escapeHtml`, `shuffle`) stanno in `src/js/utils.js`. Gli HTML devono restare il più snelli possibile: niente `<script>` né `<style>` inline e niente attributi `style=`. Gli stili specifici di una pagina vanno in `src/css/ccaf/<pagina>.css` (vedi sopra), i testi lunghi in file Markdown caricati con `fetch()` (es. `src/assets/ccaf/guida-formato.md`, la guida al formato mostrata nella schermata iniziale di `simulazione.html`). Se cambi la sintassi supportata in una pagina, le altre non ne beneficiano.

- `studio.html` — lettore dei materiali. L'array `documents` in `src/js/ccaf/studio/documents.js` è il catalogo: ogni voce ha `id`, `title`, `group`, `path` (Markdown), opzionale `slidesPdf` (pulsante "Presentazione"), `index` (etichetta nel menu) e `external: true` per link aperti in una nuova scheda. **L'ordine dei gruppi nel menu laterale e la navigazione precedente/successivo derivano dall'ordine dell'array.** Gruppi attuali: Orientamento, Domini d'esame, Domini approfonditi, Approfondimenti, Esercitazioni, Trappole d'esame, Riferimenti. Il documento aperto è nell'URL (`?doc=<id>#<sezione>`); nei Markdown i link `./studio.html?doc=<id>#<id-titolo>` aprono un altro documento senza ricaricare (l'id del titolo è lo slug generato da `slugify`, quindi rinominare un titolo rompe i link che puntano a esso).
- `simulazione.html` — simulazione d'esame a tempo. Elenco esplicito dei test (array con `file:` verso `../../assets/ccaf/questions/…`), più caricamento di un Markdown dall'utente. Sessione e storico in `localStorage`.
- `allenamento.html` — quiz di allenamento che pesca domande da tutte le banche. Scopre i test automaticamente provando `../../assets/ccaf/questions/Domande e risposte test N - Claude Certified Architect.md` per N crescente, fermandosi dopo due numeri consecutivi mancanti. Ogni risposta confermata è salvata in `localStorage` (`ccaf-training-answers`, max 5000: data, sessione, chiave `test-domanda`, scenario, difficoltà, esito) e alimenta la schermata **Statistiche** (andamento per sessione con soglia 72%, per scenario, per difficoltà, domande sbagliate più spesso).

Quindi un nuovo file di test va nominato secondo quello schema; per vederlo in `simulazione.html` va anche aggiunto al suo array.

## Formato dei contenuti

- Formato delle banche quesiti: `src/assets/ccaf/formato-test.md` (specifica) e `template-test.md` (modello). In breve: frontmatter YAML (`title`, `duration_minutes`), `## Scenario: …`, `### Question N`, opzioni `- **A.** …`, e `#### Correct answer…: X` con spiegazione.
- Struttura dei materiali di studio (tutti in `src/assets/ccaf/`, insieme ai PDF e alle banche quesiti `questions/`): `guide/` (guida d'esame, pre-corso, vocabolario), `appunti/` (spiegazioni e verifiche per dominio; `domains/` approfondimenti tecnici per dominio; `presentazioni/` slide PDF; `approfondimenti/` temi trasversali), `consigli/` (trappole d'esame).
- I domini d'esame sono indicati come D1–D5 in tutto il materiale (es. il vocabolario tagga ogni voce con il dominio).

## Convenzioni

- Commit in stile Conventional Commits, di solito in italiano (`feat: …`, `fix: …`, `refactor: …`).
