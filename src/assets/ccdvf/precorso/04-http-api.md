# PC4 · HTTP, JSON e API REST

## Perché serve all'esame

La Claude API è un'API REST: una richiesta HTTP con un corpo JSON e una risposta HTTP con un corpo JSON. Anche usando un SDK, le domande ragionano su questi elementi: un codice di stato, un header, un evento di streaming, uno schema JSON. Chi li riconosce risolve in fretta gli scenari di errore e di integrazione.

| Dove compare | Cosa chiede l'esame | Dominio |
| --- | --- | --- |
| Codici di stato `4xx` e `5xx` | Capire se ritentare o correggere la richiesta | [D2](./studio.html?doc=domain-2), [D4](./studio.html?doc=domain-4) |
| Risposta `200` con `stop_reason` | Non considerare riuscita ogni risposta riuscita a livello HTTP | [D2](./studio.html?doc=domain-2), [D4](./studio.html?doc=domain-4) |
| Header di autenticazione | Dove vive la chiave e chi la usa | [D7](./studio.html?doc=domain-7) |
| Streaming a eventi | Leggere gli eventi e gestire gli errori nello stream | [D2](./studio.html?doc=domain-2), [D5](./studio.html?doc=domain-5) |
| JSON Schema | Descrivere gli input degli strumenti e l'output strutturato | [D8](./studio.html?doc=domain-8), [D6](./studio.html?doc=domain-6) |
| API senza stato | Rinviare la storia a ogni richiesta, con costi di token | [D2](./studio.html?doc=domain-2), [D5](./studio.html?doc=domain-5) |

---

## 1. Anatomia di una richiesta e di una risposta

Una **richiesta** HTTP ha un metodo, un indirizzo, degli header e (a volte) un corpo.

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2026-10-21" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Ciao, Claude"}]
  }'
```

| Parte | Nell'esempio | Significato |
| --- | --- | --- |
| Metodo | `POST` (implicito con `-d`) | Che cosa si vuole fare |
| Indirizzo | `/v1/messages` | La risorsa chiamata |
| `x-api-key` | la chiave | Autenticazione |
| `anthropic-version` | una data | Versione del contratto dell'API |
| `content-type` | `application/json` | Formato del corpo |
| Corpo | un oggetto JSON | I parametri della richiesta |

La **risposta** ha un **codice di stato**, degli header e un corpo JSON. Con gli SDK scrivi meno codice, ma la sostanza non cambia: gli SDK costruiscono questa richiesta per te.

## 2. I metodi e i codici di stato

I metodi principali: `GET` (leggere), `POST` (creare o eseguire), `PUT`/`PATCH` (modificare), `DELETE` (cancellare).

I codici di stato si leggono per **famiglia**:

| Famiglia | Significato | Atteggiamento |
| --- | --- | --- |
| `2xx` | Riuscita | Usare la risposta, ma controllare anche il contenuto |
| `4xx` | Errore della richiesta | Di norma **non** si ritenta uguale: si corregge |
| `5xx` | Errore del server | Si ritenta con attesa crescente |

I codici della Claude API, e che cosa fare:

| Codice | Tipo | Che cosa fare |
| --- | --- | --- |
| `400` | `invalid_request_error` | Correggere la richiesta: ritentarla uguale fallisce di nuovo |
| `401` | `authentication_error` | Controllare la chiave |
| `403` | `permission_error` | Controllare i permessi |
| `413` | `request_too_large` | Ridurre la richiesta |
| `429` | `rate_limit_error` | Attendere quanto indica `retry-after`, ridurre il parallelismo |
| `500` | `api_error` | Ritentare con attesa |
| `504` | `timeout_error` | Ritentare, valutare streaming o batch per richieste lunghe |
| `529` | `overloaded_error` | Ritentare con attesa |

Ogni errore ha un corpo JSON con `type`, `message` e un `request_id`, da citare nelle segnalazioni al supporto. L'elenco completo è nel [dominio 2](./studio.html?doc=domain-2) e la strategia di debug nel [dominio 4](./studio.html?doc=domain-4).

> **Trappola frequente.** Una risposta `200` non vuol dire che il compito sia riuscito: la risposta può essere troncata (`stop_reason: "max_tokens"`), rifiutata (`refusal`) o ben formata ma sbagliata. Gli errori **di rete** e gli **esiti del modello** sono problemi diversi e hanno rimedi diversi ([dominio 4](./studio.html?doc=domain-4)).

## 3. Ritentare bene

Ritentare ha senso solo per errori **temporanei**: connessione caduta, timeout, `429`, `5xx`. Le regole:

1. **Attesa crescente** (backoff esponenziale), con un massimo di tentativi.
2. Se c'è l'header `retry-after`, **si rispetta**.
3. Nessun tentativo sugli errori di richiesta (`400`): il risultato sarebbe lo stesso.
4. Occhio agli effetti collaterali: ritentare un'operazione che cambia qualcosa (un ordine, un rimborso) può **duplicarla**. Gli strumenti che modificano dati devono essere **idempotenti** ([dominio 8](./studio.html?doc=domain-8)).

Gli SDK ufficiali lo fanno già: ritentano fino a 2 volte gli errori di connessione, i timeout e gli stati `408`, `409`, `429` e `5xx`. Un errore che arriva **dentro uno stream** non viene ritentato dall'SDK ([dominio 2](./studio.html?doc=domain-2)).

## 4. JSON e JSON Schema

**JSON** è il formato di testo con cui si scambiano i dati: oggetti `{ }`, array `[ ]`, stringhe, numeri, booleani, `null`. Un JSON malformato (virgola di troppo, virgolette mancanti) non si può leggere: è l'errore tipico di un modello a cui si chiede "rispondi in JSON" solo a parole.

Un **JSON Schema** è un JSON che descrive **come deve essere fatto** un altro JSON.

```json
{
  "type": "object",
  "properties": {
    "categoria": { "type": "string", "enum": ["fattura", "reclamo", "altro"] },
    "importo": { "type": "number" }
  },
  "required": ["categoria"]
}
```

- `properties` elenca i campi e il loro tipo; `required` quelli obbligatori; `enum` i valori ammessi.
- Lo stesso formato descrive gli **input di uno strumento** (`input_schema`, [dominio 8](./studio.html?doc=domain-8)) e l'**output strutturato** ([dominio 6](./studio.html?doc=domain-6)).
- Uno schema garantisce la **forma** dell'output, non la sua **correttezza**: il valore può essere ben formato e sbagliato.

## 5. Un'API senza stato

La Messages API **non ricorda** le richieste precedenti: a ogni chiamata si invia la storia necessaria. Conseguenze che l'esame collega:

- i **token di ingresso** crescono a ogni turno: da qui il [prompt caching](./studio.html?doc=domain-5) e la gestione del contesto ([dominio 6](./studio.html?doc=domain-6));
- lo stato di una conversazione sta **nella tua applicazione**, non nell'API;
- l'ordine dei messaggi conta: i ruoli `user` e `assistant` si alternano.

## 6. Streaming con eventi (SSE)

Con `"stream": true` la risposta arriva in pezzi, come **server-sent events**: `message_start`, poi per ogni blocco `content_block_start`, uno o più `content_block_delta`, `content_block_stop`, poi `message_delta` (con `stop_reason`) e infine `message_stop`.

Perché conta:

- **`content_block_stop` chiude un blocco, non il messaggio**: il segnale di fine è `message_stop`, e lo `stop_reason` si legge in `message_delta`. Trattare il primo `content_block_stop` come fine della risposta è un difetto tipico ([dominio 2](./studio.html?doc=domain-2)).
- Gli argomenti di uno strumento arrivano a pezzi (`input_json_delta`): si accumulano e si leggono alla chiusura del blocco.
- Un errore può comparire **dentro** lo stream, anche dopo una risposta `200`.

## 7. Chiamare l'API da Node con `fetch`

```typescript
const risposta = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
    "anthropic-version": "2026-10-21",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-sonnet-5-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Ciao, Claude" }],
  }),
});

