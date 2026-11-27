# Dominio 6: prompt e context engineering (11,0%)

Come si scrivono istruzioni efficaci, come si governa ciò che entra nella finestra di contesto e come si ottiene un output affidabile da usare nel codice.

| Competenza | Peso sull'esame |
| --- | --- |
| Context engineering | 3,8% |
| Prompt engineering | 4,6% |
| Gestione dell'output | 2,6% |

> Tutte le informazioni tecniche di questa pagina sono verificate sulla documentazione ufficiale Anthropic (novembre 2026). Le fonti sono elencate in fondo.

---

## 6.1 Context engineering (3,8%)

### Dal prompt al contesto

Il **prompt engineering** riguarda la scrittura delle istruzioni. Il **context engineering** riguarda l'intero insieme di token che il modello vede a ogni passo: istruzioni, strumenti, dati, storia dei messaggi, risultati degli strumenti. Negli agenti, che lavorano per molti turni, è la parte che fa la differenza.

### Il contesto è una risorsa limitata

Con l'aumentare dei token cala la capacità del modello di richiamare con precisione le informazioni (*context rot*), su tutti i modelli. Anthropic lo descrive come un **budget di attenzione**: ogni token aggiunto ne consuma una parte, quindi va aggiunto solo ciò che serve. Avere 1M di token disponibili non significa doverli riempire.

### Indicazioni per i singoli elementi

- **Prompt di sistema all'"altitudine giusta"**: né logica rigida del tipo se-allora codificata nel prompt, né indicazioni vaghe che danno per scontato il contesto. Si parte da un prompt minimo e si aggiungono istruzioni ed esempi per correggere gli errori osservati nei test.
- **Strumenti**: autonomi, tolleranti agli errori, con un ambito chiaro, poco sovrapposti e con risposte compatte. Se una persona non saprebbe scegliere quale strumento usare, nemmeno l'agente ci riuscirà.
- **Esempi**: pochi esempi **canonici** e diversi tra loro, non elenchi interminabili di casi limite.
- **Recupero al momento del bisogno** (*just-in-time*): invece di caricare tutto in anticipo, l'agente tiene riferimenti leggeri (percorsi di file, query salvate, link) e carica i contenuti con gli strumenti quando servono. Spesso funziona meglio un ibrido: un po' di dati caricati subito, il resto esplorato.

### Deriva e gonfiamento del contesto

Nei compiti lunghi il contesto si riempie di risultati vecchi, tentativi falliti e dettagli non più utili: il modello perde aderenza al compito (**deriva**) e ogni turno costa di più (**gonfiamento**). Le contromisure:

| Tecnica | Come funziona | Quando usarla |
| --- | --- | --- |
| **Compattazione** | Si sostituiscono i turni vecchi con un riassunto e si continua | Conversazioni lunghe con molto scambio |
| **Pulizia dei risultati degli strumenti** | Si eliminano i risultati vecchi, tenendo gli ultimi | Agenti con molte chiamate a strumenti |
| **Note strutturate** | L'agente scrive note persistenti fuori dal contesto e le ricarica | Lavori iterativi con tappe chiare |
| **Sottoagenti** | Compiti mirati in un contesto pulito che restituiscono una sintesi (spesso 1.000–2.000 token) | Ricerca o analisi complesse con esplorazione in parallelo |

### Compattazione lato server

La compattazione sostituisce i turni più vecchi con un riassunto scritto da Claude sul server, senza codice di riassunto tuo. Esistono due varianti, entrambe in beta:

- **Su richiesta**: decidi tu quando, con il parametro `compaction` e l'header beta `compact-2026-09-04`; il blocco restituito va messo per primo in `messages` al posto dei messaggi che riassume.
- **A soglia**: l'API compatta da sola quando i token in ingresso superano la soglia che imposti.

### Context editing: pulizia selettiva

Con l'header beta `context-management-2025-06-27` e il campo `context_management` si chiede all'API di togliere contenuti vecchi secondo regole precise. Il tuo client conserva la storia completa: la pulizia avviene sul server.

```json
{
  "model": "claude-opus-5-5",
  "max_tokens": 16000,
  "messages": [{"role": "user", "content": "Cerca gli sviluppi recenti sulla correzione degli errori quantistici..."}],
  "tools": [{"type": "web_search_20260209", "name": "web_search"}],
  "context_management": {
    "edits": [
      {
        "type": "clear_thinking_20251015",
        "keep": {"type": "thinking_turns", "value": 2}
      },
      {
        "type": "clear_tool_uses_20250919",
        "trigger": {"type": "input_tokens", "value": 50000},
        "keep": {"type": "tool_uses", "value": 5},
        "clear_at_least": {"type": "input_tokens", "value": 10000},
        "exclude_tools": ["web_search"]
      }
    ]
  }
}
```

