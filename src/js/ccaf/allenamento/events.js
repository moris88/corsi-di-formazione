import { confirmDialog } from "../../dialog.js";
import { saveAnswers } from "./answers.js";
import { addQuestions, generate, restoreSession, retryWrong } from "./generate.js";
import { confirmAnswer, nextQuestion, pause, renderQuestion, resume } from "./question.js";
import { renderSetup, updateSetup, updateTimeTotal } from "./setup.js";
import { app, state } from "./state.js";
import { renderStats } from "./stats.js";
import { renderSummary } from "./summary.js";
import { stopTimer } from "./timer.js";
import { clearSession, saveSession } from "./trainingSession.js";

/* ---------- Eventi ---------- */

export function bindEvents() {
  app.addEventListener("click", async (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;
    const action = control.dataset.action;
    if (action === "preset") {
      state.count = Number(control.dataset.count);
      updateSetup();
    } else if (action === "difficulty") {
      state.difficultyChoice = control.dataset.difficulty;
      updateSetup();
    } else if (action === "timed") {
      state.timedMode = control.dataset.timed === "true";
      updateSetup();
    } else if (action === "mode") {
      state.mode = control.dataset.mode;
      updateSetup();
    } else if (action === "pause") pause();
    else if (action === "resume") resume();
    else if (action === "add") addQuestions(Number(control.dataset.count));
    else if (action === "restore") restoreSession();
    else if (action === "discard") {
      clearSession();
      renderSetup();
    } else if (action === "generate") generate();
    else if (action === "confirm") confirmAnswer();
    else if (action === "next") nextQuestion();
    else if (action === "quit") renderSummary();
    else if (action === "retry-wrong") retryWrong();
    else if (action === "stats") renderStats();
    else if (action === "reset-stats") {
      const ok = await confirmDialog({
        title: "Azzerare le statistiche?",
        message: "Tutte le risposte salvate dell’allenamento verranno cancellate da questo browser.",
        confirmLabel: "Azzera",
        danger: true,
      });
      if (ok) {
        saveAnswers([]);
        renderStats();
      }
    } else if (action === "setup") {
      stopTimer();
      state.session = null;
      renderSetup();
    }
  });

  app.addEventListener("input", (event) => {
    if (event.target.matches("#count-range")) {
      state.count = Number(event.target.value);
      app.querySelector("#count-out").textContent = state.count;
      app.querySelectorAll('[data-action="preset"]').forEach((chip) => {
        chip.setAttribute("aria-pressed", String(Number(chip.dataset.count) === state.count));
      });
      const btn = app.querySelector('[data-action="generate"]');
      if (btn) btn.innerHTML = `Genera ${state.count} domande <span aria-hidden="true">→</span>`;
      updateTimeTotal();
    } else if (event.target.matches("#minutes-per-question")) {
      const minutes = Number(event.target.value);
      if (minutes >= 0.5 && minutes <= 10) {
        state.minutesPerQuestion = minutes;
        updateTimeTotal();
      }
    }
  });

  app.addEventListener("change", (event) => {
    if (event.target.matches("#minutes-per-question")) {
      const minutes = Math.min(10, Math.max(0.5, Number(event.target.value) || 2));
      state.minutesPerQuestion = minutes;
      event.target.value = minutes;
      updateTimeTotal();
      return;
    }
    if (event.target.matches("[data-scenario]")) {
      const s = event.target.dataset.scenario;
      if (event.target.checked) state.excludedScenarios.delete(s);
      else state.excludedScenarios.add(s);
      renderSetup();
    } else if (event.target.matches('input[name="answer"]') && state.session && !state.session.confirmed) {
      state.session.items[state.session.index].answer = event.target.value;
      saveSession(state.session, state.minutesPerQuestion);
      const btn = app.querySelector('[data-action="confirm"]');
      if (btn) btn.disabled = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    const session = state.session;
    if (!session || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!app.querySelector(".answer-list")) return;
    if (/^[1-4]$/.test(event.key) && !session.confirmed) {
      const item = session.items[session.index];
      item.answer = item.optionOrder[Number(event.key) - 1];
      renderQuestion();
    } else if (event.key === "Enter") {
      if (event.target.matches?.("button, a")) return;
      event.preventDefault();
      if (session.confirmed) nextQuestion();
      else confirmAnswer();
    }
  });
}

// Durante un allenamento in corso ogni link (header compreso) si apre in una nuova scheda, così la sessione non va persa
export function bindLinkGuard() {
  document.addEventListener("click", (event) => {
    if (!state.session || event.defaultPrevented || event.button !== 0) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.getAttribute("href").startsWith("#")) return;
    event.preventDefault();
    window.open(link.href, "_blank", "noopener");
  });
}
