# Dominio 2: applicazioni e integrazione (33,1%)

È il dominio più pesante: da solo vale un terzo dell'esame. Copre l'uso concreto della Claude API, le basi di ingegneria del software su cui poggia ogni integrazione, la progettazione delle applicazioni Claude e la gestione della configurazione.

| Competenza | Peso sull'esame |
| --- | --- |
| Comprendere i requisiti | 3,4% |
| Ciclo di vita dei sistemi | 2,8% |
| Funzionamento della Claude API | 6,8% |
| Basi di ingegneria del software | 7,4% |
| Progettazione di applicazioni Claude | 8,6% |
| Gestione della configurazione | 4,1% |

> Tutte le informazioni tecniche di questa pagina sono verificate sulla documentazione ufficiale Anthropic (novembre 2026). Le fonti sono elencate in fondo.

---

## 2.1 Comprendere i requisiti (3,4%)

Prima di scrivere codice bisogna tradurre le esigenze di business in requisiti:

- **Funzionali**: che cosa deve fare l'applicazione (classificare ticket, estrarre dati da fatture, rispondere ai clienti, modificare codice), con quali input e quali output.
- **Infrastrutturali**: latenza accettabile, volumi, budget, dove gira (API Anthropic o cloud partner), residenza e conservazione dei dati, integrazione con i sistemi esistenti, sicurezza e conformità.

I requisiti guidano scelte che vedremo nei domini successivi: tempo reale o batch, modello e livello di effort, workflow o agente, strumenti personalizzati o server MCP. Ogni requisito deve poi diventare un **criterio di successo misurabile** (vedi [dominio 4](./studio.html?doc=domain-4)).

---

## 2.2 Ciclo di vita dei sistemi (2,8%)

Un'applicazione Claude segue il normale ciclo di vita del software: analisi, sviluppo, test, rilascio, esercizio e manutenzione, con ambienti separati (sviluppo, staging, produzione).

Ci sono aspetti specifici da gestire:

- **Ciclo di vita dei modelli**: ogni modello ha una data di ritiro (per esempio Claude Opus 5.5: "non prima del 22 settembre 2027"). I modelli vengono prima deprecati e poi ritirati; la pagina *Model deprecations* indica date e sostituti. Una migrazione di modello va pianificata e testata come un rilascio.
- **Versioni dell'API**: ogni richiesta dichiara la versione con l'header `anthropic-version` (la documentazione attuale usa `2026-10-21`). Una nuova versione può cambiare comportamenti: per esempio, dalla versione `2026-10-21` i parametri `temperature`, `top_p` e `top_k` restituiscono errore 400 su tutti i modelli.
- **Funzioni in beta**: si attivano con l'header `anthropic-beta` e possono cambiare. In produzione vanno isolate e monitorate.
- **Eval come test di regressione**: ogni modifica a prompt, modello o strumenti va validata sulle eval prima del rilascio.

---

## 2.3 Funzionamento della Claude API (6,8%)

### La Messages API

L'endpoint principale è `POST https://api.anthropic.com/v1/messages`. Una richiesta minima:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2026-10-21" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 1024,
    "system": "Sei un assistente che risponde in italiano.",
    "messages": [{"role": "user", "content": "Ciao, Claude"}]
  }'
