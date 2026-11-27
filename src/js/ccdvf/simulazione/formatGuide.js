// Guida al formato dei test e prompt suggerito per generarne uno con l'IA
import { renderGuideMarkdown } from "./guideMarkdown.js";
import { state } from "./state.js";

// Guida al formato dei test: caricata una volta da guida-formato.md e
// inserita nei riquadri .format-guide già presenti quando arriva.
export function loadFormatGuide() {
  fetch("../../assets/ccdvf/guida-formato.md")
    .then((response) => (response.ok ? response.text() : ""))
    .then((text) => {
      state.formatGuideText = text;
      document.querySelectorAll(".format-guide:not(.ai-prompt)").forEach((box) => {
        box.innerHTML = renderGuideMarkdown(text).html;
      });
    })
    .catch(() => {});
}

// Prompt suggerito per far generare all'IA una banca quesiti importabile.
// Il modello è in inglese come le banche ufficiali; il parser accetta sia "Question" sia "Domanda".
export const AI_PROMPT = `Genera una banca quesiti per la simulazione dell'esame "Claude Certified Developer — Foundations" (CCDV-F) di Anthropic. Il file verrà importato in un simulatore che lo legge in modo automatico: rispetta il formato alla lettera.

LIVELLO RICHIESTO: avanzato
(Prima di inviare, sostituisci "avanzato" con uno tra: facile, medio, difficile, avanzato, inferno.)

1. STRUTTURA
- 53 domande in inglese, come l'esame reale, numerate da 1 a 53 senza buchi né duplicati.
- Ogni domanda ha quattro opzioni A–D e UNA sola risposta corretta (il simulatore non gestisce le domande a risposta multipla).
- Otto domini, ognuno con la sua intestazione "## Scenario: Domain N – Nome" (il nome del dominio sta nel titolo dello scenario), con questi pesi e numeri di domande:
  - Domain 1 – Agents and Workflows: 14,7% (8 domande)
  - Domain 2 – Applications and Integration: 33,1% (17 domande)
  - Domain 3 – Claude Code: 3,1% (2 domande)
  - Domain 4 – Eval, Testing, and Debugging: 2,6% (1 domanda)
  - Domain 5 – Model Selection and Optimization: 16,8% (9 domande)
  - Domain 6 – Prompt and Context Engineering: 11,0% (6 domande)
  - Domain 7 – Security and Safety: 8,1% (4 domande)
  - Domain 8 – Tools and MCPs: 10,6% (6 domande)
- Ogni domanda è autonoma: descrive da sé la situazione, senza un paragrafo di contesto comune. Non ripetere due volte lo stesso concetto.
- Risposte corrette distribuite in modo uniforme tra A, B, C e D (circa 13 ciascuna), mai la stessa lettera per più di 3 domande di fila.

2. LIVELLI DI DIFFICOLTÀ (applica solo quello richiesto)
- facile: concetti di base; situazione di 15–35 parole; una risposta chiaramente migliore; opzioni brevi (8–15 parole).
- medio: situazione realistica di 35–60 parole su un solo concetto; distrattori plausibili; opzioni di 12–20 parole.
- difficile: situazione di 50–80 parole che combina almeno due concetti e due vincoli; trappole tipiche d'esame; almeno un'opzione quasi giusta; opzioni simili tra loro, di 15–25 parole.
- avanzato: vicino all'esame reale; situazione di 60–100 parole con almeno tre vincoli da combinare e un dettaglio decisivo; quattro opzioni lunghe (20–35 parole) e tutte credibili, di cui almeno due quasi giuste.
- inferno: oltre l'esame; situazione di 90–150 parole con quattro o più vincoli, anche in tensione tra loro, ed eccezioni ai principi soliti (casi in cui la risposta "da manuale" è sbagliata); tutte le opzioni in parte giuste, una sola regge ogni vincolo; opzioni di 25–40 parole.

3. COME COSTRUIRE OGNI DOMANDA
- Parti da una competenza del programma d'esame e dall'errore tipico che la accompagna.
- Nella situazione metti vincoli concreti (numeri, budget, latenza, volumi, conformità, chi possiede cosa, cosa è già stato provato) e un dettaglio decisivo: chi lo trascura deve trovare credibili almeno due opzioni. La domanda finisce con una richiesta chiara ("Which approach best fits the requirement?").
- Opzione quasi giusta: riprende il meccanismo della risposta corretta ma viola un vincolo della situazione (ambito troppo ampio o troppo stretto, momento sbagliato, costo o latenza fuori limite, controllo probabilistico dove ne serve uno deterministico).
- Le altre opzioni errate sono soluzioni reali applicate male, scelte tra le trappole ricorrenti: istruzioni nel prompt dove serve un controllo imposto dal codice; modello più grande o contesto più lungo come rimedio universale; chiamate in tempo reale dove basta un batch; logica copiata in ogni applicazione invece di un componente condiviso; fidarsi dell'output senza validarlo; segreti o dati sensibili nel prompt.
- Le quattro opzioni hanno lunghezza e struttura simili: la corretta non deve essere la più lunga né la più dettagliata. Niente parole assolute che la tradiscano ("always", "never", "guarantees"), niente "all of the above" o "none of the above".
- Usa solo funzionalità reali di Claude, Claude Code, Agent SDK, Claude API e MCP: non inventare parametri, file o comandi. Non copiare le domande d'esempio della guida ufficiale.

4. SPIEGAZIONE (dopo la riga della risposta corretta)
- Primo paragrafo: perché la risposta corretta è giusta, citando il vincolo o il dettaglio decisivo.
- Secondo paragrafo: per ogni opzione errata, in una frase, quale vincolo viola o quale errore commette.

5. CONTROLLO FINALE (prima di consegnare, correggi ciò che non va)
- 53 domande; ognuna ha quattro opzioni A–D e una sola riga "#### Correct answer to Question N: X" con lo stesso N della domanda.
- Distribuzione delle lettere uniforme e numero di domande per dominio come indicato.
- Ogni domanda rispetta il livello richiesto: lunghezza della situazione, numero di vincoli, opzioni quasi giuste.
- Nel frontmatter, "difficulty" è il livello richiesto e il titolo lo riporta. La durata è di 120 minuti.

6. OUTPUT OBBLIGATORIO
Un file Markdown scaricabile con estensione .md (es. ccdvf-test-avanzato.md) che contenga solo il test, senza commenti prima o dopo. Se non puoi creare file, restituisci il test in un unico blocco di codice markdown, senza testo prima o dopo.

MODELLO DA SEGUIRE:

---
title: "CCDV-F Practice Test – Advanced"
duration_minutes: 120
difficulty: avanzato
---

# CCDV-F Practice Test – Advanced

## Scenario: Domain 1 – Agents and Workflows

### Question 1

[Situazione specifica con i vincoli e il dettaglio decisivo, che termina con la domanda]

- **A.** [Opzione A]
- **B.** [Opzione B]
- **C.** [Opzione C]
- **D.** [Opzione D]

#### Correct answer to Question 1: [LETTERA]

[Perché la risposta corretta è giusta]

[Perché ciascuna opzione errata è sbagliata]

## Scenario: Domain 2 – Applications and Integration

### Question 2

[Situazione specifica]

- **A.** [Opzione A]
- **B.** [Opzione B]
- **C.** [Opzione C]
- **D.** [Opzione D]

#### Correct answer to Question 2: [LETTERA]

[Spiegazione]`;

// Copia il prompt negli appunti e conferma sul pulsante per un paio di secondi
export async function copyAiPrompt(button) {
  try {
    await navigator.clipboard.writeText(AI_PROMPT);
    button.textContent = "Copiato!";
  } catch {
    button.textContent = "Copia non riuscita";
  }
  setTimeout(() => {
    button.textContent = "Copia il prompt";
  }, 2000);
}

export function formatGuideSource() {
  return state.formatGuideText;
}
