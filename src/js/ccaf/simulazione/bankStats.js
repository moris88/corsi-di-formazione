// Tabella "Caratteristiche dei test" nel popup dell'ingranaggio: per ogni test del workspace
// misura quanto le domande sono lunghe, quanto le opzioni errate somigliano alla corretta
// e quante opzioni si scartano a colpo d'occhio. Calcolata una volta, all'apertura dell'accordion.
import { escapeHtml } from "../../utils.js";
import { parseQuestionBank } from "./parser.js";
import { BUILTIN_TESTS, DIFFICULTY_NAMES } from "./state.js";

// Soglie usate nelle metriche (le stesse della revisione delle banche quesiti)
const LONG_PROMPT_WORDS = 45;
const SIMILARITY_THRESHOLD = 0.15;

const STOP_WORDS = new Set(
  "the a an and or to of in for on with so that this is it as by be from its their each any all not are can when then than into only at use uses using which what who has have".split(
    " ",
  ),
);

let cachedRows = null;

const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;

// Parole significative di un testo: minuscole, senza parole vuote né parole di due lettere
function tokens(text) {
  return new Set((text.toLowerCase().match(/[a-z_`]+/g) || []).filter((w) => w.length > 2 && !STOP_WORDS.has(w)));
}

function jaccard(a, b) {
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  const union = a.size + b.size - shared;
  return union ? shared / union : 0;
}

function percent(count, total) {
  return total ? Math.round((100 * count) / total) : 0;
}

// Percentuali di domande: testo lungo, opzione errata simile alla corretta, opzione di comodo
export function measureBank(questions) {
  let longPrompts = 0;
  let similar = 0;
  let giveaways = 0;
  for (const question of questions) {
    if (wordCount(question.prompt) >= LONG_PROMPT_WORDS) longPrompts += 1;
    const correct = question.options.find((option) => option.letter === question.correctLetter);
    const correctTokens = tokens(correct.text);
    const wrong = question.options.filter((option) => option !== correct).map((option) => tokens(option.text));
    if (Math.max(...wrong.map((set) => jaccard(correctTokens, set))) >= SIMILARITY_THRESHOLD) similar += 1;
    if (wrong.some((set) => [...set].every((word) => !correctTokens.has(word)))) giveaways += 1;
  }
  const total = questions.length;
  return {
    longPrompts: percent(longPrompts, total),
    similar: percent(similar, total),
    giveaways: percent(giveaways, total),
  };
}

async function loadRows() {
  return Promise.all(
    BUILTIN_TESTS.map(async (test) => {
      const [name, label] = test.label.split(" · ");
      try {
        const response = await fetch(test.file, { cache: "no-cache" });
        if (!response.ok) throw new Error(String(response.status));
        const parsed = parseQuestionBank(await response.text());
        const level = parsed.difficulty || (label || "").toLowerCase();
        return { name, level, ...measureBank(parsed.questions) };
      } catch {
        return { name, level: (label || "").toLowerCase(), error: true };
      }
    }),
  );
}

function levelTag(level) {
  const known = DIFFICULTY_NAMES[level];
  return `<span class="difficulty-tag" data-level="${known ? level : "custom"}">${escapeHtml(known || "Custom")}</span>`;
}

function rowHtml(row) {
  const cells = row.error
    ? `<td colspan="3" class="bank-stats-error">Test non disponibile</td>`
    : `<td>${row.longPrompts}%</td><td>${row.similar}%</td><td>${row.giveaways}%</td>`;
  return `<tr><th scope="row">${escapeHtml(row.name)}</th><td>${levelTag(row.level)}</td>${cells}</tr>`;
}

function tableHtml(rows) {
  return `<div class="table-scroll"><table class="stats-table bank-stats-table">
    <thead><tr><th scope="col">Test</th><th scope="col">Livello</th><th scope="col">Parole nel testo</th><th scope="col">Somiglianza risposte</th><th scope="col">Opzioni di comodo</th></tr></thead>
    <tbody>${rows.map(rowHtml).join("")}</tbody>
  </table></div>`;
}

// Accordion da inserire nel popup, sotto la legenda dei livelli
export function bankStatsSection() {
  return `<details class="format-help bank-stats" id="bank-stats">
    <summary>Caratteristiche dei test</summary>
    <p>Percentuale di domande di ciascun test che presenta la caratteristica indicata.</p>
    <div class="bank-stats-body" aria-live="polite">${cachedRows ? tableHtml(cachedRows) : `<p class="bank-stats-loading">Analisi dei test in corso…</p>`}</div>
    <ul class="bank-stats-notes">
      <li><strong>Parole nel testo:</strong> domande la cui situazione supera le ${LONG_PROMPT_WORDS} parole, escluso il paragrafo comune dello scenario. Più alta, più vincoli da leggere.</li>
      <li><strong>Somiglianza risposte:</strong> domande con almeno un’opzione errata che condivide buona parte delle parole significative con quella corretta (quasi giusta). Più alta, più difficile distinguerle.</li>
      <li><strong>Opzioni di comodo:</strong> domande con almeno un’opzione errata che non ha nessuna parola significativa in comune con la corretta, quindi scartabile a colpo d’occhio. Più bassa, più difficile il test.</li>
    </ul>
  </details>`;
}

// Alla prima apertura dell'accordion calcola le metriche e mostra la tabella
export function bindBankStats(root) {
  const details = root.querySelector("#bank-stats");
  if (!details || cachedRows) return;
  details.addEventListener(
    "toggle",
    async () => {
      if (!details.open) return;
      cachedRows = await loadRows();
      const body = details.querySelector(".bank-stats-body");
      if (body) body.innerHTML = tableHtml(cachedRows);
    },
    { once: true },
  );
}