```

Elementi principali:

- `model`: l'ID del modello.
- `max_tokens`: limite massimo di token in uscita, **pensiero compreso**.
- `system`: il prompt di sistema (ruolo, regole, contesto).
- `messages`: la conversazione, con ruoli `user` e `assistant` alternati. L'API è **senza stato**: a ogni richiesta si invia tutta la storia necessaria.
- Il contenuto può essere una stringa o un array di blocchi (`text`, `image`, `document`, `tool_use`, `tool_result`...).

La risposta contiene `content` (array di blocchi), `stop_reason` e `usage` (token in ingresso, in uscita e di cache).

### Motivi di arresto

| `stop_reason` | Significato | Cosa fare |
| --- | --- | --- |
| `end_turn` | Risposta terminata in modo naturale | Usare la risposta |
| `max_tokens` | Raggiunto il limite di `max_tokens` | Aumentare il limite o continuare; se è troncata a metà di un `tool_use`, riprovare con più spazio |
| `stop_sequence` | Emessa una delle `stop_sequences` | Leggere `stop_sequence` per sapere quale |
| `tool_use` | Claude chiede di eseguire strumenti | Eseguirli e restituire i `tool_result` |
| `pause_turn` | Un ciclo di strumenti lato server ha raggiunto il limite di iterazioni | Rimettere il `content` come messaggio `assistant` e rinviare con gli stessi `tools` |
| `refusal` | Claude ha rifiutato (HTTP 200, non è un errore) | Leggere `stop_details` e, se ha senso, riprovare su un modello di riserva |
| `model_context_window_exceeded` | La risposta ha riempito la finestra di contesto | Trattarla come troncata |

Gli errori veri e propri sono risposte HTTP 4xx/5xx, separati dagli stop reason.

### Streaming

Con `"stream": true` la risposta arriva come **server-sent events** nell'ordine: `message_start`, poi per ogni blocco `content_block_start`, uno o più `content_block_delta` e `content_block_stop`, poi uno o più `message_delta` (con `stop_reason` e `usage` cumulativo) e infine `message_stop`. Possono comparire eventi `ping` ed eventi `error`.

I tipi di delta sono `text_delta`, `input_json_delta` (argomenti degli strumenti, da accumulare e leggere al `content_block_stop`), `thinking_delta` e `signature_delta`.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const stream = client.messages.stream({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Spiega la ricorsione" }],
});
stream.on("text", (testo) => process.stdout.write(testo));
const finale = await stream.finalMessage(); // il Message completo
```

Lo streaming migliora la latenza percepita. Gli SDK lo **richiedono** quando `max_tokens` supera 21.333, per evitare timeout HTTP sulle richieste lunghe.

### Visione e documenti

Tutti i modelli attuali accettano immagini. I PDF si inviano come blocco `document`. Una richiesta può contenere fino a 600 immagini o pagine PDF sui modelli con contesto da 1M token.

```typescript
const risposta = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: immagineBase64 } },
        { type: "text", text: "Estrai il totale da questa ricevuta." },
      ],
    },
  ],
});
```

### Files API: accesso ai dati

Per riusare un file senza inviarlo ogni volta lo si carica una volta con la **Files API** e lo si richiama con il suo `file_id` in un blocco `document`, `image` o `container_upload`.

```typescript
import { createReadStream } from "node:fs";
import Anthropic, { toFile } from "@anthropic-ai/sdk";

const client = new Anthropic();

const caricato = await client.files.upload({
  file: await toFile(createReadStream("contratto.pdf"), undefined, { type: "application/pdf" }),
});

const risposta = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Riassumi questo contratto." },
        { type: "document", source: { type: "file", file_id: caricato.id } },
      ],
    },
  ],
});
```

Cose da sapere: file fino a 500 MB, 1 TB per organizzazione; i file sono visibili a **tutto il workspace**, quindi non si accettano mai `file_id` forniti dagli utenti finali e per applicazioni multi-tenant si usa un workspace per tenant. Le operazioni sui file sono gratuite; il contenuto usato nei messaggi si paga come token in ingresso.

### Pensiero (thinking)

Sui modelli attuali il pensiero è **adattivo**: il modello decide se e quanto ragionare, guidato dal parametro `effort`. I dettagli sono nel [dominio 5](./studio.html?doc=domain-5). Per l'integrazione conta una regola: quando si restituiscono risultati di strumenti, i blocchi `thinking` (con la loro `signature`) vanno rimandati **completi e senza modifiche**.

### Prompt caching

Il caching permette di riprendere da un prefisso del prompt già elaborato, riducendo costo e latenza. Si attiva con `cache_control` in cima alla richiesta (caching automatico) o sui singoli blocchi (breakpoint espliciti). Dettagli, prezzi e regole di invalidazione sono nel [dominio 5](./studio.html?doc=domain-5).

### Claude tramite fornitori terzi

Gli stessi modelli sono disponibili su **Amazon Bedrock**, **Claude Platform on AWS**, **Google Cloud** (gestito da Google o da Anthropic) e **Microsoft Foundry**. Differenze da tenere presenti:

