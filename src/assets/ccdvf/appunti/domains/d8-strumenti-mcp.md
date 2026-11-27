# Dominio 8: strumenti e MCP (10,6%)

Come si definiscono gli strumenti che Claude può chiamare, come si costruisce e si collega un server MCP e come si sceglie tra strumenti integrati, strumenti personalizzati, Skill e MCP.

| Competenza | Peso sull'esame |
| --- | --- |
| Realizzazione degli strumenti | 4,4% |
| Sviluppo di server MCP | 2,1% |
| Personalizzazione degli agenti | 4,1% |

> Tutte le informazioni tecniche di questa pagina sono verificate sulla documentazione ufficiale Anthropic e sul sito del Model Context Protocol (novembre 2026). Le fonti sono elencate in fondo.

---

## 8.1 Realizzazione degli strumenti (4,4%)

### Tool use (function calling)

Con il **tool use** Claude chiama funzioni definite da te o fornite da Anthropic. Claude decide **quando** chiamarle in base alla richiesta e alla **descrizione** dello strumento, e restituisce una chiamata strutturata (nome e argomenti). Lo strumento non viene eseguito da Claude: lo esegue la tua applicazione (strumenti client) oppure Anthropic (strumenti server).

### Definire uno strumento

| Campo | Contenuto |
| --- | --- |
| `name` | Nome univoco, conforme a `^[a-zA-Z0-9_-]{1,128}$` |
| `description` | Che cosa fa, quando usarlo e quando no, che cosa restituisce, limiti |
| `input_schema` | Schema JSON dei parametri |
| `input_examples` | (Facoltativo) esempi di input validi per strumenti complessi |
| `strict` | (Facoltativo) `true` garantisce che gli argomenti rispettino lo schema |

Altre proprietà facoltative: `cache_control`, `defer_loading` (per la ricerca tra molti strumenti), `allowed_callers`.

### La descrizione è il fattore più importante

La documentazione lo dice chiaramente: descrizioni **estremamente dettagliate** sono di gran lunga il fattore che più influisce sulle prestazioni. Almeno 3–4 frasi per strumento.

Descrizione insufficiente:

```json
{
  "name": "get_stock_price",
  "description": "Gets the stock price for a ticker.",
  "input_schema": {
    "type": "object",
    "properties": { "ticker": { "type": "string" } },
    "required": ["ticker"]
  }
}
```

Descrizione buona:

```json
{
  "name": "get_stock_price",
  "description": "Retrieves the current stock price for a given ticker symbol. The ticker symbol must be a valid symbol for a publicly traded company on a major US stock exchange like NYSE or NASDAQ. The tool will return the latest trade price in USD. It should be used when the user asks about the current or most recent price of a specific stock. It will not provide any other information about the stock or company.",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticker": {
        "type": "string",
        "description": "The stock ticker symbol, e.g. AAPL for Apple Inc."
      }
    },
    "required": ["ticker"]
  }
}
```

### Buone pratiche per un insieme di strumenti

- **Consolidare** le operazioni correlate: un solo strumento con un parametro `action` invece di `create_pr`, `review_pr`, `merge_pr`. Meno strumenti = meno ambiguità nella scelta.
- **Nomi con prefisso del servizio** (`github_list_prs`, `slack_send_message`) quando gli strumenti coprono più sistemi.
- **Risposte con solo informazioni utili**: identificativi stabili e leggibili, solo i campi che servono al passo successivo. Risposte gonfie sprecano contesto.
- **Strumenti senza sovrapposizioni**: se una persona non saprebbe scegliere, nemmeno Claude ci riuscirà.
- **Poka-yoke**: progettare gli argomenti in modo che gli errori siano difficili. Anthropic, per esempio, ha eliminato gli errori sui percorsi relativi chiedendo percorsi assoluti.
- **Chiedere una spiegazione, non il ragionamento**: un parametro che chiede "il tuo ragionamento passo per passo" può causare un rifiuto di tipo `reasoning_extraction`.
- **Con centinaia di strumenti**: lo strumento di **ricerca degli strumenti** (`tool_search`) con `defer_loading` carica le definizioni solo quando servono.

### Controllare quando Claude usa gli strumenti

