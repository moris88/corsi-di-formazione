# Dominio 1: agenti e workflow (14,7%)

Questo dominio riguarda il modo in cui si progettano e si costruiscono sistemi agentici con Claude: quando basta un workflow e quando serve un agente, come si costruisce il ciclo, quali schemi esistono e dove si mettono i controlli che non devono dipendere dal modello.

| Competenza | Peso sull'esame |
| --- | --- |
| Architettura degli agenti | 4,5% |
| Costruzione di agenti con Claude | 5,3% |
| Schemi e framework per agenti | 4,9% |

> Tutte le informazioni tecniche di questa pagina sono verificate sulla documentazione ufficiale Anthropic (novembre 2026). Le fonti sono elencate in fondo.

---

## 1.1 Architettura degli agenti (4,5%)

### Workflow e agenti

Anthropic chiama **sistemi agentici** sia i workflow sia gli agenti, ma li distingue con precisione:

| | Workflow | Agente |
| --- | --- | --- |
| Chi decide i passi | Il codice, con percorsi predefiniti | Il modello, che dirige da sé il processo e l'uso degli strumenti |
| Prevedibilità | Alta | Più bassa |
| Costo e latenza | Più bassi | Più alti |
| Adatto a | Compiti ben definiti, che richiedono coerenza | Problemi aperti, in cui i passi non si possono prevedere |

La regola di partenza è **la soluzione più semplice che funziona**: spesso basta una singola chiamata ottimizzata con recupero di informazioni ed esempi nel prompt. I sistemi agentici scambiano latenza e costo con prestazioni migliori, quindi si aggiunge complessità solo quando i risultati lo giustificano.

Domande da farsi prima di scegliere un agente:

- Il percorso è noto in anticipo? Allora un workflow è più prevedibile, più economico e più facile da testare.
- Il compito richiede di adattarsi a ciò che si scopre strada facendo (per esempio un bug da cercare in una codebase sconosciuta)? Allora serve un agente.
- L'ambiente è fidato e l'errore è recuperabile? Gli agenti autonomi accumulano errori: vanno provati in sandbox e con guardrail.

### Il mattone di base: l'LLM aumentato

Ogni sistema agentico parte da un **LLM aumentato** con strumenti, recupero di informazioni e memoria: il modello genera le proprie ricerche, sceglie gli strumenti e decide cosa conservare. Il lavoro di progettazione consiste nell'adattare queste capacità al caso d'uso e nel dare al modello un'interfaccia ben documentata. MCP è uno dei modi per farlo.

### Gerarchie manager/supervisore

Nello schema **orchestratore-lavoratori** un modello centrale scompone il compito in modo dinamico, lo delega a lavoratori e sintetizza i risultati. È utile quando i sotto-compiti non si possono prevedere (per esempio modifiche che toccano molti file).

Compromessi da conoscere:

- **Pro**: parallelismo, specializzazione, contesto pulito per ogni lavoratore.
- **Contro**: più chiamate e più token, più punti in cui l'informazione si perde, errori che si sommano. Il supervisore vede solo ciò che i lavoratori gli restituiscono.
- Il supervisore deve passare in modo **esplicito** ai lavoratori tutto ciò che serve: un sottoagente non eredita la conversazione.

### Sottoagenti

Un sottoagente lavora in una **propria finestra di contesto**, con un proprio prompt di sistema, propri strumenti e propri permessi. Il suo output verboso resta fuori dalla conversazione principale: al chiamante torna solo una sintesi.

Quando usarli (indicazioni della documentazione di Claude Code):

- **Sottoagente**: l'output è lungo e non serve nel contesto principale, si vogliono imporre restrizioni sugli strumenti, il lavoro è autonomo e può restituire un riassunto.
- **Skill**: prompt o procedure riutilizzabili che devono girare nel contesto della conversazione principale.
- **Conversazione principale**: lavoro iterativo, contesto condiviso tra le fasi, modifiche rapide, latenza importante.

---

## 1.2 Costruzione di agenti con Claude (5,3%)

### Il ciclo agentico fatto a mano

Un agente, nella forma più semplice, è **un modello che usa strumenti in un ciclo**. Il ciclo continua finché la risposta ha `stop_reason: "tool_use"` e si chiude quando il modello termina (`end_turn`) o quando scatta un limite di sicurezza.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MAX_TURNI = 20;

// Il tuo dispatch: chiama la funzione giusta in base al nome
declare function eseguiStrumento(nome: string, argomenti: unknown): Promise<string>;

