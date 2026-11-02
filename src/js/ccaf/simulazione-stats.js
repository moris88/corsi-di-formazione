// Statistiche delle simulazioni: classificazione dei quesiti per dominio e argomento
// e schermata di analisi costruita sullo storico salvato in localStorage.

const PASS_RATIO = 0.72;
const STUDY = "./studio.html?doc=";

export const DOMAINS = {
  D1: { name: "Architettura degli agenti e orchestrazione", weight: 27 },
  D2: { name: "Progettazione degli strumenti e integrazione MCP", weight: 18 },
  D3: { name: "Configurazione di Claude Code e flussi di lavoro", weight: 20 },
  D4: { name: "Prompt engineering e output strutturato", weight: 20 },
  D5: { name: "Gestione del contesto e affidabilità", weight: 15 },
};

// Argomenti riconosciuti nel testo di domanda, opzioni e spiegazione (in inglese, come le banche).
// L'ordine conta solo per la visualizzazione; una domanda può toccare più argomenti.
const TOPICS = [
  {
    id: "loop",
    label: "Ciclo agentico e stop_reason",
    domain: "D1",
    doc: "appunti-domain-1",
    re: /stop_reason|end_turn|agentic loop|tool_use_id|max_tokens/i,
  },
  {
    id: "multi",
    label: "Coordinatore e subagenti",
    domain: "D1",
    doc: "multi-agente",
    re: /coordinator|subagent|hub-and-spoke|Task tool|Task calls|AgentDefinition/i,
  },
  {
    id: "decomp",
    label: "Scomposizione dei compiti e catene di prompt",
    domain: "D1",
    doc: "deep-domain-1",
    re: /decompos|fixed chain|prompt chain|subtopic|multi-concern/i,
  },
  {
    id: "hooks",
    label: "Hook e controlli deterministici",
    domain: "D1",
    doc: "hook",
    re: /hook|PreToolUse|PostToolUse|deterministic|prerequisite|deny rule/i,
  },
  {
    id: "sessions",
    label: "Sessioni: resume e fork",
    domain: "D1",
    doc: "sessioni",
    re: /--resume|fork-session|fork the session|resum(e|ing) (the|yesterday)|named session/i,
  },
  {
    id: "tooldesc",
    label: "Descrizioni e scelta degli strumenti",
    domain: "D2",
    doc: "deep-domain-2",
    re: /description|tool selection|selection errors|misrout|35 tools/i,
  },
  {
    id: "toolerr",
    label: "Errori strutturati degli strumenti",
    domain: "D2",
    doc: "errori-mcp",
    re: /isError|isRetryable|structured error|errorCategory|transient/i,
  },
  { id: "mcp", label: "Server e risorse MCP", domain: "D2", doc: "deep-domain-2", re: /\bMCP\b|\.mcp\.json|resources/ },
  {
    id: "builtin",
    label: "Strumenti integrati (Read, Grep, Glob, Edit, Bash)",
    domain: "D2",
    doc: "deep-domain-2",
    re: /\b(Grep|Glob|Edit|Bash)\b/,
  },
  {
    id: "claudemd",
    label: "CLAUDE.md, memoria e regole",
    domain: "D3",
    doc: "file-claude",
    re: /CLAUDE\.md|\/memory|\.claude\/rules|`paths`/i,
  },
  {
    id: "commands",
    label: "Comandi personalizzati e skill",
    domain: "D3",
    doc: "deep-domain-3",
    re: /slash command|\.claude\/commands|\bskills?\b|\$ARGUMENTS|allowed-tools|context: fork/i,
  },
  {
    id: "plan",
    label: "Plan mode ed esecuzione diretta",
    domain: "D3",
    doc: "deep-domain-3",
    re: /plan mode|direct execution/i,
  },
  {
    id: "ci",
    label: "Claude Code in CI/CD (-p, output JSON)",
    domain: "D3",
    doc: "deep-domain-3",
    re: /`-p`|--output-format|--json-schema|allowedTools|headless|non-interactive|pipeline/i,
  },
  {
    id: "iterate",
    label: "Raffinamento iterativo e intervista",
    domain: "D3",
    doc: "deep-domain-3",
    re: /input\/output examples|interview|iterate against/i,
  },
  { id: "fewshot", label: "Few-shot ed esempi", domain: "D4", doc: "deep-domain-4", re: /few-shot/i },
  {
    id: "criteria",
    label: "Criteri espliciti e falsi positivi",
    domain: "D4",
    doc: "deep-domain-4",
    re: /false positive|explicit criteria|quality criteria|precision/i,
  },
  {
    id: "schema",
    label: "Schema JSON e output strutturato",
    domain: "D4",
    doc: "deep-domain-4",
    re: /schema|nullable|\benum\b|tool_choice/i,
  },
  {
    id: "retry",
    label: "Validazione e retry",
    domain: "D4",
    doc: "deep-domain-4",
    re: /validation|retry loop|retries/i,
  },
  {
    id: "batch",
    label: "Message Batches API",
    domain: "D4",
    doc: "deep-domain-4",
    re: /Batches API|custom_id|\bbatch(es)?\b/i,
  },
  {
    id: "review",
    label: "Revisione indipendente e multi-pass",
    domain: "D4",
    doc: "deep-domain-4",
    re: /independent (model )?instance|self-review|integration pass|per-file|reviews? (its|their) own/i,
  },
  {
    id: "context",
    label: "Gestione del contesto",
    domain: "D5",
    doc: "deep-domain-5",
    re: /lost in the middle|context window|progressive(ly)? summar|case-facts|\/compact|scratchpad|context fills|dilut/i,
  },
  { id: "escalation", label: "Escalation e handoff", domain: "D5", doc: "consigli-domain-5", re: /escalat|handoff/i },
  {
    id: "provenance",
    label: "Provenienza, citazioni e conflitti tra fonti",
    domain: "D5",
    doc: "deep-domain-5",
    re: /citation|provenance|claim-to-source|conflicting|contradiction/i,
  },
  {
    id: "coverage",
    label: "Copertura e propagazione degli errori",
    domain: "D5",
    doc: "deep-domain-5",
    re: /coverage|partial results|propagat/i,
  },
  {
    id: "confidence",
    label: "Confidenza, campionamento e revisione umana",
    domain: "D5",
    doc: "deep-domain-5",
    re: /confidence|calibrat|stratif|random sample|human review|review capacity/i,
  },
];
const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

