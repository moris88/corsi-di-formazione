import { confirmDialog } from "../dialog.js";

// I test vengono scoperti automaticamente: "questions/Domande e risposte test N - ..."
// finché non si incontrano due numeri consecutivi mancanti.
const FILE_PATTERN = (n) => `../../assets/ccaf/questions/Domande e risposte test ${n} - Claude Certified Architect.md`;
const PRESETS = [5, 10, 20, 30, 60];
const MAX_QUESTIONS = PRESETS[PRESETS.length - 1];

const app = document.querySelector("#app");
const announcer = document.querySelector("#announcer");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pool = [];
const loadedTests = [];
let loadError = "";
let count = 10;
const excludedScenarios = new Set();
let difficultyChoice = "casuale";
let timedMode = false;
let minutesPerQuestion = 2;
let timerId = null;

// Difficoltà dei test (come nelle etichette di simulazione.html).
// Un file può sovrascriverla con "difficulty: facile|medio|difficile" nel frontmatter.
const DIFFICULTIES = ["difficile", "medio", "facile"];
const DIFFICULTY_LABELS = { casuale: "Casuale (tutti)", difficile: "Difficile", medio: "Medio", facile: "Facile" };
const TEST_DIFFICULTY = {
  1: "medio",
  2: "facile",
  3: "difficile",
  4: "difficile",
  5: "difficile",
  6: "medio",
  7: "difficile",
  8: "difficile",
  9: "difficile",
  10: "difficile",
};
let session = null;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return html;
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const output = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";
  let codeLines = null;
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length)
      output.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listType}>`);
    listItems = [];
    listType = "";
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (codeLines !== null) {
      if (trimmed.startsWith("```")) {
        output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else codeLines.push(line);
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      codeLines = [];
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph();
      const nextType = bullet ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || ordered)[1]);
      continue;
    }
    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      output.push(`<p><strong>${inlineMarkdown(heading[1])}</strong></p>`);
      continue;
    }
    flushList();
    paragraph.push(trimmed.replace(/^>\s?/, ""));
  }
  if (codeLines !== null) output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushParagraph();
  flushList();
  return output.join("");
}

