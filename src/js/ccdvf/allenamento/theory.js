import { escapeHtml } from "../../utils.js";
import { state } from "./state.js";

// --- Collegamento alla teoria: sezioni degli approfondimenti per dominio più affini alla domanda ---
const THEORY_DOCS = [
  { domain: 1, id: "domain-1", path: "../../assets/ccdvf/appunti/domains/d1-agenti-workflow.md" },
  { domain: 2, id: "domain-2", path: "../../assets/ccdvf/appunti/domains/d2-applicazioni-integrazione.md" },
  { domain: 3, id: "domain-3", path: "../../assets/ccdvf/appunti/domains/d3-claude-code.md" },
  { domain: 4, id: "domain-4", path: "../../assets/ccdvf/appunti/domains/d4-eval-test-debug.md" },
  { domain: 5, id: "domain-5", path: "../../assets/ccdvf/appunti/domains/d5-modelli-ottimizzazione.md" },
  { domain: 6, id: "domain-6", path: "../../assets/ccdvf/appunti/domains/d6-prompt-contesto.md" },
  { domain: 7, id: "domain-7", path: "../../assets/ccdvf/appunti/domains/d7-sicurezza.md" },
  { domain: 8, id: "domain-8", path: "../../assets/ccdvf/appunti/domains/d8-strumenti-mcp.md" },
];
// In questa certificazione lo "scenario" di una domanda è il suo dominio ("Domain N – …"):
// il dominio indicato nel nome dello scenario restringe i documenti di teoria proposti
function scenarioDomains(scenario) {
  const match = scenario.match(/^domain\s+(\d)/i);
  return match ? [Number(match[1])] : null;
}
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
    const domains = scenarioDomains(question.scenario);
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
