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
    app.innerHTML = `<section class="screen"><div class="eyebrow">Allenamento</div><h1>${loadError ? "Banche quesiti non disponibili" : "Caricamento banche quesiti…"}</h1>${loadError ? `<p class="source-error">${escapeHtml(loadError)}</p>` : ""}</section>`;
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
    <div class="train-actions">
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
  session = { items: drawn, index: 0, confirmed: false, correct: 0, wrong: 0 };
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
    <div class="question-prompt">${markdownToHtml(q.prompt)}</div>
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
              return `<details class="review-entry"><summary><span class="review-status wrong">T${q.test} · Q${q.id}</span><span class="review-summary-text">${escapeHtml(q.prompt.replace(/[`*_>#]/g, "").slice(0, 160))}…</span></summary><div class="review-body"><div class="scenario-chip">${escapeHtml(q.scenario)}</div><div class="review-question">${markdownToHtml(q.prompt)}</div><div class="review-choice correct"><strong>Corretta:</strong> ${inlineMarkdown(right.text)}</div></div></details>`;
            })
            .join("")}</div>`
        : ""
    }
    <div class="train-actions">
      ${wrongItems.length ? `<button class="button secondary" type="button" data-action="retry-wrong">Rifai le ${wrongItems.length} sbagliate</button>` : ""}
      <button class="button secondary" type="button" data-action="setup">Cambia impostazioni</button>
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
  session = { items, index: 0, confirmed: false, correct: 0, wrong: 0 };
  startTimer();
  renderQuestion();
}

/* ---------- Eventi ---------- */

app.addEventListener("click", (event) => {
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
  else if (action === "setup") {
    stopTimer();
    session = null;
    renderSetup();
  }
});

app.addEventListener("input", (event) => {
  if (event.target.matches("#count-range")) {
    count = Number(event.target.value);
    app.querySelector("#count-out").textContent = count;
    app.querySelectorAll(".count-chip").forEach((chip) => {
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
