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

// Prompt suggerito per far generare all'IA una banca quesiti importabile.
// Il modello è in inglese come le banche ufficiali; il parser accetta sia "Question" sia "Domanda".
export const AI_PROMPT = `Genera una banca quesiti per la simulazione dell'esame "Claude Certified Architect — Foundations" (CCA-F) di Anthropic. Il file verrà importato in un simulatore che lo legge in modo automatico: rispetta il formato alla lettera.

LIVELLO RICHIESTO: avanzato
(Prima di inviare, sostituisci "avanzato" con uno tra: facile, medio, difficile, avanzato, inferno.)

1. STRUTTURA
- 60 domande in inglese, come l'esame reale, numerate da 1 a 60 senza buchi né duplicati.
- Sei scenari ufficiali, 10 domande ciascuno, con questi nomi esatti nelle intestazioni "## Scenario: ...". Ogni domanda inizia con il paragrafo di contesto del suo scenario, copiato identico, poi una riga vuota e la situazione specifica:
  - Customer Support Resolution Agent: "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate."
  - Code Generation with Claude Code: "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution."
  - Multi-Agent Research System: "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports."
  - Structured Data Extraction: "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems."
  - Claude Code for Continuous Integration: "You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives."
  - Developer Productivity with Claude: "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers."
- Copri i cinque domini con i pesi dell'esame: D1 Agentic Architecture & Orchestration 27% (16 domande), D2 Tool Design & MCP Integration 18% (11), D3 Claude Code Configuration & Workflows 20% (12), D4 Prompt Engineering & Structured Output 20% (12), D5 Context Management & Reliability 15% (9). Un dominio può comparire in qualunque scenario; non ripetere due volte lo stesso concetto.
- Risposte corrette: 15 A, 15 B, 15 C e 15 D, mai la stessa lettera per più di 3 domande di fila.

2. LIVELLI DI DIFFICOLTÀ (applica solo quello richiesto)
- facile: concetti di base; situazione di 15–35 parole; una risposta chiaramente migliore; opzioni brevi (8–15 parole).
- medio: scenario realistico di 35–60 parole su un solo concetto; distrattori plausibili; opzioni di 12–20 parole.
- difficile: situazione di 50–80 parole che combina almeno due concetti e due vincoli; trappole tipiche d'esame; almeno un'opzione quasi giusta; opzioni simili tra loro, di 15–25 parole.
- avanzato: vicino all'esame reale; situazione di 60–100 parole con almeno tre vincoli da combinare e un dettaglio decisivo; quattro opzioni lunghe (20–35 parole) e tutte credibili, di cui almeno due quasi giuste.
- inferno: oltre l'esame; situazione di 90–150 parole con quattro o più vincoli, anche in tensione tra loro, ed eccezioni ai principi soliti (casi in cui la risposta "da manuale" è sbagliata); tutte le opzioni in parte giuste, una sola regge ogni vincolo; opzioni di 25–40 parole.

3. COME COSTRUIRE OGNI DOMANDA
- Parti da un concetto d'esame e dall'errore tipico che lo accompagna.
- Nella situazione metti vincoli concreti (numeri, percentuali, budget, latenza, SLA, conformità, chi possiede cosa, cosa è già stato provato) e un dettaglio decisivo: chi lo trascura deve trovare credibili almeno due opzioni. La domanda finisce con una richiesta chiara ("What is the most effective fix?").
- Opzione quasi giusta: riprende il meccanismo della risposta corretta ma viola un vincolo della situazione (ambito troppo ampio o troppo stretto, momento sbagliato, informazione mancante, controllo probabilistico dove ne serve uno deterministico).
- Le altre opzioni errate sono soluzioni reali applicate male, scelte tra le trappole ricorrenti: istruzioni nel prompt dove serve un controllo programmatico; modello o contesto più grande; confidenza auto-dichiarata; escalation per sentiment; retry senza feedback; inventare valori mancanti; nascondere il problema; spostare il lavoro sugli umani.
- Le quattro opzioni hanno lunghezza e struttura simili: la corretta non deve essere la più lunga né la più dettagliata. Niente parole assolute che la tradiscano ("always", "never", "guarantees"), niente "all of the above" o "none of the above".
- Usa solo funzionalità reali di Claude, Claude Code, Agent SDK, Claude API e MCP: non inventare flag, file o comandi. Non copiare le domande d'esempio della guida ufficiale.

4. SPIEGAZIONE (dopo la riga della risposta corretta)
- Primo paragrafo: perché la risposta corretta è giusta, citando il vincolo o il dettaglio decisivo.
- Secondo paragrafo: per ogni opzione errata, in una frase, quale vincolo viola o quale errore commette.

5. CONTROLLO FINALE (prima di consegnare, correggi ciò che non va)
- 60 domande; ognuna ha il paragrafo di scenario, quattro opzioni A–D e una sola riga "#### Correct answer to Question N: X" con lo stesso N della domanda.
- Distribuzione delle lettere 15/15/15/15 e domini nei pesi indicati.
- Ogni domanda rispetta il livello richiesto: lunghezza della situazione, numero di vincoli, opzioni quasi giuste.
- Nel frontmatter, "difficulty" è il livello richiesto e il titolo lo riporta.

6. OUTPUT OBBLIGATORIO
Un file Markdown scaricabile con estensione .md (es. ccaf-test-avanzato.md) che contenga solo il test, senza commenti prima o dopo. Se non puoi creare file, restituisci il test in un unico blocco di codice markdown, senza testo prima o dopo.

MODELLO DA SEGUIRE:

---
title: "CCA-F Practice Test – Advanced"
duration_minutes: 120
difficulty: avanzato
---

# CCA-F Practice Test – Advanced

## Scenario: Customer Support Resolution Agent

### Question 1

[Paragrafo di contesto dello scenario, identico]

[Situazione specifica con i vincoli e il dettaglio decisivo, che termina con la domanda]

- **A.** [Opzione A]
- **B.** [Opzione B]
- **C.** [Opzione C]
- **D.** [Opzione D]

#### Correct answer to Question 1: [LETTERA]

[Perché la risposta corretta è giusta]

[Perché ciascuna opzione errata è sbagliata]

## Scenario: Code Generation with Claude Code

### Question 2

[Paragrafo di contesto dello scenario, identico]

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
