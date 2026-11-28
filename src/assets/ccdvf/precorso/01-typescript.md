# PC1 · TypeScript essenziale

## Perché serve all'esame

Gli esempi di codice dei domini e degli SDK ufficiali sono in TypeScript e Python. In TypeScript i **tipi** descrivono le risposte dell'API (blocchi di testo, blocchi `tool_use`, stop reason) e ti dicono quando un valore può mancare. Un tipo, però, **esiste solo mentre scrivi**: a runtime sparisce. Questo punto spiega più errori d'esame di qualunque sintassi.

| Dove compare | Cosa chiede l'esame | Dominio |
| --- | --- | --- |
| Blocchi di contenuto di una risposta | Distinguere `text`, `thinking`, `tool_use` prima di leggerli | [D2](./studio.html?doc=domain-2), [D1](./studio.html?doc=domain-1) |
| Output del modello come JSON | Validare e fare parsing difensivo, non fidarsi del tipo | [D6](./studio.html?doc=domain-6) |
| Schemi degli strumenti | Far corrispondere tipo TypeScript e schema JSON | [D8](./studio.html?doc=domain-8) |
| Chiamate in parallelo e streaming | `async`/`await`, `Promise.all`, `for await` | [D2](./studio.html?doc=domain-2) |
| Errori dell'SDK | Distinguere le classi di errore con `instanceof` | [D2](./studio.html?doc=domain-2), [D4](./studio.html?doc=domain-4) |

---

## 1. Tipi di base e inferenza

```typescript
const modello = "claude-sonnet-5-5"; // inferito come string
let tentativi = 0; // number
const attivo = true; // boolean

function costo(token: number, prezzoPerMilione: number): number {
  return (token / 1_000_000) * prezzoPerMilione;
}
```

- Si annotano i **parametri** e, di solito, il valore restituito delle funzioni; per le variabili locali basta l'inferenza.
- Con `"strict": true` in `tsconfig.json` il compilatore segnala anche `null` e `undefined` non gestiti. È l'impostazione da usare sempre.

## 2. Oggetti, interfacce e proprietà opzionali

```typescript
type Ordine = {
  id: string;
  importo: number;
  note?: string; // opzionale: può essere undefined
};

function riepilogo(o: Ordine): string {
  return `${o.id}: ${o.importo} € ${o.note ?? "(nessuna nota)"}`;
}
```

`??` restituisce il valore a destra solo se quello a sinistra è `null` o `undefined`. `?.` legge una proprietà senza esplodere se l'oggetto manca (`risposta?.usage?.input_tokens`).

## 3. Unioni e tipi letterali

Un valore può essere uno tra più tipi. Con i **tipi letterali** si descrivono insiemi chiusi, come gli stop reason.

```typescript
type StopReason = "end_turn" | "max_tokens" | "tool_use" | "refusal";

function descrivi(motivo: StopReason): string {
  switch (motivo) {
    case "end_turn":
      return "Risposta completa";
    case "max_tokens":
      return "Risposta troncata";
    case "tool_use":
      return "Claude chiede uno strumento";
    case "refusal":
      return "Rifiuto (HTTP 200, non è un errore di rete)";
  }
}
```

## 4. Unioni discriminate e narrowing

È il pattern più importante. Ogni elemento ha un campo `type` che dice quale forma ha: controllando quel campo, TypeScript **restringe** il tipo.

```typescript
type Blocco =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string }
  | { type: "tool_use"; id: string; name: string; input: unknown };

function testoDi(contenuto: Blocco[]): string {
  return contenuto
    .filter((b): b is Extract<Blocco, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
}
```

Perché conta: con il pensiero attivo il **primo** blocco può essere `thinking`. Chi legge `content[0].text` senza controllare `type` sbaglia: è una trappola citata nel [dominio 2](./studio.html?doc=domain-2).

## 5. `unknown` e `any`: il confine con il modello

`JSON.parse` e `await risposta.json()` restituiscono un valore che il compilatore non può verificare. Se lo tratti come `any`, spegni i controlli; se lo tratti come `unknown`, **devi** verificarlo prima di usarlo.