- Gli ID possono cambiare: su Bedrock, per esempio, `anthropic.claude-sonnet-5-5`; su Foundry si invia il nome del deployment.
- Ogni piattaforma ha **la propria autenticazione** (credenziali AWS, Google Cloud o Azure) e spesso il proprio ciclo di vita dei modelli.
- Non tutte le funzioni sono disponibili ovunque (per esempio la Batch API è sull'API Anthropic, su Claude Platform on AWS e su Google Cloud gestito da Anthropic; il caching automatico non è disponibile sull'endpoint `bedrock-runtime`). Ogni pagina della documentazione ha una sezione di disponibilità per piattaforma.

### Batch API: tempo reale o lotti

La **Message Batches API** elabora grandi volumi di richieste in modo **asincrono** con uno **sconto del 50%** sul prezzo.

| Caratteristica | Valore |
| --- | --- |
| Dimensione massima di un batch | 100.000 richieste o 256 MB (il primo limite raggiunto) |
| Tempo di elaborazione | Quasi sempre meno di 1 ora; il batch scade se non termina entro 24 ore |
| Disponibilità dei risultati | 29 giorni dalla creazione |
| Identificazione delle richieste | `custom_id` univoco (1–64 caratteri, lettere, numeri, `-` e `_`) |
| Esiti possibili per richiesta | `succeeded`, `errored`, `canceled`, `expired` |

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const batch = await client.messages.batches.create({
  requests: email.map((testo, i) => ({
    custom_id: `email-${i}`,
    params: {
      model: "claude-haiku-5-5",
      max_tokens: 1024,
      messages: [{ role: "user" as const, content: `Classifica questa email: ${testo}` }],
    },
  })),
});

// Lo stato passa da "in_progress" a "ended"
while ((await client.messages.batches.retrieve(batch.id)).processing_status !== "ended") {
  await new Promise((resolve) => setTimeout(resolve, 60_000));
}

for await (const risultato of await client.messages.batches.results(batch.id)) {
  if (risultato.result.type === "succeeded") {
    const blocco = risultato.result.message.content.find((b) => b.type === "text");
    console.log(risultato.custom_id, blocco?.type === "text" ? blocco.text : "");
  } else {
    console.log(risultato.custom_id, "da rielaborare:", risultato.result.type);
  }
}
```

Note pratiche:

- L'ordine dei risultati non è garantito: si usa sempre `custom_id` per abbinarli.
- I parametri di ogni richiesta sono validati in modo asincrono: conviene provare prima la forma della richiesta con la Messages API.
- Dentro un batch funzionano le stesse funzioni della Messages API (strumenti, visione, pensiero, caching...).
- La Batch API **non è idonea** alla conservazione zero dei dati (i risultati restano 29 giorni).

**Come scegliere**: un utente che aspetta, una chat o un agente interattivo vogliono chiamate **in tempo reale**; lavori grandi, non urgenti e sensibili al costo (classificazioni notturne, eval su larga scala, arricchimento di archivi) vanno in **batch**.

---

## 2.4 Basi di ingegneria del software (7,4%)

### API REST e JSON

- Autenticazione con `x-api-key: <chiave>` oppure `Authorization: Bearer <chiave>`.
- `anthropic-version` obbligatorio; `content-type: application/json`.
- Le chiavi vivono sul server: un'applicazione web chiama il proprio back end, che chiama Claude. Le chiamate dirette dal browser richiedono un header esplicito di "accesso pericoloso" e sono sconsigliate.

### Errori HTTP

| Codice | Tipo | Significato |
| --- | --- | --- |
| 400 | `invalid_request_error` | Richiesta malformata o non valida |
| 401 | `authentication_error` | Chiave non valida, revocata o scaduta |
| 402 | `billing_error` | Problemi di fatturazione |
| 403 | `permission_error` | La chiave non ha accesso alla risorsa |
| 404 | `not_found_error` | Risorsa inesistente |
| 409 | `conflict_error` | Conflitto con lo stato della risorsa |
| 413 | `request_too_large` | Richiesta troppo grande |
| 429 | `rate_limit_error` | Limiti di frequenza o di spesa raggiunti |
| 500 | `api_error` | Errore interno |
| 504 | `timeout_error` | Timeout durante l'elaborazione |
| 529 | `overloaded_error` | API temporaneamente sovraccarica |

Ogni errore ha un corpo JSON con `type`, `message` e un `request_id` da citare nelle segnalazioni al supporto.

### Nuovi tentativi

Gli SDK ritentano in automatico **fino a 2 volte** (3 tentativi in tutto). Seguono l'header `x-should-retry` se presente; altrimenti ritentano errori di connessione, timeout e gli stati 408, 409, 429 e ≥500. Attendono quanto indica `retry-after` oppure usano un backoff esponenziale da 0,5 a 8 secondi. Il numero si cambia con l'opzione `maxRetries` del client. Un errore che arriva **dentro uno stream** non viene ritentato dall'SDK: va gestito dal tuo codice.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ maxRetries: 5, timeout: 60_000 }); // timeout in millisecondi

try {
  const risposta = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Ciao" }],
  });
} catch (errore) {
  if (errore instanceof Anthropic.RateLimitError) {
    // 429: rallentare, mettere in coda
  } else if (errore instanceof Anthropic.APIError) {
    console.error(`Errore ${errore.status}, request_id=${errore.requestID}`);
  } else {
    throw errore;
  }
}
```

