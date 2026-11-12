import { escapeHtml } from "../../utils.js";
import { filteredPool } from "./banks.js";
import { EXTRA_PRESETS } from "./constants.js";
import { inlineMarkdown, markdownToHtml } from "./markdown.js";
import { app, state } from "./state.js";
import { formatMinutes, stopTimer, timeLeft, timerText } from "./timer.js";
import { clearSession } from "./trainingSession.js";

/* ---------- Riepilogo ---------- */

export function renderSummary() {
  const session = state.session;
  stopTimer();
  clearSession();
  // Una pausa in corso non deve consumare il tempo avanzato
  if (session.deadline && !session.timeUp) session.remaining = timeLeft();
  session.pausedAt = null;
  const answered = session.items.filter((_it, i) => i < session.index || session.confirmed);
  const wrongItems = answered.filter((it) => it.answer !== it.question.correctLetter);
  const pct = answered.length ? Math.round((session.correct / answered.length) * 100) : 0;
  // Domande aggiuntive solo se l'allenamento classico è finito prima dello scadere del tempo
  const finished =
    !session.marathon && !session.timeUp && session.confirmed && session.index === session.items.length - 1;
  const used = new Set(session.items.map((it) => it.question.key));
  const left = finished ? filteredPool().filter((q) => !used.has(q.key)).length : 0;
  const extraChoices = [...EXTRA_PRESETS.filter((p) => p < left), ...(left && left <= 20 ? [left] : [])];
  app.innerHTML = `
  <section class="screen train-summary" aria-labelledby="sum-title">
    <div class="eyebrow">${session.timeUp ? "Tempo scaduto" : session.marathon ? "Maratona conclusa" : "Allenamento concluso"}</div>
    <h1 id="sum-title">Riepilogo<br><span>${pct}% corrette</span></h1>
    <div class="stats">
      <div class="stat"><strong>${answered.length}</strong><span>Risposte</span></div>
      <div class="stat"><strong>${session.correct}</strong><span>Corrette</span></div>
      <div class="stat"><strong>${session.wrong}</strong><span>Errate</span></div>
    </div>
    <p class="intro-copy">${pct >= 72 ? "Ottimo ritmo: sei sopra la soglia indicativa del 72%. Quando sei costante, prova la simulazione completa." : "Sotto la soglia indicativa del 72%: ripassa le domande sbagliate e riprova."}</p>
    ${
      wrongItems.length
        ? `<h2>Da ripassare</h2><div class="wrong-list">${wrongItems
            .map((it) => {
              const q = it.question;
              const right = q.options.find((o) => o.letter === q.correctLetter);
              return `<details class="review-entry"><summary><span class="review-status wrong">T${q.test} · Q${q.id}${it.timedOut ? " · tempo scaduto" : ""}</span><span class="review-summary-text">${escapeHtml(q.prompt.replace(/[`*_>#]/g, "").slice(0, 160))}…</span></summary><div class="review-body"><div class="scenario-chip">${escapeHtml(q.scenario)}</div>${q.context ? `<div class="scenario-context">${markdownToHtml(q.context)}</div>` : ""}<div class="review-question">${markdownToHtml(q.prompt)}</div><div class="review-choice correct"><strong>Corretta:</strong> ${inlineMarkdown(right.text)}</div></div></details>`;
            })
            .join("")}</div>`
        : ""
    }
    ${
      extraChoices.length
        ? `<div class="train-card"><h2>Continua</h2><p class="hint">Aggiungi altre domande non ancora uscite${session.remaining != null ? `: al tempo avanzato (${timerText(session.remaining)}) si somma ${formatMinutes(state.minutesPerQuestion)} per ogni domanda` : ""}.</p><div class="count-row" role="group" aria-label="Domande da aggiungere">${extraChoices
            .map((n) => `<button type="button" class="count-chip" data-action="add" data-count="${n}">+${n}</button>`)
            .join("")}</div></div>`
        : ""
    }
    <div class="train-actions">
      ${wrongItems.length ? `<button class="button secondary" type="button" data-action="retry-wrong">Rifai le ${wrongItems.length} sbagliate</button>` : ""}
      <button class="button secondary" type="button" data-action="setup">Cambia impostazioni</button>
      <button class="button secondary" type="button" data-action="stats">Statistiche</button>
      <button class="button" type="button" data-action="generate">${state.mode === "maratona" ? "Nuova maratona" : "Nuovo allenamento"} <span aria-hidden="true">↻</span></button>
    </div>
  </section>`;
  window.scrollTo({ top: 0 });
  session.wrongItems = wrongItems;
}
