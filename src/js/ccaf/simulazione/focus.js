// Modalità concentrazione e blocco dello schermo durante la prova
import { state } from "./state.js";
import { saveExam } from "./storage.js";

// Modalità concentrazione: durante la prova l'header è nascosto e la pagina occupa tutto lo schermo
export function setFocusMode(on) {
  document.body.classList.toggle("exam-focus", on);
  // Livello del test sul body durante la prova: "inferno" accende l'effetto fuoco
  if (on && state.testDifficulty) document.body.dataset.level = state.testDifficulty;
  else delete document.body.dataset.level;
  if (!on) {
    hideExamLock();
    navigator.keyboard?.unlock?.();
  }
  if (!on && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

// ---- Blocco dello schermo durante la prova ----
// Il browser non permette di impedire del tutto l'uscita dallo schermo intero (Esc è una garanzia
// di sicurezza), quindi: Keyboard Lock su Esc dove supportato (Chrome/Edge: va tenuto premuto),
// copertura della prova finché non si torna a schermo intero, conteggio di uscite e cambi di scheda,
// avviso alla chiusura della pagina, niente menu contestuale né copia del testo delle domande.
export function requestFullscreen() {
  const root = document.documentElement;
  if (!root.requestFullscreen) return;
  const lockEscape = () => navigator.keyboard?.lock?.(["Escape"]).catch(() => {});
  if (document.fullscreenElement) lockEscape();
  else root.requestFullscreen({ navigationUI: "hide" }).then(lockEscape, () => {});
}

function examInProgress() {
  return state.exam?.status === "active" && document.body.classList.contains("exam-focus");
}

function showExamLock(resuming = false) {
  if (!document.documentElement.requestFullscreen) return;
  const { exam } = state;
  let lock = document.querySelector(".exam-lock");
  if (!lock) {
    lock = document.createElement("div");
    lock.className = "exam-lock";
    lock.setAttribute("role", "alertdialog");
    lock.setAttribute("aria-modal", "true");
    lock.setAttribute("aria-labelledby", "exam-lock-title");
    lock.addEventListener("click", (event) => {
      if (event.target.closest("[data-lock-resume]")) requestFullscreen();
    });
    document.body.append(lock);
  }
  lock.innerHTML = `<div class="exam-lock-box">
      <div class="exam-lock-icon" aria-hidden="true">⛶</div>
      <h2 id="exam-lock-title">${resuming ? "Bentornato nella prova" : "Sei uscito dallo schermo intero"}</h2>
      <p>${resuming ? `La simulazione è ancora in corso${exam.deadline ? " e il tempo ha continuato a scorrere" : ""}.` : "La prova resta nascosta finché non torni a schermo intero. Come all’esame vero, ogni uscita viene registrata e riportata nei risultati."}${exam.deadline ? " Il timer non si ferma." : ""}</p>
      <button class="button" type="button" data-lock-resume>Torna a schermo intero</button>
    </div>`;
  lock.hidden = false;
  lock.querySelector("[data-lock-resume]").focus();
}

function hideExamLock() {
  const lock = document.querySelector(".exam-lock");
  if (lock) lock.hidden = true;
}

// Ripresa di una prova (ricarica o ritorno sul sito): lo schermo intero va richiesto con un clic
export function resumeFullscreen() {
  if (!document.fullscreenElement) showExamLock(true);
}

// Ascoltatori globali: uscite dallo schermo intero, cambi di scheda, chiusura, menu contestuale e copia
export function initFocusGuards() {
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      hideExamLock();
      return;
    }
    if (!examInProgress()) return;
    state.exam.fullscreenExits = (state.exam.fullscreenExits || 0) + 1;
    saveExam();
    showExamLock();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && examInProgress()) {
      state.exam.tabSwitches = (state.exam.tabSwitches || 0) + 1;
      saveExam();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (examInProgress()) event.preventDefault();
  });

  document.addEventListener("contextmenu", (event) => {
    if (examInProgress()) event.preventDefault();
  });

  for (const type of ["copy", "cut"]) {
    document.addEventListener(type, (event) => {
      if (examInProgress() && !event.target.closest?.("textarea")) event.preventDefault();
    });
  }
}
