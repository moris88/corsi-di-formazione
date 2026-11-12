// Schermata dei risultati: esito, punteggio stimato per dominio e revisione domanda per domanda
import { escapeHtml } from "../../../utils.js";
import { applyStatsBars, PASS_SCORE, pickMotivation, scaledScore } from "../../simulazione-stats.js";
import { setFocusMode } from "../focus.js";
import { inlineMarkdown, markdownToHtml } from "../markdown.js";
import { examItems, resultCounts, statusFor } from "../scoring.js";
import { app, state, topStatus } from "../state.js";
import { renderDevil, renderPrintSummary } from "./printSummary.js";

function abbreviated(markdown, limit = 180) {
  const text = String(markdown)
    .replace(/[`*_>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}

function renderReviewEntry(item, index) {
  const question = state.questionBank.find((candidate) => candidate.id === Number(item.id));
  const status = statusFor(item, question);
  const statusLabel = status === "correct" ? "Corretta" : status === "wrong" ? "Errata" : "Non risposta";
  const displayed = item.optionOrder.map((letter, optionIndex) => ({
    ...question.options.find((option) => option.letter === letter),
    displayLetter: String.fromCharCode(65 + optionIndex),
  }));
  const chosen = displayed.find((option) => option.letter === item.answer);
  const right = displayed.find((option) => option.letter === question.correctLetter);
  return `<details class="review-entry" data-status="${status}" ${status === "wrong" ? "open" : ""}>
  <summary><span class="review-status ${status}">Domanda ${index + 1} · ${statusLabel}</span><span class="review-summary-text">${escapeHtml(abbreviated(question.prompt))}</span></summary>
  <div class="review-body">
    <div class="scenario-chip">${escapeHtml(question.scenario)}</div>
    ${question.context ? `<div class="scenario-context">${markdownToHtml(question.context)}</div>` : ""}
    <div class="review-question">${markdownToHtml(question.prompt)}</div>
    <div class="answer-label">Risposte</div>
    ${displayed
      .map((option) => {
        const isCorrect = option.letter === question.correctLetter;
        const isChosen = option.letter === item.answer;
        const classes = ["review-choice"];
        if (isCorrect) classes.push("correct");
        if (isChosen && !isCorrect) classes.push("selected-wrong");
        const note = isCorrect ? " · Corretta" : isChosen ? " · La tua risposta" : "";
        return `<div class="${classes.join(" ")}"><strong>${option.displayLetter}.</strong> ${inlineMarkdown(option.text)}<strong>${note}</strong></div>`;
      })
      .join("")}
    <p class="review-answer-line"><strong>La tua risposta:</strong> ${chosen ? `${chosen.displayLetter}. ${inlineMarkdown(chosen.text)}` : "Nessuna risposta"}<br><strong>Risposta corretta:</strong> ${right.displayLetter}. ${inlineMarkdown(right.text)}</p>
    ${question.explanation ? `<div class="review-explanation">${markdownToHtml(question.explanation)}</div>` : ""}
  </div>
</details>`;
}

export function renderResults(automatic = false) {
  const { completedExam, reviewFilter, totalQuestions } = state;
  if (!completedExam) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Esame concluso";
  const counts = resultCounts();
  const percentage = ((counts.correct / totalQuestions) * 100).toFixed(1);
  // Esito sul punteggio stimato 100–1000 (pesi ufficiali dei domini), come all'esame
  const estimate = scaledScore(examItems());
  const passed = estimate.score >= PASS_SCORE;
  // Scelta una volta per prova: cambiare filtro nella revisione non deve cambiare la frase
  completedExam.motivation ??= pickMotivation(estimate.score);
  const labels = {
    all: "Tutte",
    wrong: "Errate",
    unanswered: "Non risposte",
    correct: "Corrette",
  };
  const filters = ["all", "wrong", "unanswered", "correct"];
  const visible = completedExam.order
    .map((item, index) => ({
      item,
      index,
      question: state.questionBank.find((candidate) => candidate.id === Number(item.id)),
    }))
    .filter((entry) => reviewFilter === "all" || statusFor(entry.item, entry.question) === reviewFilter);
  app.innerHTML = `
  <section class="screen results-screen${state.testDifficulty === "inferno" ? " is-inferno" : ""}" aria-labelledby="results-title">
    ${renderPrintSummary(counts, estimate, percentage, passed)}
    <div class="results-head">
      <div><div class="eyebrow">Sessione completata${automatic ? " · Tempo esaurito" : ""}</div><h1 id="results-title">Revisione<br><span>dei risultati</span></h1><p>La simulazione è conclusa. Esamina ogni risposta e usa i filtri per concentrarti sui quesiti da ripassare.</p></div>
      <div class="score-block"><strong class="score-number">${counts.correct}<span class="score-small">/${totalQuestions}</span></strong><span class="score-caption">Risposte corrette · ${percentage}%</span></div>
    </div>
    ${state.testDifficulty === "inferno" ? renderDevil(passed) : ""}
    <div class="result-stats" aria-label="Riepilogo dei risultati">
      <div class="result-stat"><strong>${counts.correct}</strong><span>Corrette</span></div>
      <div class="result-stat"><strong>${counts.wrong}</strong><span>Errate</span></div>
      <div class="result-stat"><strong>${counts.unanswered}</strong><span>Senza risposta</span></div>
      <div class="result-stat"><strong>${completedExam.fullscreenExits || 0}</strong><span>Uscite dallo schermo intero</span></div>
      <div class="result-stat"><strong>${completedExam.tabSwitches || 0}</strong><span>Cambi di scheda o finestra</span></div>
    </div>
    <section class="result-outcome ${passed ? "passed" : "not-passed"}" aria-live="polite" aria-labelledby="outcome-title">
      <div class="outcome-mark" aria-hidden="true">${passed ? "✓" : "!"}</div>
      <div class="outcome-copy">
        <div class="outcome-kicker">Esito indicativo · soglia ${PASS_SCORE}/1000</div>
        <h2 id="outcome-title">${passed ? "Simulazione superata" : "Simulazione non superata"}</h2>
        <p class="outcome-motivation" data-band="${completedExam.motivation.band}">${escapeHtml(completedExam.motivation.text)}</p>
        <p>${passed ? `Punteggio stimato ${estimate.score}/1000, sopra la soglia di ${PASS_SCORE}, con ${counts.correct} risposte corrette su ${totalQuestions}.` : `Punteggio stimato ${estimate.score}/1000: mancano ${PASS_SCORE - estimate.score} punti alla soglia di ${PASS_SCORE}. Concentrati sui domini con il peso maggiore e la percentuale più bassa, poi riprova.`}</p>
        <p class="outcome-caveat">Il punteggio stimato pesa le risposte con i pesi ufficiali dei domini ed è calibrato sulla soglia di 720/1000, ma l’esame reale usa una scala propria che questa simulazione non può riprodurre: è un’indicazione, non l’esito ufficiale.</p>
        ${passed ? "" : `<div class="outcome-retry"><button class="button secondary" type="button" data-action="restart">Riprova la simulazione <span aria-hidden="true">↻</span></button></div>`}
      </div>
      <div class="outcome-score"><strong>${estimate.score}<small>/1000</small></strong><span>punteggio stimato · ${percentage}% corrette</span></div>
    </section>
    <section class="score-domains" aria-labelledby="score-domains-title">
      <h2 id="score-domains-title">Come è calcolato il punteggio</h2>
      <p class="stats-note">Percentuale di risposte corrette in ogni dominio, pesata con il peso ufficiale del dominio nell’esame. Scala: 0% → 100, 72% → ${PASS_SCORE}, 100% → 1000.</p>
      <table class="stats-table"><thead><tr><th>Dominio</th><th>Peso</th><th>Risposte corrette</th><th>Domande</th><th>Contributo</th></tr></thead><tbody>
      ${estimate.domains.map((d) => `<tr><td><strong>${d.key}</strong> ${escapeHtml(d.name)}</td><td>${d.weight}%</td><td><span class="stats-bar"><span class="stats-bar-fill ${d.rate >= 0.72 ? "good" : ""}" data-value="${Math.round(d.rate * 100)}"></span><span class="stats-bar-mark" aria-hidden="true"></span></span> ${Math.round(d.rate * 100)}%</td><td>${d.total ? `${d.ok}/${d.total}` : "—"}</td><td>${(d.rate * d.weight).toFixed(1)} / ${d.weight}</td></tr>`).join("")}
      </tbody></table>
    </section>
    ${completedExam.notes?.trim() ? `<section class="review-note" aria-labelledby="notes-title"><h2 id="notes-title">Le tue note</h2><p>${escapeHtml(completedExam.notes.trim())}</p></section>` : ""}
    <div class="review-head"><h2>Esito domanda per domanda</h2><div class="filter-group" role="group" aria-label="Filtra risultati">${filters.map((filter) => `<button type="button" class="filter-button ${reviewFilter === filter ? "active" : ""}" data-action="filter" data-filter="${filter}" aria-pressed="${reviewFilter === filter}">${labels[filter]} <span>${filter === "all" ? totalQuestions : counts[filter]}</span></button>`).join("")}</div></div>
    <div class="review-list">${visible.length ? visible.map(({ item, index }) => renderReviewEntry(item, index)).join("") : '<p class="empty-review">Nessuna domanda in questa categoria.</p>'}</div>
    <div class="results-actions"><button class="button secondary" type="button" data-action="show-stats">Statistiche di studio</button><button class="button secondary" type="button" data-action="print-results">Stampa risultato</button><button class="button secondary" type="button" data-action="change-source">Cambia test</button><button class="button" type="button" data-action="restart">Nuova simulazione <span aria-hidden="true">↻</span></button></div>
  </section>`;
  applyStatsBars(app);
}
