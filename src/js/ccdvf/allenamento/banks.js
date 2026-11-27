import { FILE_PATTERN } from "./constants.js";
import { parseQuestionBank } from "./parser.js";
import { app, state } from "./state.js";
import { loadTheory } from "./theory.js";

async function fetchTest(n) {
  try {
    const response = await fetch(new URL(FILE_PATTERN(n), window.location.href), { cache: "no-store" });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export async function loadAllBanks() {
  loadTheory();
  let misses = 0;
  for (let n = 1; misses < 2 && n < 100; n++) {
    const raw = await fetchTest(n);
    if (raw === null) {
      misses++;
      continue;
    }
    misses = 0;
    const questions = parseQuestionBank(raw, n);
    if (questions.length) {
      state.loadedTests.push(n);
      state.pool.push(...questions);
    }
    const counter = app.querySelector("#loader-count");
    if (counter) counter.textContent = `Test ${n} · ${state.pool.length} domande`;
  }
  if (!state.pool.length)
    state.loadError =
      "Nessuna banca quesiti trovata. Apri la pagina tramite il server locale (i file della cartella questions/ devono essere raggiungibili).";
  state.count = Math.min(state.count, state.pool.length || state.count);
}

export function scenarios() {
  return [...new Set(state.pool.map((q) => q.scenario))].sort();
}

// "casuale" = tutti i file, anche quelli senza difficoltà assegnata
export function difficultyPool() {
  return state.difficultyChoice === "casuale"
    ? state.pool
    : state.pool.filter((q) => q.difficulty === state.difficultyChoice);
}

export function filteredPool() {
  return difficultyPool().filter((q) => !state.excludedScenarios.has(q.scenario));
}

export function testsIn(questions) {
  return [...new Set(questions.map((q) => q.test))].sort((a, b) => a - b);
}
