# Dominio 4: eval, test e debug (2,6%)

Il dominio con il peso più basso, ma con concetti che ritornano ovunque: come si capisce se un'applicazione Claude funziona, che cosa fare quando qualcosa si rompe e come capire se il problema è nel tuo codice o nella risposta del modello.

| Competenza | Peso sull'esame |
| --- | --- |
| Debug e gestione degli errori | 2,6% |

> Tutte le informazioni tecniche di questa pagina sono verificate sulla documentazione ufficiale Anthropic (novembre 2026). Le fonti sono elencate in fondo.

---

## 4.1 Le eval: misurare prima di correggere

Un **eval** è un insieme di test ripetibili che misura la qualità delle risposte. Senza eval ogni modifica al prompt o al modello è un'ipotesi.

### Criteri di successo

Secondo la documentazione Anthropic un buon criterio è:

- **Specifico**: "classificazione accurata del sentiment", non "buone prestazioni".
- **Misurabile**: metriche quantitative (accuratezza, F1, tempo di risposta) o scale qualitative ben definite (per esempio Likert da 1 a 5). Anche la sicurezza si misura: "meno dello 0,1% di output segnalati su 10.000 prove".
- **Raggiungibile**: basato su benchmark, esperimenti precedenti o conoscenza esperta.
- **Rilevante**: allineato allo scopo; l'accuratezza delle citazioni conta più in un'app medica che in una chat informale.

Quasi sempre servono più dimensioni insieme: fedeltà al compito, coerenza, tono, tutela della privacy, uso del contesto, latenza e costo.

### Progettare le eval

1. **Specifiche per il compito**: riflettono la distribuzione reale degli input e includono casi limite (input irrilevanti o troppo lunghi, input ostili, casi ambigui su cui anche le persone non concordano).
2. **Automatiche dove possibile**: scelta multipla, confronto di stringhe, controlli nel codice, valutazione con un modello.
3. **Volume prima della qualità**: molte domande valutate in automatico, anche con segnale un po' più debole, battono poche domande valutate a mano.

### Metodi di valutazione

| Metodo | Esempi | Punti di forza | Limiti |
| --- | --- | --- | --- |
| **Codice** | Corrispondenza esatta, ROUGE, similarità del coseno, validazione JSON | Veloce, economico, ripetibile | Funziona solo con output verificabili in modo meccanico |
| **Modello (LLM come giudice)** | Scala Likert sul tono, sì/no su "contiene dati personali?" | Valuta aspetti qualitativi su larga scala | Va calibrato e controllato |
| **Persone** | Esperti con una griglia di valutazione | Il più affidabile sui giudizi complessi | Lento e costoso |

Valutatore nel codice:

```typescript
function corrispondenzaEsatta(output: string, rispostaCorretta: string): boolean {
  return output.trim().toLowerCase() === rispostaCorretta.toLowerCase();
}
```

Valutatore con un modello, con output vincolato da uno schema:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SCHEMA = {
  type: "object",
  properties: {
    punteggio: { type: "integer", enum: [1, 2, 3, 4, 5] },
    motivo: { type: "string" },
  },
  required: ["punteggio", "motivo"],
  additionalProperties: false,
};

interface Valutazione {
  punteggio: number;
  motivo: string;
}

