import { bankLoaderHtml } from "../../loader.js";
import { escapeHtml } from "../../utils.js";
import { difficultyPool, filteredPool, scenarios, testsIn } from "./banks.js";
import { DIFFICULTIES, DIFFICULTY_LABELS, MAX_QUESTIONS, PRESETS } from "./constants.js";
import { app, reducedMotion, state } from "./state.js";
import { formatMinutes } from "./timer.js";
import { loadSavedSession } from "./trainingSession.js";

/* ---------- Configurazione ---------- */

export function renderSetup() {
  const { pool, timedMode, minutesPerQuestion, difficultyChoice, excludedScenarios } = state;
  if (!pool.length) {
    app.innerHTML = state.loadError
      ? `<section class="screen"><div class="eyebrow">Allenamento</div><h1>Banche quesiti non disponibili</h1><p class="source-error">${escapeHtml(state.loadError)}</p></section>`
      : bankLoaderHtml("Mescolo le banche quesiti", "Test 1 · 0 domande");
    return;
  }
  const available = Math.min(filteredPool().length, MAX_QUESTIONS);
  const value = Math.max(1, Math.min(state.count, available));
  const marathon = state.mode === "maratona";
  const saved = loadSavedSession(pool);
  app.innerHTML = `
  <section class="screen train-setup" aria-labelledby="page-title">
    ${
      saved
        ? `<div class="train-card train-saved" role="status">
      <h2>Allenamento interrotto</h2>
      <p class="hint">${saved.session.marathon ? "Maratona" : "Allenamento"} del ${new Date(saved.savedAt).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}: domanda ${saved.session.index + 1}${saved.session.marathon ? "" : ` di ${saved.session.items.length}`}, ✓ ${saved.session.correct} · ✗ ${saved.session.wrong}.${saved.session.pausedAt ? " Riprende in pausa, con il tempo fermo all’ultimo salvataggio." : ""}</p>
      <div class="count-row">
        <button class="button" type="button" data-action="restore">Riprendi <span aria-hidden="true">→</span></button>
        <button class="button secondary" type="button" data-action="discard">Scarta</button>
      </div>
    </div>`
        : ""
    }
    <div>
      <div class="eyebrow">Allenamento · prima della simulazione</div>
      <h1 id="page-title">Domande<br><span>casuali</span></h1>
      <p class="intro-copy">${marathon ? "Maratona: 2 min a domanda, senza fine." : timedMode ? `Con tempo: ${formatMinutes(minutesPerQuestion)} a domanda.` : "Senza tempo."} Ogni risposta viene subito segnata come corretta o errata.</p>
      <div class="stats" aria-label="Banche disponibili">
        <div class="stat"><strong>${pool.length}</strong><span>Domande totali</span></div>
        <div class="stat"><strong>${state.loadedTests.length}</strong><span>Test caricati</span></div>
        <div class="stat"><strong id="time-stat">${marathon ? "2 min" : timedMode ? formatMinutes(minutesPerQuestion * value) : "∞"}</strong><span>${marathon ? "A domanda" : "Tempo"}</span></div>
      </div>
    </div>
    <div class="train-card">
      <h2>Modalità</h2>
      <div class="count-row" role="group" aria-label="Modalità di allenamento">
        <button type="button" class="count-chip" data-action="mode" data-mode="classica" aria-pressed="${!marathon}">Classica</button>
        <button type="button" class="count-chip" data-action="mode" data-mode="maratona" aria-pressed="${marathon}">Maratona</button>
      </div>
      <p class="hint">${
        marathon
          ? "Domande casuali (tra la difficoltà e gli scenari scelti) una dietro l’altra, senza fine: una domanda può anche ripresentarsi. Hai 2 minuti per ognuna: allo scadere conta come errata e passi automaticamente alla successiva. Dopo la conferma il tempo si ferma finché non vai avanti. Puoi mettere in pausa; la maratona finisce solo quando premi Termina, e vedi il riepilogo con le statistiche."
          : "Un numero fisso di domande, con o senza tempo."
      }</p>
    </div>
    <div class="train-card">
      <h2>Difficoltà</h2>
      <p class="hint">Limita le domande ai test di una difficoltà, oppure pesca casualmente da tutti i file.</p>
      <div class="count-row" role="group" aria-label="Difficoltà dei test">
        ${["casuale", ...DIFFICULTIES]
          .map((d) => {
            const n = d === "casuale" ? pool.length : pool.filter((q) => q.difficulty === d).length;
            return `<button type="button" class="count-chip" data-action="difficulty" data-difficulty="${d}" aria-pressed="${difficultyChoice === d}" ${n ? "" : "disabled"}>${DIFFICULTY_LABELS[d]} <span class="bank-line">(${n})</span></button>`;
          })
          .join("")}
      </div>
    </div>
    <div class="train-card" ${marathon ? "hidden" : ""}>
      <h2>Quante domande?</h2>
      <p class="hint">Pescate a caso da ${difficultyChoice === "casuale" ? "tutti i test" : `i test ${DIFFICULTY_LABELS[difficultyChoice].toLowerCase()}`} (${testsIn(
        difficultyPool(),
      )
        .map((n) => `T${n}`)
        .join(", ")}), senza ripetizioni.</p>
      <div class="count-row" role="group" aria-label="Numero di domande">
        ${PRESETS.filter((p) => p <= available)
          .map(
            (p) =>
              `<button type="button" class="count-chip" data-action="preset" data-count="${p}" aria-pressed="${p === value}">${p}</button>`,
          )
          .join("")}
      </div>
      <div class="count-custom">
        <input type="range" id="count-range" min="1" max="${available}" value="${value}" aria-label="Numero di domande personalizzato">
        <output id="count-out" for="count-range">${value}</output>
      </div>
    </div>
    <div class="train-card" ${marathon ? "hidden" : ""}>
      <h2>Tempo</h2>
      <p class="hint">Con il tempo attivo, il limite totale è calcolato in base al numero di domande e puoi mettere in pausa. Allo scadere l’allenamento termina e vedi il riepilogo; se finisci prima, puoi aggiungere altre domande e il loro tempo si somma a quello avanzato.</p>
      <div class="count-row" role="group" aria-label="Modalità tempo">
        <button type="button" class="count-chip" data-action="timed" data-timed="false" aria-pressed="${!timedMode}">Senza tempo</button>
        <button type="button" class="count-chip" data-action="timed" data-timed="true" aria-pressed="${timedMode}">Con tempo</button>
      </div>
      ${
        timedMode
          ? `<div class="time-custom">
        <label for="minutes-per-question">Minuti a domanda</label>
        <input type="number" id="minutes-per-question" min="0.5" max="10" step="0.5" value="${minutesPerQuestion}">
        <span class="bank-line">Totale: <span class="time-total" id="time-total">${formatMinutes(minutesPerQuestion * value)}</span></span>
      </div>`
          : ""
      }
    </div>
    <div class="train-card">
      <h2>Scenari</h2>
      <p class="hint">Deseleziona gli scenari che non vuoi allenare.</p>
      <div class="scenario-filter">
        ${scenarios()
          .map(
            (s) =>
              `<label><input type="checkbox" data-scenario="${escapeHtml(s)}" ${excludedScenarios.has(s) ? "" : "checked"}>${escapeHtml(s)} <span class="bank-line">(${difficultyPool().filter((q) => q.scenario === s).length})</span></label>`,
          )
          .join("")}
      </div>
    </div>
    <div class="train-actions is-sticky">
      <button class="button secondary" type="button" data-action="stats">Statistiche</button>
      <a class="button secondary" href="simulazione.html">Vai alla simulazione vera</a>
      <button class="button" type="button" data-action="generate" ${available ? "" : "disabled"}>${marathon ? "Inizia la maratona" : `Genera ${value} domande`} <span aria-hidden="true">→</span></button>
    </div>
  </section>`;
  state.count = value;
}

// Ridisegna la configurazione con una View Transition: le schede che compaiono, spariscono o si spostano si animano invece di scattare
export function updateSetup() {
  if (reducedMotion || !document.startViewTransition) renderSetup();
  else document.startViewTransition(renderSetup);
}

export function updateTimeTotal() {
  if (!state.timedMode) return;
  const text = formatMinutes(state.minutesPerQuestion * state.count);
  const total = app.querySelector("#time-total");
  const stat = app.querySelector("#time-stat");
  if (total) total.textContent = text;
  if (stat) stat.textContent = text;
  const intro = app.querySelector(".intro-copy");
  if (intro)
    intro.firstChild.textContent = `Con tempo: ${formatMinutes(state.minutesPerQuestion)} a domanda. Ogni risposta viene subito segnata come corretta o errata.`;
}
