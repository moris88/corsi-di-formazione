import { escapeHtml } from "../../utils.js";
import { recordAnswer } from "./answers.js";
import { DIFFICULTY_LABELS, MARATHON_MS } from "./constants.js";
import { randomItem } from "./generate.js";
import { inlineMarkdown, markdownToHtml } from "./markdown.js";
import { announce, app, reducedMotion, state } from "./state.js";
import { renderSummary } from "./summary.js";
import { theoryLinksHtml } from "./theory.js";
import { timeLeft, timerText } from "./timer.js";
import { saveSession } from "./trainingSession.js";

/* ---------- Quesito con correzione immediata ---------- */

export function renderQuestion() {
  const session = state.session;
  saveSession(session, state.minutesPerQuestion);
  const item = session.items[session.index];
  const q = item.question;
  const total = session.items.length;
  const displayed = item.optionOrder.map((letter, i) => ({
    ...q.options.find((o) => o.letter === letter),
    displayLetter: String.fromCharCode(65 + i),
  }));
  const done = session.confirmed;
  const isRight = item.answer === q.correctLetter;
  const right = displayed.find((o) => o.letter === q.correctLetter);
  const last = !session.marathon && session.index === total - 1;
  const timed = session.marathon || session.deadline;
  const progress = `
    <div class="train-progress">
      ${session.marathon ? `<span class="train-marathon">Maratona</span>` : `<progress value="${session.index + (done ? 1 : 0)}" max="${total}" aria-label="Avanzamento"></progress>`}
      ${timed ? `<span class="train-timer${timeLeft() <= 60000 ? " low" : ""}" id="train-timer" role="timer" aria-label="Tempo rimasto">${timerText(timeLeft())}</span>` : ""}
      ${timed && !(session.marathon && done) ? `<button class="button secondary train-pause" type="button" data-action="${session.pausedAt ? "resume" : "pause"}">${session.pausedAt ? "Riprendi" : "Pausa"}</button>` : ""}
      <span class="train-score"><span class="ok">✓ ${session.correct}</span> · <span class="ko">✗ ${session.wrong}</span></span>
    </div>`;

  if (session.pausedAt) {
    app.innerHTML = `
  <section class="screen" aria-labelledby="pause-title">
    ${progress}
    <div class="train-paused">
      <h1 id="pause-title">In pausa</h1>
      <p class="intro-copy">Il tempo è fermo e la domanda è nascosta. Riprendi quando sei pronto.</p>
      <button class="button" type="button" data-action="resume">Riprendi <span aria-hidden="true">→</span></button>
    </div>
    <div class="train-actions">
      <button class="button secondary" type="button" data-action="quit">Termina</button>
    </div>
  </section>`;
    return;
  }

  app.innerHTML = `
  <section class="screen${q.difficulty === "inferno" ? " is-inferno" : ""}" aria-labelledby="question-title">
    ${progress}
    <div class="question-meta">
      <div class="scenario-chip" title="${escapeHtml(q.scenario)}">${escapeHtml(q.scenario)}</div>
      <span class="source-tag">Test ${q.test} · domanda ${q.id}${q.difficulty && q.difficulty !== "inferno" ? ` · ${DIFFICULTY_LABELS[q.difficulty]}` : ""}</span>${q.difficulty === "inferno" ? `<span class="inferno-badge">🔥 Domanda inferno</span>` : ""}
    </div>
    <h1 class="question-heading" id="question-title">Domanda ${session.index + 1}${session.marathon ? "" : `<span>di ${total}</span>`}</h1>
    ${q.context ? `<div class="scenario-context">${markdownToHtml(q.context)}</div>` : ""}<div class="question-prompt">${markdownToHtml(q.prompt)}</div>
    <div class="answer-label">${done ? "Correzione" : "Seleziona una risposta e conferma"}</div>
    <div class="answer-list" role="radiogroup" aria-label="Opzioni di risposta">
      ${displayed
        .map((o) => {
          const classes = ["answer-option"];
          if (done) {
            classes.push("locked");
            if (o.letter === q.correctLetter) classes.push("is-correct");
            else if (o.letter === item.answer) classes.push("is-wrong");
          }
          return `<label class="${classes.join(" ")}"><input type="radio" name="answer" value="${o.letter}" ${item.answer === o.letter ? "checked" : ""} ${done ? "disabled" : ""}><span class="answer-letter">${o.displayLetter}</span><span class="answer-text">${inlineMarkdown(o.text)}</span></label>`;
        })
        .join("")}
    </div>
    ${
      done
        ? `
    <div class="feedback ${isRight ? "" : "wrong"}" role="status">
      <h3>${isRight ? "✓ Corretto!" : `✗ Sbagliato: la risposta giusta è la ${right.displayLetter}`}</h3>
      ${
        q.explanation
          ? `<div class="feedback-explanation">${markdownToHtml(q.explanation)}</div>${
              item.optionOrder.join("") !== "ABCD"
                ? `<p class="feedback-note">Le lettere citate nella spiegazione si riferiscono all'ordine originale delle opzioni (qui la ${q.correctLetter} è mostrata come ${right.displayLetter}).</p>`
                : ""
            }`
          : ""
      }
      ${isRight ? "" : theoryLinksHtml(q)}
    </div>`
        : ""
    }
    <div class="train-actions">
      <button class="button secondary" type="button" data-action="quit">Termina</button>
      ${
        done
          ? `<button class="button" type="button" data-action="next">${last ? "Vedi il riepilogo" : "Prossima domanda"} <span aria-hidden="true">→</span></button>`
          : `<button class="button" type="button" data-action="confirm" ${item.answer ? "" : "disabled"}>Conferma risposta</button>`
      }
    </div>
  </section>`;
  if (done && !isRight && !reducedMotion) app.querySelector(".answer-option.is-wrong")?.classList.add("shake");
  window.scrollTo({ top: done ? window.scrollY : 0 });
}

export function confirmAnswer() {
  const session = state.session;
  const item = session.items[session.index];
  if (!item.answer || session.confirmed || session.pausedAt) return;
  // In maratona il tempo della domanda si ferma alla conferma
  if (session.marathon) session.frozenLeft = session.questionDeadline - Date.now();
  session.confirmed = true;
  recordAnswer(item.question, item.answer === item.question.correctLetter);
  if (item.answer === item.question.correctLetter) session.correct++;
  else session.wrong++;
  renderQuestion();
  app.querySelector(".feedback")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
  announce(item.answer === item.question.correctLetter ? "Risposta corretta." : "Risposta errata.");
}

export function nextQuestion() {
  const session = state.session;
  if (session.marathon) {
    session.items.push(randomItem());
    session.questionDeadline = Date.now() + MARATHON_MS;
  } else if (session.index === session.items.length - 1) {
    renderSummary();
    return;
  }
  session.index++;
  session.confirmed = false;
  renderQuestion();
}

// Maratona: allo scadere dei 2 minuti la domanda senza risposta conta come errata
export function skipQuestion() {
  const session = state.session;
  const item = session.items[session.index];
  item.answer = null;
  item.timedOut = true;
  recordAnswer(item.question, false);
  session.wrong++;
  nextQuestion();
  announce("Tempo scaduto: domanda segnata come errata.");
}

export function pause() {
  const session = state.session;
  if (!session || session.pausedAt) return;
  session.pausedAt = Date.now();
  renderQuestion();
  announce("Allenamento in pausa.");
}

// Alla ripresa le scadenze si spostano in avanti della durata della pausa
export function resume() {
  const session = state.session;
  if (!session?.pausedAt) return;
  const paused = Date.now() - session.pausedAt;
  if (session.deadline) session.deadline += paused;
  if (session.questionDeadline) session.questionDeadline += paused;
  session.pausedAt = null;
  renderQuestion();
  announce("Allenamento ripreso.");
}
