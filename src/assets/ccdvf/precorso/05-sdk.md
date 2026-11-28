# PC5 · SDK e Messages API

## Perché serve all'esame

È il modulo più vicino al cuore dell'esame. Gli scenari mostrano codice scritto con gli SDK, tracce di una chiamata, errori delle librerie. Devi sapere **quale strumento** usare (SDK client, Agent SDK, Managed Agents), **come è fatta** una risposta e **che cosa fa l'SDK al posto tuo**.

| Dove compare | Cosa chiede l'esame | Dominio |
| --- | --- | --- |
| Scelta tra SDK client, Agent SDK, agenti gestiti | Scegliere l'ambiente di esecuzione giusto | [D1](./studio.html?doc=domain-1) |
| Ciclo agente-strumento | Condizione di uscita, `tool_result` per ogni `tool_use` | [D1](./studio.html?doc=domain-1), [D8](./studio.html?doc=domain-8) |
| Struttura di una risposta | Blocchi, `stop_reason`, `usage` | [D2](./studio.html?doc=domain-2) |
| Errori e retry dell'SDK | Classi di errore, che cosa è già gestito dall'SDK | [D2](./studio.html?doc=domain-2), [D4](./studio.html?doc=domain-4) |
| SDK che incapsulano l'API REST | Streaming, `maxRetries`, timeout | [D5](./studio.html?doc=domain-5) |
| Definizione degli strumenti | Nome, descrizione, `input_schema` | [D8](./studio.html?doc=domain-8) |

---

## 1. Tre livelli, da non confondere

| Livello | A che cosa serve | Chi guida il ciclo |
| --- | --- | --- |
| **SDK client** (`@anthropic-ai/sdk`, `anthropic`) | Chiamare la Messages API dal tuo codice | **Tu**: invii ogni richiesta e gestisci ogni risposta |
| **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`, `claude-agent-sdk`) | Costruire agenti con gli stessi strumenti, ciclo e gestione del contesto di Claude Code | **L'SDK**: esegue il ciclo, tu configuri strumenti, permessi, hook e sottoagenti |
| **Managed Agents** | Far girare l'agente su un'infrastruttura gestita da Anthropic, tramite API | **Anthropic**: un harness ospitato, con sessioni nel suo cloud |

Il [Claude Code](./studio.html?doc=domain-3) da terminale è una quarta cosa: l'interfaccia interattiva per lo sviluppo quotidiano.

Regola pratica per l'esame:

- vuoi **controllare ogni passo** (o un'integrazione semplice): SDK client;
- vuoi un **agente che legge file, esegue comandi e usa strumenti** senza riscrivere il ciclo: Agent SDK;
- vuoi un agente di **lunga durata o asincrono** senza gestire sandbox e sessioni: agenti gestiti ([dominio 1](./studio.html?doc=domain-1)).

Gli SDK client ufficiali esistono per Python, TypeScript, C#, Go, Java, PHP e Ruby, con interfacce tipizzate e supporto integrato a streaming, retry e gestione degli errori.

## 2. Installare e creare il client

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // legge ANTHROPIC_API_KEY dall'ambiente
```

- La chiave non si scrive nel codice: arriva dall'ambiente ([PC2](./studio.html?doc=pc-node)).
- Opzioni utili: `maxRetries` (tentativi in più), `timeout` (in millisecondi).

```typescript
const client = new Anthropic({ maxRetries: 5, timeout: 60_000 });
```

## 3. Una richiesta e la sua risposta

```typescript
const risposta = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  system: "Rispondi in italiano, in modo sintetico.",
  messages: [{ role: "user", content: "Che cos'è un token?" }],
});

for (const blocco of risposta.content) {
  if (blocco.type === "text") console.log(blocco.text);
}
console.log(risposta.stop_reason); // perché si è fermata
console.log(risposta.usage.input_tokens, risposta.usage.output_tokens);
```

Che cosa guardare nella risposta:

- **`content`** è un **array di blocchi**, non una stringa. Contiene blocchi `text`, e a seconda dei casi `thinking` e `tool_use`. Non leggere `content[0].text` senza controllare `type`.
- **`stop_reason`** dice perché la generazione è finita: `end_turn`, `max_tokens`, `tool_use`, `refusal` e altri ([dominio 2](./studio.html?doc=domain-2)).
- **`usage`** conta i token in ingresso e in uscita (e di cache): serve per costi e tracce ([dominio 5](./studio.html?doc=domain-5)).
- `max_tokens` è **obbligatorio** e include il pensiero.

## 4. Conversazioni: lo stato lo tieni tu

```typescript
const storia: Anthropic.MessageParam[] = [{ role: "user", content: "Mi chiamo Anna." }];

const r1 = await client.messages.create({ model: "claude-sonnet-5-5", max_tokens: 512, messages: storia });
storia.push({ role: "assistant", content: r1.content }); // la risposta torna nella storia

storia.push({ role: "user", content: "Come mi chiamo?" });
const r2 = await client.messages.create({ model: "claude-sonnet-5-5", max_tokens: 512, messages: storia });
```

L'API è senza stato: se non rinvii la storia, Claude non ricorda nulla ([PC4](./studio.html?doc=pc-http-api)). Ogni turno ripaga i token di tutta la storia, da cui [caching](./studio.html?doc=domain-5) e [gestione del contesto](./studio.html?doc=domain-6).

## 5. Errori: che cosa gestisce l'SDK e che cosa no

L'SDK **ritenta da solo** fino a 2 volte gli errori temporanei (connessione, timeout, `408`, `409`, `429`, `5xx`) rispettando `retry-after`. Gli errori che arrivano comunque sono eccezioni tipizzate.