async function agente(richiesta: string, tools: Anthropic.Tool[]): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: richiesta }];

  for (let turno = 0; turno < MAX_TURNI; turno++) { // limite di sicurezza
    const risposta = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      tools,
      messages,
    });
    // La risposta va rimessa nella storia così com'è (anche i blocchi thinking)
    messages.push({ role: "assistant", content: risposta.content });

    if (risposta.stop_reason !== "tool_use") {
      return risposta.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    }

    const risultati: Anthropic.ToolResultBlockParam[] = [];
    for (const blocco of risposta.content) {
      if (blocco.type !== "tool_use") continue;
      try {
        const esito = await eseguiStrumento(blocco.name, blocco.input);
        risultati.push({ type: "tool_result", tool_use_id: blocco.id, content: esito });
      } catch (errore) {
        risultati.push({
          type: "tool_result",
          tool_use_id: blocco.id,
          content: `Errore: ${String(errore)}`,
          is_error: true,
        });
      }
    }
    // Tutti i risultati in un unico messaggio utente, prima di qualsiasi testo
    messages.push({ role: "user", content: risultati });
  }
  throw new Error("Limite di turni raggiunto");
}
```

Punti fermi del ciclo:

- La condizione di uscita è lo `stop_reason`, non il contenuto del testo.
- Ogni `tool_use` riceve un `tool_result` con lo stesso `tool_use_id`, **anche quando lo strumento fallisce** (con `is_error: true`).
- I `tool_result` vanno nel messaggio utente che segue subito, e vanno **prima** di eventuale testo.
- Il limite di iterazioni è una rete di sicurezza, non il criterio principale di uscita.
- Con il pensiero attivo, i blocchi `thinking` restituiti vanno rimandati **intatti** insieme ai risultati degli strumenti.

Al posto del ciclo scritto a mano, gli SDK client offrono un **tool runner** che esegue gli strumenti e rimanda i risultati in automatico.

### L'harness

L'**harness** è tutto il codice che circonda il modello: costruisce le richieste, esegue gli strumenti, gestisce errori, nuovi tentativi, permessi e contesto. Scriverne uno personalizzato ha senso quando servono controlli molto specifici; altrimenti conviene partire da un harness esistente.

### Il Claude Agent SDK

L'Agent SDK offre **lo stesso ciclo, gli stessi strumenti e la stessa gestione del contesto di Claude Code**, programmabili in Python e TypeScript. Include strumenti integrati (lettura, scrittura e modifica di file, comandi, ricerca web), hook, sottoagenti, MCP, permessi, sessioni, Skill e plugin.

Installazione: `npm install @anthropic-ai/claude-agent-sdk` (esiste anche il pacchetto Python `claude-agent-sdk`). L'autenticazione usa `ANTHROPIC_API_KEY`; in alternativa Bedrock, Vertex, Foundry o Claude Platform on AWS con le rispettive variabili (`CLAUDE_CODE_USE_BEDROCK=1` e simili).

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Rivedi utils.ts e correggi i bug che causano crash.",
  options: {
    allowedTools: ["Read", "Edit", "Glob"], // approvati senza chiedere
    permissionMode: "acceptEdits", // modifiche ai file approvate
    systemPrompt: "Sei uno sviluppatore TypeScript senior. Segui le convenzioni del progetto.",
  },
})) {
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
    }
  } else if (message.type === "result") {
    console.log(`Fine: ${message.subtype}`);
  }
}
```

`query` restituisce un iteratore asincrono, da leggere con `for await`: ogni messaggio è un ragionamento, una chiamata a strumento, un risultato o l'esito finale. L'SDK gestisce orchestrazione, esecuzione degli strumenti, contesto e nuovi tentativi.

### Quale strumento scegliere

| Vuoi | Usa |
| --- | --- |
| Incorporare l'agente di Claude Code nella tua applicazione, in un processo che gestisci tu | **Agent SDK** |
| Lavorare in modo interattivo o lanciare compiti singoli dal terminale | **Claude Code CLI** |
| Chiamare direttamente l'API dal tuo codice e scrivere il ciclo da te (o con il tool runner) | **Client SDK** |
| Far ospitare l'agente ad Anthropic, configurandolo tramite API | **Managed Agents** |

### Agenti gestiti: dove gira l'agente

- **Self-hosted**: l'agente (per esempio costruito con l'Agent SDK) gira in un processo, container o pipeline che gestisci tu.
- **Ospitato da Anthropic**: con **Managed Agents** Anthropic fornisce l'harness che esegue il ciclo; le sessioni girano in una sandbox cloud gestita da Anthropic oppure in una sandbox ospitata sulla tua infrastruttura. Si usa tramite SDK, CLI `ant` o API REST.

Da altri linguaggi si può guidare lo stesso ciclo eseguendo la CLI come sottoprocesso con `claude -p` e `--output-format json`.

### Hook per azioni deterministiche

