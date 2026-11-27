# Dominio 5: scelta e ottimizzazione dei modelli (16,8%)

Il secondo dominio per peso. Parte da come funziona un LLM, passa per le opzioni che controllano il ragionamento, arriva alla scelta del modello e al controllo di token e costi.

| Competenza | Peso sull'esame |
| --- | --- |
| Fondamenti degli LLM | 5,2% |
| Fondamenti tecnici | 6,1% |
| Scelta del modello e compromessi | 2,7% |
| Gestione di costi e token | 2,8% |

> Modelli, prezzi e parametri cambiano spesso: i valori di questa pagina sono verificati sulla documentazione ufficiale Anthropic a novembre 2026. Prima dell'esame conviene ricontrollare la pagina *Models overview*.

---

## 5.1 Fondamenti degli LLM (5,2%)

### Token

Il modello non legge caratteri ma **token**, pezzi di testo. Con il tokenizer attuale (introdotto con Claude Opus 4.7) 1 milione di token corrisponde a circa 555.000 parole. Tutto si misura in token: la finestra di contesto, il limite di output, i prezzi e i limiti di frequenza.

### Generazione del token successivo e campionamento

Un LLM genera la risposta **un token alla volta**: a ogni passo calcola una distribuzione di probabilità sul token successivo e ne **campiona** uno. Per questo le risposte **non sono deterministiche**: la stessa richiesta può dare risposte diverse.

Storicamente il campionamento si regolava con `temperature`, `top_p` e `top_k`. Sui modelli attuali (Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.2 e altri) valori diversi dai predefiniti restituiscono **errore 400**, e dalla versione API `2026-10-21` qualunque valore di questi parametri dà errore 400 su tutti i modelli. La variabilità si governa con il prompt, gli esempi, l'output strutturato e l'effort; la coerenza si verifica con le eval su più esecuzioni.

### Finestra di contesto

La finestra di contesto è la "memoria di lavoro" del modello: comprende prompt di sistema, messaggi, risultati degli strumenti, definizioni degli strumenti **e** l'output generato, pensiero compreso. Tutti i modelli attuali hanno **1M di token** di contesto e fino a **128K token** di output per richiesta. Più contesto non è automaticamente meglio: con l'aumentare dei token l'accuratezza nel richiamare le informazioni cala (*context rot*). Vedi il [dominio 6](./studio.html?doc=domain-6).

### Opzioni del modello: pensiero ed effort

**Pensiero adattivo** (adaptive thinking): il modello decide se e quanto pensare prima di rispondere. Sui modelli Claude 5 è attivo per impostazione predefinita.

| Modello | Pensiero | Si può disattivare? |
| --- | --- | --- |
| Opus 5.5 | Adattivo, sempre attivo | No (`disabled` → errore 400) |
| Sonnet 5.5 | Adattivo | Non con `disabled` (errore 400); `between_tools` toglie il pensiero iniziale, fino a effort `high` |
| Haiku 5.5 | Adattivo | Sì, con `disabled`, fino a effort `high` |
| Fable 5.2 | Adattivo, sempre attivo | No |

**Pensiero esteso** (extended thinking) è la modalità manuale precedente: `thinking: {"type": "enabled", "budget_tokens": N}`. È deprecata su Opus 4.6 e Sonnet 4.6 e **non è accettata** dai modelli successivi.

Altre regole da ricordare:

- Il testo dei blocchi di pensiero è un **riassunto**, mai il ragionamento grezzo. Il campo `display` decide se riceverlo (`"summarized"`) o no (`"omitted"`, predefinito sui modelli attuali). Si pagano comunque tutti i token di pensiero generati.
- Il pensiero conta dentro `max_tokens`.
- Nei cicli con strumenti i blocchi di pensiero (con la `signature`) vanno rimandati intatti.

**Effort** (`output_config.effort`) regola quanti token il modello spende in tutta la risposta: testo, chiamate a strumenti e pensiero. È un segnale di comportamento, non un budget rigido.

| Livello | Uso tipico |
| --- | --- |
| `max` | Massima capacità senza limiti di spesa; per problemi di frontiera |
| `xhigh` | Lavori agentici e di codice lunghi |
| `high` | Ragionamento complesso; predefinito su Sonnet 5.5 e Fable 5.2 |
| `medium` | Equilibrio tra qualità, costo e velocità; predefinito su Opus 5.5 e Haiku 5.5 |
| `low` | Compiti semplici e veloci, sottoagenti, chat |

```typescript
// Con max_tokens oltre 21.333 l'SDK richiede lo streaming: finalMessage() restituisce il Message completo
const risposta = await client.messages
  .stream({
    model: "claude-opus-5-5",
    max_tokens: 64000, // con effort alti serve spazio per pensiero + risposta
    messages: [{ role: "user", content: "Analizza i compromessi tra microservizi e monolite" }],
    output_config: { effort: "high" },
    thinking: { type: "adaptive", display: "summarized" }, // per vedere il riassunto del pensiero
  })
  .finalMessage();
```

