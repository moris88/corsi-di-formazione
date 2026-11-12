// Esito delle risposte e registrazione della prova consegnata nello storico
import { classifyQuestion, PASS_SCORE, scaledScore } from "../simulazione-stats.js";
import { HISTORY_LIMIT, state } from "./state.js";
import { loadHistory, saveHistory } from "./storage.js";

export function statusFor(item, question) {
  if (!item.answer) return "unanswered";
  return item.answer === question.correctLetter ? "correct" : "wrong";
}

export function resultCounts() {
  const counts = { correct: 0, wrong: 0, unanswered: 0 };
  for (const item of state.completedExam.order) {
    const question = state.questionBank.find((candidate) => candidate.id === Number(item.id));
    const status = statusFor(item, question);
    counts[status]++;
  }
  return counts;
}

// Dettaglio per domanda (scenario, argomenti, domini, esito, segnata) per statistiche e punteggio stimato
export function examItems() {
  return state.completedExam.order.map((item) => {
    const question = state.questionBank.find((candidate) => candidate.id === Number(item.id));
    // Solo domanda, opzioni e spiegazione: il paragrafo introduttivo dello scenario è uguale per tutte
    const { topics, domains } = classifyQuestion(question);
    return { s: question.scenario, t: topics, d: domains, r: statusFor(item, question), f: item.flagged };
  });
}

export function recordResult(automatic) {
  const { completedExam } = state;
  const counts = resultCounts();
  const history = loadHistory();
  const items = examItems();
  history.unshift({
    date: Date.now(),
    title: state.testTitle,
    correct: counts.correct,
    total: state.totalQuestions,
    passed: scaledScore(items).score >= PASS_SCORE,
    automatic,
    difficulty: state.testDifficulty,
    durationMs: completedExam.startedAt ? Date.now() - completedExam.startedAt : null,
    timeLimitMs: completedExam.deadline ? completedExam.deadline - completedExam.startedAt : null,
    score: scaledScore(items).score,
    fullscreenExits: completedExam.fullscreenExits || 0,
    tabSwitches: completedExam.tabSwitches || 0,
    items,
  });
  saveHistory(history.slice(0, HISTORY_LIMIT));
}
