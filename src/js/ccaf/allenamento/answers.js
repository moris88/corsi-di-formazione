import { state } from "./state.js";

/* ---------- Statistiche: ogni risposta confermata è salvata in localStorage ---------- */

const ANSWERS_KEY = "ccaf-training-answers";
const MAX_ANSWERS = 5000;

export function loadAnswers() {
  try {
    const value = JSON.parse(localStorage.getItem(ANSWERS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveAnswers(list) {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(list.slice(-MAX_ANSWERS)));
  } catch {
    // Spazio esaurito o storage non disponibile: le statistiche non vengono aggiornate
  }
}

// t: quando, sid: sessione (inizio), k: test-domanda, s: scenario, d: difficoltà, ok: risposta corretta
export function recordAnswer(question, ok) {
  const list = loadAnswers();
  list.push({
    t: Date.now(),
    sid: state.session.startedAt,
    k: question.key,
    s: question.scenario,
    d: question.difficulty,
    ok,
  });
  saveAnswers(list);
}
