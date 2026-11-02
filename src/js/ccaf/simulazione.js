import { confirmDialog } from "../dialog.js";
import { bankLoaderHtml } from "../loader.js";
import {
  applyStatsBars,
  classifyQuestion,
  PASS_SCORE,
  pickMotivation,
  renderStats,
  scaledScore,
} from "./simulazione-stats.js";

const DEFAULT_DURATION_MINUTES = 120;
let TOTAL_QUESTIONS = 0;
let _DURATION_MS = DEFAULT_DURATION_MINUTES * 60 * 1000;
const STORAGE_KEY = "ccaf-simulation-session-v1";
const HISTORY_KEY = "ccaf-simulation-history-v1";
const HISTORY_LIMIT = 30;
const BUILTIN_TESTS = [
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 1 - Claude Certified Architect.md",
    label: "Test 1 EN · Facile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 2 - Claude Certified Architect.md",
    label: "Test 2 EN · Medio",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 3 - Claude Certified Architect.md",
    label: "Test 3 EN · Medio",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 4 - Claude Certified Architect.md",
    label: "Test 4 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 5 - Claude Certified Architect.md",
    label: "Test 5 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 6 - Claude Certified Architect.md",
    label: "Test 6 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 7 - Claude Certified Architect.md",
    label: "Test 7 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 8 - Claude Certified Architect.md",
    label: "Test 8 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 9 - Claude Certified Architect.md",
    label: "Test 9 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 10 - Claude Certified Architect.md",
    label: "Test 10 EN · Difficile",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 11 - Claude Certified Architect.md",
    label: "Test 11 EN · Avanzato",
  },
  {
    file: "../../assets/ccaf/questions/Domande e risposte test 12 - Claude Certified Architect.md",
    label: "Test 12 EN · Avanzato",
  },
];
let selectedPreset = BUILTIN_TESTS[0].file;
// Test importati dall'utente in questa sessione della pagina: compaiono nel select come "Test importato n.X"
const importedTests = [];
const app = document.querySelector("#app");
const topStatus = document.querySelector("#top-status");
const announcer = document.querySelector("#announcer");

let questionBank = [];
let testTitle = "Simulazione CCA-F";
let testDurationMinutes = DEFAULT_DURATION_MINUTES;
let testDifficulty = "";
// Testo e nome della banca caricata: salvati nella sessione se è un test importato, per poterla riprendere
let currentSource = { raw: "", name: "" };
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
  const difficulty = frontmatterMatch?.[1].match(/^difficulty:\s*["']?(\w+)["']?\s*$/im)?.[1].toLowerCase() || "";
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
  return { questions: parsed, title, durationMinutes, difficulty };
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

// Dettaglio per domanda (scenario, argomenti, domini, esito, segnata) per statistiche e punteggio stimato
function examItems() {
  return completedExam.order.map((item) => {
    const question = questionBank.find((candidate) => candidate.id === Number(item.id));
    // Solo domanda, opzioni e spiegazione: il paragrafo introduttivo dello scenario è uguale per tutte
    const { topics, domains } = classifyQuestion(question);
    return { s: question.scenario, t: topics, d: domains, r: statusFor(item, question), f: item.flagged };
  });
}

function recordResult(automatic) {
  const counts = resultCounts();
  const history = loadHistory();
  const items = examItems();
  history.unshift({
    date: Date.now(),
    title: testTitle,
    correct: counts.correct,
    total: TOTAL_QUESTIONS,
    passed: scaledScore(items).score >= PASS_SCORE,
    automatic,
    difficulty: testDifficulty,
    durationMs: completedExam.startedAt ? Date.now() - completedExam.startedAt : null,
    timeLimitMs: completedExam.deadline ? completedExam.deadline - completedExam.startedAt : null,
    score: scaledScore(items).score,
    fullscreenExits: completedExam.fullscreenExits || 0,
    tabSwitches: completedExam.tabSwitches || 0,
    items,
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
      return `<li><span><span class="history-meta">${escapeHtml(date)}</span><br>${escapeHtml(entry.title)}</span><span class="history-score ${entry.passed ? "passed" : "not-passed"}">${entry.score ? `${entry.score}/1000 · ` : ""}${percentage}%</span></li>`;
    })
    .join("");
  return `<section class="history-box" aria-labelledby="history-title">
        <h3 id="history-title">Esiti precedenti</h3>
        <ul class="history-list">${rows}</ul>
        <div class="history-actions">
          <button class="button secondary" type="button" data-action="show-stats">Statistiche di studio</button>
          <button class="history-clear" type="button" data-action="clear-history">Cancella lo storico</button>
        </div>
      </section>`;
}

function renderStatsScreen() {
  const history = loadHistory();
  if (!history.length) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Statistiche";
  app.innerHTML = renderStats(history);
  applyStatsBars(app);
  window.scrollTo({ top: 0 });
}

function announce(message) {
  announcer.textContent = message;
}

function setSource(raw, label) {
  const parsed = parseQuestionBank(raw);
  currentSource = { raw, name: label };
  questionBank = parsed.questions;
  testTitle = parsed.title;
  testDifficulty =
    parsed.difficulty ||
    (BUILTIN_TESTS.find((test) => test.file === selectedPreset)?.label.split("· ")[1] || "").toLowerCase();
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
        resumeFullscreen();
      }
      return;
    }
  }
  // Prova salvata non riprendibile (banca cambiata o assente): va eliminata, altrimenti
  // theme.js continuerebbe a riportare su questa pagina
  if (!exam && saved?.status === "active") safeStorageRemove();
  renderIntro();
}