Cambiare l'effort a livello di richiesta tra un turno e l'altro può invalidare la cache; i modelli recenti permettono di cambiarlo per singolo messaggio preservando la cache.

La **modalità veloce** (fast mode) è una funzione in anteprima di ricerca che privilegia la velocità di generazione; cambiarla tra una richiesta e l'altra invalida la cache del prompt di sistema e dei messaggi.

### Tecniche di prompting di base

- **Zero-shot**: solo istruzioni, nessun esempio.
- **Single-shot**: un esempio.
- **Multi-shot (few-shot)**: più esempi; la documentazione consiglia **3–5 esempi** rilevanti, diversi tra loro e racchiusi in tag `<example>`.

---

## 5.2 Fondamenti tecnici (6,1%)

### SDK che incapsulano l'API REST

Anthropic fornisce SDK ufficiali per **Python, TypeScript, C#, Go, Java, PHP e Ruby** e la CLI `ant`. Gli SDK incapsulano l'API REST e aggiungono:

- lettura automatica della chiave da `ANTHROPIC_API_KEY`;
- tipi per richieste e risposte;
- nuovi tentativi automatici (2 per impostazione) e timeout;
- helper per lo streaming (`.on("text", ...)`, `finalMessage()`), per l'output strutturato (`messages.parse` con `zodOutputFormat`) e per gli strumenti (tool runner);
- paginazione automatica.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // legge ANTHROPIC_API_KEY

const message = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Ciao, Claude" }],
});
const text = message.content.find((b) => b.type === "text");
console.log(text?.text);
```

### Streaming, SSE e WebSocket

Lo streaming della Claude API usa i **server-sent events** (SSE): una connessione HTTP in cui il server invia eventi in una sola direzione. I **WebSocket** sono invece una connessione bidirezionale persistente: si usano tipicamente tra il tuo back end e il tuo front end (o un'app vocale) per inoltrare in tempo reale i token ricevuti dallo stream SSE e i messaggi dell'utente. In un'architettura tipica:

1. il browser apre un WebSocket verso il tuo server;
2. il server chiama la Claude API in streaming (SSE) con la chiave che solo lui conosce;
3. ogni `text_delta` ricevuto viene inoltrato sul WebSocket.

Così la chiave resta sul server e l'utente vede la risposta mentre viene generata.

---

## 5.3 Scelta del modello e compromessi (2,7%)

### I modelli attuali

| | Fable 5.2 | Opus 5.5 | Sonnet 5.5 | Haiku 5.5 |
| --- | --- | --- | --- | --- |
| Per | Ragionamento impegnativo e lavoro agentico molto lungo | Codice agentico lungo e lavoro di conoscenza | Miglior equilibrio tra velocità e intelligenza | Compiti ad alto volume e sensibili alla latenza: classificazione, estrazione, instradamento |
| Latenza | Moderata | Moderata | Veloce | La più veloce |
| Prezzo (input / output per MTok) | $8 / $40 | $4 / $20 | $2 / $10 | da $0,10 / da $0,50 |
| ID API | `claude-fable-5-2` | `claude-opus-5-5` | `claude-sonnet-5-5` | `claude-haiku-5-5` |
| Effort predefinito | `high` | `medium` | `high` | `medium` |
| Contesto / output massimo | 1M / 128K | 1M / 128K | 1M / 128K | 1M / 128K |

L'indicazione ufficiale: **partire da Opus 5.5** per la maggior parte dei carichi; passare a **Fable 5.2** quando le eval su Opus 5.5 anche con effort alto non bastano. Haiku costa meno su prompt fino a 100.000 token; oltre costa di più.

### Come scegliere

1. Fissare i criteri: capacità necessarie, latenza, costo, volumi.
2. Partire da un modello capace e misurare con le eval.
3. Ottimizzare: spesso **regolare l'effort** è una leva migliore che cambiare modello; poi valutare un modello più piccolo dove le eval lo permettono.
4. Usare l'instradamento: domande semplici a Haiku, difficili a Opus.

### Supporto al pensiero adattivo

Tutti i modelli attuali usano il pensiero adattivo; i modelli precedenti a Opus 4.6 / Sonnet 4.6 (per esempio Haiku 4.5, Sonnet 4.5) supportano solo il pensiero esteso manuale. Per verificarlo in modo programmatico, l'endpoint **Models API** (`GET /v1/models`) restituisce un oggetto `capabilities` per ogni modello.

### Cambiamenti di comportamento tra rilasci

Un nuovo modello può rompere un'applicazione che funzionava. Esempi reali dalla documentazione:

- Opus 5.5 ha effort predefinito `medium`, mentre Opus 5 aveva `high`: una richiesta senza `effort` gira un livello più in basso.
- Opus 5.5 e Sonnet 5.5 **rifiutano il tool use forzato** (`tool_choice` `any` o `tool` → errore 400): bisogna usare `auto` con strict tool use o l'output strutturato.
- Dai modelli 4.6 in poi il **prefill** dell'ultimo messaggio dell'assistente non è più supportato (errore 400).
- I livelli di effort sono calibrati in modo diverso tra versioni: va rifatta una prova su più livelli con le proprie eval.

Per questo: modello fissato nella configurazione, lettura delle guide di migrazione, eval prima di ogni cambio.

---

## 5.4 Gestione di costi e token (2,8%)

### Leve di costo

| Leva | Effetto |
| --- | --- |
| Scelta del modello | Haiku costa una frazione di Opus |
| Effort | Meno effort, meno token (anche di pensiero e di strumenti) |
| `max_tokens` | Limite rigido all'output di ogni richiesta |
| Batch API | −50% per i lavori non urgenti |
| Prompt caching | Le letture dalla cache costano molto meno dell'input normale |
| Gestione del contesto | Meno storia e meno risultati vecchi = meno token in ingresso a ogni turno |
| Strumenti | Le definizioni degli strumenti e il prompt di sistema per gli strumenti (circa 286 token su Opus 5.5) si pagano a ogni richiesta |

### Prompt caching

Due modi per attivarlo:

- **Automatico**: un solo campo `cache_control` in cima alla richiesta; il punto di cache si sposta da solo sull'ultimo blocco man mano che la conversazione cresce. Ideale per le conversazioni a più turni.
- **Breakpoint espliciti**: `cache_control` sui singoli blocchi, fino a **4 breakpoint** per richiesta; ogni breakpoint cerca una scrittura precedente fino a 20 blocchi indietro.

```typescript
const risposta = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  system: [
    {
      type: "text",
      text: MANUALE_PRODOTTO, // lungo e uguale per tutte le richieste
      cache_control: { type: "ephemeral" }, // 5 minuti; { type: "ephemeral", ttl: "1h" } per un'ora
    },
  ],
  messages: [{ role: "user", content: domandaCliente }],
});