- `clear_tool_uses_20250919` toglie i risultati degli strumenti più vecchi oltre una soglia (`trigger`, predefinita 100.000 token in ingresso), tenendo gli ultimi `keep` (predefinito 3). `clear_tool_inputs: true` toglie anche gli argomenti.
- `clear_thinking_20251015` toglie i blocchi di pensiero dei turni precedenti.
- Le modifiche applicate sono riportate in `context_management.applied_edits`.
- Pulire contenuti invalida la cache da quel punto: `clear_at_least` evita pulizie troppo piccole per valere il costo di una nuova scrittura in cache.

### Isolamento del contesto

Isolare significa dare a ogni parte del lavoro un contesto proprio:

- **Sottoagenti**: un contesto pulito per ogni compito mirato; al chiamante torna solo la sintesi.
- **Workflow a più passi**: ogni chiamata riceve solo ciò che le serve, non tutta la storia.
- **Memoria esterna**: file di note, `CLAUDE.md`, memory tool, letti all'inizio di una nuova sessione o finestra di contesto.

---

## 6.2 Prompt engineering (4,6%)

### Chiarezza

Claude risponde bene a istruzioni chiare ed esplicite. Il test suggerito da Anthropic: mostrare il prompt a un collega che non conosce il compito; se lui sarebbe confuso, lo sarà anche Claude.

- Specificare formato e vincoli dell'output.
- Usare passi numerati quando ordine e completezza contano.
- Chiedere esplicitamente ciò che si vuole oltre il minimo: i modelli attuali seguono le istruzioni in modo preciso e non indovinano.
- **Spiegare il perché**: "la risposta verrà letta da un sintetizzatore vocale, quindi non usare i puntini di sospensione" funziona meglio di "NON usare MAI i puntini di sospensione", perché Claude può generalizzare dalla motivazione.

### Esempi (few-shot)

Gli esempi sono uno dei modi più affidabili per guidare formato, tono e struttura. Devono essere **pertinenti** al caso reale, **diversi** tra loro (per non suggerire schemi involontari) e **strutturati** in tag `<example>` dentro `<examples>`. Ne servono di solito 3–5.

### Struttura con tag XML

```text
<istruzioni>
Classifica il ticket in una delle categorie indicate. Rispondi solo con la categoria.
</istruzioni>

<categorie>fatturazione, accesso, bug, altro</categorie>

<examples>
  <example>
    <ticket>Non riesco a entrare con la mia password</ticket>
    <categoria>accesso</categoria>
  </example>
  <example>
    <ticket>Mi avete addebitato due volte</ticket>
    <categoria>fatturazione</categoria>
  </example>
</examples>

<ticket>{{TICKET}}</ticket>
```

Tag coerenti e descrittivi, annidati quando il contenuto ha una gerarchia.

### Prompt di sistema e prompt dell'utente

- Il **prompt di sistema** (`system`) contiene il ruolo, le regole stabili, il contesto dell'applicazione. Anche una sola frase di ruolo cambia comportamento e tono.
- Il **messaggio dell'utente** contiene la richiesta specifica e i dati variabili.
- Il contenuto non fidato (documenti, pagine web, risultati di strumenti) **non** va nel prompt di sistema: vedi il [dominio 7](./studio.html?doc=domain-7).

### Dove mettere le istruzioni nei prompt lunghi

Con documenti o dati lunghi (oltre 20.000 token):

- mettere i **dati in alto** e la **domanda in fondo**: secondo i test di Anthropic le domande alla fine migliorano la qualità fino al 30%, soprattutto con più documenti;
- racchiudere ogni documento in `<document>` con sotto-tag `<source>` e `<document_content>`;
- chiedere di **citare** prima i passaggi rilevanti e poi rispondere.

### Vincoli sull'output

- Dire che cosa fare invece di che cosa non fare ("scrivi in paragrafi" invece di "non usare elenchi").
- Chiedere l'output dentro tag XML per estrarlo facilmente.
- Per un formato JSON garantito, usare l'output strutturato (sezione 6.3).
- **Prefill non più supportato**: dai modelli 4.6 in poi un ultimo messaggio dell'assistente precompilato restituisce errore 400. Al suo posto: output strutturato, istruzioni esplicite ("rispondi senza preambolo"), tag XML.

### Azione o suggerimento

I modelli attuali seguono alla lettera: "puoi suggerire delle modifiche?" produce suggerimenti, "modifica questa funzione per migliorarne le prestazioni" produce le modifiche. Se si vuole un comportamento proattivo lo si dice nel prompt di sistema.

### Raffinamento iterativo

1. Scrivere una prima versione e i criteri di successo.
2. Eseguire le eval su casi reali e limite.
3. Analizzare gli errori e correggere il prompt (istruzioni, esempi, struttura) uno alla volta.
4. Ripetere, versionando ogni prompt.

### Sanificazione dell'input

Prima di inserire input dell'utente o di terzi nel prompt:

- racchiuderlo in tag o codificarlo in JSON, così non può "uscire" dal suo contenitore;
- limitarne la lunghezza;
- filtrare schemi noti di iniezione, eventualmente con un modello leggero che fa da filtro;
- non concatenarlo mai alle istruzioni come testo libero.

---

## 6.3 Gestione dell'output (2,6%)

### Output strutturato

Con `output_config.format` di tipo `json_schema` Claude restituisce **sempre** JSON valido conforme allo schema, grazie alla decodifica vincolata: niente errori di parsing, tipi e campi obbligatori garantiti, nessun nuovo tentativo per violazioni dello schema.

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const Contatto = z.object({
  nome: z.string(),
  email: z.string(),
  piano: z.string(),
  demo_richiesta: z.boolean(),
});

const client = new Anthropic();

const risposta = await client.messages.parse({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: "Estrai i dati: Mario Rossi (mario@example.com) vuole il piano Enterprise e una demo martedì.",
    },
  ],
  output_config: { format: zodOutputFormat(Contatto) },
});

console.log(risposta.parsed_output); // già validato e tipizzato come z.infer<typeof Contatto>
```

Senza Zod si passa lo schema JSON direttamente in `output_config.format` di `client.messages.create` e si legge il blocco di testo con `JSON.parse`.

Limiti da conoscere:

- Supportati: tipi base, `enum`, `const`, `anyOf`, `allOf`, `$ref`/`$defs`, `required`, formati di stringa comuni.
- **Non** supportati (errore 400): schemi ricorsivi, `oneOf`, `not`, vincoli numerici (`minimum`, `maximum`) e di lunghezza delle stringhe; `additionalProperties` deve essere `false`.
- La prima richiesta con uno schema nuovo ha una latenza in più per compilare la grammatica (resta in cache 24 ore).

Per gli strumenti esiste l'equivalente: `strict: true` nella definizione garantisce che gli argomenti rispettino lo schema. Vedi il [dominio 8](./studio.html?doc=domain-8).

### Validazione della risposta

Lo schema garantisce la **forma**, non il **contenuto**. Restano da controllare nel codice:

- vincoli che lo schema non può esprimere (intervalli numerici, somme che devono tornare, date coerenti);
- coerenza con le fonti (un importo estratto esiste davvero nel documento?);
- la risposta può comunque non arrivare: con `stop_reason` `max_tokens` o `refusal` il JSON può mancare o essere incompleto.

Se la validazione fallisce, si può rimandare a Claude l'errore specifico chiedendo di correggerlo, con un numero massimo di tentativi.

### Parsing difensivo

Quando l'output non è vincolato da uno schema (o arriva da un modello di cui non si controlla il formato):

```typescript
interface Fattura {
  importo: number;
  [campo: string]: unknown;
}

/** Estrae e valida l'oggetto JSON senza fidarsi del formato. */
function leggiJson(testo: string): Fattura | null {
  const inizio = testo.indexOf("{");
  const fine = testo.lastIndexOf("}");
  if (inizio === -1 || fine === -1) return null;

  let dati: unknown;
  try {
    dati = JSON.parse(testo.slice(inizio, fine + 1));
  } catch {
    return null;
  }
  if (typeof dati !== "object" || dati === null) return null;

  const { importo } = dati as Record<string, unknown>;
  if (typeof importo !== "number") return null; // campo mancante o di tipo sbagliato
  return dati as Fattura;
}
```

Regole: controllare `stop_reason` prima di leggere, cercare il blocco di tipo `text` invece di prendere il primo blocco (con il pensiero attivo il primo può essere `thinking`), validare campi e tipi, gestire esplicitamente il caso "nessun dato".

### Scetticismo verso gli output troppo sicuri

Un tono sicuro non è una prova di correttezza. Contromisure:

- chiedere citazioni o estratti delle fonti per ogni affermazione importante;
- permettere esplicitamente di rispondere "non lo so" o di lasciare campi vuoti (campi annullabili negli schemi);
- verificare in modo indipendente i dati critici (con il codice, con una seconda istanza o con una persona);
- non usare la "confidenza" dichiarata dal modello come unico criterio per automatizzare decisioni importanti.

---

## Ripasso rapido

- Il contesto è un budget di attenzione: solo ciò che serve, recuperato quando serve.
- Deriva e gonfiamento si combattono con compattazione, pulizia dei risultati, note strutturate e sottoagenti.
- Istruzioni chiare con il perché; 3–5 esempi diversi in `<example>`; struttura con tag XML.
- Dati lunghi in alto, domanda in fondo; niente prefill sui modelli attuali.
- `output_config.format` garantisce il JSON valido; la validazione del contenuto resta al tuo codice.
- Una risposta sicura di sé non è per questo corretta.

Vedi anche: [Sicurezza e protezione](./studio.html?doc=domain-7) per l'input non fidato.

---

## Fonti ufficiali

- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) e [Context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing)
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Mitigate jailbreaks and prompt injections](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