```typescript
try {
  await client.messages.create({ model: "claude-sonnet-5-5", max_tokens: 1024, messages: storia });
} catch (errore) {
  if (errore instanceof Anthropic.RateLimitError) {
    // 429: rallentare, mettere in coda
  } else if (errore instanceof Anthropic.APIError) {
    console.error(`Errore ${errore.status}, request_id=${errore.requestID}`);
  } else {
    throw errore; // non è un errore dell'API: non nasconderlo
  }
}
```

Da ricordare:

- un errore **dentro uno stream** non viene ritentato dall'SDK: tocca al tuo codice;
- un rifiuto del modello (`stop_reason: "refusal"`) o una risposta troncata **non sono eccezioni**: arrivano con `200` e si controllano guardando `stop_reason`;
- il `request_id` va annotato nei log per il supporto ([dominio 4](./studio.html?doc=domain-4)).

## 6. Streaming con l'SDK

```typescript
const flusso = client.messages.stream({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Spiega la ricorsione" }],
});

flusso.on("text", (testo) => process.stdout.write(testo));
const finale = await flusso.finalMessage(); // il messaggio completo, con stop_reason
```

Lo streaming migliora la latenza percepita. Gli SDK lo **richiedono** quando `max_tokens` è molto alto, per evitare timeout sulle richieste lunghe ([dominio 2](./studio.html?doc=domain-2)).

## 7. Strumenti e ciclo agente a mano

Definire uno strumento significa dare **nome**, **descrizione** e **schema degli input**:

```typescript
const tools: Anthropic.Tool[] = [
  {
    name: "get_order_status",
    description:
      "Restituisce lo stato di un ordine. order_id è l'identificativo alfanumerico dell'ordine (per esempio A-1042), non il nome del cliente.",
    input_schema: {
      type: "object",
      properties: { order_id: { type: "string", description: "Identificativo dell'ordine" } },
      required: ["order_id"],
    },
  },
];
```

La **descrizione** è il fattore che più influenza l'uso corretto ([dominio 8](./studio.html?doc=domain-8)). Il ciclo completo, con i suoi punti fermi, è nel [dominio 1](./studio.html?doc=domain-1). In sintesi:

1. invii la richiesta con `tools`;
2. se `stop_reason` è `tool_use`, esegui ogni strumento richiesto;
3. rispondi con un blocco `tool_result` per **ogni** `tool_use`, con lo stesso `tool_use_id` (anche se lo strumento fallisce, con `is_error: true`), in un unico messaggio utente;
4. ripeti finché lo `stop_reason` non è più `tool_use`, con un limite di giri come rete di sicurezza.

Gli SDK client offrono anche un **tool runner** che esegue gli strumenti e rimanda i risultati al posto tuo.

## 8. L'Agent SDK in breve

L'Agent SDK offre già il ciclo, gli strumenti integrati e la gestione del contesto di Claude Code, programmabili in TypeScript e Python.

```bash
npm install @anthropic-ai/claude-agent-sdk
```

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const messaggio of query({
  prompt: "Spiega la struttura di questo progetto",
  options: { allowedTools: ["Read", "Glob", "Grep"] }, // solo strumenti di lettura
})) {
  if ("result" in messaggio) console.log(messaggio.result);
}
```

- Si governano **strumenti consentiti**, **permessi**, **hook**, **sottoagenti** e **sessioni** dalle opzioni.
- Gli **hook** fanno eseguire azioni obbligatorie in modo deterministico, senza dipendere dalla decisione del modello ([dominio 1](./studio.html?doc=domain-1), [dominio 7](./studio.html?doc=domain-7)).
- Con `allowedTools` limiti ciò che l'agente può fare: è privilegio minimo ([dominio 7](./studio.html?doc=domain-7)).
- La versione TypeScript include già il programma nativo di Claude Code come dipendenza opzionale: non serve installarlo a parte.

---

## Mini-laboratorio (45–60 minuti)

1. Installa l'SDK, imposta la chiave nell'ambiente e invia una richiesta. Stampa `stop_reason` e `usage`.
2. Imposta `max_tokens: 10` e osserva `stop_reason`: che cosa significa, e perché non è un'eccezione?
3. Costruisci una conversazione a due turni e verifica che senza rinviare la storia Claude "dimentica".
4. Definisci lo strumento `get_order_status` e scrivi il ciclo con un finto `eseguiStrumento`. Fai fallire lo strumento e controlla che tu rimandi lo stesso un `tool_result` con `is_error: true`.
5. Facoltativo: esegui l'esempio con `query` dell'Agent SDK, limitando gli strumenti alla sola lettura.

## Controlla di saper

- distinguere SDK client, Agent SDK e agenti gestiti e dire quando usare ciascuno;
- leggere una risposta: blocchi, `stop_reason`, `usage`;
- dire che cosa ritenta l'SDK e che cosa resta a carico tuo;
- descrivere il ciclo agente-strumento e la regola del `tool_result` per ogni `tool_use`.

## Dove studiare

- [Get started with Claude](https://platform.claude.com/docs/en/get-started): installazione, chiave e prima richiesta.
- [SDK, CLI e librerie](https://platform.claude.com/docs/en/cli-sdks-libraries/overview) e [SDK TypeScript](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript).
- [Panoramica dell'API](https://platform.claude.com/docs/en/api/overview).
- [Agent SDK: panoramica](https://code.claude.com/docs/en/agent-sdk/overview) e [riferimento TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript).
- [Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview).
- [Tool use con Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) e [gestione delle chiamate agli strumenti](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls).
- Elenco completo in [Dove studiare](./studio.html?doc=pc-risorse).
