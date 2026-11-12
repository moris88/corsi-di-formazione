// Costanti, riferimenti al DOM e stato condiviso della simulazione.
// Lo stato mutabile è in un unico oggetto: i binding ES importati sono in sola lettura.

export const DEFAULT_DURATION_MINUTES = 120;
export const STORAGE_KEY = "ccaf-simulation-session-v1";
export const HISTORY_KEY = "ccaf-simulation-history-v1";
export const HISTORY_LIMIT = 30;
export const BUILTIN_TESTS = [
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 1 - Claude Certified Architect.md",
    label: "Test 1 EN · Facile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 2 - Claude Certified Architect.md",
    label: "Test 2 EN · Medio",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 3 - Claude Certified Architect.md",
    label: "Test 3 EN · Medio",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 4 - Claude Certified Architect.md",
    label: "Test 4 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 5 - Claude Certified Architect.md",
    label: "Test 5 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 6 - Claude Certified Architect.md",
    label: "Test 6 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 7 - Claude Certified Architect.md",
    label: "Test 7 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 8 - Claude Certified Architect.md",
    label: "Test 8 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 9 - Claude Certified Architect.md",
    label: "Test 9 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 10 - Claude Certified Architect.md",
    label: "Test 10 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 11 - Claude Certified Architect.md",
    label: "Test 11 EN · Avanzato",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 12 - Claude Certified Architect.md",
    label: "Test 12 EN · Avanzato",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 13 - Claude Certified Architect.md",
    label: "Test 13 EN · Inferno",
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
  testTitle: "Simulazione CCA-F",
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
