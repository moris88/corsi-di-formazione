// Schermata della prova in corso: domanda, opzioni, indice e blocco note
import { escapeHtml } from "../../../utils.js";
import { currentQuestion, finishExam } from "../exam.js";
import { setFocusMode } from "../focus.js";
import { inlineMarkdown, markdownToHtml } from "../markdown.js";
import { app, state, topStatus } from "../state.js";
import { saveExam } from "../storage.js";
import { startTimer } from "../timer.js";

export function renderExam() {
  const { exam, totalQuestions } = state;
  if (!exam || !state.sourceReady) return;
  setFocusMode(true);
  if (topStatus) topStatus.textContent = "Prova in corso";
  const item = exam.order[exam.index];
  const question = currentQuestion();
  if (!question) {
    finishExam(true);
    return;
  }
  const answered = exam.order.filter((entry) => entry.answer).length;
  const percent = (answered / totalQuestions) * 100;
  const presentedOptions = item.optionOrder.map((letter, index) => ({
    ...question.options.find((option) => option.letter === letter),
    displayLetter: String.fromCharCode(65 + index),
  }));
  const questionButtons = exam.order
    .map((entry, index) => {
      const bankQuestion = state.questionBank.find((candidate) => candidate.id === Number(entry.id));
      const classes = ["question-number"];
      if (entry.answer) classes.push("answered");
      if (entry.flagged) classes.push("flagged");
      if (index === exam.index) classes.push("current");
      return `<button type="button" class="${classes.join(" ")}" data-action="go" data-index="${index}" aria-label="Domanda ${index + 1}${entry.answer ? ", risposta selezionata" : ", senza risposta"}${entry.flagged ? ", contrassegnata" : ""}" ${index === exam.index ? 'aria-current="step"' : ""} title="${escapeHtml(bankQuestion?.scenario || "")}">${String(index + 1).padStart(2, "0")}</button>`;
    })
    .join("");

  app.innerHTML = `
  <section class="screen exam-screen" aria-label="Esame in corso">
    <div class="exam-progress">
      <div>
        <div class="progress-copy"><strong>${answered} di ${totalQuestions} risposte</strong><span>Completamento ${Math.round(percent)}%</span></div>
        <progress class="progress-track" value="${answered}" max="${totalQuestions}" aria-label="Domande con risposta">${percent}%</progress>
        ${
          exam.deadline
            ? `<div class="progress-copy time-copy"><strong>Tempo trascorso</strong><span id="time-percent"></span></div>
        <progress class="progress-track time-track" id="time-track" max="${exam.deadline - exam.startedAt}" aria-label="Tempo trascorso della prova"></progress>`
            : ""
        }
      </div>
      <div class="timer" id="timer" role="timer" aria-live="off">--:--</div>
    </div>
    <div class="exam-layout">
      <aside class="question-rail" aria-label="Navigazione domande">
        <div class="rail-head"><h2 class="rail-title">Indice</h2><span class="answered-count">${answered}/${totalQuestions}</span></div>
        <nav class="question-grid" aria-label="Vai alla domanda">${questionButtons}</nav>
        <div class="rail-legend" aria-hidden="true">
          <span class="legend-item"><i class="legend-chip done"></i>Risposta</span>
          <span class="legend-item"><i class="legend-chip marked"></i>Corrente</span>
          <span class="legend-item"><i class="legend-chip flagged"></i>Segnata</span>
        </div>
        <div class="rail-submit"><button class="button full" type="button" data-action="submit">Consegna esame</button></div>
      </aside>
      <section class="question-area" aria-labelledby="question-title">
        <div class="question-meta">
          <div class="scenario-chip" title="${escapeHtml(question.scenario)}">${escapeHtml(question.scenario)}</div>
          <button class="flag-button" type="button" data-action="flag" aria-pressed="${item.flagged}" title="Contrassegna per la revisione"><span class="flag-symbol" aria-hidden="true">⚑</span><span>${item.flagged ? "Segnata" : "Segna"}</span></button>
        </div>
        <h1 class="question-heading" id="question-title">Domanda ${exam.index + 1}<span>di ${totalQuestions}</span></h1>
        ${question.context ? `<div class="scenario-context">${markdownToHtml(question.context)}</div>` : ""}<div class="question-prompt">${markdownToHtml(question.prompt)}</div>
        <div class="answer-label">Seleziona una risposta</div>
        <div class="answer-list" role="radiogroup" aria-label="Opzioni di risposta">
          ${presentedOptions.map((option) => `<label class="answer-option"><input type="radio" name="answer" value="${option.letter}" ${item.answer === option.letter ? "checked" : ""}><span class="answer-letter">${option.displayLetter}</span><span class="answer-text">${inlineMarkdown(option.text)}</span></label>`).join("")}
        </div>
        <div class="question-footer">
          <div class="nav-actions"><button class="button secondary" type="button" data-action="previous" ${exam.index === 0 ? "disabled" : ""}><span aria-hidden="true">←</span> Precedente</button><button class="button" type="button" data-action="next" ${exam.index === totalQuestions - 1 ? "disabled" : ""}>Successiva <span aria-hidden="true">→</span></button></div>
          <span class="keyboard-hint">La risposta si salva automaticamente</span>
        </div>
      </section>
      <aside class="exam-notes" aria-label="Note della prova">
        <label for="exam-notes">Blocco note</label>
        <p class="exam-notes-hint" id="exam-notes-hint">Uno spazio unico per tutta la prova, sempre visibile mentre cambi domanda: annota dubbi, numeri delle domande da rivedere o concetti da ripassare. Si salva automaticamente, non influisce sul punteggio e lo ritrovi nella revisione finale.</p>
        <textarea id="exam-notes" rows="16" maxlength="10000" aria-describedby="exam-notes-hint" placeholder="Es. D12 indeciso tra B e C (hook o prompt?) · ripassare Batches API">${escapeHtml(exam.notes || "")}</textarea>
      </aside>
    </div>
  </section>`;
  measureExamBar();
  saveExam();
  startTimer();
}

// Altezza della barra fissa in alto (risposte, tempo, timer): serve a indice e note per fermarsi sotto
export function measureExamBar() {
  const bar = app.querySelector(".exam-progress");
  document.body.style.setProperty("--exam-bar", bar ? `${bar.offsetHeight}px` : "0px");
}
