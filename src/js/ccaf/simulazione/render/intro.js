// Schermata iniziale (selezione del test, storico) e schermata delle statistiche
import { escapeHtml } from "../../../utils.js";
import { applyStatsBars, renderStats } from "../../simulazione-stats.js";
import { setFocusMode } from "../focus.js";
import {
  app,
  BUILTIN_TESTS,
  DEFAULT_DURATION_MINUTES,
  DIFFICULTY_NAMES,
  state,
  timedMode,
  topStatus,
} from "../state.js";
import { loadHistory } from "../storage.js";

function renderHistory() {
  const history = loadHistory();
  if (!history.length) return "";
  const rows = history
    .map((entry) => {
      const percentage = ((entry.correct / entry.total) * 100).toFixed(1);
      const date = new Date(entry.date).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
      return `<li><span><span class="history-meta">${escapeHtml(date)}</span><br>${escapeHtml(entry.title)}</span><span class="history-score ${entry.passed ? "passed" : "not-passed"}">${entry.score ? `${entry.score}/1000 · ` : ""}${percentage}%</span></li>`;
    })
    .join("");
  return `<section class="history-box" aria-labelledby="history-title">
        <h3 id="history-title">Esiti precedenti</h3>
        <ul class="history-list">${rows}</ul>
        <div class="history-actions">
          <button class="button secondary" type="button" data-action="show-stats">Statistiche di studio</button>
          <button class="history-clear" type="button" data-action="clear-history">Cancella lo storico</button>
        </div>
      </section>`;
}

export function renderStatsScreen() {
  const history = loadHistory();
  if (!history.length) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Statistiche";
  app.innerHTML = renderStats(history);
  applyStatsBars(app);
  window.scrollTo({ top: 0 });
}

function difficultyBadge() {
  if (!state.sourceReady) return "—";
  const level = state.importedTests.some((test) => test.file === state.selectedPreset)
    ? "custom"
    : state.testDifficulty;
  const name = DIFFICULTY_NAMES[level] || "Custom";
  return `<span class="difficulty-tag" data-level="${DIFFICULTY_NAMES[level] ? level : "custom"}">${name}</span>`;
}

export function renderIntro() {
  const { sourceReady, sourceError, questionBank, testDurationMinutes, testDifficulty, selectedPreset } = state;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Simulazione d’esame";
  app.innerHTML = `
  <section class="screen intro-layout${testDifficulty === "inferno" ? " is-inferno" : ""}" aria-labelledby="page-title">
    ${testDifficulty === "inferno" ? `<div class="guide-embers" aria-hidden="true">${"<i></i>".repeat(18)}</div>` : ""}
    <div class="intro-copy-block">
      <div class="eyebrow">Sessione di simulazione</div>
      <h1 id="page-title">Simulazione<br><span>d’esame</span></h1>
      <p class="intro-copy">${escapeHtml(state.testTitle)} · una prova di preparazione con quesiti a scelta multipla.</p>
      <div class="stats" aria-label="Riepilogo della prova">
        <div class="stat"><strong>${sourceReady ? questionBank.length : "—"}</strong><span>Domande</span></div>
        <div class="stat"><strong>${timedMode ? `${sourceReady ? testDurationMinutes : DEFAULT_DURATION_MINUTES}′` : "∞"}</strong><span>Tempo disponibile</span></div>
        <div class="stat"><strong>4</strong><span>Opzioni per quesito</span></div>
      </div>
      <button class="button" type="button" data-action="show-guide" ${sourceReady ? "" : "disabled"}>
        Inizia la simulazione <span aria-hidden="true">→</span>
      </button>
      <aside class="sim-toast" role="note" aria-label="Avviso sulla simulazione">
        <span class="sim-toast-icon" aria-hidden="true">i</span>
        <p><strong>Questa è una simulazione, non l’esame ufficiale.</strong>Formato, domande e livello di difficoltà sono pensati per avvicinarsi il più possibile alla prova reale, ma l’esito ottenuto qui non ha alcun valore ai fini della certificazione e non garantisce il superamento dell’esame.</p>
      </aside>
    </div>
    <aside class="exam-panel" aria-label="Dettagli della prova">
      <div class="panel-kicker">Formato della sessione</div>
      <h2 class="panel-title">Condizioni d’esame</h2>
      <ul class="exam-facts">
        <li><span>Durata</span><strong>${timedMode ? `${sourceReady ? testDurationMinutes : DEFAULT_DURATION_MINUTES} minuti` : "Senza limite"}</strong></li>
        <li><span>Quesiti</span><strong>${sourceReady ? questionBank.length : "—"}, ordine casuale</strong></li>
        <li><span>Risposte</span><strong>Una scelta per domanda</strong></li>
        <li><span>Correzione</span><strong>Al termine della prova</strong></li>
        <li><span>Difficoltà</span><strong>${difficultyBadge()}</strong></li>
      </ul>
      <div class="source-line" role="status">
        <span class="source-dot ${sourceReady ? "ready" : sourceError ? "error" : ""}" aria-hidden="true"></span>
        <span id="source-status">${escapeHtml(state.sourceMessage)}</span>
      </div>
      ${sourceError ? `<p class="source-error">${escapeHtml(sourceError)}</p>` : ""}
      <div class="source-actions">
        <label class="preset-select-label"><span>Test nel workspace</span><select id="preset-test" aria-label="Seleziona un test già presente nel workspace">${[
          ...BUILTIN_TESTS,
          ...state.importedTests,
        ]
          .map(
            (test) =>
              `<option value="${escapeHtml(test.file)}" ${selectedPreset === test.file ? "selected" : ""}>${escapeHtml(test.label)}</option>`,
          )
          .join("")}</select></label>
        <button class="settings-button" type="button" data-action="open-tools" aria-label="Importa, esporta e formato dei test" title="Importa, esporta e formato dei test">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      ${renderHistory()}
    </aside>
  </section>`;
}
