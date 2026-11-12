// Riepilogo per la stampa dei risultati e diavoletto dei test "inferno"
import { escapeHtml } from "../../../utils.js";
import { PASS_SCORE } from "../../simulazione-stats.js";
import { app, DIFFICULTY_NAMES, state } from "../state.js";
import { timerText } from "../timer.js";
import { renderResults } from "./results.js";

// Riepilogo visibile solo in stampa (Stampa risultato → Salva come PDF): dati della prova
// che a schermo sono sparsi o assenti (date, durata, modalità, difficoltà, comportamento)
export function renderPrintSummary(counts, estimate, percentage, passed) {
  const { completedExam } = state;
  const when = (time) => new Date(time).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" });
  const used =
    completedExam.finishedAt && completedExam.startedAt ? completedExam.finishedAt - completedExam.startedAt : 0;
  const level = state.importedTests.some((test) => test.file === state.selectedPreset)
    ? "Custom (test importato)"
    : DIFFICULTY_NAMES[state.testDifficulty] || "Non indicata";
  const rows = [
    ["Test", state.testTitle],
    ["Difficoltà", level],
    ["Iniziata", completedExam.startedAt ? when(completedExam.startedAt) : "—"],
    [
      "Consegnata",
      completedExam.finishedAt
        ? `${when(completedExam.finishedAt)}${completedExam.automatic ? " (tempo esaurito)" : ""}`
        : "—",
    ],
    [
      "Tempo impiegato",
      `${timerText(used)}${completedExam.deadline ? ` su ${state.testDurationMinutes} minuti disponibili` : " (senza limite di tempo)"}`,
    ],
    ["Punteggio stimato", `${estimate.score}/1000 · soglia ${PASS_SCORE} · ${passed ? "superata" : "non superata"}`],
    [
      "Risposte",
      `${counts.correct} corrette, ${counts.wrong} errate, ${counts.unanswered} senza risposta su ${state.totalQuestions} (${percentage}%)`,
    ],
    ["Domande segnate", String(completedExam.order.filter((item) => item.flagged).length)],
    ["Uscite dallo schermo intero", String(completedExam.fullscreenExits || 0)],
    ["Cambi di scheda o finestra", String(completedExam.tabSwitches || 0)],
  ];
  return `<header class="print-summary">
      <div class="print-brand">Claude Certified Architect – Foundations · Simulazione d’esame</div>
      <h1>Risultato della simulazione</h1>
      <dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
      <p class="print-disclaimer">Documento generato da una simulazione di preparazione: non è l’esame ufficiale e il punteggio stimato non ha valore ai fini della certificazione.</p>
    </header>`;
}

export function printResults() {
  // In stampa servono tutte le domande con risposte e spiegazioni, a prescindere dal filtro attivo
  state.reviewFilter = "all";
  renderResults(state.completedExam.automatic);
  for (const entry of app.querySelectorAll(".review-entry")) entry.open = true;
  // Il titolo della pagina diventa il nome proposto per il PDF
  const title = document.title;
  const day = new Date(state.completedExam.finishedAt || Date.now()).toISOString().slice(0, 10);
  document.title = `Risultato simulazione CCA-F - ${state.testTitle} - ${day}`;
  // Il PDF va sempre in tema chiaro, anche se a schermo è attivo quello scuro
  const root = document.documentElement;
  const theme = root.dataset.theme;
  root.dataset.theme = "light";
  window.addEventListener(
    "afterprint",
    () => {
      document.title = title;
      root.dataset.theme = theme;
    },
    { once: true },
  );
  window.print();
}

// Diavoletto in cima ai risultati dei test "inferno": arrabbiato se la prova è superata, ride se non lo è
export function renderDevil(passed) {
  const brows = passed
    ? '<path class="devil-brow" d="M38 50 L54 58"/><path class="devil-brow" d="M82 50 L66 58"/>'
    : '<path class="devil-brow" d="M38 52 Q46 46 54 52"/><path class="devil-brow" d="M66 52 Q74 46 82 52"/>';
  const eyes = passed
    ? '<circle class="devil-eye" cx="47" cy="65" r="5"/><circle class="devil-eye" cx="73" cy="65" r="5"/>'
    : '<path class="devil-eye-closed" d="M40 64 Q47 58 54 64"/><path class="devil-eye-closed" d="M66 64 Q73 58 80 64"/><circle class="devil-tear" cx="38" cy="72" r="3"/><circle class="devil-tear" cx="82" cy="72" r="3"/>';
  const mouth = passed
    ? '<path class="devil-mouth-line" d="M46 90 Q60 80 74 90"/>'
    : '<path class="devil-mouth" d="M42 80 Q60 104 78 80 Z"/>';
  const steam = passed
    ? '<g class="devil-steam"><path d="M22 30 q-6 -8 0 -16 q6 -8 0 -16"/><path d="M98 30 q6 -8 0 -16 q-6 -8 0 -16"/></g>'
    : "";
  return `<figure class="result-devil is-${passed ? "angry" : "laughing"}">
      <svg viewBox="0 0 120 130" role="img" aria-label="${passed ? "Diavoletto arrabbiato" : "Diavoletto che ride"}">
        ${steam}
        <g class="devil-body">
          <path class="devil-horn" d="M30 42 Q18 22 24 8 Q34 26 44 34 Z"/>
          <path class="devil-horn" d="M90 42 Q102 22 96 8 Q86 26 76 34 Z"/>
          <ellipse class="devil-face" cx="60" cy="70" rx="38" ry="40"/>
          ${brows}${eyes}${mouth}
        </g>
      </svg>
      <figcaption>${passed ? "Il diavoletto è furioso: questa volta l’inferno non ti ha preso." : "Il diavoletto se la ride… prenditi la rivincita!"}</figcaption>
    </figure>`;
}