const u = risposta.usage;
console.log(u.cache_creation_input_tokens, u.cache_read_input_tokens, u.input_tokens);
```

| Voce | Moltiplicatore sul prezzo di input |
| --- | --- |
| Scrittura in cache, durata 5 minuti (predefinita) | 1,25× |
| Scrittura in cache, durata 1 ora | 2× |
| Lettura dalla cache | 0,1× (0,05× su Opus 5.5 e Sonnet 5.5; 0,025× su Fable 5.2) |

Regole da ricordare:

- Lunghezza minima cacheabile sui modelli attuali: **512 token**; i prompt più corti non vengono messi in cache, senza errore.
- La durata di 5 minuti si rinnova gratis a ogni uso.
- La gerarchia è **strumenti → sistema → messaggi**: una modifica a un livello invalida quel livello e tutti i successivi. Cambiare le definizioni degli strumenti invalida tutto; cambiare `tool_choice`, immagini, impostazioni di pensiero o effort invalida i messaggi.
- Contenuto stabile all'inizio (strumenti, sistema, documenti, esempi), contenuto variabile alla fine; mai timestamp o dati della richiesta prima del breakpoint.
- Nella risposta: `cache_creation_input_tokens` (scritti), `cache_read_input_tokens` (letti), `input_tokens` (non in cache). Se i primi due sono 0, non c'è stato caching.

### Contare e tracciare i token

- **Prima** della richiesta: l'endpoint di conteggio (`/v1/messages/count_tokens`) stima i token in ingresso.
- **Dopo**: il campo `usage` di ogni risposta; in streaming i conteggi in `message_delta` sono cumulativi.
- In Claude Code `--output-format json` riporta `total_cost_usd` (stima lato client).

```typescript
const conteggio = await client.messages.countTokens({
  model: "claude-sonnet-5-5",
  system: "Sei un assistente.",
  messages: [{ role: "user", content: documentoLungo }],
});
console.log(conteggio.input_tokens);
```

### Budget di token

- `max_tokens` è il limite rigido per singola richiesta (pensiero compreso).
- Per i compiti agentici lunghi esistono i **task budget** (in beta): un budget indicativo per l'intero ciclo che aiuta il modello ad autoregolarsi.
- Nel tuo harness: limite di turni, limite di spesa per sessione, allarmi sul consumo.

---

## Ripasso rapido

- Il modello campiona un token alla volta: le risposte non sono deterministiche. Sui modelli attuali `temperature`/`top_p`/`top_k` danno errore 400.
- Pensiero adattivo guidato da `output_config.effort`; il pensiero esteso con `budget_tokens` non è accettato dai modelli recenti.
- Si parte da Opus 5.5; Fable 5.2 per i casi più difficili; Haiku 5.5 per volumi alti e latenza bassa.
- Regolare l'effort spesso conviene più che cambiare modello.
- Cambiare modello è un rilascio: guide di migrazione ed eval.
- Batch −50%; cache: scrittura 1,25× (5 min) o 2× (1 h), lettura molto più economica; minimo 512 token; strumenti → sistema → messaggi.

Vedi anche: [Applicazioni e integrazione](./studio.html?doc=domain-2) per la Batch API e la fissazione delle versioni.

---

## Fonti ufficiali

- [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) e [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
- [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) e [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Streaming messages](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [Tool use: pricing](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#pricing)
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