async function loadPreset(filename) {
  const preset = BUILTIN_TESTS.find((test) => test.file === filename);
  if (!preset) return;
  selectedPreset = preset.file;
  sourceReady = false;
  sourceError = "";
  sourceMessage = `Caricamento ${preset.label}…`;
  app.innerHTML = bankLoaderHtml("Preparo la simulazione", escapeHtml(preset.label));
  try {
    // Durata minima, così l'animazione si vede anche quando il file arriva subito
    const [response] = await Promise.all([
      fetch(new URL(preset.file, window.location.href), { cache: "no-store" }),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
    if (!response.ok) throw new Error(`Risposta HTTP ${response.status}`);
    setSource(await response.text(), preset.label);
  } catch (_error) {
    sourceReady = false;
    sourceMessage = "Banca quesiti non caricata";
    sourceError = `Non è stato possibile caricare ${preset.label}. Puoi importare il file manualmente.`;
    renderIntro();
  }
}

// All'avvio: se c'è una prova in corso si ricarica la sua banca e setSource la riprende
// (il timer usa una scadenza assoluta, quindi il tempo trascorso fuori dal sito è già scalato).
function loadFromWorkspace() {
  const saved = safeStorageGet();
  if (saved?.status === "active" && saved.source?.file && BUILTIN_TESTS.some((t) => t.file === saved.source.file)) {
    loadPreset(saved.source.file);
    return;
  }
  if (saved?.status === "active" && saved.source?.raw) {
    try {
      const test = { file: "imported-1", label: "Test importato n.1", name: saved.source.name, raw: saved.source.raw };
      importedTests.push(test);
      selectedPreset = test.file;
      setSource(test.raw, test.name);
      return;
    } catch {
      /* banca salvata non più valida: si riparte dal test predefinito */
    }
  }
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

// Badge della difficoltà come nella legenda del popup; i test importati sono sempre "Custom"
const DIFFICULTY_NAMES = { facile: "Facile", medio: "Medio", difficile: "Difficile", avanzato: "Avanzato" };
function difficultyBadge() {
  if (!sourceReady) return "—";
  const level = importedTests.some((test) => test.file === selectedPreset) ? "custom" : testDifficulty;
  const name = DIFFICULTY_NAMES[level] || "Custom";
  return `<span class="difficulty-tag" data-level="${DIFFICULTY_NAMES[level] ? level : "custom"}">${name}</span>`;
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
      <aside class="sim-toast" role="note" aria-label="Avviso sulla simulazione">
        <span class="sim-toast-icon" aria-hidden="true">i</span>
        <p><strong>Questa è una simulazione, non l’esame ufficiale.</strong>Formato, domande e livello di difficoltà sono pensati per avvicinarsi il più possibile alla prova reale, ma l’esito ottenuto qui non ha alcun valore ai fini della certificazione e non garantisce il superamento dell’esame.</p>
      </aside>
    </div>
    <aside class="exam-panel" aria-label="Dettagli della prova">
      <div class="panel-kicker">Formato della sessione</div>
      <h2 class="panel-title">Condizioni d’esame</h2>
      <ul class="exam-facts">
        <li><span>Durata</span><strong>${timedMode ? `${sourceReady ? testDurationMinutes : DEFAULT_DURATION_MINUTES} minuti` : "Senza limite"}</strong></li>
        <li><span>Quesiti</span><strong>${sourceReady ? questionBank.length : "—"}, ordine casuale</strong></li>
        <li><span>Risposte</span><strong>Una scelta per domanda</strong></li>
        <li><span>Correzione</span><strong>Al termine della prova</strong></li>
        <li><span>Difficoltà</span><strong>${difficultyBadge()}</strong></li>
      </ul>
      <div class="source-line" role="status">
        <span class="source-dot ${sourceReady ? "ready" : sourceError ? "error" : ""}" aria-hidden="true"></span>
        <span id="source-status">${escapeHtml(sourceMessage)}</span>
      </div>
      ${sourceError ? `<p class="source-error">${escapeHtml(sourceError)}</p>` : ""}
      <div class="source-actions">
        <label class="preset-select-label"><span>Test nel workspace</span><select id="preset-test" aria-label="Seleziona un test già presente nel workspace">${[
          ...BUILTIN_TESTS,
          ...importedTests,
        ]
          .map(
            (test) =>
              `<option value="${escapeHtml(test.file)}" ${selectedPreset === test.file ? "selected" : ""}>${escapeHtml(test.label)}</option>`,
          )
          .join("")}</select></label>
        <button class="settings-button" type="button" data-action="open-tools" aria-label="Importa, esporta e formato dei test" title="Importa, esporta e formato dei test">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
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
    <div class="guide-docs" aria-label="Documenti ufficiali">
      <a class="button secondary" href="../../assets/ccaf/Anthropic-Certification-Exam-Policy.pdf" target="_blank" rel="noopener">Politica d’esame Anthropic (PDF)</a>
      <a class="button secondary" href="../../assets/ccaf/Certification-Terms-and-Conditions.pdf" target="_blank" rel="noopener">Termini e condizioni (PDF)</a>
    </div>
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
  if (!on) {
    hideExamLock();
    navigator.keyboard?.unlock?.();
  }
  if (!on && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

// ---- Blocco dello schermo durante la prova ----
// Il browser non permette di impedire del tutto l'uscita dallo schermo intero (Esc è una garanzia
// di sicurezza), quindi: Keyboard Lock su Esc dove supportato (Chrome/Edge: va tenuto premuto),
// copertura della prova finché non si torna a schermo intero, conteggio di uscite e cambi di scheda,
// avviso alla chiusura della pagina, niente menu contestuale né copia del testo delle domande.
function requestFullscreen() {
  const root = document.documentElement;
  if (!root.requestFullscreen) return;
  const lockEscape = () => navigator.keyboard?.lock?.(["Escape"]).catch(() => {});
  if (document.fullscreenElement) lockEscape();
  else root.requestFullscreen({ navigationUI: "hide" }).then(lockEscape, () => {});
}

function examInProgress() {
  return exam?.status === "active" && document.body.classList.contains("exam-focus");
}

function showExamLock(resuming = false) {
  if (!document.documentElement.requestFullscreen) return;
  let lock = document.querySelector(".exam-lock");
  if (!lock) {
    lock = document.createElement("div");
    lock.className = "exam-lock";
    lock.setAttribute("role", "alertdialog");
    lock.setAttribute("aria-modal", "true");
    lock.setAttribute("aria-labelledby", "exam-lock-title");
    lock.addEventListener("click", (event) => {
      if (event.target.closest("[data-lock-resume]")) requestFullscreen();
    });
    document.body.append(lock);
  }
  lock.innerHTML = `<div class="exam-lock-box">
      <div class="exam-lock-icon" aria-hidden="true">⛶</div>
      <h2 id="exam-lock-title">${resuming ? "Bentornato nella prova" : "Sei uscito dallo schermo intero"}</h2>
      <p>${resuming ? `La simulazione è ancora in corso${exam.deadline ? " e il tempo ha continuato a scorrere" : ""}.` : "La prova resta nascosta finché non torni a schermo intero. Come all’esame vero, ogni uscita viene registrata e riportata nei risultati."}${exam.deadline ? " Il timer non si ferma." : ""}</p>
      <button class="button" type="button" data-lock-resume>Torna a schermo intero</button>
    </div>`;
  lock.hidden = false;
  lock.querySelector("[data-lock-resume]").focus();
}

function hideExamLock() {
  const lock = document.querySelector(".exam-lock");
  if (lock) lock.hidden = true;
}

// Ripresa di una prova (ricarica o ritorno sul sito): lo schermo intero va richiesto con un clic
function resumeFullscreen() {
  if (!document.fullscreenElement) showExamLock(true);
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    hideExamLock();
    return;
  }
  if (!examInProgress()) return;
  exam.fullscreenExits = (exam.fullscreenExits || 0) + 1;
  saveExam();
  showExamLock();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && examInProgress()) {
    exam.tabSwitches = (exam.tabSwitches || 0) + 1;
    saveExam();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (examInProgress()) event.preventDefault();
});

document.addEventListener("contextmenu", (event) => {
  if (examInProgress()) event.preventDefault();
});

for (const type of ["copy", "cut"]) {
  document.addEventListener(type, (event) => {
    if (examInProgress() && !event.target.closest?.("textarea")) event.preventDefault();
  });
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
    // Da dove ricaricare le domande alla riapertura della pagina (anche se nel frattempo è selezionato un altro test)
    source: BUILTIN_TESTS.some((test) => test.file === selectedPreset)
      ? { file: selectedPreset }
      : { raw: currentSource.raw, name: currentSource.name },
    startedAt: Date.now(),
    deadline: timedMode ? Date.now() + testDurationMinutes * 60 * 1000 : null,
    index: 0,
    notes: "",
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
  // Barra del tempo sotto quella delle risposte: si riempie man mano che il tempo passa
  const track = document.querySelector("#time-track");
  if (track) {
    const total = exam.deadline - exam.startedAt;
    track.value = total - remaining;
    track.classList.toggle("warning", remaining <= 10 * 60 * 1000 && remaining > 5 * 60 * 1000);
    track.classList.toggle("critical", remaining <= 5 * 60 * 1000);
    const percent = document.querySelector("#time-percent");
    if (percent)
      percent.textContent = `${Math.round(((total - remaining) / total) * 100)}% · restano ${timerText(remaining)}`;
  }
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
      <aside class="exam-notes" aria-label="Note della prova">
        <label for="exam-notes">Blocco note</label>
        <p class="exam-notes-hint" id="exam-notes-hint">Uno spazio unico per tutta la prova, sempre visibile mentre cambi domanda: annota dubbi, numeri delle domande da rivedere o concetti da ripassare. Si salva automaticamente, non influisce sul punteggio e lo ritrovi nella revisione finale.</p>
        <textarea id="exam-notes" rows="16" maxlength="10000" aria-describedby="exam-notes-hint" placeholder="Es. D12 indeciso tra B e C (hook o prompt?) · ripassare Batches API">${escapeHtml(exam.notes || "")}</textarea>
      </aside>
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
    finishedAt: Date.now(),
    automatic,
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

// Riepilogo visibile solo in stampa (Stampa risultato → Salva come PDF): dati della prova
// che a schermo sono sparsi o assenti (date, durata, modalità, difficoltà, comportamento)
function renderPrintSummary(counts, estimate, percentage, passed) {
  const when = (time) => new Date(time).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" });
  const used =
    completedExam.finishedAt && completedExam.startedAt ? completedExam.finishedAt - completedExam.startedAt : 0;
  const level = importedTests.some((test) => test.file === selectedPreset)
    ? "Custom (test importato)"
    : DIFFICULTY_NAMES[testDifficulty] || "Non indicata";
  const rows = [
    ["Test", testTitle],
    ["Difficoltà", level],
    ["Iniziata", completedExam.startedAt ? when(completedExam.startedAt) : "—"],
    [
      "Consegnata",
      completedExam.finishedAt
        ? `${when(completedExam.finishedAt)}${completedExam.automatic ? " (tempo esaurito)" : ""}`
        : "—",
    ],
    [
      "Tempo impiegato",
      `${timerText(used)}${completedExam.deadline ? ` su ${testDurationMinutes} minuti disponibili` : " (senza limite di tempo)"}`,
    ],
    ["Punteggio stimato", `${estimate.score}/1000 · soglia ${PASS_SCORE} · ${passed ? "superata" : "non superata"}`],
    [
      "Risposte",
      `${counts.correct} corrette, ${counts.wrong} errate, ${counts.unanswered} senza risposta su ${TOTAL_QUESTIONS} (${percentage}%)`,
    ],
    ["Domande segnate", String(completedExam.order.filter((item) => item.flagged).length)],
    ["Uscite dallo schermo intero", String(completedExam.fullscreenExits || 0)],
    ["Cambi di scheda o finestra", String(completedExam.tabSwitches || 0)],
  ];
  return `<header class="print-summary">
      <div class="print-brand">Claude Certified Architect – Foundations · Simulazione d’esame</div>
      <h1>Risultato della simulazione</h1>
      <dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
      <p class="print-disclaimer">Documento generato da una simulazione di preparazione: non è l’esame ufficiale e il punteggio stimato non ha valore ai fini della certificazione.</p>
    </header>`;
}

function printResults() {
  // In stampa servono tutte le domande con risposte e spiegazioni, a prescindere dal filtro attivo
  reviewFilter = "all";
  renderResults(completedExam.automatic);
  for (const entry of app.querySelectorAll(".review-entry")) entry.open = true;
  // Il titolo della pagina diventa il nome proposto per il PDF
  const title = document.title;
  const day = new Date(completedExam.finishedAt || Date.now()).toISOString().slice(0, 10);
  document.title = `Risultato simulazione CCA-F - ${testTitle} - ${day}`;
  // Il PDF va sempre in tema chiaro, anche se a schermo è attivo quello scuro
  const root = document.documentElement;
  const theme = root.dataset.theme;
  root.dataset.theme = "light";
  window.addEventListener(
    "afterprint",
    () => {
      document.title = title;
      root.dataset.theme = theme;
    },
    { once: true },
  );
  window.print();
}

function renderResults(automatic = false) {
  if (!completedExam) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Esame concluso";
  const counts = resultCounts();
  const percentage = ((counts.correct / TOTAL_QUESTIONS) * 100).toFixed(1);
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
      question: questionBank.find((candidate) => candidate.id === Number(item.id)),
    }))
    .filter((entry) => reviewFilter === "all" || statusFor(entry.item, entry.question) === reviewFilter);
  app.innerHTML = `
  <section class="screen results-screen" aria-labelledby="results-title">
    ${renderPrintSummary(counts, estimate, percentage, passed)}
    <div class="results-head">
      <div><div class="eyebrow">Sessione completata${automatic ? " · Tempo esaurito" : ""}</div><h1 id="results-title">Revisione<br><span>dei risultati</span></h1><p>La simulazione è conclusa. Esamina ogni risposta e usa i filtri per concentrarti sui quesiti da ripassare.</p></div>
      <div class="score-block"><strong class="score-number">${counts.correct}<span class="score-small">/${TOTAL_QUESTIONS}</span></strong><span class="score-caption">Risposte corrette · ${percentage}%</span></div>
    </div>
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
        <p>${passed ? `Punteggio stimato ${estimate.score}/1000, sopra la soglia di ${PASS_SCORE}, con ${counts.correct} risposte corrette su ${TOTAL_QUESTIONS}.` : `Punteggio stimato ${estimate.score}/1000: mancano ${PASS_SCORE - estimate.score} punti alla soglia di ${PASS_SCORE}. Concentrati sui domini con il peso maggiore e la percentuale più bassa, poi riprova.`}</p>
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
    <div class="review-head"><h2>Esito domanda per domanda</h2><div class="filter-group" role="group" aria-label="Filtra risultati">${filters.map((filter) => `<button type="button" class="filter-button ${reviewFilter === filter ? "active" : ""}" data-action="filter" data-filter="${filter}" aria-pressed="${reviewFilter === filter}">${labels[filter]} <span>${filter === "all" ? TOTAL_QUESTIONS : counts[filter]}</span></button>`).join("")}</div></div>
    <div class="review-list">${visible.length ? visible.map(({ item, index }) => renderReviewEntry(item, index)).join("") : '<p class="empty-review">Nessuna domanda in questa categoria.</p>'}</div>
    <div class="results-actions"><button class="button secondary" type="button" data-action="show-stats">Statistiche di studio</button><button class="button secondary" type="button" data-action="print-results">Stampa risultato</button><button class="button secondary" type="button" data-action="change-source">Cambia test</button><button class="button" type="button" data-action="restart">Nuova simulazione <span aria-hidden="true">↻</span></button></div>
  </section>`;
  applyStatsBars(app);
}

// Popup dell'ingranaggio: importazione di un Markdown, esportazione di un test
// del workspace e guida al formato. Creato una volta, contenuto rigenerato a ogni apertura.
let toolsDialog = null;

function testFileName(path) {
  return decodeURIComponent(path.split("/").pop());
}

function openToolsDialog() {
  if (!toolsDialog) {
    toolsDialog = document.createElement("dialog");
    toolsDialog.className = "site-dialog tools-dialog";
    toolsDialog.setAttribute("aria-labelledby", "tools-dialog-title");
    document.body.append(toolsDialog);
    toolsDialog.addEventListener("click", (event) => {
      if (event.target === toolsDialog) toolsDialog.close();
      else if (event.target.closest('[data-action="choose-source"]'))
        toolsDialog.querySelector("#source-file")?.click();
    });
    toolsDialog.addEventListener("change", (event) => {
      if (event.target.matches("#source-file")) {
        toolsDialog.close();
        importSourceFile(event.target.files?.[0]);
      } else if (event.target.matches("#export-test")) {
        const link = toolsDialog.querySelector("#export-link");
        link.href = event.target.value;
        link.download = testFileName(event.target.value);
      }
    });
  }
  const exportFile = BUILTIN_TESTS.some((test) => test.file === selectedPreset)
    ? selectedPreset
    : BUILTIN_TESTS[0].file;
  toolsDialog.innerHTML = `
    <div class="site-dialog-body">
      <h2 class="site-dialog-title" id="tools-dialog-title">Gestione dei test</h2>
      <section class="tools-section">
        <h3>Importa</h3>
        <p class="site-dialog-message">Carica una banca quesiti in formato Markdown dal tuo computer.</p>
        <button class="button secondary" type="button" data-action="choose-source">Importa un altro Markdown</button>
        <input class="file-input" type="file" accept=".md,text/markdown,text/plain" id="source-file" aria-label="Seleziona il file Markdown con i quesiti">
      </section>
      <section class="tools-section">
        <h3>Esporta</h3>
        <p class="site-dialog-message">Scarica il file Markdown di un test del workspace.</p>
        <div class="tools-export">
          <label class="preset-select-label"><span>Test da esportare</span><select id="export-test">${BUILTIN_TESTS.map((test) => `<option value="${escapeHtml(test.file)}" ${exportFile === test.file ? "selected" : ""}>${escapeHtml(test.label)}</option>`).join("")}</select></label>
          <a class="button" id="export-link" href="${escapeHtml(exportFile)}" download="${escapeHtml(testFileName(exportFile))}">Esporta (.md)</a>
        </div>
      </section>
      <section class="tools-section">
        <h3>Livelli di difficoltà</h3>
        <dl class="difficulty-legend">
          <div><dt><span class="difficulty-tag" data-level="facile">Facile</span></dt><dd>Concetti di base, una risposta chiaramente migliore delle altre.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="medio">Medio</span></dt><dd>Scenari realistici con distrattori plausibili su un singolo concetto.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="difficile">Difficile</span></dt><dd>Più concetti insieme, trappole tipiche d’esame, opzioni simili tra loro.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="avanzato">Avanzato</span></dt><dd>Vicino all’esame reale: più vincoli da combinare, un dettaglio decisivo, risposte lunghe e tutte credibili.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="custom">Custom</span></dt><dd>Test importato: la difficoltà non è nota a priori.</dd></div>
        </dl>
      </section>
      <details class="format-help">
        <summary>Formato per creare un altro test</summary>
        <p>Usa un titolo, scenari facoltativi, quesiti numerati, quattro opzioni A–D e la riga della risposta corretta.</p>
        <p><a class="button secondary" href="../../assets/ccaf/template-test.md" download="template-test.md">Scarica il template (template-test.md)</a></p>
        <div class="format-guide">${renderGuideMarkdown(formatGuideSource()).html}</div>
      </details>
      <form method="dialog" class="site-dialog-actions"><button class="button secondary" type="submit">Chiudi</button></form>
    </div>`;
  toolsDialog.showModal();
}

async function importSourceFile(file) {
  if (!file) return;
  try {
    const raw = await file.text();
    parseQuestionBank(raw);
    const test = {
      file: `imported-${importedTests.length + 1}`,
      label: `Test importato n.${importedTests.length + 1}`,
      name: file.name,
      raw,
    };
    importedTests.push(test);
    selectedPreset = test.file;
    setSource(raw, file.name);
  } catch (error) {
    sourceReady = false;
    sourceMessage = "Banca quesiti non caricata";
    sourceError = error instanceof Error ? error.message : "Il file selezionato non è valido.";
    renderIntro();
  }
}

app.addEventListener("click", async (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
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
    if (completedExam) renderResults();
    else renderIntro();
  } else if (action === "print-results" && completedExam) {
    printResults();
  } else if (action === "show-stats") {
    renderStatsScreen();
  } else if (action === "start") {
    const ok = await confirmDialog({
      title: "Sei pronto a iniziare?",
      message: timedMode
        ? `Da questo momento la prova non si può mettere in pausa: il timer di ${testDurationMinutes} minuti continua a scorrere anche se chiudi o ricarichi la pagina, e allo scadere le risposte vengono consegnate automaticamente. Puoi solo consegnare prima del tempo. Mettiti in un posto tranquillo e affrontala come se fosse l’esame vero.`
        : "Da questo momento la prova è avviata: le domande sono in ordine casuale e non puoi tornare alle istruzioni. Puoi chiudere la pagina e riprendere, ma l’unico modo per terminare è consegnare. Affrontala come se fosse l’esame vero.",
      confirmLabel: "Inizia ora",
      cancelLabel: "Non ancora",
    });
    if (!ok) return;
    // Il tutto schermo va chiesto dentro un gesto dell'utente: il clic su "Inizia ora" lo è ancora
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

app.addEventListener("input", (event) => {
  if (event.target.matches("#exam-notes") && exam) {
    exam.notes = event.target.value;
    saveExam();
  }
});

app.addEventListener("change", async (event) => {
  if (event.target.matches("#preset-test")) {
    const imported = importedTests.find((test) => test.file === event.target.value);
    if (imported) {
      selectedPreset = imported.file;
      setSource(imported.raw, imported.name);
    } else if (event.target.value) loadPreset(event.target.value);
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
