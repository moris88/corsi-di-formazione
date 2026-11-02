import { confirmDialog } from "../dialog.js";

const DEFAULT_DURATION_MINUTES = 120;
let TOTAL_QUESTIONS = 0;
let _DURATION_MS = DEFAULT_DURATION_MINUTES * 60 * 1000;
const STORAGE_KEY = "ccaf-simulation-session-v1";
const HISTORY_KEY = "ccaf-simulation-history-v1";
const HISTORY_LIMIT = 30;
const BUILTIN_TESTS = [
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 10 - Claude Certified Architect.md",
    label: "Test 10 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 9 - Claude Certified Architect.md",
    label: "Test 9 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 8 - Claude Certified Architect.md",
    label: "Test 8 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 7 - Claude Certified Architect.md",
    label: "Test 7 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 6 - Claude Certified Architect.md",
    label: "Test 6 EN · Medio",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 5 - Claude Certified Architect.md",
    label: "Test 5 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 4 - Claude Certified Architect.md",
    label: "Test 4 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 3 - Claude Certified Architect.md",
    label: "Test 3 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 2 - Claude Certified Architect.md",
    label: "Test 2 EN · Facile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 1 - Claude Certified Architect.md",
    label: "Test 1 EN · Medio",
  },
];
let selectedPreset = BUILTIN_TESTS[0].file;
const app = document.querySelector("#app");
const topStatus = document.querySelector("#top-status");
const announcer = document.querySelector("#announcer");

let questionBank = [];
let testTitle = "Simulazione CCA-F";
let testDurationMinutes = DEFAULT_DURATION_MINUTES;
const timedMode = true;
let sourceFingerprint = "";
let sourceReady = false;
let sourceMessage = "Caricamento banca quesiti…";
let sourceError = "";
let exam = null;
let completedExam = null;
let tickHandle = null;
let reviewFilter = "all";

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  html = html.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}

function _safeHref(value) {
  const href = String(value || "")
    .replace(/&amp;/g, "&")
    .trim();
  if (/^(https?:|mailto:|\.\.?\/|\/|#)/i.test(href)) return escapeHtml(href);
  return "#";
}

function plainHeading(source) {
  return source
    .replace(/[`*_~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function slugify(source) {
  return (
    plainHeading(source)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "sezione"
  );
}

function listMarker(line) {
  const match = line.match(/^(\s*)([-+*]|\d+[.)])\s+(.*)$/);
  if (!match) return null;
  return {
    indent: match[1].replace(/\t/g, "  ").length,
    ordered: /^\d/.test(match[2]),
    text: match[3],
  };
}

function renderList(lines, start) {
  const first = listMarker(lines[start]);
  const baseIndent = first.indent;
  const ordered = first.ordered;
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let current = null;
  let index = start;

  while (index < lines.length) {
    const marker = listMarker(lines[index]);
    if (marker && marker.indent < baseIndent) break;
    if (marker && marker.indent === baseIndent) {
      if (marker.ordered !== ordered) break;
      current = [inlineMarkdown(marker.text)];
      items.push(current);
      index++;
      continue;
    }
    if (marker && marker.indent > baseIndent && current) {
      const nested = renderList(lines, index);
      current.push(nested.html);
      index = nested.next;
      continue;
    }
    if (!lines[index].trim()) {
      let next = index + 1;
      while (next < lines.length && !lines[next].trim()) next++;
      const nextMarker = lines[next] && listMarker(lines[next]);
      if (nextMarker && nextMarker.indent >= baseIndent) {
        index = next;
        continue;
      }
      break;
    }
    const indent = (lines[index].match(/^\s*/) || [""])[0].replace(/\t/g, "  ").length;
    if (current && indent > baseIndent) {
      current.push(`<span>${inlineMarkdown(lines[index].trim())}</span>`);
      index++;
      continue;
    }
    break;
  }
  return {
    html: `<${tag}>${items.map((parts) => `<li>${parts.join(" ")}</li>`).join("")}</${tag}>`,
    next: index,
  };
}

function parseTableRow(line) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderGuideMarkdown(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const output = [];
  const _headings = [];
  let index = 0;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const isBlockStart = (line, next = "") => {
    const trimmed = line.trim();
    return (
      !trimmed ||
      trimmed.startsWith("```") ||
      /^#{1,6}\s/.test(trimmed) ||
      /^\s*(---+|\*\*\*+|___+)\s*$/.test(trimmed) ||
      /^>/.test(trimmed) ||
      listMarker(line) ||
      (trimmed.startsWith("|") && isTableDivider(next))
    );
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      index++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      const language = trimmed.replace(/^`+/, "").trim();
      const codeLines = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index++;
      }
      if (index < lines.length) index++;
      output.push(
        `<pre>${language ? `<span class="code-language">${escapeHtml(language)}</span>` : ""}<code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].replace(/\s+#+\s*$/, "");
      const id = slugify(text);
      if (level > 1) {
        output.push(`<h${level} id="${escapeHtml(id)}">${inlineMarkdown(text)}</h${level}>`);
      }
      index++;
      continue;
    }

    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushParagraph();
      output.push("<hr>");
      index++;
      continue;
    }

    if (trimmed.startsWith("|") && isTableDivider(lines[index + 1] || "")) {
      flushParagraph();
      const header = parseTableRow(lines[index]);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index]));
        index++;
      }
      output.push(
        `<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${header.map((_cell, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (/^>/.test(trimmed)) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index++;
      }
      output.push(`<blockquote>${renderGuideMarkdown(quote.join("\n")).html}</blockquote>`);
      continue;
    }

    if (listMarker(line)) {
      flushParagraph();
      const list = renderList(lines, index);
      output.push(list.html);
      index = list.next;
      continue;
    }

    if (!isBlockStart(line, lines[index + 1] || "")) {
      paragraph.push(trimmed);
      index++;
    } else {
      flushParagraph();
    }
  }
  flushParagraph();
  return { html: output.join("\n"), headings: [] };
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
  let quoteLines = [];

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
  const flushQuote = () => {
    if (quoteLines.length) output.push(`<blockquote>${quoteLines.map(inlineMarkdown).join("<br>")}</blockquote>`);
    quoteLines = [];
  };
  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (codeLines !== null) {
      if (trimmed.startsWith("```")) {
        output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushTextBlocks();
      codeLines = [];
      continue;
    }
    if (!trimmed) {
      flushTextBlocks();
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    const quote = trimmed.match(/^>\s?(.*)$/);
    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph();
      flushQuote();
      const nextType = bullet ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || ordered)[1]);
      continue;
    }
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }
    if (heading) {
      flushTextBlocks();
      output.push(`<p><strong>${inlineMarkdown(heading[1])}</strong></p>`);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }
  if (codeLines !== null) output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushTextBlocks();
  return output.join("");
}

