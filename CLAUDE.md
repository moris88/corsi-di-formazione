# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cos'è questo repository

Materiali di studio in italiano sui corsi Anthropic. La parte "applicativa" è un piccolo sito statico per la preparazione alla certificazione **Claude Certified Architect — Foundations (CCA-F)**; le altre cartelle tematiche (`Sviluppo con l'API di Claude/`, `Introduzione agli agent skills/`, ecc.) contengono solo appunti Markdown, PDF e notebook.

Tutti i contenuti e i testi dell'interfaccia sono in **italiano**; le banche quesiti in `CCA-F/questions/` sono in **inglese** (come l'esame reale).

## Esecuzione

HTML/CSS/JS vanilla, nessun framework e nessun test. Le uniche dipendenze npm servono al server Express e alla build di minimizzazione; i sorgenti funzionano anche senza.

Le pagine caricano i Markdown con `fetch()`, quindi vanno servite da un server (da `file://` il caricamento fallisce). In sviluppo, sui sorgenti, dalla radice del repo:

```bash
npx serve .        # oppure: python -m http.server
```

In produzione il sito è servito da Express (`server.mjs`: gzip, `Cache-Control` no-cache per HTML/MD/CSS/JS e un giorno per immagini e PDF, 404 con la home) a partire dalla build minimizzata in `dist/` (non versionata):

```bash
npm install
npm run build      # scripts/build.mjs: copia index.html, src/, public/ e CCA-F/ in dist/ minimizzando HTML (con CSS inline), CSS e JS
npm start          # http://localhost:3000 (porta da PORT)
npm run serve      # build + start
npm run dev        # nodemon (nodemon.json): a ogni modifica di index.html, src/, public/, CCA-F/, server.mjs o scripts/ rifà la build e riavvia il server
```

Su Vercel non gira Express: `vercel.json` (`framework: null`, `buildCommand: npm run build`, `outputDirectory: dist`) pubblica `dist/` come sito statico e replica le intestazioni di cache; `.vercelignore` esclude `server.mjs`, `nodemon.json` e `others/` dal deploy. Senza `vercel.json` Vercel tratterebbe il progetto come app Express (dove `express.static` non è usato) o pubblicherebbe solo `public/`, e il CSS non verrebbe servito.

Dopo ogni modifica ai sorgenti va rieseguito `npm run build`; si modificano sempre i sorgenti, mai `dist/`. Solo `index.html`, `src/`, `public/` e `CCA-F/` finiscono in `dist/`: un nuovo file o cartella pubblica fuori da questi va aggiunto all'array `entries` di `scripts/build.mjs`. Terser accorcia i nomi locali ma non quelli globali degli script.

I PDF accanto ai Markdown vengono generati a mano con l'estensione VS Code *Markdown PDF* (vedi `.vscode/settings.json`): quando modifichi un `.md` che ha un PDF collegato, il PDF va rigenerato dall'utente.

## Architettura

- `index.html` (radice) — **portale** di tutte le certificazioni (`body.page-home.page-portal`): una scheda `.path` per ogni certificazione. Ogni certificazione vive in una propria cartella (oggi solo `CCA-F/`) con la sua `index.html`; per aggiungerne una: nuova cartella, nuova scheda nel portale, nuova voce in `entries` di `scripts/build.mjs`.
- `CCA-F/index.html` — home della certificazione CCA-F (`body.page-home`): avviso fisso sugli aggiornamenti d'esame (`.home-alert`, non chiudibile), logo e titolo, dati riassuntivi (domini, scenari, durata, numero di domande, scritti a mano) e i link alle tre pagine.
- **Header**: nel portale solo la scritta "Certificazioni Anthropic", senza logo. Nelle pagine di una certificazione logo + nome esteso (es. "Claude Certified Architect<br />Foundations"); su mobile il nome è sostituito via CSS (`::after` con `attr(data-short)`) dalla sigla indicata in `data-short` sullo `.brand-name` (es. `data-short="CCA-F"`). Il logo porta sempre al portale.
- `src/css/style.css` — un unico foglio di stile condiviso da tutte le pagine, diviso in sezioni numerate (componenti condivisi, pagine, tema scuro `:root[data-theme="dark"]`, stampa).
  - **Colori**: il colore principale è il coral (`--coral: #b85a43`), esposto come `--primary`, `--primary-dark`, `--primary-pale`; usare questi token per link, pulsanti e stati attivi. Il verde (`--green*`) è riservato a risposte corrette ed esito superato. Entrambi i temi usano grigi neutri (header `--forest`, grigio scuro), senza tinte verdi.
  - **Pulsanti**: `.button` è il principale (coral pieno); `.button.secondary` è trasparente con bordo e testo coral. Non introdurre varianti di colore per singole pagine o schede.
  - **Responsive**: breakpoint a 1080, 760 e 480 px. Sotto 760 px i pulsanti Home/Feedback diventano solo icone.