| `tool_choice` | Comportamento |
| --- | --- |
| `auto` | Claude decide se chiamare uno strumento (predefinito quando ci sono strumenti) |
| `any` | Deve usare uno degli strumenti |
| `tool` | Deve usare lo strumento indicato |
| `none` | Nessuno strumento (predefinito senza strumenti) |

Attenzione ai modelli attuali: **Opus 5.5, Sonnet 5.5, Fable 5.2** (e altri) **rifiutano** `any` e `tool` con errore 400. Al loro posto si usa `auto` con `strict: true` (argomenti garantiti) e un'istruzione nel prompt, oppure l'output strutturato quando serve una risposta JSON fissa. Dove il tool use forzato è accettato, la risposta inizia direttamente con la chiamata e senza pensiero.

Con `disable_parallel_tool_use: true` Claude fa al massimo una chiamata per turno; altrimenti può chiamare più strumenti in parallelo, e tutti i risultati vanno restituiti **nello stesso messaggio utente**.

### Gestione degli errori

Ogni `tool_use` riceve un `tool_result`. Se lo strumento fallisce o la chiamata non è valida si risponde con `is_error: true` e un messaggio che dice che cosa è andato storto e che cosa provare:

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
  "content": "Errore: manca il parametro obbligatorio 'location'",
  "is_error": true
}
```

Claude può riprovare o spiegare il problema all'utente; il ciclo deve limitare il numero di tentativi. Per eliminare del tutto le chiamate non valide si usa `strict: true`. Gli strumenti server riportano i propri errori dentro il loro blocco di risultato: non si invia `is_error` per loro.

### Strumenti client e strumenti server

| | Strumenti client | Strumenti server |
| --- | --- | --- |
| Chi li esegue | La tua applicazione | Anthropic |
| Esempi | Strumenti definiti da te; strumenti con schema Anthropic come `bash`, `text_editor`, memory tool, computer use | `web_search`, `web_fetch`, `code_execution`, `tool_search`, MCP connector |
| Flusso | `stop_reason: "tool_use"` → esegui → `tool_result` | I risultati arrivano già nella risposta |
| Costo | Token | Token più eventuali costi d'uso (per esempio per ricerca) |

Un ciclo di strumenti server che raggiunge il limite di iterazioni restituisce `stop_reason: "pause_turn"`: si rimanda la risposta così com'è per continuare.

### Dispatch nell'harness

Nel tuo codice uno strumento è una funzione e il dispatch associa il nome alla funzione:

```typescript
import type Anthropic from "@anthropic-ai/sdk";

type Utente = { id: string };
type Strumento = (input: Record<string, unknown>) => Promise<unknown>;

declare function cercaOrdine(input: Record<string, unknown>): Promise<unknown>;
declare function rimborsa(input: Record<string, unknown>): Promise<unknown>;
declare function chiediConferma(utente: Utente, blocco: Anthropic.ToolUseBlock): Promise<boolean>;

const STRUMENTI: Record<string, Strumento> = {
  cerca_ordine: cercaOrdine,
  rimborsa,
};
const RICHIEDE_APPROVAZIONE = new Set(["rimborsa"]);