if (!risposta.ok) {
  const errore: unknown = await risposta.json();
  throw new Error(`Errore ${risposta.status}: ${JSON.stringify(errore)}`);
}

const dati: unknown = await risposta.json(); // da validare prima dell'uso
```

`risposta.ok` è `true` solo per i codici `2xx`. Il corpo è `unknown` finché non lo hai verificato ([PC1](./studio.html?doc=pc-typescript)). Con l'[SDK](./studio.html?doc=pc-sdk) tutto questo diventa una riga, con retry, streaming ed errori già gestiti.

## 8. Dove vive la chiave

La chiave API è un segreto del **server**. Un'applicazione web chiama il proprio back end, che chiama Claude: la chiave non si incorpora nel codice che gira nel browser o nell'app del cliente ([dominio 7](./studio.html?doc=domain-7)). Le chiamate dirette dal browser richiedono un header esplicito di accesso pericoloso e sono sconsigliate.

---

## Mini-laboratorio (30–45 minuti)

1. Esegui la richiesta `curl` con una chiave valida. Poi togli `x-api-key` e osserva codice di stato e corpo dell'errore.
2. Riscrivi la richiesta con `fetch` in uno script Node e gestisci `risposta.ok`.
3. Prova a mandare un corpo senza `max_tokens` e leggi il messaggio d'errore: quale codice di stato arriva e che cosa ti dice?
4. Scrivi una tabella a due colonne: errori che ritenteresti e errori che correggeresti.

## Controlla di saper

- leggere una richiesta HTTP e indicare metodo, header e corpo;
- scegliere se ritentare in base al codice di stato;
- dire perché una risposta `200` può contenere un problema;
- leggere un JSON Schema con `properties`, `required` ed `enum`;
- dire quale evento chiude un messaggio in streaming.

## Dove studiare

- [Panoramica di HTTP (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview): richieste, risposte, header e metodi.
- [Lavorare con JSON (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON).
- [Usare la Fetch API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
- [Panoramica dell'API di Claude](https://platform.claude.com/docs/en/api/overview), [errori dell'API](https://platform.claude.com/docs/en/api/errors) e [streaming dei messaggi](https://platform.claude.com/docs/en/build-with-claude/streaming).
- [Autenticazione](https://platform.claude.com/docs/en/manage-claude/authentication) e [gestione degli stop reason](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons).
- Elenco completo in [Dove studiare](./studio.html?doc=pc-risorse).
