import { MARATHON_MS } from "./constants.js";
import { skipQuestion } from "./question.js";
import { announce, state } from "./state.js";
import { renderSummary } from "./summary.js";
import { saveSession } from "./trainingSession.js";

export function formatMinutes(minutes) {
  const total = Math.round(minutes * 60);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : sec ? `${m} min ${sec} s` : `${m} min`;
}

export function timerText(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const sec = String(total % 60).padStart(2, "0");
  return h ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}

export function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
}

// Tempo rimasto: in maratona quello della domanda corrente, altrimenti quello totale
export function timeLeft() {
  const session = state.session;
  const now = session.pausedAt ?? Date.now();
  if (session.marathon) return session.confirmed ? session.frozenLeft : session.questionDeadline - now;
  return session.deadline - now;
}

export function startTimer() {
  const session = state.session;
  stopTimer();
  if (session.marathon) session.questionDeadline = Date.now() + MARATHON_MS;
  else if (!state.timedMode) return;
  else session.deadline ??= Date.now() + session.items.length * state.minutesPerQuestion * 60000;
  runTimer();
}

// Avvia il conteggio senza toccare le scadenze (usato anche alla ripresa di una sessione salvata)
export function runTimer() {
  stopTimer();
  state.timerId = setInterval(() => {
    const session = state.session;
    if (session.pausedAt || (session.marathon && session.confirmed)) return;
    saveSession(session, state.minutesPerQuestion);
    const left = timeLeft();
    const node = document.querySelector("#train-timer");
    if (node) {
      node.textContent = timerText(left);
      node.classList.toggle("low", left <= 60000);
    }
    if (left > 0) return;
    if (session.marathon) skipQuestion();
    else {
      session.timeUp = true;
      renderSummary();
      announce("Tempo scaduto.");
    }
  }, 1000);
}
