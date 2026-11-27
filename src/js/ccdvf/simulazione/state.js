// Costanti, riferimenti al DOM e stato condiviso della simulazione.
// Lo stato mutabile è in un unico oggetto: i binding ES importati sono in sola lettura.

export const DEFAULT_DURATION_MINUTES = 120;
export const STORAGE_KEY = "ccdvf-simulation-session-v1";
export const HISTORY_KEY = "ccdvf-simulation-history-v1";
export const HISTORY_LIMIT = 30;
// Numerati in ordine di difficoltà (Facile → Inferno), come i file delle banche quesiti
export const BUILTIN_TESTS = [
  {
    file: "../../assets/ccdvf/questions/Domande e risposte test 1 - Claude Certified Developer.md",
    label: "Test 1 EN · Medio",
  },
];

// Badge della difficoltà come nella legenda del popup; i test importati sono sempre "Custom"
export const DIFFICULTY_NAMES = {
  facile: "Facile",
  medio: "Medio",
  difficile: "Difficile",
  avanzato: "Avanzato",
  inferno: "Inferno",
};

export const timedMode = true;

export const app = document.querySelector("#app");
export const topStatus = document.querySelector("#top-status");
export const announcer = document.querySelector("#announcer");

export const state = {
  totalQuestions: 0,
  durationMs: DEFAULT_DURATION_MINUTES * 60 * 1000,
  selectedPreset: BUILTIN_TESTS[0].file,
  // Test importati dall'utente in questa sessione della pagina: compaiono nel select come "Test importato n.X"
  importedTests: [],
  questionBank: [],
  testTitle: "Simulazione CCDV-F",
  testDurationMinutes: DEFAULT_DURATION_MINUTES,
  testDifficulty: "",
  // Testo e nome della banca caricata: salvati nella sessione se è un test importato, per poterla riprendere
  currentSource: { raw: "", name: "" },
  sourceFingerprint: "",
  sourceReady: false,
  sourceMessage: "Caricamento banca quesiti…",
  sourceError: "",
  exam: null,
  completedExam: null,
  tickHandle: null,
  reviewFilter: "all",
  launching: false,
  formatGuideText: "",
  toolsDialog: null,
};

export function announce(message) {
  announcer.textContent = message;
}
