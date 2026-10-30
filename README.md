# Corsi Anthropic · Materiali di studio

Appunti, riassunti ed esercitazioni in italiano sui corsi Anthropic, con un portale web per prepararsi alla certificazione **Claude Certified Architect — Foundations (CCA-F)**.

## Contenuti

| Cartella | Cosa contiene |
| --- | --- |
| [CCA-F](CCA-F/) | Portale di studio con guida d'esame, materiali per i cinque domini, simulazioni d'esame e quiz di allenamento |
| [Competenza nell'IA – Quadro di riferimento e fondamenti](Competenza%20nell'IA%20–%20Quadro%20di%20riferimento%20e%20fondamenti/) | Appunti sul corso AI Fluency |
| [Fondamenti della Piattaforma e dei Modelli di Claude](Fondamenti%20della%20Piattaforma%20e%20dei%20Modelli%20di%20Claude/) | Panoramica della piattaforma e dei modelli Claude |
| [Introduzione agli agent skills](Introduzione%20agli%20agent%20skills/) | Appunti sulle Agent Skills |
| [Sviluppo con l'API di Claude](Sviluppo%20con%20l'API%20di%20Claude/) | Raccolta completa sul corso dell'API di Claude e notebook Jupyter degli esercizi (cartella `Download`) |

Ogni argomento è disponibile in Markdown e in PDF.

## Portale delle certificazioni

La pagina iniziale ([index.html](index.html)) raccoglie tutte le certificazioni: ognuna ha una propria cartella con la sua home. Per ora è disponibile **Claude Certified Architect — Foundations** ([CCA-F](CCA-F/index.html)), che ha tre sezioni:

- **Studio** (`studio.html`): legge i materiali organizzati per sezione: orientamento (guida d'esame, pre-corso con i prerequisiti tecnici, vocabolario), domini d'esame, approfondimenti, esercitazioni, trappole d'esame e riferimenti ufficiali. Molti articoli si possono scaricare in PDF.
- **Simulazione** (`simulazione.html`): test completi a tempo, come all'esame, con correzione e storico dei risultati. Si possono caricare anche test propri in Markdown (vedi [formato-test.md](CCA-F/formato-test.md)).
- **Allenamento** (`allenamento.html`): quiz brevi con domande prese da tutte le banche disponibili.

Le domande delle simulazioni sono in inglese, come all'esame reale; tutti gli altri materiali sono in italiano.

L'interfaccia ha tema chiaro e scuro, è pensata anche per smartphone e in ogni pagina ha un pulsante **Home** per tornare alla pagina iniziale.

### Come avviarlo in locale

Il portale è un sito statico (HTML, CSS e JavaScript), ma carica i file Markdown dal disco: va aperto tramite un server e non con doppio clic sul file. Dalla cartella principale del repository:

```bash
npx serve .
```

Poi apri nel browser l'indirizzo indicato dal comando scegli la certificazione e poi la sezione. In questo modo lavori direttamente sui file sorgente: è il modo più comodo mentre modifichi i contenuti.

### Avvio con Express (versione minimizzata)

Per pubblicare il sito c'è un server [Express](https://expressjs.com/) che serve una versione minimizzata, con compressione gzip e cache. Serve Node.js 18 o successivo:

```bash
npm install
npm run build   # crea dist/ con HTML, CSS e JavaScript minimizzati
npm start       # avvia il server su http://localhost:3000
```

`npm run serve` esegue build e avvio in un unico comando. Mentre lavori sul sito usa `npm run dev`: con [nodemon](https://nodemon.io/) rifà la build e riavvia il server da solo a ogni modifica dei file (basta ricaricare la pagina nel browser). Per usare un'altra porta imposta la variabile `PORT` (es. `PORT=8080 npm start`).

Su **Vercel** il sito è pubblicato come statico: `vercel.json` esegue `npm run build` e pubblica `dist/`, senza Express (che in `.vercelignore` è escluso dal deploy).

La cartella `dist/` viene rigenerata da zero a ogni build e non è versionata: dopo una modifica ai file del sito rilancia `npm run build`.

## Segnalazioni e feedback

Hai trovato un errore o hai un suggerimento? [Apri una issue su GitHub](https://github.com/moris88/corsi-di-formazione/issues). Lo stesso link è presente in ogni pagina del portale, nel pulsante **Segnala / Feedback**.

## Nota

Materiale di studio personale, non ufficiale e non affiliato ad Anthropic. Per le informazioni ufficiali sull'esame fanno fede i documenti Anthropic raccolti nella sezione *Riferimenti* del portale.
