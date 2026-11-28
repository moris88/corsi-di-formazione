# PC2 · Node.js, npm e variabili d'ambiente

## Perché serve all'esame

Node.js è l'ambiente in cui girano gli agenti, i server MCP e gli script di integrazione scritti in TypeScript. Anche chi lavora in Python ritrova gli stessi concetti: un processo, variabili d'ambiente, un gestore di pacchetti, input e output standard.

| Dove compare | Cosa chiede l'esame | Dominio |
| --- | --- | --- |
| Chiave API letta dall'ambiente | Non scriverla nel codice né nel repository | [D7](./studio.html?doc=domain-7) |
| Server MCP con trasporto stdio | Mai scrivere su stdout, solo su stderr | [D8](./studio.html?doc=domain-8) |
| Hook di Claude Code | Leggere il JSON da stdin e usare i codici di uscita | [D7](./studio.html?doc=domain-7), [D1](./studio.html?doc=domain-1) |
| `package.json`, `npm`, versioni | Dipendenze fissate e riproducibili | [D2](./studio.html?doc=domain-2) |
| Modalità headless in CI | Eseguire Claude Code da script e pipeline | [D3](./studio.html?doc=domain-3) |

---

## 1. Che cos'è Node.js

Node.js è un ambiente che esegue JavaScript **fuori dal browser**. Un programma Node gira in un solo processo e usa operazioni di ingresso e uscita **non bloccanti**: mentre aspetta la rete, può gestire altro. Per questo le chiamate all'API sono `async` e conviene capire l'event loop solo a grandi linee: una coda di compiti in attesa, svuotata un pezzo alla volta.

```bash
node --version   # verifica l'installazione
node script.mjs  # esegue un file
```

Si consiglia la versione **LTS** (a supporto a lungo termine): è la più stabile per i progetti di produzione.

## 2. `package.json` e npm

`npm` installa le dipendenze e lancia gli script. Il file `package.json` descrive il progetto.

```json
{
  "name": "mio-agente",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^1.8.0"
  }
}
```

- `"type": "module"` fa trattare i file `.js` come moduli ES (`import`/`export`).
- `npm install` legge `package.json` e scrive il file **`package-lock.json`**, che fissa le versioni esatte: va **versionato** insieme al codice, così ogni ambiente installa le stesse versioni.
- `^1.8.0` accetta aggiornamenti compatibili (stessa versione maggiore). Un aggiornamento maggiore può rompere il codice, quindi si aggiorna con test e revisione.
- `npm run start` esegue lo script `start`; `npx comando` esegue un programma senza installarlo in modo permanente.
- La cartella `node_modules/` si ricrea con `npm install`: non si versiona.

> Per i **modelli** vale lo stesso principio delle dipendenze: si fissa la versione del modello usata (vedi "versioni fissate" nel [dominio 2](./studio.html?doc=domain-2)) e si controllano i cambiamenti con valutazioni di regressione.

## 3. Variabili d'ambiente e segreti

Una **variabile d'ambiente** è un valore passato al processo dall'esterno. Le chiavi API stanno lì, non nel codice.

```bash
# macOS e Linux
export ANTHROPIC_API_KEY="..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY = "..."
```

```typescript
const chiave = process.env.ANTHROPIC_API_KEY;
if (!chiave) {
  console.error("Manca ANTHROPIC_API_KEY");
  process.exit(1); // codice di uscita diverso da 0: errore
}
```

Gli SDK ufficiali leggono `ANTHROPIC_API_KEY` da soli, quindi spesso non serve passarla a mano. Nelle versioni recenti di Node si può caricare un file `.env` all'avvio con l'opzione `--env-file=.env`.

Regole che l'esame mette alla prova ([dominio 7](./studio.html?doc=domain-7)):

- il file `.env` va nel `.gitignore` e **non si versiona mai**;
- un segreto non finisce nel prompt, nei log né nel codice che gira nel browser;
- ambienti diversi (sviluppo, produzione) hanno chiavi diverse e limitate al loro scopo;
- una chiave esposta si **revoca e si sostituisce**: cancellarla dal codice non basta (vedi [PC3](./studio.html?doc=pc-git)).

