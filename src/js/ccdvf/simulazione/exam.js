// Ciclo di vita della prova: avvio, domanda corrente, consegna
import { confirmDialog } from "../../dialog.js";
import { shuffle } from "../../utils.js";
import { renderExam } from "./render/exam.js";
import { renderResults } from "./render/results.js";
import { recordResult } from "./scoring.js";
import { announce, BUILTIN_TESTS, state, timedMode } from "./state.js";
import { safeStorageRemove, safeStorageSet } from "./storage.js";

export function beginExam() {
  if (!state.sourceReady || state.questionBank.length === 0) return;
  const shuffledQuestions = shuffle(state.questionBank);
  state.exam = {
    status: "active",
    sourceFingerprint: state.sourceFingerprint,
    // Da dove ricaricare le domande alla riapertura della pagina (anche se nel frattempo è selezionato un altro test)
    source: BUILTIN_TESTS.some((test) => test.file === state.selectedPreset)
      ? { file: state.selectedPreset }
      : { raw: state.currentSource.raw, name: state.currentSource.name },
    startedAt: Date.now(),
    deadline: timedMode ? Date.now() + state.testDurationMinutes * 60 * 1000 : null,
    index: 0,
    notes: "",
    order: shuffledQuestions.map((question) => ({
      id: question.id,
      optionOrder: shuffle(question.options.map((option) => option.letter)),
      answer: null,
      flagged: false,
    })),
  };
  safeStorageSet(state.exam);
  renderExam();
  announce(
    timedMode
      ? `Simulazione iniziata. Hai ${state.testDurationMinutes} minuti.`
      : "Simulazione iniziata, senza limite di tempo.",
  );
}

export function currentQuestion() {
  if (!state.exam) return null;
  const orderItem = state.exam.order[state.exam.index];
  return state.questionBank.find((question) => question.id === Number(orderItem.id));
}

export async function confirmFinish() {
  const unanswered = state.exam.order.filter((item) => !item.answer).length;
  const message = unanswered
    ? `Hai ${unanswered} domande senza risposta. Vuoi consegnare comunque la prova?`
    : "Vuoi consegnare la prova e vedere i risultati?";
  const ok = await confirmDialog({
    title: "Consegnare la prova?",
    message,
    confirmLabel: "Consegna",
    cancelLabel: "Continua la prova",
  });
  if (ok && state.exam) finishExam(false);
}

export function finishExam(automatic) {
  const { exam } = state;
  if (exam?.status !== "active") return;
  if (!automatic && exam.deadline && exam.deadline <= Date.now()) automatic = true;
  if (state.tickHandle) {
    clearInterval(state.tickHandle);
    state.tickHandle = null;
  }
  state.completedExam = {
    ...exam,
    finishedAt: Date.now(),
    automatic,
    order: exam.order.map((item) => ({ ...item })),
  };
  state.exam = null;
  safeStorageRemove();
  recordResult(automatic);
  state.reviewFilter = "all";
  renderResults(automatic);
  announce(automatic ? "Tempo terminato. La prova è stata consegnata." : "Prova consegnata. Risultati disponibili.");
}