```typescript
const CATEGORIE = ["fattura", "reclamo", "altro"] as const;
type Categoria = (typeof CATEGORIE)[number];
type Esito = { categoria: Categoria; importo?: number };

function isEsito(v: unknown): v is Esito {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.categoria === "string" &&
    (CATEGORIE as readonly string[]).includes(o.categoria) &&
    (o.importo === undefined || typeof o.importo === "number")
  );
}

function leggiEsito(testo: string): Esito | null {
  try {
    const dati: unknown = JSON.parse(testo);
    return isEsito(dati) ? dati : null;
  } catch {
    return null; // JSON non valido
  }
}
```

> **Regola d'esame.** Un tipo dichiarato non valida nulla a runtime. L'output di un modello va **validato** (schema, controlli, parsing difensivo) anche quando "sembra" corretto. Vedi il [dominio 6](./studio.html?doc=domain-6) e il [dominio 8](./studio.html?doc=domain-8).

## 6. Asincronia: `Promise`, `async`, `await`

Ogni chiamata di rete restituisce una `Promise`: un valore che arriverà. `await` sospende la funzione `async` finché la promessa non si risolve; se viene rifiutata, `await` lancia l'errore e lo prendi con `try/catch`.

```typescript
const attendi = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function conRiprova<T>(operazione: () => Promise<T>, massimo = 3): Promise<T> {
  for (let tentativo = 1; ; tentativo++) {
    try {
      return await operazione();
    } catch (errore) {
      if (tentativo >= massimo) throw errore;
      await attendi(500 * 2 ** (tentativo - 1)); // backoff esponenziale: 500 ms, poi 1000, poi 2000...
    }
  }
}
```

Punti da ricordare:

- Senza `await` ottieni la `Promise` e non il risultato: errori silenziosi e dati mancanti.
- Un `try/catch` cattura gli errori solo se c'è `await` **dentro** il `try`.
- `Promise.all([...])` avvia più operazioni **in parallelo**; se una fallisce, fallisce tutto. Il parallelismo va limitato dai limiti di frequenza dell'API ([dominio 2](./studio.html?doc=domain-2)).
- `for await (const pezzo of flusso)` legge uno stream pezzo per pezzo, ed è la base dello streaming.

```typescript
const risultati = await Promise.all(testi.map((t) => classifica(t))); // parallelo
```

## 7. Generici, in breve

Un **generico** dice "lo stesso tipo in ingresso e in uscita", come `<T>` nell'esempio sopra. Lo incontri leggendo `Promise<string>`, `Array<Blocco>` o `Record<string, unknown>`. Per l'esame basta saperli leggere.

## 8. Moduli

```typescript
// strumenti.ts
export function sommaOrdini(ordini: { importo: number }[]): number {
  return ordini.reduce((totale, o) => totale + o.importo, 0);
}

// index.ts
import { sommaOrdini } from "./strumenti.js";
```

Gli SDK e i server MCP usano i moduli ES (`import`/`export`). Dettagli su come Node li carica nel [PC2](./studio.html?doc=pc-node).

---

## Mini-laboratorio (30–45 minuti)

1. Definisci il tipo `Blocco` e scrivi `testoDi` come sopra. Prova con un array che inizia con un blocco `thinking`.
2. Scrivi `leggiEsito` e verifica che restituisca `null` per: JSON non valido, `{"categoria": "spam"}` e `{"importo": "12"}`.
3. Scrivi `conRiprova` e provala con una funzione che fallisce due volte e poi riesce.
4. Prova a togliere `await` da una chiamata e osserva che cosa ottieni.

## Controlla di saper

- spiegare perché `unknown` è più sicuro di `any` per l'output di un modello;
- restringere un'unione con il campo `type`;
- dire che cosa succede a un errore dentro una funzione `async` quando manca `await`;
- leggere `Promise<string[]>` e `Record<string, unknown>`.

## Dove studiare

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html), con le guide di partenza per chi viene da altri linguaggi.
- [TypeScript per programmatori JavaScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html): il percorso più rapido se conosci già JavaScript.
- [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) e [TypeScript per chi inizia a programmare](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).
- [Async/await e Promise su MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) e la voce [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await).
- Elenco completo in [Dove studiare](./studio.html?doc=pc-risorse).
