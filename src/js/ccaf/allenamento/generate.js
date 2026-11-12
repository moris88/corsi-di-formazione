import { shuffle } from "../../utils.js";
import { filteredPool, scenarios } from "./banks.js";
import { renderQuestion } from "./question.js";
import { renderSetup } from "./setup.js";
import { announce, app, reducedMotion, state } from "./state.js";
import { runTimer, startTimer } from "./timer.js";
import { loadSavedSession } from "./trainingSession.js";

/* ---------- Animazione di generazione ---------- */

const toItem = (q) => ({ question: q, optionOrder: shuffle(["A", "B", "C", "D"]), answer: null });

// Maratona: ogni domanda è pescata a caso, quindi può ripetersi
export function randomItem() {
  const candidates = filteredPool();
  return toItem(candidates[Math.floor(Math.random() * candidates.length)]);
}

export function generate() {
  if (state.mode === "maratona") {
    state.session = { items: [randomItem()], index: 0, confirmed: false, correct: 0, wrong: 0, startedAt: Date.now() };
    state.session.marathon = true;
    startTimer();
    renderQuestion();
    announce("Maratona iniziata: 2 minuti a domanda.");
    return;
  }
  const drawn = shuffle(filteredPool()).slice(0, state.count).map(toItem);
  state.session = { items: drawn, index: 0, confirmed: false, correct: 0, wrong: 0, startedAt: Date.now() };
  startTimer();

  if (reducedMotion) {
    renderQuestion();
    return;
  }

  app.innerHTML = `
  <section class="forge" aria-live="polite">
    <div>
      <div class="deck" aria-hidden="true">
        ${[1, 2, 3, 4, 5].map(() => `<div class="deck-card"><span><b>?</b>CCA-F</span></div>`).join("")}
      </div>
      <h1 class="forge-title">Mescolo il mazzo…</h1>
      <div class="forge-ticker" id="ticker">&nbsp;</div>
      <div class="forge-bar"><span id="forge-bar"></span></div>
      <div class="forge-drawn" id="drawn" aria-hidden="true"></div>
    </div>
  </section>`;

  const ticker = app.querySelector("#ticker");
  const bar = app.querySelector("#forge-bar");
  const drawnBox = app.querySelector("#drawn");
  const scenarioNames = scenarios();
  const shuffleMs = 900;
  const step = Math.max(35, Math.min(140, 1800 / drawn.length));
  const flicker = setInterval(() => {
    ticker.textContent = scenarioNames[Math.floor(Math.random() * scenarioNames.length)];
  }, 70);

  setTimeout(() => {
    clearInterval(flicker);
    app.querySelector(".forge-title").textContent = "Pesco le domande…";
    drawn.forEach((item, i) => {
      setTimeout(() => {
        const q = item.question;
        ticker.textContent = `T${q.test} · Q${q.id} — ${q.scenario}`;
        bar.style.width = `${((i + 1) / drawn.length) * 100}%`;
        if (i < 60) {
          const chip = document.createElement("i");
          chip.textContent = `T${q.test}·${q.id}`;
          drawnBox.appendChild(chip);
        }
        if (i === drawn.length - 1) {
          app.querySelector(".forge-title").textContent = `${drawn.length} domande pronte!`;
          setTimeout(renderQuestion, 700);
        }
      }, i * step);
    });
  }, shuffleMs);
  announce(`Generazione di ${drawn.length} domande casuali.`);
}

// Aggiunge domande non ancora uscite; il loro tempo si somma a quello avanzato
export function addQuestions(n) {
  const session = state.session;
  const used = new Set(session.items.map((it) => it.question.key));
  const extra = shuffle(filteredPool().filter((q) => !used.has(q.key)))
    .slice(0, n)
    .map(toItem);
  if (!extra.length) return;
  session.items.push(...extra);
  session.index++;
  session.confirmed = false;
  if (session.remaining != null)
    session.deadline = Date.now() + session.remaining + extra.length * state.minutesPerQuestion * 60000;
  startTimer();
  renderQuestion();
  announce(`Aggiunte ${extra.length} domande.`);
}

export function restoreSession() {
  const saved = loadSavedSession(state.pool);
  if (!saved) return renderSetup();
  state.session = saved.session;
  state.minutesPerQuestion = saved.minutesPerQuestion || state.minutesPerQuestion;
  state.mode = state.session.marathon ? "maratona" : "classica";
  if (state.session.marathon || state.session.deadline) runTimer();
  renderQuestion();
  announce("Allenamento ripreso da dove eri rimasto.");
}

export function retryWrong() {
  const items = shuffle(state.session.wrongItems).map((it) => ({
    question: it.question,
    optionOrder: shuffle(["A", "B", "C", "D"]),
    answer: null,
  }));
  state.session = { items, index: 0, confirmed: false, correct: 0, wrong: 0, startedAt: Date.now() };
  startTimer();
  renderQuestion();
}
