// Gestione degli eventi della pagina: azioni dei pulsanti, risposte, note, selezione del test e tastiera
import { confirmDialog } from "../../dialog.js";
import { playDemonGate } from "./demonGate.js";
import { confirmFinish } from "./exam.js";
import { requestFullscreen } from "./focus.js";
import { playInfernoIntro, playLaunch } from "./launch.js";
import { renderExam } from "./render/exam.js";
import { renderExamGuide } from "./render/guide.js";
import { renderIntro, renderStatsScreen } from "./render/intro.js";
import { printResults } from "./render/printSummary.js";
import { renderResults } from "./render/results.js";
import { loadPreset, setSource } from "./source.js";
import { announce, app, BUILTIN_TESTS, state, timedMode } from "./state.js";
import { saveExam, saveHistory } from "./storage.js";
import { openToolsDialog } from "./toolsDialog.js";

export function initAppEvents() {
  app.addEventListener("click", async (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;
    const action = control.dataset.action;
    const { exam } = state;
    if (action === "open-tools") {
      openToolsDialog();
    } else if (action === "clear-history") {
      const ok = await confirmDialog({
        title: "Cancellare lo storico?",
        message: "Tutti gli esiti delle simulazioni salvati in questo browser verranno eliminati.",
        confirmLabel: "Cancella storico",
        danger: true,
      });
      if (ok) {
        saveHistory([]);
        renderIntro();
      }
    } else if (action === "show-guide" || action === "restart") {
      if (
        exam &&
        !(await confirmDialog({
          title: "Iniziare una nuova simulazione?",
          message: "La simulazione in corso verrà eliminata. Vuoi iniziarne una nuova?",
          confirmLabel: "Nuova simulazione",
          danger: true,
        }))
      )
        return;
      renderExamGuide();
    } else if (action === "back-to-intro") {
      renderIntro();
    } else if (action === "stats-back") {
      if (state.completedExam) renderResults();
      else renderIntro();
    } else if (action === "print-results" && state.completedExam) {
      printResults();
    } else if (action === "show-stats") {
      renderStatsScreen();
    } else if (action === "start") {
      const ok = await confirmDialog({
        title: "Sei pronto a iniziare?",
        message: timedMode
          ? `Da questo momento la prova non si può mettere in pausa: il timer di ${state.testDurationMinutes} minuti continua a scorrere anche se chiudi o ricarichi la pagina, e allo scadere le risposte vengono consegnate automaticamente. Puoi solo consegnare prima del tempo. Mettiti in un posto tranquillo e affrontala come se fosse l’esame vero.`
          : "Da questo momento la prova è avviata: le domande sono in ordine casuale e non puoi tornare alle istruzioni. Puoi chiudere la pagina e riprendere, ma l’unico modo per terminare è consegnare. Affrontala come se fosse l’esame vero.",
        confirmLabel: "Inizia ora",
        cancelLabel: "Non ancora",
      });
      if (!ok) return;
      // Il tutto schermo va chiesto dentro un gesto dell'utente: il clic su "Inizia ora" lo è ancora
      requestFullscreen();
      if (state.testDifficulty === "inferno") playDemonGate(playLaunch);
      else playLaunch();
    } else if (action === "go" && exam) {
      exam.index = Number(control.dataset.index);
      saveExam();
      renderExam();
    } else if (action === "previous" && exam && exam.index > 0) {
      exam.index--;
      saveExam();
      renderExam();
    } else if (action === "next" && exam && exam.index < state.totalQuestions - 1) {
      exam.index++;
      saveExam();
      renderExam();
    } else if (action === "flag" && exam) {
      exam.order[exam.index].flagged = !exam.order[exam.index].flagged;
      saveExam();
      renderExam();
    } else if (action === "submit" && exam) {
      confirmFinish();
    } else if (action === "filter" && state.completedExam) {
      state.reviewFilter = control.dataset.filter;
      renderResults(false);
    } else if (action === "change-source" && state.completedExam) {
      state.completedExam = null;
      renderIntro();
    }
  });

  app.addEventListener("input", (event) => {
    if (event.target.matches("#exam-notes") && state.exam) {
      state.exam.notes = event.target.value;
      saveExam();
    }
  });

  app.addEventListener("change", async (event) => {
    if (event.target.matches("#preset-test")) {
      const imported = state.importedTests.find((test) => test.file === event.target.value);
      if (imported) {
        state.selectedPreset = imported.file;
        setSource(imported.raw, imported.name);
      } else if (event.target.value) {
        if (/inferno/i.test(BUILTIN_TESTS.find((test) => test.file === event.target.value)?.label || ""))
          playInfernoIntro();
        loadPreset(event.target.value);
      }
      return;
    }
    if (event.target.matches('input[name="answer"]') && state.exam) {
      state.exam.order[state.exam.index].answer = event.target.value;
      saveExam();
      renderExam();
      announce("Risposta salvata.");
    }
  });
}

export function initKeyboard() {
  document.addEventListener("keydown", (event) => {
    const { exam } = state;
    if (!exam || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target && (target.matches("input, textarea, select, button") || target.isContentEditable)) return;
    if (event.key === "ArrowLeft" && exam.index > 0) {
      exam.index--;
      saveExam();
      renderExam();
    } else if (event.key === "ArrowRight" && exam.index < state.totalQuestions - 1) {
      exam.index++;
      saveExam();
      renderExam();
    } else if (/^[1-4]$/.test(event.key)) {
      const item = exam.order[exam.index];
      item.answer = item.optionOrder[Number(event.key) - 1];
      saveExam();
      renderExam();
    }
  });
}
