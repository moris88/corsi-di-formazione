import { escapeHtml } from "../../utils.js";
import { loadAnswers } from "./answers.js";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "./constants.js";
import { app, state } from "./state.js";
import { stopTimer } from "./timer.js";

const PASS_THRESHOLD = 72;

const percent = (ok, total) => (total ? Math.round((ok / total) * 100) : 0);

function groupBy(list, keyOf) {
  const groups = new Map();
  for (const entry of list) {
    const key = keyOf(entry);
    const group = groups.get(key) || { key, ok: 0, total: 0, first: entry.t };
    group.total++;
    if (entry.ok) group.ok++;
    groups.set(key, group);
  }
  return [...groups.values()];
}

function formatDate(time) {
  return new Date(time).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

// Andamento: % di risposte corrette per sessione (ultime 20), con la soglia indicativa del 72%
function trendChart(sessions) {
  const width = 640;
  const height = 220;
  const pad = { top: 14, right: 16, bottom: 28, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const x = (i) => pad.left + (sessions.length === 1 ? plotW / 2 : (i / (sessions.length - 1)) * plotW);
  const y = (pct) => pad.top + plotH - (pct / 100) * plotH;
  const points = sessions.map((s, i) => ({ ...s, pct: percent(s.ok, s.total), cx: x(i) }));
  const grid = [0, 50, 100]
    .map(
      (v) =>
        `<line class="trend-grid" x1="${pad.left}" x2="${width - pad.right}" y1="${y(v)}" y2="${y(v)}" /><text class="trend-axis" x="${pad.left - 8}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`,
    )
    .join("");
  const threshold = `<line class="trend-threshold" x1="${pad.left}" x2="${width - pad.right}" y1="${y(PASS_THRESHOLD)}" y2="${y(PASS_THRESHOLD)}" /><text class="trend-axis" x="${width - pad.right}" y="${y(PASS_THRESHOLD) - 6}" text-anchor="end">soglia ${PASS_THRESHOLD}%</text>`;
  const line =
    points.length > 1
      ? `<polyline class="trend-line" points="${points.map((p) => `${p.cx},${y(p.pct)}`).join(" ")}" />`
      : "";
  const dots = points.map((p) => `<circle class="trend-dot" cx="${p.cx}" cy="${y(p.pct)}" r="4.5" />`).join("");
  const labels = [points[0], points[points.length - 1]]
    .filter((p, i, all) => p && (i === 0 || p !== all[0]))
    .map(
      (p) =>
        `<text class="trend-axis" x="${p.cx}" y="${height - 8}" text-anchor="middle">${formatDate(p.first)}</text>`,
    )
    .join("");
  // Aree di passaggio del mouse più larghe dei punti, una per sessione
  const step = points.length > 1 ? plotW / (points.length - 1) : plotW;
  const hits = points
    .map(
      (p, i) =>
        `<rect class="trend-hit" x="${p.cx - step / 2}" y="${pad.top}" width="${step}" height="${plotH}" data-index="${i}" />`,
    )
    .join("");
  return `
    <div class="trend-chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Percentuale di risposte corrette nelle ultime ${points.length} sessioni">
        ${grid}${threshold}${line}${dots}${labels}${hits}
      </svg>
      <div class="trend-tooltip" hidden></div>
    </div>`;
}

function barRows(groups) {
  return `<div class="stat-bars">${groups
    .map(
      (g) => `
      <div class="stat-bar-row">
        <span class="stat-bar-label">${escapeHtml(g.label)}</span>
        <span class="stat-bar-track"><span class="stat-bar-fill" data-pct="${percent(g.ok, g.total)}"></span></span>
        <span class="stat-bar-value"><strong>${percent(g.ok, g.total)}%</strong> · ${g.total} rispost${g.total === 1 ? "a" : "e"}</span>
      </div>`,
    )
    .join("")}</div>`;
}

export function renderStats() {
  stopTimer();
  const answers = loadAnswers();
  const back = `<button class="button secondary" type="button" data-action="setup">Torna all’allenamento</button>`;
  if (!answers.length) {
    app.innerHTML = `
    <section class="screen train-stats" aria-labelledby="stats-title">
      <div class="eyebrow">Allenamento</div>
      <h1 id="stats-title">Le tue<br><span>statistiche</span></h1>
      <p class="intro-copy">Non ci sono ancora risposte salvate. Ogni risposta che confermi in allenamento viene salvata in questo browser e qui vedrai l’andamento.</p>
      <div class="train-actions">${back}</div>
    </section>`;
    window.scrollTo({ top: 0 });
    return;
  }
  const correct = answers.filter((a) => a.ok).length;
  const sessions = groupBy(answers, (a) => a.sid).sort((a, b) => a.key - b.key);
  const recent = answers.filter((a) => a.t >= Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOk = recent.filter((a) => a.ok).length;
  const lastSessions = sessions.slice(-20);
  const scenarioGroups = groupBy(answers, (a) => a.s)
    .map((g) => ({ ...g, label: g.key }))
    .sort((a, b) => percent(a.ok, a.total) - percent(b.ok, b.total));
  const difficultyGroups = groupBy(
    answers.filter((a) => a.d),
    (a) => a.d,
  )
    .map((g) => ({ ...g, label: DIFFICULTY_LABELS[g.key] || g.key }))
    .sort((a, b) => DIFFICULTIES.indexOf(a.key) - DIFFICULTIES.indexOf(b.key));
  const missed = groupBy(
    answers.filter((a) => !a.ok),
    (a) => a.k,
  )
    .filter((g) => g.total >= 2)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  const questionByKey = new Map(state.pool.map((q) => [q.key, q]));

  app.innerHTML = `
  <section class="screen train-stats" aria-labelledby="stats-title">
    <div class="eyebrow">Allenamento</div>
    <h1 id="stats-title">Le tue<br><span>statistiche</span></h1>
    <div class="stats">
      <div class="stat"><strong>${answers.length}</strong><span>Risposte date</span></div>
      <div class="stat"><strong>${percent(correct, answers.length)}%</strong><span>Corrette in totale</span></div>
      <div class="stat"><strong>${recent.length ? `${percent(recentOk, recent.length)}%` : "–"}</strong><span>Ultimi 7 giorni (${recent.length})</span></div>
      <div class="stat"><strong>${sessions.length}</strong><span>Sessioni</span></div>
    </div>

    <h2>Andamento</h2>
    <p class="hint">Percentuale di risposte corrette per sessione${sessions.length > 20 ? " (ultime 20)" : ""}.</p>
    ${trendChart(lastSessions)}
    <details class="stat-table">
      <summary>Mostra i dati in tabella</summary>
      <table>
        <thead><tr><th>Sessione</th><th>Risposte</th><th>Corrette</th><th>%</th></tr></thead>
        <tbody>${lastSessions
          .map(
            (s) =>
              `<tr><td>${new Date(s.first).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}</td><td>${s.total}</td><td>${s.ok}</td><td>${percent(s.ok, s.total)}%</td></tr>`,
          )
          .join("")}</tbody>
      </table>
    </details>

    <h2>Per scenario</h2>
    <p class="hint">Dal più debole al più forte.</p>
    ${barRows(scenarioGroups)}

    ${difficultyGroups.length ? `<h2>Per difficoltà</h2>${barRows(difficultyGroups)}` : ""}

    ${
      missed.length
        ? `<h2>Sbagliate più spesso</h2><div class="wrong-list">${missed
            .map((g) => {
              const q = questionByKey.get(g.key);
              const label = q ? `T${q.test} · Q${q.id}` : g.key;
              const text = q ? `${escapeHtml(q.prompt.replace(/[`*_>#]/g, "").slice(0, 140))}…` : "";
              return `<div class="missed-row"><span class="review-status wrong">${label}</span><span class="review-summary-text">${text}</span><strong class="missed-count">${g.total}×</strong></div>`;
            })
            .join("")}</div>`
        : ""
    }

    <div class="train-actions is-sticky">
      <button class="button secondary" type="button" data-action="reset-stats">Azzera statistiche</button>
      ${back}
      <button class="button" type="button" data-action="generate">Nuovo allenamento <span aria-hidden="true">→</span></button>
    </div>
  </section>`;

  // Larghezza delle barre impostata da JS (niente attributi style= nell'HTML generato)
  app.querySelectorAll(".stat-bar-fill").forEach((bar) => {
    bar.style.width = `${bar.dataset.pct}%`;
  });
  setupTrendTooltip(lastSessions);
  window.scrollTo({ top: 0 });
}

function setupTrendTooltip(sessions) {
  const chart = app.querySelector(".trend-chart");
  if (!chart) return;
  const tooltip = chart.querySelector(".trend-tooltip");
  const dots = chart.querySelectorAll(".trend-dot");
  chart.addEventListener("pointerover", (event) => {
    const hit = event.target.closest(".trend-hit");
    if (!hit) return;
    const index = Number(hit.dataset.index);
    const s = sessions[index];
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
    tooltip.innerHTML = `<strong>${percent(s.ok, s.total)}%</strong> corrette<br>${s.ok} su ${s.total} · ${new Date(s.first).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}`;
    tooltip.hidden = false;
    const dot = dots[index].getBoundingClientRect();
    const box = chart.getBoundingClientRect();
    tooltip.style.left = `${Math.min(Math.max(dot.left - box.left, 70), box.width - 70)}px`;
    tooltip.style.top = `${dot.top - box.top}px`;
  });
  chart.addEventListener("pointerleave", () => {
    tooltip.hidden = true;
    dots.forEach((dot) => {
      dot.classList.remove("is-active");
    });
  });
}
