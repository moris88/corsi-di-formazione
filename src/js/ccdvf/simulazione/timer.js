// Timer della prova: tempo rimanente (o trascorso, senza limite) e consegna automatica allo scadere
import { finishExam } from "./exam.js";
import { state } from "./state.js";

export function timerText(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimer() {
  const { exam } = state;
  if (!exam) return;
  const timer = document.querySelector("#timer");
  if (!exam.deadline) {
    // Untimed mode: show elapsed time, never auto-submit
    if (timer) {
      const elapsed = Date.now() - (exam.startedAt || Date.now());
      timer.textContent = timerText(elapsed);
      timer.setAttribute("aria-label", `Tempo trascorso, senza limite: ${timerText(elapsed)}`);
    }
    return;
  }
  const remaining = Math.max(0, exam.deadline - Date.now());
  // Barra del tempo sotto quella delle risposte: si riempie man mano che il tempo passa
  const track = document.querySelector("#time-track");
  if (track) {
    const total = exam.deadline - exam.startedAt;
    track.value = total - remaining;
    track.classList.toggle("warning", remaining <= 10 * 60 * 1000 && remaining > 5 * 60 * 1000);
    track.classList.toggle("critical", remaining <= 5 * 60 * 1000);
    const percent = document.querySelector("#time-percent");
    if (percent)
      percent.textContent = `${Math.round(((total - remaining) / total) * 100)}% · restano ${timerText(remaining)}`;
  }
  if (timer) {
    timer.textContent = timerText(remaining);
    timer.classList.toggle("warning", remaining <= 10 * 60 * 1000 && remaining > 5 * 60 * 1000);
    timer.classList.toggle("critical", remaining <= 5 * 60 * 1000);
    timer.setAttribute("aria-label", `Tempo rimanente: ${timerText(remaining)}`);
  }
  if (remaining <= 0) finishExam(true);
}

export function startTimer() {
  if (state.tickHandle) clearInterval(state.tickHandle);
  updateTimer();
  state.tickHandle = setInterval(updateTimer, 1000);
}
