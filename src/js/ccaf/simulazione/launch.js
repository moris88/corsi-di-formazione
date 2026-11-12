// Animazioni di avvio: introduzione del livello inferno e preparazione della prova
import { escapeHtml } from "../../utils.js";
import { beginExam } from "./exam.js";
import { setFocusMode } from "./focus.js";
import { announce, state, timedMode } from "./state.js";

// Animazione a schermo intero quando si sceglie un test di livello "inferno"; clic o Esc la chiudono
export function playInfernoIntro() {
  document.querySelector(".inferno-intro")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "inferno-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="inferno-flames">${"<span></span>".repeat(14)}</div>
    <div class="inferno-embers">${"<i></i>".repeat(24)}</div>
    <div class="inferno-text">
      <strong>Inferno</strong>
      <p>Lasciate ogni speranza, voi ch’entrate</p>
    </div>`;
  const close = () => {
    overlay.classList.add("is-leaving");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => overlay.remove(), 600);
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  announce("Livello inferno selezionato.");
  setTimeout(close, 3200);
}

// Animazione di preparazione mostrata dopo "Inizia la prova": al termine avvia l'esame dietro l'overlay e lo dissolve
export function playLaunch() {
  if (state.launching) return;
  state.launching = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = [
    `Mescolo le ${state.questionBank.length} domande`,
    "Ordino le risposte a caso",
    timedMode ? `Avvio il timer: ${state.testDurationMinutes} minuti` : "Prova senza limite di tempo",
    "Pronti: buona fortuna!",
  ];
  const stepTime = reduced ? 150 : 650;
  const overlay = document.createElement("div");
  overlay.className = "exam-launch";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.style.setProperty("--launch-duration", `${steps.length * stepTime}ms`);
  overlay.innerHTML = `
    <div class="launch-card">
      <div class="launch-ring" aria-hidden="true">
        <svg viewBox="0 0 120 120"><circle class="launch-ring-track" cx="60" cy="60" r="52" /><circle class="launch-ring-fill" cx="60" cy="60" r="52" pathLength="100" /></svg>
        <img src="../../assets/ccaf.png" alt="" class="launch-logo" />
      </div>
      <p class="launch-eyebrow">Simulazione d’esame</p>
      <ol class="launch-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
    </div>`;
  document.body.append(overlay);
  setFocusMode(true);
  const items = overlay.querySelectorAll(".launch-steps li");
  // Calcola gli stili iniziali prima di avviare il riempimento dell'anello, altrimenti la transizione non parte
  overlay.getBoundingClientRect();
  overlay.classList.add("is-running");
  items.forEach((item, index) => {
    setTimeout(() => {
      items[index - 1]?.classList.replace("is-active", "is-done");
      item.classList.add("is-active");
    }, index * stepTime);
  });
  setTimeout(
    () => {
      items[items.length - 1].classList.replace("is-active", "is-done");
      beginExam();
      overlay.classList.add("is-leaving");
      setTimeout(
        () => {
          overlay.remove();
          state.launching = false;
        },
        reduced ? 0 : 450,
      );
    },
    steps.length * stepTime + (reduced ? 0 : 250),
  );
}