## 4. Input e output standard, codici di uscita

Ogni processo ha tre canali: **stdin** (ingresso), **stdout** (uscita normale) e **stderr** (uscita per errori e log). Alla fine termina con un **codice di uscita**: `0` significa successo, un altro numero significa errore.

```typescript
// Legge tutto ciò che arriva da stdin
async function leggiStdin(): Promise<string> {
  let testo = "";
  process.stdin.setEncoding("utf8");
  for await (const pezzo of process.stdin) testo += pezzo;
  return testo;
}

const evento: unknown = JSON.parse(await leggiStdin());
console.error("Evento ricevuto"); // i log vanno su stderr
```

Questo spiega due temi d'esame:

1. **Hook di Claude Code.** Uno script riceve su stdin un JSON che descrive l'evento. Con codice di uscita `0` l'azione prosegue; con codice `2` l'hook **blocca** l'azione e il testo scritto su stderr viene restituito a Claude come motivo ([dominio 7](./studio.html?doc=domain-7)).
2. **Server MCP stdio.** Il client e il server si scambiano messaggi JSON sul canale stdout/stdin. Un `console.log` di debug sullo stdout **corrompe** quei messaggi: i log vanno su stderr ([dominio 8](./studio.html?doc=domain-8)).

## 5. Moduli ES e CommonJS

Node accetta due sistemi di moduli:

| | ES modules | CommonJS |
| --- | --- | --- |
| Sintassi | `import x from "y"` / `export` | `require("y")` / `module.exports` |
| Attivazione | `"type": "module"` o estensione `.mjs` | impostazione predefinita nei progetti più vecchi |
| `await` al livello più alto | sì | no |

Gli esempi dei domini usano i moduli ES. Gli import dei moduli integrati si scrivono con il prefisso `node:`.

```typescript
import { readFile } from "node:fs/promises";

const contenuto = await readFile("note.txt", "utf8");
```

## 6. `fetch` e stream

Node include `fetch` come funzione globale: è sufficiente per chiamare l'API anche senza SDK (vedi [PC4](./studio.html?doc=pc-http-api)). Il corpo di una risposta si legge con `await risposta.json()` o come flusso, pezzo per pezzo, con `for await`.

---

## Mini-laboratorio (30–45 minuti)

1. Crea una cartella, esegui `npm init -y`, imposta `"type": "module"` e aggiungi uno script `start`.
2. Scrivi uno script che legge `ANTHROPIC_API_KEY` e termina con codice `1` e un messaggio su stderr se manca. Controlla il codice di uscita con `echo $?` (PowerShell: `$LASTEXITCODE`).
3. Scrivi uno script che legge un JSON da stdin, stampa su stderr un log e su stdout il risultato. Provalo con `echo '{"azione":"prova"}' | node script.mjs`.
4. Aggiungi `.env` al `.gitignore` e verifica con `git status` che non venga proposto per il commit.

## Controlla di saper

- spiegare a che cosa serve `package-lock.json` e perché si versiona;
- leggere una chiave dall'ambiente e gestire il caso in cui manca;
- distinguere stdin, stdout e stderr e dire dove vanno i log;
- dire che cosa significano i codici di uscita `0` e `2` in un hook.

## Dove studiare

- [Learn Node.js](https://nodejs.org/learn): percorso ufficiale con avvio, riga di comando, HTTP, file system, lavoro asincrono, TypeScript e test.
- [Introduzione a Node.js](https://nodejs.org/learn/getting-started/introduction-to-nodejs) e [Quanto JavaScript serve per usare Node.js](https://nodejs.org/learn/getting-started/how-much-javascript-do-you-need-to-know-to-use-nodejs).
- [Build an MCP server](https://modelcontextprotocol.io/docs/develop/build-server): la guida ufficiale per costruire un server MCP.
- Elenco completo in [Dove studiare](./studio.html?doc=pc-risorse).
