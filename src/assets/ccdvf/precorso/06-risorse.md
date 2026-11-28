# PC6 · Dove studiare: link ufficiali

Tutti i link puntano a documentazione **ufficiale** o a risorse di riferimento dei progetti. Sono quasi tutti in inglese, come l'esame; fanno eccezione il libro su Git, tradotto in parte in italiano, e alcune pagine di Claude Code su `code.claude.com`, che hanno una versione italiana sostituendo `en` con `it` nell'indirizzo, quando disponibile.

I link sono ricavati dalla documentazione ufficiale e dalle fonti dei domini (novembre 2026). Le documentazioni cambiano in fretta: se una pagina si sposta, cerca il titolo dal sito principale.

---

## TypeScript

Modulo di riferimento: [PC1](./studio.html?doc=pc-typescript).

| Risorsa | A chi serve | Da dove partire |
| --- | --- | --- |
| [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) | Tutti | Introduzione e guida adatta al tuo profilo |
| [TypeScript per programmatori JavaScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) | Chi conosce già JavaScript | Intera pagina: è breve |
| [TypeScript per chi inizia a programmare](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) | Chi parte da zero | Intera pagina |
| [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) | Tutti | Primo capitolo del manuale |
| [TypeScript con Node.js](https://nodejs.org/learn) | Chi esegue TypeScript con Node | Sezione "TypeScript" della guida di Node |

Argomenti da cercare nel manuale: **unioni**, **narrowing**, **generici**, **`unknown`** e moduli.

## Node.js e npm

Modulo di riferimento: [PC2](./studio.html?doc=pc-node).

| Risorsa | A chi serve | Da dove partire |
| --- | --- | --- |
| [Learn Node.js](https://nodejs.org/learn) | Tutti | Avvio, riga di comando, HTTP, file system, lavoro asincrono |
| [Introduzione a Node.js](https://nodejs.org/learn/getting-started/introduction-to-nodejs) | Chi inizia | Intera pagina |
| [Quanto JavaScript serve per usare Node.js](https://nodejs.org/learn/getting-started/how-much-javascript-do-you-need-to-know-to-use-nodejs) | Chi vuole misurare le lacune | Elenco degli argomenti consigliati |
| [Operazioni asincrone in JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) | Chi non è sicuro di `Promise` e `await` | Intera pagina |
| [`async function` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) e [`await` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) | Chi vuole il dettaglio | Descrizione e sintassi |

## Git

Modulo di riferimento: [PC3](./studio.html?doc=pc-git).

| Risorsa | A chi serve | Da dove partire |
| --- | --- | --- |
| [Pro Git in italiano](https://git-scm.com/book/it/v2) | Tutti | Capitolo 1 (introduzione), capitolo 2 (basi), capitolo 3 (rami) |
| [Git: Learn](https://git-scm.com/learn) | Chi preferisce video e schede riassuntive | Libro, video e cheat sheet |

Comandi da saper usare senza cercarli: `status`, `add`, `commit`, `log`, `diff`, `switch`, `push`, `pull`, `revert`, `restore`, `stash`. Concetti: rami, pull request, `.gitignore`.

## API: HTTP, JSON e Claude API

Modulo di riferimento: [PC4](./studio.html?doc=pc-http-api).

| Risorsa | A chi serve | Da dove partire |
| --- | --- | --- |
| [Panoramica di HTTP (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) | Chi non ha mai letto una richiesta HTTP | Intera pagina |
| [Lavorare con JSON (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON) | Chi vuole ripassare il formato | Intera pagina |
| [Usare la Fetch API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | Chi chiama API da JavaScript | Controllo dello stato e lettura del corpo |
| [Panoramica dell'API di Claude](https://platform.claude.com/docs/en/api/overview) | Tutti | Riferimento dell'API |
| [Errori dell'API](https://platform.claude.com/docs/en/api/errors) | Tutti | Tipi di errore e codici |
| [Streaming dei messaggi](https://platform.claude.com/docs/en/build-with-claude/streaming) | Tutti | Ordine degli eventi |
| [Stop reason](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) | Tutti | Che cosa fare per ciascun motivo di arresto |
| [Autenticazione](https://platform.claude.com/docs/en/manage-claude/authentication) | Chi gestisce chiavi e accessi | Tipi di chiave e buone pratiche |

## SDK

Modulo di riferimento: [PC5](./studio.html?doc=pc-sdk).

| Risorsa | A chi serve | Da dove partire |
| --- | --- | --- |
| [Get started with Claude](https://platform.claude.com/docs/en/get-started) | Chi non ha mai chiamato l'API | Installazione, chiave e prima richiesta |
| [SDK, CLI e librerie](https://platform.claude.com/docs/en/cli-sdks-libraries/overview) | Tutti | Elenco degli SDK per linguaggio |
| [SDK TypeScript](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript) | Chi usa Node, Deno, Bun o il browser | Installazione e configurazione |
| [Agent SDK: panoramica](https://code.claude.com/docs/en/agent-sdk/overview) | Chi costruisce agenti | Confronto con gli altri strumenti e avvio rapido |
| [Agent SDK: riferimento TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript) | Chi scrive agenti in TypeScript | Installazione e funzioni principali |
| [Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) | Chi valuta agenti ospitati | Panoramica |
| [Tool use con Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) | Chi definisce strumenti | Panoramica e definizione degli strumenti |

## Per chi vuole andare oltre

| Argomento | Risorsa | Dominio |
| --- | --- | --- |
| Agenti | [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | [D1](./studio.html?doc=domain-1) |
| Contesto | [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | [D6](./studio.html?doc=domain-6) |
| Claude Code | [Run Claude Code programmatically](https://code.claude.com/docs/en/headless) | [D3](./studio.html?doc=domain-3) |
| Hook | [Hooks reference](https://code.claude.com/docs/en/hooks) | [D7](./studio.html?doc=domain-7) |
| MCP | [Build an MCP server](https://modelcontextprotocol.io/docs/develop/build-server) | [D8](./studio.html?doc=domain-8) |
| Corsi | [Anthropic Academy](https://anthropic.skilljar.com/): "Building with the Claude API", "Claude Code in Action", "Introduction to Model Context Protocol" | D1, D2, D3, D8 |

---

## Un percorso minimo

Se hai poco tempo, questo è l'insieme più utile per l'esame:

1. [TypeScript per programmatori JavaScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html), poi la sezione sulle unioni e sul narrowing del manuale.
2. [Introduzione a Node.js](https://nodejs.org/learn/getting-started/introduction-to-nodejs) e le pagine MDN su `async`/`await`.
3. I capitoli 1–3 di [Pro Git](https://git-scm.com/book/it/v2).
4. [Panoramica di HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) e [errori dell'API](https://platform.claude.com/docs/en/api/errors).
5. [Get started with Claude](https://platform.claude.com/docs/en/get-started) e la pagina dell'[SDK TypeScript](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript).
6. La [panoramica dell'Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview).

Poi torna alla [mappa del pre-corso](./studio.html?doc=precorso) e passa ai [domini](./studio.html?doc=domain-1).