function parseQuestionBank(markdown) {
  const source = String(markdown)
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "");
  const frontmatterMatch = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  let body = source;
  let title = "";
  let durationMinutes = DEFAULT_DURATION_MINUTES;

  if (frontmatterMatch) {
    body = source.slice(frontmatterMatch[0].length);
    const titleMatch = frontmatterMatch[1].match(/^title:\s*(.*?)\s*$/im);
    const durationMatch = frontmatterMatch[1].match(/^duration_minutes:\s*(.*?)\s*$/im);
    if (titleMatch) {
      title = titleMatch[1].replace(/^(["'])(.*)\1$/, "$2").trim();
    }
    if (durationMatch) {
      const value = durationMatch[1].replace(/^(["'])(.*)\1$/, "$2").trim();
      durationMinutes = Number(value);
      if (!Number.isSafeInteger(durationMinutes) || durationMinutes < 1) {
        throw new Error("duration_minutes deve essere un numero intero maggiore di zero.");
      }
    }
  }
  if (!title) title = body.match(/^#\s+(.+)$/m)?.[1].trim() || "Simulazione personalizzata";

  const lines = body.split("\n");
  const parsed = [];
  let scenario = "Scenario generale";
  let current = null;
  let phase = "";

  function finishQuestion() {
    if (!current) return;
    const prompt = current.promptLines.join("\n").trim();
    const explanation = current.explanationLines.join("\n").trim();
    if (!prompt || current.options.length !== 4 || !current.correctLetter) {
      throw new Error(
        `Formato non valido alla domanda ${current.id}: servono testo, quattro opzioni e risposta corretta.`,
      );
    }
    if (!current.options.some((option) => option.letter === current.correctLetter)) {
      throw new Error(`La risposta corretta indicata alla domanda ${current.id} non corrisponde a un’opzione.`);
    }
    const optionLetters = new Set(current.options.map((option) => option.letter));
    if (optionLetters.size !== 4 || !["A", "B", "C", "D"].every((letter) => optionLetters.has(letter))) {
      throw new Error(`La domanda ${current.id} deve avere una sola opzione per ciascuna lettera A, B, C e D.`);
    }
    parsed.push({
      id: Number(current.id),
      scenario,
      prompt,
      options: current.options,
      correctLetter: current.correctLetter,
      explanation,
    });
    current = null;
    phase = "";
  }

  for (const line of lines) {
    const scenarioMatch = line.match(/^##\s+Scenario:\s*(.+)$/i);
    if (scenarioMatch) {
      finishQuestion();
      scenario = scenarioMatch[1].trim();
      continue;
    }
    const questionMatch = line.match(/^###\s+(?:Domanda|Question)\s+(\d+)\s*$/i);
    if (questionMatch) {
      finishQuestion();
      current = {
        id: questionMatch[1],
        promptLines: [],
        options: [],
        correctLetter: "",
        explanationLines: [],
      };
      phase = "prompt";
      continue;
    }
    if (!current) continue;
    const answerMatch = line.match(
      /^####\s+(?:Risposta corretta|Correct answer)(?:\s+(?:alla domanda|to question)\s+(\d+))?:\s*([A-D])\s*$/i,
    );
    if (answerMatch) {
      if (answerMatch[1] && Number(answerMatch[1]) !== Number(current.id)) {
        throw new Error(`La riga della risposta corretta non corrisponde alla domanda ${current.id}.`);
      }
      current.correctLetter = answerMatch[2].toUpperCase();
      phase = "explanation";
      continue;
    }
    if (phase === "prompt" || phase === "options") {
      const optionMatch = line.match(/^\s*-\s+\*\*([A-D])\.\*\*\s*(.*)$/);
      if (optionMatch) {
        phase = "options";
        current.options.push({
          letter: optionMatch[1].toUpperCase(),
          text: optionMatch[2].trim(),
        });
      } else if (phase === "prompt") {
        current.promptLines.push(line);
      } else if (line.trim() && current.options.length) {
        current.options[current.options.length - 1].text += ` ${line.trim()}`;
      }
      continue;
    }
    if (phase === "explanation") current.explanationLines.push(line);
  }
  finishQuestion();
  if (parsed.length === 0) throw new Error("Nel file non è stata trovata alcuna domanda.");
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
  const ids = new Set(parsed.map((question) => question.id));
  if (ids.size !== parsed.length) throw new Error("Il file contiene numeri di domanda duplicati.");
  return { questions: parsed, title, durationMinutes };
}

function hashSource(source) {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  }
  return `${source.length}-${(hash >>> 0).toString(16)}`;
}

function safeStorageGet() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function safeStorageSet(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* La simulazione resta utilizzabile anche senza archiviazione locale. */
  }
}

function safeStorageRemove() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* La simulazione resta utilizzabile anche senza archiviazione locale. */
  }
}

function loadHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* La simulazione resta utilizzabile anche senza archiviazione locale. */
  }
}

function recordResult(automatic) {
  const counts = resultCounts();
  const history = loadHistory();
  history.unshift({
    date: Date.now(),
    title: testTitle,
    correct: counts.correct,
    total: TOTAL_QUESTIONS,
    passed: counts.correct >= Math.ceil(TOTAL_QUESTIONS * 0.72),
    automatic,
  });
  saveHistory(history.slice(0, HISTORY_LIMIT));
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) return "";
  const rows = history
    .map((entry) => {
      const percentage = ((entry.correct / entry.total) * 100).toFixed(1);
      const date = new Date(entry.date).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
      return `<li><span><span class="history-meta">${escapeHtml(date)}</span><br>${escapeHtml(entry.title)}</span><span class="history-score ${entry.passed ? "passed" : "not-passed"}">${entry.correct}/${entry.total} · ${percentage}%</span></li>`;
    })
    .join("");
  return `<section class="history-box" aria-labelledby="history-title">
        <h3 id="history-title">Esiti precedenti</h3>
        <ul class="history-list">${rows}</ul>
        <button class="history-clear" type="button" data-action="clear-history">Cancella lo storico</button>
      </section>`;
}

function announce(message) {
  announcer.textContent = message;
}

function setSource(raw, label) {
  const parsed = parseQuestionBank(raw);
  questionBank = parsed.questions;
  testTitle = parsed.title;
  testDurationMinutes = parsed.durationMinutes;
  TOTAL_QUESTIONS = questionBank.length;
  _DURATION_MS = testDurationMinutes * 60 * 1000;
  sourceFingerprint = hashSource(raw);
  sourceReady = true;
  sourceError = "";
  sourceMessage = `${questionBank.length} domande caricate · ${label}`;
  const saved = safeStorageGet();
  if (
    saved &&
    saved.status === "active" &&
    saved.sourceFingerprint === sourceFingerprint &&
    Array.isArray(saved.order) &&
    saved.order.length === questionBank.length
  ) {
    const ids = new Set(questionBank.map((question) => question.id));
    const valid = saved.order.every(
      (item) => ids.has(Number(item.id)) && Array.isArray(item.optionOrder) && item.optionOrder.length === 4,
    );
    if (valid) {
      exam = saved;
      if (exam.deadline && exam.deadline <= Date.now()) {
        finishExam(true);
      } else {
        renderExam();
      }
      return;
    }
  }
  renderIntro();
}

async function loadPreset(filename) {
  const preset = BUILTIN_TESTS.find((test) => test.file === filename);
  if (!preset) return;
  selectedPreset = preset.file;
  sourceReady = false;
  sourceError = "";
  sourceMessage = `Caricamento ${preset.label}…`;
  renderIntro();
  try {
    const response = await fetch(new URL(preset.file, window.location.href), { cache: "no-store" });
    if (!response.ok) throw new Error(`Risposta HTTP ${response.status}`);
    setSource(await response.text(), preset.label);
  } catch (_error) {
    sourceReady = false;
    sourceMessage = "Banca quesiti non caricata";
    sourceError = `Non è stato possibile caricare ${preset.label}. Puoi importare il file manualmente.`;
    renderIntro();
  }
}

function loadFromWorkspace() {
  loadPreset(BUILTIN_TESTS[0].file);
}

// Guida al formato dei test: caricata una volta da guida-formato.md e
// inserita nei riquadri .format-guide già presenti quando arriva.
let formatGuideText = "";
fetch("../../assets/ccaf/guida-formato.md")
  .then((response) => (response.ok ? response.text() : ""))
  .then((text) => {
    formatGuideText = text;
    document.querySelectorAll(".format-guide").forEach((box) => {
      box.innerHTML = renderGuideMarkdown(text).html;
    });
  })
  .catch(() => {});

function formatGuideSource() {
  return formatGuideText;
}

function renderIntro() {
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Simulazione d’esame";
  app.innerHTML = `
  <section class="screen intro-layout" aria-labelledby="page-title">
    <div class="intro-copy-block">
      <div class="eyebrow">Sessione di simulazione</div>
      <h1 id="page-title">Simulazione<br><span>d’esame</span></h1>
      <p class="intro-copy">${escapeHtml(testTitle)} · una prova di preparazione con quesiti a scelta multipla.</p>
      <div class="stats" aria-label="Riepilogo della prova">
        <div class="stat"><strong>${sourceReady ? questionBank.length : "—"}</strong><span>Domande</span></div>
        <div class="stat"><strong>${timedMode ? `${sourceReady ? testDurationMinutes : DEFAULT_DURATION_MINUTES}′` : "∞"}</strong><span>Tempo disponibile</span></div>
        <div class="stat"><strong>4</strong><span>Opzioni per quesito</span></div>
      </div>
      <button class="button" type="button" data-action="show-guide" ${sourceReady ? "" : "disabled"}>
        Inizia la simulazione <span aria-hidden="true">→</span>
      </button>
    </div>
    <aside class="exam-panel" aria-label="Dettagli della prova">
      <div class="panel-kicker">Formato della sessione</div>
      <h2 class="panel-title">Condizioni d’esame</h2>
      <ul class="exam-facts">
        <li><span>Durata</span><strong>${timedMode ? `${sourceReady ? testDurationMinutes : DEFAULT_DURATION_MINUTES} minuti` : "Senza limite"}</strong></li>
        <li><span>Quesiti</span><strong>${sourceReady ? questionBank.length : "—"}, ordine casuale</strong></li>
        <li><span>Risposte</span><strong>Una scelta per domanda</strong></li>
        <li><span>Correzione</span><strong>Al termine della prova</strong></li>
      </ul>
      <div class="source-line" role="status">
        <span class="source-dot ${sourceReady ? "ready" : sourceError ? "error" : ""}" aria-hidden="true"></span>
        <span id="source-status">${escapeHtml(sourceMessage)}</span>
      </div>
      ${sourceError ? `<p class="source-error">${escapeHtml(sourceError)}</p>` : ""}
      <div class="source-actions">
        <label class="preset-select-label"><span>Test nel workspace</span><select id="preset-test" aria-label="Seleziona un test già presente nel workspace">${BUILTIN_TESTS.map((test) => `<option value="${escapeHtml(test.file)}" ${selectedPreset === test.file ? "selected" : ""}>${escapeHtml(test.label)}</option>`).join("")}</select></label>
        <button class="button secondary" type="button" data-action="choose-source">Importa un altro Markdown</button>
        <input class="file-input" type="file" accept=".md,text/markdown,text/plain" id="source-file" aria-label="Seleziona il file Markdown con i quesiti">
      </div>
      <details class="format-help">
        <summary>Formato per creare un altro test</summary>
        <p>Usa un titolo, scenari facoltativi, quesiti numerati, quattro opzioni A–D e la riga della risposta corretta.</p>
        <p><a class="button secondary" href="../../assets/ccaf/template-test.md" download="template-test.md">Scarica il template (template-test.md)</a></p>
        <div class="format-guide">${renderGuideMarkdown(formatGuideSource()).html}</div>
      </details>
      ${renderHistory()}
    </aside>
  </section>`;
}

function renderExamGuide() {
  if (!sourceReady || questionBank.length === 0) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Istruzioni d’esame";
  app.innerHTML = `
  <section class="screen guide-screen" aria-labelledby="guide-title">
    <div class="guide-heading">
      <div class="eyebrow">Prima di iniziare · ${escapeHtml(testTitle)}</div>
      <h1 id="guide-title">Come affrontare<br><span>la simulazione</span></h1>
      <p class="intro-copy">${timedMode ? "La prova inizia solo quando selezioni “Inizia la prova”. Fino ad allora il timer resta fermo." : "Prova senza limite di tempo: consegna quando hai finito."}</p>
    </div>
    <div class="guide-grid">
      <section class="guide-section" aria-labelledby="procedure-title">
        <div class="panel-kicker">01 · Procedura</div>
        <h2 id="procedure-title">Durante la prova</h2>
        <ol class="guide-steps">
          <li><strong>Leggi il caso e la domanda.</strong> Cerca l’obiettivo, il vincolo e il problema da risolvere.</li>
          <li><strong>Seleziona una delle quattro opzioni.</strong> La risposta viene salvata automaticamente; puoi cambiarla finché la prova è aperta.</li>
          <li><strong>Naviga liberamente.</strong> Usa Precedente, Successiva o l’indice numerato. Contrassegna i quesiti da rivedere con “Segna”.</li>
          ${timedMode ? `<li><strong>Consegna entro ${testDurationMinutes} minuti.</strong> Puoi consegnare prima; allo scadere la prova viene inviata automaticamente.</li>` : `<li><strong>Consegna quando vuoi.</strong> La prova è senza limite di tempo: il timer mostra solo il tempo trascorso.</li>`}
          <li><strong>Rivedi il risultato.</strong> Alla consegna trovi corrette, errate e senza risposta, con spiegazioni e filtri.</li>
        </ol>
      </section>
      <section class="guide-section" aria-labelledby="strategy-title">
        <div class="panel-kicker">02 · Strategia</div>
        <h2 id="strategy-title">Per puntare al superamento</h2>
        <ul class="guide-tips">
          <li><strong>Rispondi a tutto.</strong> La guida d’esame indica che non ci sono penalità per le risposte errate; se sei incerto, scegli l’opzione più plausibile.</li>
          <li><strong>Gestisci il tempo.</strong> Con ${questionBank.length} quesiti in ${testDurationMinutes} minuti, la media è di circa ${Math.floor((testDurationMinutes * 60) / questionBank.length)} secondi per domanda. Segna i dubbi e torna a rivederli.</li>
          <li><strong>Leggi i vincoli con attenzione.</strong> Distingui il problema principale da sintomi secondari e scarta le soluzioni che contraddicono i requisiti dello scenario.</li>
          <li><strong>Scegli la soluzione proporzionata.</strong> Preferisci l’intervento che affronta la causa alla radice senza aggiungere complessità non necessaria; usa vincoli programmatici quando serve una garanzia deterministica.</li>
          <li><strong>Concentrati sui domini più pesanti.</strong> Architettura e orchestrazione (27%); Claude Code (20%); prompt e output strutturato (20%); strumenti e MCP (18%); contesto e affidabilità (15%).</li>
        </ul>
      </section>
    </div>
    <aside class="guide-note" role="note">
      <strong>Soglia ufficiale: 720 su 1000.</strong>
      <span>È un punteggio scalare: la percentuale corretta mostrata da questa simulazione è un risultato grezzo e non equivale direttamente al punteggio ufficiale né garantisce il superamento.</span>
    </aside>
    <div class="guide-actions">
      <button class="button secondary" type="button" data-action="back-to-intro">Torna alla selezione</button>
      <button class="button" type="button" data-action="start">Inizia la prova <span aria-hidden="true">→</span></button>
    </div>
  </section>`;
}

function shuffle(items) {
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

// Modalità concentrazione: durante la prova l'header è nascosto e la pagina occupa tutto lo schermo
function setFocusMode(on) {
  document.body.classList.toggle("exam-focus", on);
  if (!on && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function requestFullscreen() {
  const root = document.documentElement;
  if (!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen().catch(() => {});
}

// Animazione di preparazione mostrata dopo "Inizia la prova": al termine avvia l'esame dietro l'overlay e lo dissolve
let launching = false;
function playLaunch() {
  if (launching) return;
  launching = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = [
    `Mescolo le ${questionBank.length} domande`,
    "Ordino le risposte a caso",
    timedMode ? `Avvio il timer: ${testDurationMinutes} minuti` : "Prova senza limite di tempo",
    "Pronti: buona fortuna!",
  ];
  const stepTime = reduced ? 150 : 650;
  const overlay = document.createElement("div");
  overlay.className = "exam-launch";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.style.setProperty("--launch-duration", `${steps.length * stepTime}ms`);
  overlay.innerHTML = `
    <div class="launch-card">
      <div class="launch-ring" aria-hidden="true">
        <svg viewBox="0 0 120 120"><circle class="launch-ring-track" cx="60" cy="60" r="52" /><circle class="launch-ring-fill" cx="60" cy="60" r="52" pathLength="100" /></svg>
        <img src="../../assets/ccaf.png" alt="" class="launch-logo" />
      </div>
      <p class="launch-eyebrow">Simulazione d’esame</p>
      <ol class="launch-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
    </div>`;
  document.body.append(overlay);
  setFocusMode(true);
  const items = overlay.querySelectorAll(".launch-steps li");
  // Calcola gli stili iniziali prima di avviare il riempimento dell'anello, altrimenti la transizione non parte
  overlay.getBoundingClientRect();
  overlay.classList.add("is-running");
  items.forEach((item, index) => {
    setTimeout(() => {
      items[index - 1]?.classList.replace("is-active", "is-done");
      item.classList.add("is-active");
    }, index * stepTime);
  });
  setTimeout(
    () => {
      items[items.length - 1].classList.replace("is-active", "is-done");
      beginExam();
      overlay.classList.add("is-leaving");
      setTimeout(
        () => {
          overlay.remove();
          launching = false;
        },
        reduced ? 0 : 450,
      );
    },
    steps.length * stepTime + (reduced ? 0 : 250),
  );
}

function beginExam() {
  if (!sourceReady || questionBank.length === 0) return;
  const shuffledQuestions = shuffle(questionBank);
  exam = {
    status: "active",
    sourceFingerprint,
    startedAt: Date.now(),
    deadline: timedMode ? Date.now() + testDurationMinutes * 60 * 1000 : null,
    index: 0,
    order: shuffledQuestions.map((question) => ({
      id: question.id,
      optionOrder: shuffle(question.options.map((option) => option.letter)),
      answer: null,
      flagged: false,
    })),
  };
  safeStorageSet(exam);
  renderExam();
  announce(
    timedMode
      ? `Simulazione iniziata. Hai ${testDurationMinutes} minuti.`
      : "Simulazione iniziata, senza limite di tempo.",
  );
}

function currentQuestion() {
  if (!exam) return null;
  const orderItem = exam.order[exam.index];
  return questionBank.find((question) => question.id === Number(orderItem.id));
}

function statusFor(item, question) {
  if (!item.answer) return "unanswered";
  return item.answer === question.correctLetter ? "correct" : "wrong";
}

function timerText(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimer() {
  if (!exam) return;
  const timer = document.querySelector("#timer");
  if (!exam.deadline) {
    // Untimed mode: show elapsed time, never auto-submit
    if (timer) {
      const elapsed = Date.now() - (exam.startedAt || Date.now());
      timer.textContent = timerText(elapsed);
      timer.setAttribute("aria-label", `Tempo trascorso, senza limite: ${timerText(elapsed)}`);
    }
    return;
  }
  const remaining = Math.max(0, exam.deadline - Date.now());
  if (timer) {
    timer.textContent = timerText(remaining);
    timer.classList.toggle("warning", remaining <= 10 * 60 * 1000 && remaining > 5 * 60 * 1000);
    timer.classList.toggle("critical", remaining <= 5 * 60 * 1000);
    timer.setAttribute("aria-label", `Tempo rimanente: ${timerText(remaining)}`);
  }
  if (remaining <= 0) finishExam(true);
}

function startTimer() {
  if (tickHandle) clearInterval(tickHandle);
  updateTimer();
  tickHandle = setInterval(updateTimer, 1000);
}

function saveExam() {
  if (exam) safeStorageSet(exam);
}

function renderExam() {
  if (!exam || !sourceReady) return;
  setFocusMode(true);
  if (topStatus) topStatus.textContent = "Prova in corso";
  const item = exam.order[exam.index];
  const question = currentQuestion();
  if (!question) {
    finishExam(true);
    return;
  }
  const answered = exam.order.filter((entry) => entry.answer).length;
  const percent = (answered / TOTAL_QUESTIONS) * 100;
  const presentedOptions = item.optionOrder.map((letter, index) => ({
    ...question.options.find((option) => option.letter === letter),
    displayLetter: String.fromCharCode(65 + index),
  }));
  const questionButtons = exam.order
    .map((entry, index) => {
      const bankQuestion = questionBank.find((candidate) => candidate.id === Number(entry.id));
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
        <div class="progress-copy"><strong>${answered} di ${TOTAL_QUESTIONS} risposte</strong><span>Completamento ${Math.round(percent)}%</span></div>
        <progress class="progress-track" value="${answered}" max="${TOTAL_QUESTIONS}" aria-label="Domande con risposta">${percent}%</progress>
      </div>
      <div class="timer" id="timer" role="timer" aria-live="off">--:--</div>
    </div>
    <div class="exam-layout">
      <aside class="question-rail" aria-label="Navigazione domande">
        <div class="rail-head"><h2 class="rail-title">Indice</h2><span class="answered-count">${answered}/${TOTAL_QUESTIONS}</span></div>
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
        <h1 class="question-heading" id="question-title">Domanda ${exam.index + 1}<span>di ${TOTAL_QUESTIONS}</span></h1>
        ${question.context ? `<div class="scenario-context">${markdownToHtml(question.context)}</div>` : ""}<div class="question-prompt">${markdownToHtml(question.prompt)}</div>
        <div class="answer-label">Seleziona una risposta</div>
        <div class="answer-list" role="radiogroup" aria-label="Opzioni di risposta">
          ${presentedOptions.map((option) => `<label class="answer-option"><input type="radio" name="answer" value="${option.letter}" ${item.answer === option.letter ? "checked" : ""}><span class="answer-letter">${option.displayLetter}</span><span class="answer-text">${inlineMarkdown(option.text)}</span></label>`).join("")}
        </div>
        <div class="question-footer">
          <div class="nav-actions"><button class="button secondary" type="button" data-action="previous" ${exam.index === 0 ? "disabled" : ""}><span aria-hidden="true">←</span> Precedente</button><button class="button" type="button" data-action="next" ${exam.index === TOTAL_QUESTIONS - 1 ? "disabled" : ""}>Successiva <span aria-hidden="true">→</span></button></div>
          <span class="keyboard-hint">La risposta si salva automaticamente</span>
        </div>
      </section>
    </div>
  </section>`;
  saveExam();
  startTimer();
}

async function confirmFinish() {
  const unanswered = exam.order.filter((item) => !item.answer).length;
  const message = unanswered
    ? `Hai ${unanswered} domande senza risposta. Vuoi consegnare comunque la prova?`
    : "Vuoi consegnare la prova e vedere i risultati?";
  const ok = await confirmDialog({
    title: "Consegnare la prova?",
    message,
    confirmLabel: "Consegna",
    cancelLabel: "Continua la prova",
  });
  if (ok && exam) finishExam(false);
}

function finishExam(automatic) {
  if (exam?.status !== "active") return;
  if (!automatic && exam.deadline && exam.deadline <= Date.now()) automatic = true;
  if (tickHandle) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
  completedExam = {
    ...exam,
    order: exam.order.map((item) => ({ ...item })),
  };
  exam = null;
  safeStorageRemove();
  recordResult(automatic);
  reviewFilter = "all";
  renderResults(automatic);
  announce(automatic ? "Tempo terminato. La prova è stata consegnata." : "Prova consegnata. Risultati disponibili.");
}

function resultCounts() {
  const counts = { correct: 0, wrong: 0, unanswered: 0 };
  for (const item of completedExam.order) {
    const question = questionBank.find((candidate) => candidate.id === Number(item.id));
    const status = statusFor(item, question);
    counts[status]++;
  }
  return counts;
}

function abbreviated(markdown, limit = 180) {
  const text = String(markdown)
    .replace(/[`*_>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}

function renderReviewEntry(item, index) {
  const question = questionBank.find((candidate) => candidate.id === Number(item.id));
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

function renderResults(automatic = false) {
  if (!completedExam) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Esame concluso";
  const counts = resultCounts();
  const percentage = ((counts.correct / TOTAL_QUESTIONS) * 100).toFixed(1);
  const thresholdCorrect = Math.ceil(TOTAL_QUESTIONS * 0.72);
  const passed = counts.correct >= thresholdCorrect;
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
      question: questionBank.find((candidate) => candidate.id === Number(item.id)),
    }))
    .filter((entry) => reviewFilter === "all" || statusFor(entry.item, entry.question) === reviewFilter);
  app.innerHTML = `
  <section class="screen results-screen" aria-labelledby="results-title">
    <div class="results-head">
      <div><div class="eyebrow">Sessione completata${automatic ? " · Tempo esaurito" : ""}</div><h1 id="results-title">Revisione<br><span>dei risultati</span></h1><p>La simulazione è conclusa. Esamina ogni risposta e usa i filtri per concentrarti sui quesiti da ripassare.</p></div>
      <div class="score-block"><strong class="score-number">${counts.correct}<span class="score-small">/${TOTAL_QUESTIONS}</span></strong><span class="score-caption">Risposte corrette · ${percentage}%</span></div>
    </div>
    <div class="result-stats" aria-label="Riepilogo dei risultati">
      <div class="result-stat"><strong>${counts.correct}</strong><span>Corrette</span></div>
      <div class="result-stat"><strong>${counts.wrong}</strong><span>Errate</span></div>
      <div class="result-stat"><strong>${counts.unanswered}</strong><span>Senza risposta</span></div>
    </div>
    <section class="result-outcome ${passed ? "passed" : "not-passed"}" aria-live="polite" aria-labelledby="outcome-title">
      <div class="outcome-mark" aria-hidden="true">${passed ? "✓" : "!"}</div>
      <div class="outcome-copy">
        <div class="outcome-kicker">Esito indicativo · soglia simulata ${thresholdCorrect}/${TOTAL_QUESTIONS}</div>
        <h2 id="outcome-title">${passed ? "Simulazione superata" : "Simulazione non superata"}</h2>
        <p>${passed ? `Hai raggiunto la soglia indicativa del 72% con ${counts.correct} risposte corrette su ${TOTAL_QUESTIONS}.` : `Hai ottenuto ${counts.correct} risposte corrette su ${TOTAL_QUESTIONS}; per raggiungere la soglia indicativa del 72% ne servono almeno ${thresholdCorrect}. Ripassa gli errori e riprova.`}</p>
        <p class="outcome-caveat">L’esame ufficiale usa un punteggio scalare con soglia 720/1000: questa simulazione non può convertirlo né determinarne l’esito reale.</p>
        ${passed ? "" : `<div class="outcome-retry"><button class="button secondary" type="button" data-action="restart">Riprova la simulazione <span aria-hidden="true">↻</span></button></div>`}
      </div>
      <div class="outcome-score"><strong>${percentage}%</strong><span>risposte corrette</span></div>
    </section>
    <div class="review-head"><h2>Esito domanda per domanda</h2><div class="filter-group" role="group" aria-label="Filtra risultati">${filters.map((filter) => `<button type="button" class="filter-button ${reviewFilter === filter ? "active" : ""}" data-action="filter" data-filter="${filter}" aria-pressed="${reviewFilter === filter}">${labels[filter]} <span>${filter === "all" ? TOTAL_QUESTIONS : counts[filter]}</span></button>`).join("")}</div></div>
    <div class="review-list">${visible.length ? visible.map(({ item, index }) => renderReviewEntry(item, index)).join("") : '<p class="empty-review">Nessuna domanda in questa categoria.</p>'}</div>
    <div class="results-actions"><button class="button secondary" type="button" data-action="change-source">Cambia test</button><button class="button" type="button" data-action="restart">Nuova simulazione <span aria-hidden="true">↻</span></button></div>
  </section>`;
}

app.addEventListener("click", async (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "choose-source") {
    app.querySelector("#source-file")?.click();
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
  } else if (action === "start") {
    // Il tutto schermo va chiesto subito, dentro il clic dell'utente
    requestFullscreen();
    playLaunch();
  } else if (action === "go" && exam) {
    exam.index = Number(control.dataset.index);
    saveExam();
    renderExam();
  } else if (action === "previous" && exam && exam.index > 0) {
    exam.index--;
    saveExam();
    renderExam();
  } else if (action === "next" && exam && exam.index < TOTAL_QUESTIONS - 1) {
    exam.index++;
    saveExam();
    renderExam();
  } else if (action === "flag" && exam) {
    exam.order[exam.index].flagged = !exam.order[exam.index].flagged;
    saveExam();
    renderExam();
  } else if (action === "submit" && exam) {
    confirmFinish();
  } else if (action === "filter" && completedExam) {
    reviewFilter = control.dataset.filter;
    renderResults(false);
  } else if (action === "change-source" && completedExam) {
    completedExam = null;
    renderIntro();
  }
});

app.addEventListener("change", async (event) => {
  if (event.target.matches("#preset-test")) {
    if (event.target.value) loadPreset(event.target.value);
    return;
  }
  if (event.target.matches("#source-file")) {
    const file = event.target.files?.[0];
    if (!file) return;
    selectedPreset = "";
    try {
      setSource(await file.text(), file.name);
    } catch (error) {
      sourceReady = false;
      sourceMessage = "Banca quesiti non caricata";
      sourceError = error instanceof Error ? error.message : "Il file selezionato non è valido.";
      renderIntro();
    }
    return;
  }
  if (event.target.matches('input[name="answer"]') && exam) {
    exam.order[exam.index].answer = event.target.value;
    saveExam();
    renderExam();
    announce("Risposta salvata.");
  }
});

document.addEventListener("keydown", (event) => {
  if (!exam || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  if (target && (target.matches("input, textarea, select, button") || target.isContentEditable)) return;
  if (event.key === "ArrowLeft" && exam.index > 0) {
    exam.index--;
    saveExam();
    renderExam();
  } else if (event.key === "ArrowRight" && exam.index < TOTAL_QUESTIONS - 1) {
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

renderIntro();
loadFromWorkspace();
