// Guida al formato dei test e prompt suggerito per generarne uno con l'IA
import { renderGuideMarkdown } from "./guideMarkdown.js";
import { state } from "./state.js";

// Guida al formato dei test: caricata una volta da guida-formato.md e
// inserita nei riquadri .format-guide già presenti quando arriva.
export function loadFormatGuide() {
  fetch("../../assets/ccaf/guida-formato.md")
    .then((response) => (response.ok ? response.text() : ""))
    .then((text) => {
      state.formatGuideText = text;
      document.querySelectorAll(".format-guide:not(.ai-prompt)").forEach((box) => {
        box.innerHTML = renderGuideMarkdown(text).html;
      });
    })
    .catch(() => {});
}

// Prompt suggerito per far generare all'IA una banca quesiti importabile
export const AI_PROMPT = `Genera una banca quesiti per la simulazione dell'esame "Claude Certified Architect — Foundations" (CCA-F), rispettando ESATTAMENTE il formato del modello riportato qui sotto.

Requisiti:
- Lingua delle domande: inglese, come l'esame reale (puoi tradurre in inglese anche le intestazioni del modello, es. "### Question N" e "#### Correct answer to question N: X").
- Frontmatter YAML con title e duration_minutes.
- Raggruppa le domande sotto intestazioni "## Scenario: ..." realistiche, coprendo i domini D1–D5.
- Ogni domanda ha quattro opzioni A–D e la riga "####" della risposta corretta, seguita da una spiegazione che motivi la risposta giusta e perché le altre sono sbagliate.
- Difficoltà MOLTO ALTA, livello "Avanzato": vicino all'esame reale, con più vincoli da combinare, un dettaglio decisivo nello scenario, risposte lunghe e tutte credibili. Nessuna opzione deve essere scartabile a colpo d'occhio.
- Distribuisci la risposta corretta in modo uniforme tra A, B, C e D.
- Numero di domande: 60.

Output OBBLIGATORIO: un file Markdown scaricabile con estensione .md (es. test-ccaf.md), non testo nella chat. Il file deve contenere solo il test, senza commenti prima o dopo.

Modello da seguire:

---
title: "[Titolo del test]"
duration_minutes: 120
---

# [Titolo del test]

## Scenario: [Titolo dello scenario]

### Domanda 1

[Testo della domanda]

- **A.** [Testo dell'opzione A]
- **B.** [Testo dell'opzione B]
- **C.** [Testo dell'opzione C]
- **D.** [Testo dell'opzione D]

#### Risposta corretta alla domanda 1: [RISPOSTA_CORRETTA]

[Spiegazione facoltativa]

### Domanda 2

[Testo della domanda]

- **A.** [Testo dell'opzione A]
- **B.** [Testo dell'opzione B]
- **C.** [Testo dell'opzione C]
- **D.** [Testo dell'opzione D]

#### Risposta corretta alla domanda 2: [RISPOSTA_CORRETTA]

[Spiegazione facoltativa]`;

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