Un'istruzione nel prompt è **probabilistica**: il modello di solito la segue, ma non è garantito. Un **hook** è codice che scatta in un punto preciso del ciclo e può bloccare o modificare un'azione: è **deterministico**. La documentazione di Claude Code lo dice chiaramente: per bloccare un'azione qualunque cosa decida Claude, si usa un hook `PreToolUse`, non un'istruzione in `CLAUDE.md`.

Esempi tipici: bloccare `rm -rf`, impedire la modifica di file protetti, imporre un controllo prima di un rimborso, eseguire il formattatore dopo ogni modifica (`PostToolUse`). Il dettaglio di configurazione è nel [dominio 7](./studio.html?doc=domain-7).

---

## 1.3 Schemi e framework per agenti (4,9%)

### Gli schemi di workflow

| Schema | Come funziona | Quando usarlo |
| --- | --- | --- |
| **Catena di prompt** | Ogni chiamata elabora l'output della precedente; tra un passo e l'altro ci sono controlli nel codice ("gate") | Il compito si divide in sotto-compiti fissi: si scambia latenza con accuratezza |
| **Instradamento (routing)** | Si classifica l'input e lo si manda a un percorso specializzato | Categorie distinte gestite meglio separatamente; la classificazione è affidabile. Esempio: domande facili a un modello piccolo, difficili a uno più capace |
| **Parallelizzazione: sezionamento** | Sotto-compiti indipendenti eseguiti in parallelo | Un modello controlla l'input come guardrail mentre un altro risponde; più eval su aspetti diversi |
| **Parallelizzazione: voto** | Lo stesso compito eseguito più volte | Serve più fiducia nel risultato (per esempio più revisioni di sicurezza dello stesso codice) |
| **Orchestratore-lavoratori** | Un modello centrale scompone, delega e sintetizza | I sotto-compiti non si possono prevedere |
| **Valutatore-ottimizzatore** | Un modello genera, un altro valuta e dà indicazioni in un ciclo | Criteri di valutazione chiari e iterazioni che migliorano davvero il risultato |

### Agenti autonomi

Partono da un comando o da una discussione con una persona, poi pianificano e agiscono da soli. A ogni passo verificano la **realtà dell'ambiente** (risultati degli strumenti, esecuzione del codice), si fermano per un riscontro umano ai punti di controllo o quando sono bloccati e usano condizioni di arresto come un numero massimo di iterazioni.

### Schemi di supporto

- **Ciclo di uso degli strumenti**: la struttura descritta nella sezione 1.2.
- **Sottoagenti**: per isolare il contesto e parallelizzare l'esplorazione; tornano sintesi brevi.
- **Memoria**: note persistenti fuori dalla finestra di contesto (file, memory tool, memoria degli agenti di Claude Code), ricaricate quando servono.
- **Gestione della finestra di contesto**: compattazione, pulizia dei risultati vecchi, recupero al momento del bisogno. Vedi il [dominio 6](./studio.html?doc=domain-6).

### I framework

Esistono framework che offrono astrazioni per agenti e workflow a più passi, per esempio **Claude Agent SDK, Strands Agents SDK, LangGraph, PydanticAI**. Semplificano compiti comuni (chiamare il modello, definire strumenti, concatenare chiamate), ma aggiungono livelli che possono **nascondere prompt e risposte**, rendendo il debug più difficile e invitando a complessità non necessaria.

Il consiglio di Anthropic: partire dalle API direttamente; se si usa un framework, capire il codice che c'è sotto.

### I tre principi

1. Mantenere semplice il progetto dell'agente.
2. Privilegiare la **trasparenza**, mostrando in modo esplicito i passi di pianificazione.
3. Curare l'**interfaccia agente-computer** (ACI): documentare e testare bene gli strumenti. Vedi il [dominio 8](./studio.html?doc=domain-8).

---

## Ripasso rapido

- Workflow = percorso deciso dal codice; agente = percorso deciso dal modello. Si parte dal più semplice.
- Il ciclo si chiude sullo `stop_reason`; il limite di turni è solo una rete di sicurezza.
- Ogni `tool_use` vuole il suo `tool_result`, anche in caso di errore (`is_error: true`).
- Un sottoagente ha un contesto separato: va istruito in modo esplicito e restituisce una sintesi.
- Una regola che deve valere **sempre** va imposta dal codice (hook, permessi), non chiesta nel prompt.
- Agent SDK = Claude Code come libreria; Managed Agents = harness ospitato da Anthropic.
- I framework aiutano, ma nascondono i prompt: bisogna sapere cosa fanno.

Vedi anche: [Strumenti e MCP](./studio.html?doc=domain-8) e [Prompt e context engineering](./studio.html?doc=domain-6).

---

## Fonti ufficiali

- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (Anthropic Engineering)
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) e [Quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart)
- [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) e [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
- [Subagents in Claude Code](https://code.claude.com/docs/en/sub-agents)
- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
