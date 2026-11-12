// Stato condiviso della pagina: un unico oggetto mutabile, perché i binding importati sono in sola lettura
export const app = document.querySelector("#app");
const announcer = document.querySelector("#announcer");
export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const state = {
  pool: [],
  loadedTests: [],
  loadError: "",
  count: 10,
  excludedScenarios: new Set(),
  difficultyChoice: "casuale",
  timedMode: false,
  minutesPerQuestion: 2,
  timerId: null,
  // "classica" = numero fisso di domande; "maratona" = domande casuali senza fine, 2 minuti ciascuna
  mode: "classica",
  session: null,
};

export function announce(message) {
  announcer.textContent = message;
}