async function valutaTono(risposta: string): Promise<Valutazione> {
  const r = await client.messages.create({
    model: "claude-sonnet-5-5", // meglio un modello diverso da quello valutato
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Valuta da 1 a 5 quanto questa risposta è cortese e professionale.\n<risposta>${risposta}</risposta>`,
      },
    ],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  });
  const blocco = r.content.find((b) => b.type === "text");
  if (blocco?.type !== "text") throw new Error(`Nessuna valutazione (stop_reason: ${r.stop_reason})`);
  const esito: Valutazione = JSON.parse(blocco.text);
  // Fallire in modo esplicito sui valori inattesi
  if (![1, 2, 3, 4, 5].includes(esito.punteggio)) throw new Error(`Punteggio inatteso: ${esito.punteggio}`);
  return esito;
}
```

Consigli per la valutazione con un modello: usare un modello diverso da quello che ha generato l'output, vincolare il formato della risposta, controllare l'output del valutatore e fallire in modo esplicito sui valori inattesi.

---

## 4.2 Riconoscere il tipo di errore

### Errori dell'API (HTTP 4xx/5xx)

| Tipo | Esempi | Strategia |
| --- | --- | --- |
| Errore della richiesta | 400 `invalid_request_error`, 413 `request_too_large` | **Non** riprovare uguale: correggere la richiesta |
| Autenticazione e permessi | 401, 403 | Controllare chiave, workspace e permessi |
| Limiti | 429 `rate_limit_error` | Riprovare con attesa (`retry-after`), ridurre il parallelismo, usare il batch |
| Lato server | 500 `api_error`, 529 `overloaded_error`, 504 `timeout_error` | Riprovare con backoff esponenziale; per richieste lunghe usare lo streaming o il batch |

Gli SDK ritentano da soli fino a 2 volte gli errori di connessione, i timeout e gli stati 408, 409, 429 e ≥500, rispettando `x-should-retry` e `retry-after`. Un errore dentro uno stream non viene ritentato dall'SDK.

### Problemi nella risposta del modello (HTTP 200)

| Sintomo | Come riconoscerlo | Strategia |
| --- | --- | --- |
| Risposta troncata | `stop_reason: "max_tokens"` | Aumentare `max_tokens` (ricordando che include il pensiero) o chiedere di continuare |
| Contesto pieno | `stop_reason: "model_context_window_exceeded"` | Trattare come troncata; ridurre il contesto (compattazione, pulizia) |
| Rifiuto | `stop_reason: "refusal"` | Leggere `stop_details`; riprovare su un modello di riserva, oppure cambiare il prompt |
| Strumento fallito | Il tuo codice solleva un'eccezione | Restituire `tool_result` con `is_error: true` e un messaggio utile; limitare i tentativi |
| Chiamata a strumento non valida | Parametri mancanti o sbagliati | Migliorare la descrizione, oppure `strict: true` per garantire lo schema |
| JSON non valido o campi mancanti | Il parsing fallisce | Usare l'output strutturato (`output_config.format`) invece di chiedere JSON a parole |
| Contenuto sbagliato ma ben formato | Solo le eval o una verifica lo rivelano | Validazione semantica, revisione, miglioramento del prompt |

Un messaggio di errore utile dice **che cosa è andato storto e che cosa provare**:

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
  "content": "Limite di frequenza superato. Riprova tra 60 secondi.",
  "is_error": true
}
```

---

## 4.3 Analizzare le tracce

Una **traccia** registra ogni passo di una richiesta. Per un'applicazione Claude conviene salvare almeno:

- l'elenco completo dei messaggi inviati (prompt di sistema, storia, strumenti) e la versione del prompt;
- il modello, l'effort e gli altri parametri;
- la risposta completa: blocchi, `stop_reason`, `usage` (token in ingresso, in uscita, di cache);
- ogni chiamata a strumento con argomenti, risultato ed eventuale `is_error`;
- il `request_id` di ogni chiamata, da citare nelle segnalazioni ad Anthropic.

Leggendo la traccia si cerca il **primo passo** in cui il comportamento si allontana da quello atteso: uno strumento scelto male, un risultato di strumento ambiguo, un'informazione persa nel contesto, un'istruzione ignorata.

In Claude Code le tracce sono disponibili come:

- trascrizioni delle sessioni (file `.jsonl`, riprendibili con `--resume`);
- output `--output-format stream-json`, con un evento per ogni messaggio, chiamata a strumento e risultato, e l'evento `system/api_retry` per i nuovi tentativi;
- `claude doctor` e `/status` per i problemi di configurazione.

---

## 4.4 Isolare l'origine del problema

| Domanda | Se sì, il problema è probabilmente... |
| --- | --- |
| La richiesta inviata è quella che pensavi? (storia, strumenti, versione del prompt) | ...nell'**integrazione** se la richiesta non è quella attesa |
| La stessa richiesta, ripetuta, fallisce sempre allo stesso modo? | ...deterministico: codice, schema o prompt |
| Il risultato dello strumento era corretto e chiaro? | ...nello **strumento** se il dato era sbagliato o confuso |
| Il modello ha ricevuto tutto ciò che serviva ma ha risposto male? | ...nella **risposta del modello**: prompt, esempi, effort o modello |

Strategia pratica:

1. Riprodurre il caso con la richiesta esatta salvata nella traccia.
2. Togliere variabili: stesso prompt con meno contesto, strumento sostituito da un valore fisso, modello o effort diversi.
3. Correggere il livello giusto: il codice se la richiesta è sbagliata, la descrizione o il risultato dello strumento se la scelta dello strumento è sbagliata, il prompt (istruzioni, esempi) se l'interpretazione è sbagliata.
4. Aggiungere il caso alle eval, così il problema non torna.

Le risposte del modello non sono deterministiche: un errore che compare una volta su dieci va misurato su più esecuzioni, non giudicato su un singolo tentativo.

---

## Ripasso rapido

- Criteri di successo specifici, misurabili, raggiungibili e rilevanti; eval automatiche e numerose.
- Codice dove si può, modello come giudice per il qualitativo, persone per i casi difficili.
- 400 non si riprova uguale; 429, 500, 529 si riprovano con attesa (gli SDK lo fanno da soli fino a 2 volte).
- `max_tokens`, `refusal` e `model_context_window_exceeded` arrivano come HTTP 200: vanno gestiti nel codice.
- Errori degli strumenti → `is_error: true` con un messaggio che dice cosa fare.
- Prima si isola l'origine (integrazione, strumento o modello), poi si corregge; ogni bug diventa un caso di eval.

Vedi anche il [dominio 6](./studio.html?doc=domain-6) per la validazione dell'output.

---

## Fonti ufficiali

- [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [API errors](https://platform.claude.com/docs/en/api/errors)
- [Handling stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
- [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
- [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