async function esegui(blocco: Anthropic.ToolUseBlock, utente: Utente): Promise<Anthropic.ToolResultBlockParam> {
  const errore = (content: string): Anthropic.ToolResultBlockParam => ({
    type: "tool_result",
    tool_use_id: blocco.id,
    content,
    is_error: true,
  });

  const funzione = STRUMENTI[blocco.name];
  if (!funzione) return errore(`Strumento sconosciuto: ${blocco.name}`);
  if (RICHIEDE_APPROVAZIONE.has(blocco.name) && !(await chiediConferma(utente, blocco))) {
    return errore("L'utente non ha approvato l'operazione.");
  }
  try {
    const risultato = await funzione(blocco.input as Record<string, unknown>);
    return { type: "tool_result", tool_use_id: blocco.id, content: JSON.stringify(risultato) };
  } catch (e) {
    return errore(`Errore: ${String(e)}`);
  }
}
```

### Approvazioni

Per le azioni con effetti (pagamenti, invii, cancellazioni) l'harness chiede una **conferma umana** prima di eseguire, come nell'esempio sopra. In Claude Code lo stesso ruolo lo svolgono il sistema dei permessi (`allow`, `ask`, `deny`), le modalità di permesso e gli hook `PermissionRequest`; si può anche richiedere l'approvazione per uno specifico strumento MCP, che allora chiede conferma in ogni modalità. L'Agent SDK offre una callback per approvare o negare ogni chiamata.

---

## 8.2 Sviluppo di server MCP (2,1%)

### Architettura

Il **Model Context Protocol** è un protocollo aperto per collegare un'applicazione di IA a strumenti e dati esterni.

- **Host**: l'applicazione di IA (Claude Code, Claude Desktop, un IDE). Crea un client per ogni server.
- **Client**: mantiene la connessione con **un** server.
- **Server**: il programma che offre il contesto, locale o remoto.

Due livelli:

- **Livello dati**: protocollo **JSON-RPC 2.0** con le primitive e le notifiche. Nella versione `2026-07-28` della specifica il protocollo è **senza stato**: ogni richiesta porta nel campo `_meta` la versione del protocollo e le capacità, e il server dichiara le sue con la richiesta `server/discover`.
- **Livello di trasporto**:
  - **stdio**: input/output standard tra processi sulla stessa macchina; nessun overhead di rete; tipico dei server locali, che servono un solo client.
  - **Streamable HTTP**: HTTP POST dal client al server con SSE facoltativi per lo streaming; per i server remoti, con autenticazione standard (token bearer, chiavi, header) e OAuth consigliato.

### Le primitive

| Primitiva | Che cos'è | Metodi |
| --- | --- | --- |
| **Strumenti** (tools) | Funzioni eseguibili che il modello può invocare | `tools/list`, `tools/call` |
| **Risorse** (resources) | Dati di contesto: contenuti di file, record, risposte di API | `resources/list`, `resources/read` |
| **Prompt** | Modelli riutilizzabili per strutturare le interazioni | `prompts/list`, `prompts/get` |

Dal lato client esiste l'**elicitation** (`elicitation/create`): il server chiede all'utente informazioni o una conferma. Le notifiche (per esempio `notifications/tools/list_changed`) avvisano il client quando l'elenco degli strumenti cambia. Nella versione `2026-07-28` roots, sampling e logging del protocollo sono deprecati.

### Scrivere un server in TypeScript

```typescript
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

function createServer() {
  const server = new McpServer({ name: "tariffe-spedizione", version: "1.0.0" });
  server.registerTool(
    "calcola_tariffa",
    {
      description: "Calcola la tariffa di spedizione standard per peso e paese di destinazione",
      inputSchema: z.object({
        peso_kg: z.number().positive().describe("Peso del pacco in chilogrammi"),
        paese: z.string().length(2).describe("Codice ISO a due lettere (es. IT)"),
      }),
    },
    async ({ peso_kg, paese }) => ({
      content: [{ type: "text", text: `Tariffa calcolata per ${peso_kg} kg verso ${paese}` }],
    }),
  );
  return server;
}