### Programmazione asincrona

In TypeScript ogni chiamata restituisce una `Promise`: con `Promise.all` più richieste partono in parallelo. Il parallelismo va comunque limitato in base ai limiti di frequenza dell'organizzazione.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function classifica(testo: string): Promise<string> {
  const r = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: `Categoria di: ${testo}` }],
  });
  // Con il pensiero attivo il primo blocco può essere "thinking": si cerca il blocco di testo
  const blocco = r.content.find((b) => b.type === "text");
  return blocco?.type === "text" ? blocco.text : "";
}

// Le chiamate partono in parallelo
const categorie = await Promise.all(testi.map(classifica));
```

### Controllo di versione, revisione e refactoring

- Prompt, schemi degli strumenti, configurazioni (`CLAUDE.md`, `.claude/settings.json`, `.mcp.json`) e dataset delle eval stanno nel **repository**, versionati come il codice.
- Le modifiche passano da **revisione del codice**, anche quando le scrive Claude.
- I refactoring, piccoli o grandi, si fanno con test che proteggono il comportamento esistente. Claude Code si integra nel ciclo di sviluppo anche in pipeline CI (modalità non interattiva, vedi [dominio 3](./studio.html?doc=domain-3)).

---

## 2.5 Progettazione di applicazioni Claude (8,6%)

### Come Claude riceve le istruzioni nelle diverse interfacce

| Interfaccia | Dove stanno le istruzioni |
| --- | --- |
| **API / SDK client** | Le controlli tu: prompt di sistema, messaggi, strumenti. Niente viene aggiunto oltre al prompt speciale per l'uso degli strumenti |
| **Claude Code** (terminale, IDE, desktop) | Ha un proprio prompt di sistema non pubblicato; aggiungi istruzioni con i file `CLAUDE.md`, le regole in `.claude/rules/`, le Skill, oppure con `--append-system-prompt` |
| **Agent SDK** | Come Claude Code; puoi passare un `system_prompt` personalizzato e scegliere quali impostazioni caricare |
| **claude.ai e Claude Desktop** | L'applicazione ha un proprio prompt di sistema; le istruzioni dell'utente arrivano da preferenze, progetti e Skill |

La stessa istruzione può quindi comportarsi in modo diverso: in Claude Code `CLAUDE.md` è contesto che il modello legge, **non** una configurazione imposta; nell'API il prompt di sistema è l'unico strato di istruzioni.

### Confini dei contenuti

Separare sempre ciò che è fidato (le tue istruzioni) da ciò che non lo è (pagine web, email, documenti caricati, risultati di strumenti):

- I contenuti di terzi vanno nei blocchi `tool_result`, non nel prompt di sistema né in blocchi di testo dell'utente.
- I tag XML (`<documento>`, `<email>`) rendono chiari i confini.
- Dettagli nel [dominio 7](./studio.html?doc=domain-7).

### Progettazione degli schemi

Gli schemi JSON compaiono in due punti: gli **input degli strumenti** (`input_schema`) e l'**output strutturato** (`output_config.format`). Regole utili:

- campi con nomi e descrizioni chiari, `enum` per i valori ammessi;
- campi `required` solo quando il dato è davvero sempre disponibile; altrimenti campi annullabili, per non spingere il modello a inventare;
- `additionalProperties: false` sugli oggetti (obbligatorio con l'output strutturato).

Dettagli nel [dominio 6](./studio.html?doc=domain-6) e nel [dominio 8](./studio.html?doc=domain-8).

### Igiene delle sessioni

- Una sessione per compito: un contesto pieno di argomenti diversi peggiora la qualità.
- In Claude Code: `/clear` per ripartire, `/compact` per riassumere, `--continue`/`--resume` per riprendere una sessione precisa.
- Nelle applicazioni API: decidere che cosa resta nella storia e che cosa va riassunto o tolto.

### Gestione dei plugin

In Claude Code un **plugin** raggruppa Skill, sottoagenti, hook, server MCP e altri componenti in un'unica unità installabile da un marketplace. Ogni plugin abilitato aggiunge al contesto nomi e descrizioni dei suoi componenti in **ogni sessione**, avvia i suoi server MCP e gira con i tuoi permessi: va installato solo ciò che serve e controllato prima. Dettagli nel [dominio 3](./studio.html?doc=domain-3).

---

## 2.6 Gestione della configurazione (4,1%)

### CLAUDE.md e settings.json

- `CLAUDE.md` contiene **istruzioni** (comandi di build, convenzioni, architettura); `settings.json` contiene **impostazioni** applicate dal programma (permessi, hook, variabili d'ambiente, modello, plugin).
- Entrambi hanno più livelli (organizzazione, utente, progetto, locale). La gerarchia completa è nel [dominio 3](./studio.html?doc=domain-3).
- I file di progetto condivisi vanno versionati; quelli locali (`CLAUDE.local.md`, `.claude/settings.local.json`) restano fuori da git.

### Versioni fissate dei modelli

Dalla generazione 4.6 in poi **ogni ID di modello senza data è già una versione fissata** (snapshot): `claude-sonnet-5-5` indica sempre lo stesso modello. Per i modelli precedenti l'alias puntava a un ID datato (per esempio `claude-sonnet-4-5-20250929`). Fissare il modello nella configurazione evita che il comportamento cambi senza preavviso; il passaggio a un nuovo modello diventa un cambiamento esplicito, da testare con le eval.

### Versioni dei prompt

I prompt sono codice: si versionano nel repository, si cambiano con una revisione, si legano alle eval che li validano. Conviene registrare quale versione di prompt e di modello ha prodotto ogni risposta in produzione, per poter fare debug.

### Dipendenze dei plugin

I plugin hanno versioni e possono dipendere da altri plugin; un plugin con una dipendenza non soddisfatta non si carica. In modalità non interattiva l'evento `system/init` riporta i plugin caricati (`plugins`) e gli errori (`plugin_errors`), così una pipeline CI può fallire se un plugin necessario manca.

---

## Ripasso rapido

- Requisiti funzionali e infrastrutturali guidano modello, modalità (tempo reale o batch) e architettura.
- `anthropic-version` in ogni richiesta; le funzioni beta si attivano con `anthropic-beta`.
- Il ciclo si governa con `stop_reason`; `refusal` arriva come HTTP 200.
- Batch: −50%, fino a 100.000 richieste, risultati entro 24 ore, abbinati con `custom_id`.
- Gli SDK ritentano 2 volte da soli; dentro uno stream gli errori li gestisci tu.
- In Claude Code le istruzioni sono contesto (`CLAUDE.md`), i vincoli veri sono impostazioni e hook.
- ID senza data = versione fissata: cambiare modello è un rilascio da testare.

---

## Fonti ufficiali

- [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) e [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Handling stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
- [Streaming messages](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [Files API](https://platform.claude.com/docs/en/build-with-claude/files)
- [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- [API errors](https://platform.claude.com/docs/en/api/errors)
- [Authentication](https://platform.claude.com/docs/en/manage-claude/authentication)
- [Settings](https://code.claude.com/docs/en/settings) e [Plugins overview](https://code.claude.com/docs/en/plugins)
