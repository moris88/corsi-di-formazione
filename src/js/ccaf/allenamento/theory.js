import { escapeHtml } from "../../utils.js";
import { state } from "./state.js";

// --- Collegamento alla teoria: sezioni degli approfondimenti per dominio più affini alla domanda ---
const THEORY_DOCS = [
  { domain: 1, id: "deep-domain-1", path: "../../assets/ccaf/appunti/domains/d1-agentic-architecture.md" },
  { domain: 2, id: "deep-domain-2", path: "../../assets/ccaf/appunti/domains/d2-tool-design-mcp.md" },
  { domain: 3, id: "deep-domain-3", path: "../../assets/ccaf/appunti/domains/d3-claude-code-config.md" },
  { domain: 4, id: "deep-domain-4", path: "../../assets/ccaf/appunti/domains/d4-prompt-engineering.md" },
  { domain: 5, id: "deep-domain-5", path: "../../assets/ccaf/appunti/domains/d5-context-reliability.md" },
];
// Domini più coinvolti per scenario, come indicato nella guida d'esame
const SCENARIO_DOMAINS = {
  "customer support resolution agent": [1, 2, 5],
  "code generation with claude code": [3],
  "multi-agent research system": [1, 5],
  "developer productivity with claude": [2, 3, 5],
  "claude code for continuous integration": [3, 4],
  "structured data extraction": [4, 5],
};
let theorySections = [];

function slugify(source) {
  return (
    source
      .replace(/[`*_~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "sezione"
  );
}

function tokens(text) {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .match(/[a-z0-9][a-z0-9_.-]*[a-z0-9]/g)
      ?.filter((t) => t.length >= 3) ?? [],
  );
}

export async function loadTheory() {
  const docs = await Promise.all(
    THEORY_DOCS.map(async (doc) => {
      try {
        const response = await fetch(new URL(doc.path, window.location.href));
        return response.ok ? { doc, text: await response.text() } : null;
      } catch {
        return null;
      }
    }),
  );
  const sections = [];
  for (const entry of docs) {
    if (!entry) continue;
    let current = null;
    let inCode = false;
    for (const line of entry.text.split("\n")) {
      if (/^\s*```/.test(line)) inCode = !inCode;
      const heading = !inCode && line.match(/^##\s+(.+)$/);
      if (heading) {
        const title = heading[1].replace(/\s+#+\s*$/, "");
        current = { ...entry.doc, title: title.replace(/[`*~]/g, ""), slug: slugify(title), body: title };
        sections.push(current);
      } else if (current) current.body += `\n${line}`;
    }
  }
  const df = new Map();
  for (const s of sections) {
    s.tokens = tokens(s.body);
    for (const t of s.tokens) df.set(t, (df.get(t) || 0) + 1);
  }
  for (const s of sections) {
    s.weights = new Map();
    for (const t of s.tokens) s.weights.set(t, Math.log(sections.length / df.get(t)));
    s.norm = s.tokens.size ** 0.75 || 1;
  }
  theorySections = sections;
}

const questionTokens = (question) =>
  (question.tokens ??= tokens(
    `${question.prompt} ${question.options.map((o) => o.text).join(" ")} ${question.explanation}`,
  ));
const scenarioCache = new Map();
function scenarioFrequencies(scenario) {
  if (!scenarioCache.has(scenario)) {
    const df = new Map();
    const questions = state.pool.filter((q) => q.scenario === scenario);
    for (const q of questions) for (const t of questionTokens(q)) df.set(t, (df.get(t) || 0) + 1);
    df.total = questions.length + 1;
    scenarioCache.set(scenario, df);
  }
  return scenarioCache.get(scenario);
}

function theoryLinksFor(question) {
  if (!theorySections.length) return [];
  if (!question.theory) {
    const domains = SCENARIO_DOMAINS[question.scenario.toLowerCase()];
    const candidates = theorySections.filter((s) => !domains || domains.includes(s.domain));
    const words = questionTokens(question);
    // Le parole presenti in molte domande dello stesso scenario (nomi degli strumenti, del dominio applicativo…)
    // non dicono di quale argomento tratta la domanda: pesano meno
    const scenarioDf = scenarioFrequencies(question.scenario);
    const scored = candidates
      .map((s) => {
        let score = 0;
        for (const w of words) score += (s.weights.get(w) || 0) * Math.log(scenarioDf.total / (scenarioDf.get(w) || 1));
        return { s, score: score / s.norm };
      })
      .sort((a, b) => b.score - a.score);
    const best = scored[0]?.score || 0;
    question.theory =
      best > 0
        ? scored
            .slice(0, 2)
            .filter((x, i) => i === 0 || x.score >= best * 0.75)
            .map((x) => x.s)
        : [];
  }
  return question.theory;
}

export function theoryLinksHtml(question) {
  const links = theoryLinksFor(question);
  if (!links.length) return "";
  return `<p class="feedback-theory"><strong>Ripassa la teoria:</strong> ${links
    .map(
      (s) =>
        `<a href="./studio.html?doc=${s.id}#${encodeURIComponent(s.slug)}" target="_blank" rel="noopener">D${s.domain} · ${escapeHtml(s.title)}</a>`,
    )
    .join(" · ")}</p>`;
}