- `src/js/theme.js` — incluso da ogni pagina. Gestisce il tema chiaro/scuro (salvato in `localStorage`) e **inietta nella `.topbar-actions` gli elementi comuni** (link **Home**: nelle pagine di una certificazione porta alla sua home, indicata da `data-home` sul `<body>`; nella home della certificazione porta al portale; assente nel portale (`page-portal`); pulsante tema; link "Segnala / Feedback" alle issue GitHub). Gli elementi che devono essere identici in tutte le pagine vanno aggiunti qui, non duplicati nei singoli HTML.
- `public/` — file statici condivisi senza elaborazione (immagini come il logo `blob.png`), copiati così come sono nella build.

Ogni pagina di `CCA-F/` (studio, simulazione, allenamento) è autonoma e ha `data-home="index.html"` sul `<body>`: il markup è nell’HTML e la logica in un proprio file `src/js/cca-f/<pagina>.js` (script classico, non modulo, caricato in fondo al `<body>`), con il proprio parser Markdown minimale (non una libreria). Gli HTML devono restare il più snelli possibile: niente `<script>` né `<style>` inline e niente attributi `style=`. Gli stili specifici di una pagina vanno in `src/css/cca-f/<pagina>.css` (caricato dopo `style.css`; oggi `allenamento.css` e `simulazione.css`), i testi lunghi in file Markdown caricati con `fetch()` (es. `CCA-F/guida-formato.md`, la guida al formato mostrata nella schermata iniziale di `simulazione.html`). Se cambi la sintassi supportata in una pagina, le altre non ne beneficiano.

- `studio.html` — lettore dei materiali. L'array `documents` in `src/js/cca-f/studio.js` è il catalogo: ogni voce ha `id`, `title`, `group`, `path` (Markdown), opzionali `pdf` / `slidesPdf` (pulsanti di download) e `deep` (id di un altro documento, aperto dal pulsante "Approfondisci"), `index` (etichetta nel menu) e `external: true` per link aperti in una nuova scheda. **L'ordine dei gruppi nel menu laterale e la navigazione precedente/successivo derivano dall'ordine dell'array.** Gruppi attuali: Orientamento, Domini d'esame, Domini approfonditi, Approfondimenti, Esercitazioni, Trappole d'esame, Riferimenti. Il documento aperto è nell'URL (`?doc=<id>#<sezione>`); nei Markdown i link `./studio.html?doc=<id>#<id-titolo>` aprono un altro documento senza ricaricare (l'id del titolo è lo slug generato da `slugify`, quindi rinominare un titolo rompe i link che puntano a esso).
- `simulazione.html` — simulazione d'esame a tempo. Elenco esplicito dei test (array con `file:` verso `questions/…`), più caricamento di un Markdown dall'utente. Sessione e storico in `localStorage`.
- `allenamento.html` — quiz di allenamento che pesca domande da tutte le banche. Scopre i test automaticamente provando `questions/Domande e risposte test N - Claude Certified Architect.md` per N crescente, fermandosi dopo due numeri consecutivi mancanti.

Quindi un nuovo file di test va nominato secondo quello schema; per vederlo in `simulazione.html` va anche aggiunto al suo array.

## Formato dei contenuti

- Formato delle banche quesiti: `CCA-F/formato-test.md` (specifica) e `template-test.md` (modello). In breve: frontmatter YAML (`title`, `duration_minutes`), `## Scenario: …`, `### Question N`, opzioni `- **A.** …`, e `#### Correct answer…: X` con spiegazione.
- Struttura dei materiali di studio: `guide/` (guida d'esame, pre-corso, vocabolario), `appunti/` (spiegazioni e verifiche per dominio; `domains/` approfondimenti tecnici per dominio; `presentazioni/` slide PDF; `approfondimenti/` temi trasversali), `consigli/` (trappole d'esame).
- I domini d'esame sono indicati come D1–D5 in tutto il materiale (es. il vocabolario tagga ogni voce con il dominio).

## Convenzioni

- Commit in stile Conventional Commits, di solito in italiano (`feat: …`, `fix: …`, `refactor: …`).