serveStdio(createServer, { onerror: (error) => console.error(error) });
```

Lo schema Zod di `inputSchema` diventa in automatico lo schema JSON dello strumento. `serveStdio` riceve una funzione che crea il server: la usa a ogni richiesta di cui ha bisogno, ed è compatibile sia con i client della versione `2026-07-28` sia con quelli precedenti. Esiste anche l'SDK Python (`mcp`) con la classe `MCPServer`.

**Regola fondamentale per i server stdio**: non scrivere mai su **stdout** (`console.log()` in Node, `print()` in Python): corromperebbe i messaggi JSON-RPC. I log vanno su stderr (`console.error()`) o su file.

### Collegare il server

In **Claude Code**:

```bash
claude mcp add --transport stdio tariffe -- npx tsx tariffe.ts
claude mcp add --transport http --scope project crm https://mcp.example.com/mcp
```

Il file `.mcp.json` del progetto (ambito `project`) è versionato e condiviso; i segreti arrivano dalle variabili d'ambiente:

```json
{
  "mcpServers": {
    "crm": {
      "type": "http",
      "url": "${CRM_BASE_URL:-https://mcp.example.com}/mcp",
      "headers": { "Authorization": "Bearer ${CRM_TOKEN}" }
    }
  }
}
```

- Gli strumenti MCP compaiono come `mcp__<server>__<strumento>` (per esempio nelle regole di permesso e negli hook).
- I server di un `.mcp.json` di progetto richiedono approvazione nelle sessioni interattive; in `claude -p` e nell'Agent SDK vengono caricati senza chiedere.
- Claude Code avvisa quando l'output di uno strumento MCP supera 10.000 token; il limite predefinito è 25.000 (`MAX_MCP_OUTPUT_TOKENS`).
- Il trasporto SSE è deprecato: per i server remoti si usa HTTP.

Dalla **Messages API** l'**MCP connector** collega server MCP remoti senza scrivere un client MCP.

---

## 8.3 Personalizzazione degli agenti (4,1%)

### Quale forma di estensione scegliere

| Opzione | Che cosa è | Quando sceglierla |
| --- | --- | --- |
| **Strumenti integrati** | Strumenti già pronti: in Claude Code/Agent SDK Read, Edit, Bash, Grep, WebSearch...; nell'API gli strumenti server e quelli con schema Anthropic | La capacità esiste già: nessun codice da scrivere e manutenere |
| **Strumenti personalizzati** | Funzioni definite nella tua applicazione (`tools` nella Messages API) | Logica specifica di una sola applicazione, controllo totale su esecuzione e autorizzazioni |
| **Skill** | Istruzioni e risorse (`SKILL.md`) caricate quando servono | Insegnare una **procedura** o una conoscenza (come fare una cosa), non dare un accesso nuovo |
| **Server MCP** | Strumenti, risorse e prompt esposti con un protocollo standard | La stessa capacità serve a **più applicazioni o client**, va mantenuta in un solo posto, o è offerta da un fornitore |
| **Plugin** | Pacchetto di Skill, agenti, hook e server MCP | Distribuire una configurazione completa a un team o a più progetti |

Criteri di scelta:

- **Accesso o conoscenza?** Se serve raggiungere un sistema (database, API interna) servono strumenti o MCP; se serve spiegare come lavorare, una Skill.
- **Riutilizzo**: una funzione usata da un'unica applicazione può restare uno strumento personalizzato; una funzione condivisa tra più applicazioni o con Claude Code/Desktop va in un server MCP.
- **Costo di contesto**: ogni strumento definito consuma token a ogni richiesta; le Skill caricano il corpo solo quando servono; con molti strumenti si usa la ricerca degli strumenti.
- **Sicurezza**: ogni server MCP o plugin gira con i tuoi permessi: va controllato prima di installarlo; per gli strumenti personalizzati l'autorizzazione va nel codice.
- **Manutenzione**: logica duplicata nei prompt di più applicazioni è difficile da tenere allineata; un componente condiviso si aggiorna una volta sola.

---

## Ripasso rapido

- La descrizione è il criterio con cui Claude sceglie lo strumento: almeno 3–4 frasi, con quando usarlo e quando no.
- Pochi strumenti, non sovrapposti, con nomi prefissati e risposte compatte.
- Su Opus 5.5 e Sonnet 5.5 niente `tool_choice` forzato: `auto` + `strict: true` o output strutturato.
- Errori degli strumenti → `tool_result` con `is_error: true` e un messaggio utile.
- MCP: host, client, server; JSON-RPC 2.0; stdio o Streamable HTTP; strumenti, risorse e prompt.
- Server stdio: mai scrivere su stdout.
- Strumento personalizzato per una sola app, MCP per una capacità condivisa, Skill per una procedura.

Vedi anche: [Agenti e workflow](./studio.html?doc=domain-1) e [Sicurezza e protezione](./studio.html?doc=domain-7).

---

## Fonti ufficiali

- [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools) e [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
- [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [MCP: Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture) e [Build an MCP server](https://modelcontextprotocol.io/docs/develop/build-server)
- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (appendice sugli strumenti)
- [Skills](https://code.claude.com/docs/en/skills) e [Plugins overview](https://code.claude.com/docs/en/plugins)