// Stesso formato accettato da simulazione.html
function parseQuestionBank(markdown, testNumber) {
  const source = String(markdown).replace(/^﻿/, "").replace(/\r/g, "");
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  const body = frontmatter ? source.slice(frontmatter[0].length) : source;
  const declared = frontmatter?.[1].match(/^difficulty:\s*["']?(\w+)["']?\s*$/im)?.[1].toLowerCase();
  const difficulty = DIFFICULTIES.includes(declared) ? declared : TEST_DIFFICULTY[testNumber] || "";
  const parsed = [];
  let scenario = "Scenario generale";
  let current = null;
  let phase = "";
  const finish = () => {
    if (current && current.options.length === 4 && current.correctLetter) {
      parsed.push({
        key: `${testNumber}-${current.id}`,
        test: testNumber,
        difficulty,
        id: Number(current.id),
        scenario,
        prompt: current.promptLines.join("\n").trim(),
        options: current.options,
        correctLetter: current.correctLetter,
        explanation: current.explanationLines.join("\n").trim(),
      });
    }
    current = null;
    phase = "";
  };
  for (const line of body.split("\n")) {
    const scenarioMatch = line.match(/^##\s+Scenario:\s*(.+)$/i);
    if (scenarioMatch) {
      finish();
      scenario = scenarioMatch[1].trim();
      continue;
    }
    const questionMatch = line.match(/^###\s+(?:Domanda|Question)\s+(\d+)\s*$/i);
    if (questionMatch) {
      finish();
      current = { id: questionMatch[1], promptLines: [], options: [], correctLetter: "", explanationLines: [] };
      phase = "prompt";
      continue;
    }
    if (!current) continue;
    const answerMatch = line.match(
      /^####\s+(?:Risposta corretta|Correct answer)(?:\s+(?:alla domanda|to question)\s+\d+)?:\s*([A-D])\s*$/i,
    );
    if (answerMatch) {
      current.correctLetter = answerMatch[1].toUpperCase();
      phase = "explanation";
      continue;
    }
    if (phase === "prompt" || phase === "options") {
      const optionMatch = line.match(/^\s*-\s+\*\*([A-D])\.\*\*\s*(.*)$/);
      if (optionMatch) {
        phase = "options";
        current.options.push({ letter: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
      } else if (phase === "prompt") current.promptLines.push(line);
      else if (line.trim() && current.options.length)
        current.options[current.options.length - 1].text += ` ${line.trim()}`;
      continue;
    }
    if (phase === "explanation") current.explanationLines.push(line);
  }
  finish();
  // Il primo paragrafo ripetuto in più domande dello stesso scenario è la sua descrizione: va mostrato a parte
  const firstParagraph = (question) => question.prompt.split(/\n\s*\n/)[0].trim();
  const intros = new Map();
  for (const question of parsed) {
    const key = `${question.scenario}\n${firstParagraph(question)}`;
    intros.set(key, (intros.get(key) || 0) + 1);
  }
  for (const question of parsed) {
    const intro = firstParagraph(question);
    const rest = question.prompt.slice(question.prompt.indexOf(intro) + intro.length).trim();
    if (rest && intros.get(`${question.scenario}\n${intro}`) > 1) {
      question.context = intro;
      question.prompt = rest;
    }
  }
  return parsed;
}

async function fetchTest(n) {
  try {
    const response = await fetch(new URL(FILE_PATTERN(n), window.location.href), { cache: "no-store" });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function loadAllBanks() {
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
      loadedTests.push(n);
      pool.push(...questions);
    }
    const counter = app.querySelector("#loader-count");
    if (counter) counter.textContent = `Test ${n} · ${pool.length} domande`;
  }
  if (!pool.length)
    loadError =
      "Nessuna banca quesiti trovata. Apri la pagina tramite il server locale (i file della cartella questions/ devono essere raggiungibili).";
  count = Math.min(count, pool.length || count);
}

function shuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function scenarios() {
  return [...new Set(pool.map((q) => q.scenario))].sort();
}

// "casuale" = tutti i file, anche quelli senza difficoltà assegnata
function difficultyPool() {
  return difficultyChoice === "casuale" ? pool : pool.filter((q) => q.difficulty === difficultyChoice);
}

function filteredPool() {
  return difficultyPool().filter((q) => !excludedScenarios.has(q.scenario));
}

function testsIn(questions) {
  return [...new Set(questions.map((q) => q.test))].sort((a, b) => a - b);
}

function announce(message) {
  announcer.textContent = message;
}

/* ---------- Configurazione ---------- */

function renderSetup() {
  if (!pool.length) {
    app.innerHTML = loadError
      ? `<section class="screen"><div class="eyebrow">Allenamento</div><h1>Banche quesiti non disponibili</h1><p class="source-error">${escapeHtml(loadError)}</p></section>`
      : `<section class="screen bank-loader" role="status" aria-label="Caricamento banche quesiti">
          <div class="loader-stage" aria-hidden="true">
            <span class="loader-ring"></span><span class="loader-ring"></span><span class="loader-ring"></span>
            <div class="loader-orbit">${["A", "B", "C", "D"].map((l) => `<b>${l}</b>`).join("")}</div>
            <div class="loader-stack">${"<i></i>".repeat(5)}</div>
            <div class="loader-sparks">${"<i></i>".repeat(12)}</div>
          </div>
          <p class="loader-title">Mescolo le banche quesiti</p>
          <p class="loader-count" id="loader-count">Test 1 · 0 domande</p>
        </section>`;
    return;
  }
  const available = Math.min(filteredPool().length, MAX_QUESTIONS);
  const value = Math.max(1, Math.min(count, available));
  app.innerHTML = `
  <section class="screen train-setup" aria-labelledby="page-title">
    <div>
      <div class="eyebrow">Allenamento · prima della simulazione</div>
      <h1 id="page-title">Domande<br><span>casuali</span></h1>
      <p class="intro-copy">${timedMode ? `Con tempo: ${formatMinutes(minutesPerQuestion)} a domanda.` : "Senza tempo."} Ogni risposta viene subito segnata come corretta o errata.</p>
      <div class="stats" aria-label="Banche disponibili">
        <div class="stat"><strong>${pool.length}</strong><span>Domande totali</span></div>
        <div class="stat"><strong>${loadedTests.length}</strong><span>Test caricati</span></div>
        <div class="stat"><strong id="time-stat">${timedMode ? formatMinutes(minutesPerQuestion * value) : "∞"}</strong><span>Tempo</span></div>
      </div>
    </div>
    <div class="train-card">
      <h2>Difficoltà</h2>
      <p class="hint">Limita le domande ai test di una difficoltà, oppure pesca casualmente da tutti i file.</p>
      <div class="count-row" role="group" aria-label="Difficoltà dei test">
        ${["casuale", ...DIFFICULTIES]
          .map((d) => {
            const n = d === "casuale" ? pool.length : pool.filter((q) => q.difficulty === d).length;
            return `<button type="button" class="count-chip" data-action="difficulty" data-difficulty="${d}" aria-pressed="${difficultyChoice === d}" ${n ? "" : "disabled"}>${DIFFICULTY_LABELS[d]} <span class="bank-line">(${n})</span></button>`;
          })
          .join("")}
      </div>
    </div>
    <div class="train-card">
      <h2>Quante domande?</h2>
      <p class="hint">Pescate a caso da ${difficultyChoice === "casuale" ? "tutti i test" : `i test ${DIFFICULTY_LABELS[difficultyChoice].toLowerCase()}`} (${testsIn(
        difficultyPool(),
      )
        .map((n) => `T${n}`)
        .join(", ")}), senza ripetizioni.</p>
      <div class="count-row" role="group" aria-label="Numero di domande">
        ${PRESETS.filter((p) => p <= available)
          .map(
            (p) =>
              `<button type="button" class="count-chip" data-action="preset" data-count="${p}" aria-pressed="${p === value}">${p}</button>`,
          )
          .join("")}
      </div>
      <div class="count-custom">
        <input type="range" id="count-range" min="1" max="${available}" value="${value}" aria-label="Numero di domande personalizzato">
        <output id="count-out" for="count-range">${value}</output>
      </div>
    </div>
    <div class="train-card">
      <h2>Tempo</h2>
      <p class="hint">Con il tempo attivo, il limite totale è calcolato in base al numero di domande. Allo scadere l’allenamento termina e vedi il riepilogo.</p>
      <div class="count-row" role="group" aria-label="Modalità tempo">
        <button type="button" class="count-chip" data-action="timed" data-timed="false" aria-pressed="${!timedMode}">Senza tempo</button>
        <button type="button" class="count-chip" data-action="timed" data-timed="true" aria-pressed="${timedMode}">Con tempo</button>
      </div>
      ${
        timedMode
          ? `<div class="time-custom">
        <label for="minutes-per-question">Minuti a domanda</label>
        <input type="number" id="minutes-per-question" min="0.5" max="10" step="0.5" value="${minutesPerQuestion}">
        <span class="bank-line">Totale: <span class="time-total" id="time-total">${formatMinutes(minutesPerQuestion * value)}</span></span>
      </div>`
          : ""
      }
    </div>
    <div class="train-card">
      <h2>Scenari</h2>
      <p class="hint">Deseleziona gli scenari che non vuoi allenare.</p>
      <div class="scenario-filter">
        ${scenarios()
          .map(
            (s) =>
              `<label><input type="checkbox" data-scenario="${escapeHtml(s)}" ${excludedScenarios.has(s) ? "" : "checked"}>${escapeHtml(s)} <span class="bank-line">(${difficultyPool().filter((q) => q.scenario === s).length})</span></label>`,
          )
          .join("")}
      </div>
    </div>
    <div class="train-actions is-sticky">
      <button class="button secondary" type="button" data-action="stats">Statistiche</button>
      <a class="button secondary" href="simulazione.html">Vai alla simulazione vera</a>
      <button class="button" type="button" data-action="generate" ${available ? "" : "disabled"}>Genera ${value} domande <span aria-hidden="true">→</span></button>
    </div>
  </section>`;
  count = value;
}

/* ---------- Animazione di generazione ---------- */

function generate() {
  const drawn = shuffle(filteredPool())
    .slice(0, count)
    .map((q) => ({
      question: q,
      optionOrder: shuffle(["A", "B", "C", "D"]),
      answer: null,
    }));
  session = { items: drawn, index: 0, confirmed: false, correct: 0, wrong: 0, startedAt: Date.now() };
  startTimer();

  if (reducedMotion) {
    renderQuestion();
    return;
  }

  app.innerHTML = `
  <section class="forge" aria-live="polite">
    <div>
      <div class="deck" aria-hidden="true">
        ${[1, 2, 3, 4, 5].map(() => `<div class="deck-card"><span><b>?</b>CCA-F</span></div>`).join("")}
      </div>
      <h1 class="forge-title">Mescolo il mazzo…</h1>
      <div class="forge-ticker" id="ticker">&nbsp;</div>
      <div class="forge-bar"><span id="forge-bar"></span></div>
      <div class="forge-drawn" id="drawn" aria-hidden="true"></div>
    </div>
  </section>`;

  const ticker = app.querySelector("#ticker");
  const bar = app.querySelector("#forge-bar");
  const drawnBox = app.querySelector("#drawn");
  const scenarioNames = scenarios();
  const shuffleMs = 900;
  const step = Math.max(35, Math.min(140, 1800 / drawn.length));
  const flicker = setInterval(() => {
    ticker.textContent = scenarioNames[Math.floor(Math.random() * scenarioNames.length)];
  }, 70);

  setTimeout(() => {
    clearInterval(flicker);
    app.querySelector(".forge-title").textContent = "Pesco le domande…";
    drawn.forEach((item, i) => {
      setTimeout(() => {
        const q = item.question;
        ticker.textContent = `T${q.test} · Q${q.id} — ${q.scenario}`;
        bar.style.width = `${((i + 1) / drawn.length) * 100}%`;
        if (i < 60) {
          const chip = document.createElement("i");
          chip.textContent = `T${q.test}·${q.id}`;
          drawnBox.appendChild(chip);
        }
        if (i === drawn.length - 1) {
          app.querySelector(".forge-title").textContent = `${drawn.length} domande pronte!`;
          setTimeout(renderQuestion, 700);
        }
      }, i * step);
    });
  }, shuffleMs);
  announce(`Generazione di ${drawn.length} domande casuali.`);
}

/* ---------- Quesito con correzione immediata ---------- */

function renderQuestion() {
  const item = session.items[session.index];
  const q = item.question;
  const total = session.items.length;
  const displayed = item.optionOrder.map((letter, i) => ({
    ...q.options.find((o) => o.letter === letter),
    displayLetter: String.fromCharCode(65 + i),
  }));
  const done = session.confirmed;
  const isRight = item.answer === q.correctLetter;
  const right = displayed.find((o) => o.letter === q.correctLetter);
  const last = session.index === total - 1;

  app.innerHTML = `
  <section class="screen" aria-labelledby="question-title">
    <div class="train-progress">
      <progress value="${session.index + (done ? 1 : 0)}" max="${total}" aria-label="Avanzamento"></progress>
      ${session.deadline ? `<span class="train-timer" id="train-timer" role="timer" aria-label="Tempo rimasto">${timerText(session.deadline - Date.now())}</span>` : ""}
      <span class="train-score"><span class="ok">✓ ${session.correct}</span> · <span class="ko">✗ ${session.wrong}</span></span>
    </div>
    <div class="question-meta">
      <div class="scenario-chip" title="${escapeHtml(q.scenario)}">${escapeHtml(q.scenario)}</div>
      <span class="source-tag">Test ${q.test} · domanda ${q.id}${q.difficulty ? ` · ${DIFFICULTY_LABELS[q.difficulty]}` : ""}</span>
    </div>
    <h1 class="question-heading" id="question-title">Domanda ${session.index + 1}<span>di ${total}</span></h1>
    ${q.context ? `<div class="scenario-context">${markdownToHtml(q.context)}</div>` : ""}<div class="question-prompt">${markdownToHtml(q.prompt)}</div>
    <div class="answer-label">${done ? "Correzione" : "Seleziona una risposta e conferma"}</div>
    <div class="answer-list" role="radiogroup" aria-label="Opzioni di risposta">
      ${displayed
        .map((o) => {
          const classes = ["answer-option"];
          if (done) {
            classes.push("locked");
            if (o.letter === q.correctLetter) classes.push("is-correct");
            else if (o.letter === item.answer) classes.push("is-wrong");
          }
          return `<label class="${classes.join(" ")}"><input type="radio" name="answer" value="${o.letter}" ${item.answer === o.letter ? "checked" : ""} ${done ? "disabled" : ""}><span class="answer-letter">${o.displayLetter}</span><span class="answer-text">${inlineMarkdown(o.text)}</span></label>`;
        })
        .join("")}
    </div>
    ${
      done
        ? `
    <div class="feedback ${isRight ? "" : "wrong"}" role="status">
      <h3>${isRight ? "✓ Corretto!" : `✗ Sbagliato: la risposta giusta è la ${right.displayLetter}`}</h3>
    </div>`
        : ""
    }
    <div class="train-actions">
      <button class="button secondary" type="button" data-action="quit">Termina</button>
      ${
        done
          ? `<button class="button" type="button" data-action="next">${last ? "Vedi il riepilogo" : "Prossima domanda"} <span aria-hidden="true">→</span></button>`
          : `<button class="button" type="button" data-action="confirm" ${item.answer ? "" : "disabled"}>Conferma risposta</button>`
      }
    </div>
  </section>`;
  if (done && !isRight && !reducedMotion) app.querySelector(".answer-option.is-wrong")?.classList.add("shake");
  window.scrollTo({ top: done ? window.scrollY : 0 });
}

function confirmAnswer() {
  const item = session.items[session.index];
  if (!item.answer || session.confirmed) return;
  session.confirmed = true;
  recordAnswer(item.question, item.answer === item.question.correctLetter);
  if (item.answer === item.question.correctLetter) session.correct++;
  else session.wrong++;
  renderQuestion();
  app.querySelector(".feedback")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
  announce(item.answer === item.question.correctLetter ? "Risposta corretta." : "Risposta errata.");
}

function nextQuestion() {
  if (session.index === session.items.length - 1) {
    renderSummary();
    return;
  }
  session.index++;
  session.confirmed = false;
  renderQuestion();
}

/* ---------- Riepilogo ---------- */

function formatMinutes(minutes) {
  const total = Math.round(minutes * 60);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : sec ? `${m} min ${sec} s` : `${m} min`;
}

function timerText(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const sec = String(total % 60).padStart(2, "0");
  return h ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  stopTimer();
  if (!timedMode) return;
  session.deadline = Date.now() + session.items.length * minutesPerQuestion * 60000;
  timerId = setInterval(() => {
    const left = session.deadline - Date.now();
    const node = document.querySelector("#train-timer");
    if (node) {
      node.textContent = timerText(left);
      node.classList.toggle("low", left <= 60000);
    }
    if (left <= 0) {
      session.timeUp = true;
      renderSummary();
      announce("Tempo scaduto.");
    }
  }, 1000);
}

function renderSummary() {
  stopTimer();
  const answered = session.items.filter((_it, i) => i < session.index || session.confirmed);
  const wrongItems = answered.filter((it) => it.answer !== it.question.correctLetter);
  const pct = answered.length ? Math.round((session.correct / answered.length) * 100) : 0;
  app.innerHTML = `
  <section class="screen train-summary" aria-labelledby="sum-title">
    <div class="eyebrow">${session.timeUp ? "Tempo scaduto" : "Allenamento concluso"}</div>
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
              return `<details class="review-entry"><summary><span class="review-status wrong">T${q.test} · Q${q.id}</span><span class="review-summary-text">${escapeHtml(q.prompt.replace(/[`*_>#]/g, "").slice(0, 160))}…</span></summary><div class="review-body"><div class="scenario-chip">${escapeHtml(q.scenario)}</div>${q.context ? `<div class="scenario-context">${markdownToHtml(q.context)}</div>` : ""}<div class="review-question">${markdownToHtml(q.prompt)}</div><div class="review-choice correct"><strong>Corretta:</strong> ${inlineMarkdown(right.text)}</div></div></details>`;
            })
            .join("")}</div>`
        : ""
    }
    <div class="train-actions">
      ${wrongItems.length ? `<button class="button secondary" type="button" data-action="retry-wrong">Rifai le ${wrongItems.length} sbagliate</button>` : ""}
      <button class="button secondary" type="button" data-action="setup">Cambia impostazioni</button>
      <button class="button secondary" type="button" data-action="stats">Statistiche</button>
      <button class="button" type="button" data-action="generate">Nuovo allenamento <span aria-hidden="true">↻</span></button>
    </div>
  </section>`;
  window.scrollTo({ top: 0 });
  session.wrongItems = wrongItems;
}

function retryWrong() {
  const items = shuffle(session.wrongItems).map((it) => ({
    question: it.question,
    optionOrder: shuffle(["A", "B", "C", "D"]),
    answer: null,
  }));
  session = { items, index: 0, confirmed: false, correct: 0, wrong: 0, startedAt: Date.now() };
  startTimer();
  renderQuestion();
}

/* ---------- Statistiche: ogni risposta confermata è salvata in localStorage ---------- */

const ANSWERS_KEY = "ccaf-training-answers";
const MAX_ANSWERS = 5000;
const PASS_THRESHOLD = 72;

function loadAnswers() {
  try {
    const value = JSON.parse(localStorage.getItem(ANSWERS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveAnswers(list) {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(list.slice(-MAX_ANSWERS)));
  } catch {
    // Spazio esaurito o storage non disponibile: le statistiche non vengono aggiornate
  }
}

// t: quando, sid: sessione (inizio), k: test-domanda, s: scenario, d: difficoltà, ok: risposta corretta
function recordAnswer(question, ok) {
  const list = loadAnswers();
  list.push({
    t: Date.now(),
    sid: session.startedAt,
    k: question.key,
    s: question.scenario,
    d: question.difficulty,
    ok,
  });
  saveAnswers(list);
}

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

function renderStats() {
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
  const questionByKey = new Map(pool.map((q) => [q.key, q]));

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

/* ---------- Eventi ---------- */

app.addEventListener("click", async (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "preset") {
    count = Number(control.dataset.count);
    renderSetup();
  } else if (action === "difficulty") {
    difficultyChoice = control.dataset.difficulty;
    renderSetup();
  } else if (action === "timed") {
    timedMode = control.dataset.timed === "true";
    renderSetup();
  } else if (action === "generate") generate();
  else if (action === "confirm") confirmAnswer();
  else if (action === "next") nextQuestion();
  else if (action === "quit") renderSummary();
  else if (action === "retry-wrong") retryWrong();
  else if (action === "stats") renderStats();
  else if (action === "reset-stats") {
    const ok = await confirmDialog({
      title: "Azzerare le statistiche?",
      message: "Tutte le risposte salvate dell’allenamento verranno cancellate da questo browser.",
      confirmLabel: "Azzera",
      danger: true,
    });
    if (ok) {
      saveAnswers([]);
      renderStats();
    }
  } else if (action === "setup") {
    stopTimer();
    session = null;
    renderSetup();
  }
});

app.addEventListener("input", (event) => {
  if (event.target.matches("#count-range")) {
    count = Number(event.target.value);
    app.querySelector("#count-out").textContent = count;
    app.querySelectorAll('[data-action="preset"]').forEach((chip) => {
      chip.setAttribute("aria-pressed", String(Number(chip.dataset.count) === count));
    });
    const btn = app.querySelector('[data-action="generate"]');
    if (btn) btn.innerHTML = `Genera ${count} domande <span aria-hidden="true">→</span>`;
    updateTimeTotal();
  } else if (event.target.matches("#minutes-per-question")) {
    const minutes = Number(event.target.value);
    if (minutes >= 0.5 && minutes <= 10) {
      minutesPerQuestion = minutes;
      updateTimeTotal();
    }
  }
});

function updateTimeTotal() {
  if (!timedMode) return;
  const text = formatMinutes(minutesPerQuestion * count);
  const total = app.querySelector("#time-total");
  const stat = app.querySelector("#time-stat");
  if (total) total.textContent = text;
  if (stat) stat.textContent = text;
  const intro = app.querySelector(".intro-copy");
  if (intro)
    intro.firstChild.textContent = `Con tempo: ${formatMinutes(minutesPerQuestion)} a domanda. Ogni risposta viene subito segnata come corretta o errata.`;
}

app.addEventListener("change", (event) => {
  if (event.target.matches("#minutes-per-question")) {
    const minutes = Math.min(10, Math.max(0.5, Number(event.target.value) || 2));
    minutesPerQuestion = minutes;
    event.target.value = minutes;
    updateTimeTotal();
    return;
  }
  if (event.target.matches("[data-scenario]")) {
    const s = event.target.dataset.scenario;
    if (event.target.checked) excludedScenarios.delete(s);
    else excludedScenarios.add(s);
    renderSetup();
  } else if (event.target.matches('input[name="answer"]') && session && !session.confirmed) {
    session.items[session.index].answer = event.target.value;
    const btn = app.querySelector('[data-action="confirm"]');
    if (btn) btn.disabled = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (!session || event.altKey || event.ctrlKey || event.metaKey) return;
  if (!app.querySelector(".answer-list")) return;
  if (/^[1-4]$/.test(event.key) && !session.confirmed) {
    const item = session.items[session.index];
    item.answer = item.optionOrder[Number(event.key) - 1];
    renderQuestion();
  } else if (event.key === "Enter") {
    if (event.target.matches?.("button, a")) return;
    event.preventDefault();
    if (session.confirmed) nextQuestion();
    else confirmAnswer();
  }
});

renderSetup();
loadAllBanks().then(renderSetup);