// Dominio di ripiego quando nessun argomento viene riconosciuto
const SCENARIO_DOMAIN = {
  "Customer Support Resolution Agent": "D1",
  "Code Generation with Claude Code": "D3",
  "Multi-Agent Research System": "D1",
  "Structured Data Extraction": "D4",
  "Claude Code for Continuous Integration": "D3",
  "Developer Productivity with Claude": "D2",
};

export function classifyQuestion(question) {
  const text = [question.prompt, ...question.options.map((option) => option.text), question.explanation].join("\n");
  const topics = TOPICS.filter((topic) => topic.re.test(text)).map((topic) => topic.id);
  const domains = [...new Set(topics.map((id) => TOPIC_BY_ID.get(id).domain))];
  if (!domains.length) domains.push(SCENARIO_DOMAIN[question.scenario] || "D1");
  return { topics, domains };
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

function pct(ok, total) {
  return total ? Math.round((ok / total) * 100) : 0;
}

function tally(items, keysOf) {
  const map = new Map();
  for (const item of items) {
    for (const key of keysOf(item)) {
      const row = map.get(key) || { key, total: 0, ok: 0, wrong: 0, blank: 0 };
      row.total++;
      if (item.r === "correct") row.ok++;
      else if (item.r === "wrong") row.wrong++;
      else row.blank++;
      map.set(key, row);
    }
  }
  return [...map.values()].map((row) => ({ ...row, rate: pct(row.ok, row.total) }));
}

function bar(rate, label) {
  return `<span class="stats-bar" role="img" aria-label="${escapeHtml(label)}: ${rate}%"><span class="stats-bar-fill ${rate >= PASS_RATIO * 100 ? "good" : ""}" data-value="${rate}"></span><span class="stats-bar-mark" aria-hidden="true"></span></span>`;
}

function minutes(ms) {
  return `${Math.round(ms / 60000)}′`;
}

function level(rate) {
  if (rate < 60) return { label: "Priorità alta", cls: "high" };
  if (rate < PASS_RATIO * 100) return { label: "Da rinforzare", cls: "mid" };
  if (rate < 85) return { label: "Buono", cls: "ok" };
  return { label: "Solido", cls: "top" };
}

export function renderStats(history) {
  const detailed = history.filter((entry) => Array.isArray(entry.items) && entry.items.length);
  const items = detailed.flatMap((entry) => entry.items);
  const rates = history.map((entry) => pct(entry.correct, entry.total));
  const avg = Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
  const passed = history.filter((entry) => entry.passed).length;
  const recent = rates.slice(0, 3);
  const older = rates.slice(3, 6);
  const trend = older.length
    ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length - older.reduce((a, b) => a + b, 0) / older.length)
    : null;
  const timed = history.filter((entry) => entry.durationMs);

  // Domini: priorità = peso d'esame × quota di errori, così un dominio pesante e debole sale in cima
  const domainRows = tally(items, (item) => item.d || [])
    .map((row) => ({
      ...row,
      ...DOMAINS[row.key],
      priority: (DOMAINS[row.key]?.weight || 0) * (1 - row.ok / row.total),
    }))
    .sort((a, b) => b.priority - a.priority);
  const topicRows = tally(items, (item) => item.t || [])
    .filter((row) => TOPIC_BY_ID.has(row.key))
    .map((row) => ({ ...row, topic: TOPIC_BY_ID.get(row.key) }))
    .sort((a, b) => a.rate - b.rate || b.total - a.total);
  const scenarioRows = tally(items, (item) => [item.s]).sort((a, b) => a.rate - b.rate);
  const difficultyRows = tally(
    detailed.flatMap((entry) => entry.items.map((item) => ({ ...item, diff: entry.difficulty || "n.d." }))),
    (item) => [item.diff],
  );

  const weakDomains = domainRows.filter((row) => row.rate < 80).slice(0, 3);
  const weakTopics = topicRows.filter((row) => row.total >= 3 && row.rate < 75).slice(0, 6);
  const flagged = items.filter((item) => item.f);
  const unflagged = items.filter((item) => !item.f);
  const blank = items.filter((item) => item.r === "unanswered").length;

  const tips = [];
  if (weakDomains[0])
    tips.push(
      `Parti dal <strong>${weakDomains[0].key}</strong> (${escapeHtml(weakDomains[0].name)}): pesa il ${weakDomains[0].weight}% dell’esame e qui rispondi bene solo nel ${weakDomains[0].rate}% dei casi.`,
    );
  if (weakTopics[0])
    tips.push(
      `L’argomento più debole è <strong>${escapeHtml(weakTopics[0].topic.label)}</strong> (${weakTopics[0].rate}% su ${weakTopics[0].total} domande): rileggi gli appunti e le trappole collegate.`,
    );
  if (items.length && blank / items.length > 0.03)
    tips.push(
      `Lasci senza risposta il ${pct(blank, items.length)}% delle domande: non ci sono penalità, rispondi sempre.`,
    );
  if (flagged.length >= 5 && pct(flagged.filter((i) => i.r === "correct").length, flagged.length) < 50)
    tips.push(
      "Le domande che segni come dubbie sono sbagliate più di metà delle volte: quando un dubbio resta, rileggi lo scenario cercando il vincolo decisivo.",
    );
  if (
    timed.length &&
    timed.every((entry) => entry.timeLimitMs && entry.durationMs < entry.timeLimitMs * 0.5) &&
    avg < PASS_RATIO * 100
  )
    tips.push(
      "Usi meno di metà del tempo disponibile ma resti sotto soglia: rallenta e confronta tutte le opzioni prima di scegliere.",
    );
  if (trend !== null && trend <= -5)
    tips.push(
      `Le ultime simulazioni sono in calo di ${-trend} punti: alterna i test con lo studio degli argomenti deboli invece di ripetere solo prove.`,
    );
  if (avg >= 80 && passed === history.length)
    tips.push("Sei stabilmente sopra soglia: passa ai test di livello Avanzato per avvicinarti all’esame reale.");
  if (!tips.length) tips.push("Completa altre simulazioni per avere indicazioni più precise.");

  const lastTen = history.slice(0, 10).reverse();

  return `
  <section class="screen stats-screen" aria-labelledby="stats-title">
    <div class="results-head">
      <div><div class="eyebrow">Analisi delle simulazioni</div><h1 id="stats-title">Statistiche<br><span>di studio</span></h1><p>Dati calcolati su ${history.length} simulazion${history.length === 1 ? "e" : "i"} completat${history.length === 1 ? "a" : "e"} in questo browser${detailed.length < history.length ? ` (dettaglio per domanda disponibile per ${detailed.length})` : ""}.</p></div>
      <button class="button secondary" type="button" data-action="stats-back"><span aria-hidden="true">←</span> Indietro</button>
    </div>

    <div class="stats-kpis">
      <div><strong>${history.length}</strong><span>Simulazioni</span></div>
      <div><strong>${avg}%</strong><span>Media</span></div>
      <div><strong>${Math.max(...rates)}%</strong><span>Migliore</span></div>
      <div><strong>${rates[0]}%</strong><span>Ultima</span></div>
      <div><strong>${passed}/${history.length}</strong><span>Sopra soglia 72%</span></div>
      <div><strong>${trend === null ? "—" : `${trend > 0 ? "+" : ""}${trend}`}</strong><span>Tendenza (punti)</span></div>
      <div><strong>${timed.length ? minutes(timed.reduce((s, e) => s + e.durationMs, 0) / timed.length) : "—"}</strong><span>Tempo medio</span></div>
      <div><strong>${items.length ? `${pct(blank, items.length)}%` : "—"}</strong><span>Senza risposta</span></div>
    </div>

    <section class="stats-card stats-advice" aria-labelledby="advice-title">
      <h2 id="advice-title">Dove migliorare</h2>
      <ul>${tips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
      ${
        weakDomains.length || weakTopics.length
          ? `<div class="stats-review-grid">
        <div><h3>Domini da ripassare</h3>${weakDomains.length ? `<ul class="stats-links">${weakDomains.map((row) => `<li><span><strong>${row.key}</strong> ${escapeHtml(row.name)} · ${row.rate}%</span><span><a href="${STUDY}appunti-domain-${row.key[1]}">Appunti</a> · <a href="${STUDY}consigli-domain-${row.key[1]}">Trappole</a> · <a href="${STUDY}verifica-domain-${row.key[1]}">Verifica</a></span></li>`).join("")}</ul>` : "<p>Nessun dominio sotto l’80%.</p>"}</div>
        <div><h3>Argomenti da ripassare</h3>${weakTopics.length ? `<ul class="stats-links">${weakTopics.map((row) => `<li><span>${escapeHtml(row.topic.label)} · ${row.rate}% <small>(${row.ok}/${row.total})</small></span><span><span class="domain-chip">${row.topic.domain}</span> <a href="${STUDY}${row.topic.doc}">Studia</a></span></li>`).join("")}</ul>` : "<p>Nessun argomento con abbastanza errori.</p>"}</div>
      </div>`
          : ""
      }
    </section>

    <section class="stats-card" aria-labelledby="trend-title">
      <h2 id="trend-title">Andamento</h2>
      <p class="stats-note">Ultime ${lastTen.length} simulazioni, dalla più vecchia alla più recente. La linea indica la soglia del 72%.</p>
      <div class="stats-trend">${lastTen
        .map((entry) => {
          const rate = pct(entry.correct, entry.total);
          const date = new Date(entry.date).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
          return `<div class="stats-trend-col" title="${escapeHtml(entry.title)} · ${rate}%"><span class="stats-trend-value">${rate}%</span><span class="stats-trend-bar ${entry.passed ? "good" : ""}" data-value="${rate}"></span><span class="stats-trend-date">${date}</span></div>`;
        })
        .join("")}<span class="stats-trend-threshold" aria-hidden="true"></span></div>
    </section>

    ${
      items.length
        ? `<section class="stats-card" aria-labelledby="domains-title">
      <h2 id="domains-title">Per dominio d’esame</h2>
      <p class="stats-note">Ordinati per priorità di ripasso: peso del dominio nell’esame × quota di risposte non corrette.</p>
      <table class="stats-table"><thead><tr><th>Dominio</th><th>Peso</th><th>Risposte corrette</th><th>Domande</th><th>Stato</th></tr></thead><tbody>
      ${domainRows
        .map((row) => {
          const l = level(row.rate);
          return `<tr><td><strong>${row.key}</strong> ${escapeHtml(row.name || "")}</td><td>${row.weight || "—"}%</td><td>${bar(row.rate, row.key)} ${row.rate}%</td><td>${row.ok}/${row.total}</td><td><span class="level-tag ${l.cls}">${l.label}</span></td></tr>`;
        })
        .join("")}
      </tbody></table>
    </section>

    <section class="stats-card" aria-labelledby="topics-title">
      <h2 id="topics-title">Per argomento</h2>
      <p class="stats-note">Argomenti riconosciuti automaticamente nel testo delle domande; una domanda può toccarne più d’uno.</p>
      <table class="stats-table"><thead><tr><th>Argomento</th><th>Dominio</th><th>Risposte corrette</th><th>Domande</th><th></th></tr></thead><tbody>
      ${topicRows.map((row) => `<tr><td>${escapeHtml(row.topic.label)}</td><td><span class="domain-chip">${row.topic.domain}</span></td><td>${bar(row.rate, row.topic.label)} ${row.rate}%</td><td>${row.ok}/${row.total}</td><td><a href="${STUDY}${row.topic.doc}">Studia</a></td></tr>`).join("")}
      </tbody></table>
    </section>

    <div class="stats-columns">
      <section class="stats-card" aria-labelledby="scenarios-title">
        <h2 id="scenarios-title">Per scenario</h2>
        <ul class="stats-rows">${scenarioRows.map((row) => `<li><span>${escapeHtml(row.key)}</span>${bar(row.rate, row.key)}<strong>${row.rate}%</strong></li>`).join("")}</ul>
      </section>
      <section class="stats-card" aria-labelledby="habits-title">
        <h2 id="habits-title">Abitudini d’esame</h2>
        <ul class="stats-rows">
          ${difficultyRows.map((row) => `<li><span>Livello ${escapeHtml(row.key)}</span>${bar(row.rate, row.key)}<strong>${row.rate}%</strong></li>`).join("")}
          <li><span>Domande segnate come dubbie</span>${bar(pct(flagged.filter((i) => i.r === "correct").length, flagged.length), "segnate")}<strong>${flagged.length ? `${pct(flagged.filter((i) => i.r === "correct").length, flagged.length)}%` : "—"}</strong></li>
          <li><span>Domande non segnate</span>${bar(pct(unflagged.filter((i) => i.r === "correct").length, unflagged.length), "non segnate")}<strong>${pct(unflagged.filter((i) => i.r === "correct").length, unflagged.length)}%</strong></li>
        </ul>
        <p class="stats-note">Se le domande segnate hanno una percentuale simile alle altre, i tuoi dubbi non sono ben calibrati: fidati di più del primo ragionamento o rileggi meglio lo scenario.</p>
      </section>
    </div>`
        : `<section class="stats-card"><p>Le simulazioni salvate prima di questo aggiornamento non contengono il dettaglio per domanda: completa una nuova simulazione per vedere domini e argomenti.</p></section>`
    }
  </section>`;
}

// Larghezza/altezza delle barre: impostata da JS per non usare attributi style= nel markup
export function applyStatsBars(root) {
  for (const el of root.querySelectorAll("[data-value]")) el.style.setProperty("--value", `${el.dataset.value}%`);
}
