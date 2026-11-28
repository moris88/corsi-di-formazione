// Statistiche delle simulazioni: classificazione dei quesiti per dominio e argomento
// e schermata di analisi costruita sullo storico salvato in localStorage.

import { escapeHtml } from "../utils.js";

const PASS_RATIO = 0.72;
const STUDY = "./studio.html?doc=";

export const DOMAINS = {
  D1: { name: "Agenti e workflow", weight: 17 },
  D2: { name: "Applicazioni e integrazione", weight: 20 },
  D3: { name: "Claude Code", weight: 8 },
  D4: { name: "Eval, test e debug", weight: 10 },
  D5: { name: "Scelta e ottimizzazione dei modelli", weight: 12 },
  D6: { name: "Prompt e context engineering", weight: 15 },
  D7: { name: "Sicurezza e protezione", weight: 8 },
  D8: { name: "Strumenti e MCP", weight: 10 },
};

// Argomenti riconosciuti nel testo di domanda, opzioni e spiegazione (in inglese, come le banche).
// L'ordine conta solo per la visualizzazione; una domanda può toccare più argomenti.
const TOPICS = [
  {
    id: "agents",
    label: "Workflow o agente, supervisore e sottoagenti",
    domain: "D1",
    doc: "domain-1",
    re: /\bagents?\b|workflow|supervisor|subagent|sub-agent|Agent SDK|LangGraph|PydanticAI|Strands/i,
  },
  {
    id: "api",
    label: "Claude API: messaggi, streaming e visione",
    domain: "D2",
    doc: "domain-2",
    re: /Messages API|streaming|\bvision\b|asynchronous|REST|third-party/i,
  },
  {
    id: "batch",
    label: "Batch API e tempo reale",
    domain: "D2",
    doc: "domain-2",
    re: /Batch(es)? API|batch|real-?time|overnight/i,
  },
  {
    id: "config",
    label: "Configurazione: CLAUDE.md, settings.json, versioni",
    domain: "D2",
    doc: "domain-2",
    re: /CLAUDE\.md|settings\.json|pinn|prompt version|plugin/i,
  },
  {
    id: "claudecode",
    label: "Claude Code: sessioni, comandi, headless",
    domain: "D3",
    doc: "domain-3",
    re: /Claude Code|slash command|headless|\bskills?\b/i,
  },
  {
    id: "debug",
    label: "Debug, errori e analisi delle tracce",
    domain: "D4",
    doc: "domain-4",
    re: /\btrace|debug|error handling|failure mode|\beval/i,
  },
  {
    id: "models",
    label: "Scelta del modello: Opus, Sonnet, Haiku",
    domain: "D5",
    doc: "domain-5",
    re: /\bOpus\b|\bSonnet\b|\bHaiku\b|model selection|latency|adaptive thinking|extended thinking|effort/i,
  },
  {
    id: "tokens",
    label: "Token, costi e prompt caching",
    domain: "D5",
    doc: "domain-5",
    re: /\btokens?\b|prompt cach|cache|cost|context window|temperature|sampling/i,
  },
  {
    id: "context",
    label: "Gestione del contesto",
    domain: "D6",
    doc: "domain-6",
    re: /context (window|drift|bloat)|compaction|prun|isolat/i,
  },
  {
    id: "prompting",
    label: "Prompt engineering ed esempi few-shot",
    domain: "D6",
    doc: "domain-6",
    re: /few-shot|system prompt|instruction|prompt engineering|zero-shot|multi-shot/i,
  },
  {
    id: "output",
    label: "Output strutturato e validazione",
    domain: "D6",
    doc: "domain-6",
    re: /structured output|schema|validat|defensive|pars(e|ing)|JSON/i,
  },
  {
    id: "injection",
    label: "Prompt injection e input non fidato",
    domain: "D7",
    doc: "domain-7",
    re: /prompt injection|untrusted|jailbreak|inject|leak|\bPII\b/i,
  },
  {
    id: "guardrails",
    label: "Guardrail, privilegio minimo e hook",
    domain: "D7",
    doc: "domain-7",
    re: /guardrail|least[- ]privilege|\bhooks?\b|destructive|permission/i,
  },
  {
    id: "secrets",
    label: "Segreti, chiavi API e accessi",
    domain: "D7",
    doc: "domain-7",
    re: /secret|API keys?|credential|authentication|authorization/i,
  },
  {
    id: "tools",
    label: "Strumenti: descrizioni, errori e approvazioni",
    domain: "D8",
    doc: "domain-8",
    re: /tool use|function calling|tool description|client-side|server-side|approval/i,
  },
  { id: "mcp", label: "Server MCP, risorse e prompt", domain: "D8", doc: "domain-8", re: /\bMCP\b|stdio|socket/i },
  {
    id: "custom",
    label: "Strumenti integrati, Skill o MCP",
    domain: "D8",
    doc: "domain-8",
    re: /built-in tool|custom tool|\bSkills?\b/i,
  },
];
const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

// Dominio indicato nel nome dello scenario ("Domain N – …"), se presente
function scenarioDomain(scenario) {
  const match = scenario.match(/^domain\s+(\d)/i);
  return match ? `D${match[1]}` : null;
}

export function classifyQuestion(question) {
  const text = [question.prompt, ...question.options.map((option) => option.text), question.explanation].join("\n");
  // Se lo scenario indica il dominio ("Domain N – …") la domanda appartiene solo a quello: gli argomenti sono
  // quelli riconosciuti nel testo ma limitati a quel dominio, così le statistiche non si disperdono
  const explicit = scenarioDomain(question.scenario);
  const topics = TOPICS.filter((topic) => (!explicit || topic.domain === explicit) && topic.re.test(text)).map(
    (topic) => topic.id,
  );
  if (explicit) return { topics, domains: [explicit] };
  const domains = [...new Set(topics.map((id) => TOPIC_BY_ID.get(id).domain))];
  if (!domains.length) domains.push("D2");
  return { topics, domains };
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
  const scored = history.filter((entry) => entry.score);
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
    : null;

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
      <div><strong>${avgScore ?? "—"}</strong><span>Punteggio stimato medio</span></div>
      <div><strong>${avg}%</strong><span>Media risposte corrette</span></div>
      <div><strong>${Math.max(...rates)}%</strong><span>Migliore</span></div>
      <div><strong>${rates[0]}%</strong><span>Ultima</span></div>
      <div><strong>${passed}/${history.length}</strong><span>Superate</span></div>
      <div><strong>${trend === null ? "—" : `${trend > 0 ? "+" : ""}${trend}`}</strong><span>Tendenza (punti)</span></div>
      <div><strong>${timed.length ? minutes(timed.reduce((s, e) => s + e.durationMs, 0) / timed.length) : "—"}</strong><span>Tempo medio</span></div>
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

// Punteggio stimato su scala 100–1000, come l'esame ufficiale (soglia 720).
// 1) accuratezza per dominio (una domanda conta in ogni dominio che tocca);
// 2) media pesata con i pesi ufficiali dei domini (un dominio senza domande usa l'accuratezza complessiva);
// 3) conversione lineare a tratti: 0% → 100, 72% → 720, 100% → 1000.
export const PASS_SCORE = 720;
export function scaledScore(items) {
  const overall = items.length ? items.filter((item) => item.r === "correct").length / items.length : 0;
  const domains = Object.entries(DOMAINS).map(([key, domain]) => {
    const inDomain = items.filter((item) => (item.d || []).includes(key));
    const ok = inDomain.filter((item) => item.r === "correct").length;
    return { key, ...domain, total: inDomain.length, ok, rate: inDomain.length ? ok / inDomain.length : overall };
  });
  const weighted = domains.reduce((sum, d) => sum + d.rate * d.weight, 0) / 100;
  const score =
    weighted <= PASS_RATIO
      ? 100 + (weighted / PASS_RATIO) * (PASS_SCORE - 100)
      : PASS_SCORE + ((weighted - PASS_RATIO) / (1 - PASS_RATIO)) * (1000 - PASS_SCORE);
  return { score: Math.round(score), weighted, domains };
}

// Messaggio motivazionale a fine simulazione: 10 frasi per fascia di punteggio,
// scelte a caso evitando di ripetere l'ultima mostrata in quella fascia.
const MOTIVATION = {
  low: [
    "Così non ci siamo: torna sulla teoria e ripassa bene i domini prima di riprovare.",
    "Il punteggio dice che le basi non sono ancora solide: riparti dagli appunti, non dai test.",
    "Fermati un attimo: altre simulazioni adesso servono a poco, prima serve studiare i concetti.",
    "Non scoraggiarti, ma serve un ripasso serio: parti dal dominio con il peso più alto.",
    "Siamo ancora lontani dalla soglia: dedica qualche giorno alla teoria e alle trappole d’esame.",
    "Ogni esperto è partito da qui: rileggi la guida d’esame e costruisci le fondamenta.",
    "Troppi errori per affidarsi all’intuito: studia il perché di ogni risposta corretta.",
    "Così l’esame sarebbe in salita: riprendi gli appunti dominio per dominio, con calma.",
    "Prima la teoria, poi i test: è il modo più rapido per alzare davvero il punteggio.",
    "Non è il momento di fare un’altra simulazione: è il momento di aprire il materiale di studio.",
  ],
  close: [
    "Dai, ce la puoi fare: ripassa ancora un po’ e la soglia è tua.",
    "Ci sei quasi! Qualche risposta in più e saresti oltre il 720.",
    "Manca davvero poco: concentrati sugli errori di questa prova e riprova.",
    "Sei a un passo dalla soglia: ripassa i domini più deboli e torna più forte.",
    "Peccato, per poco! Rivedi le spiegazioni delle risposte sbagliate: lì c’è il salto che ti manca.",
    "Il lavoro si vede, ora serve l’ultimo sforzo: ripasso mirato e poi un’altra simulazione.",
    "Quasi! Spesso basta leggere con più attenzione i vincoli dello scenario.",
    "Non mollare proprio adesso: sei vicinissimo, ripassa le trappole d’esame.",
    "Ancora un piccolo passo: guarda quali argomenti ti hanno tradito e sistemali.",
    "La soglia è lì, a portata di mano: un altro giro di ripasso e ci arrivi.",
  ],
  passed: [
    "Bene, hai superato questa simulazione: non cullarti sugli allori e continua a migliorare.",
    "Promosso in simulazione! Ora prova un test più difficile per metterti alla prova davvero.",
    "Ottimo risultato, ma l’esame vero non perdona: ripassa comunque gli errori.",
    "Sopra la soglia, complimenti! Mantieni il ritmo e punta a un margine più ampio.",
    "Ce l’hai fatta! Ricorda però che un buon margine sopra il 720 ti mette al sicuro.",
    "Prova superata: adesso consolida, rivedendo le domande in cui hai esitato.",
    "Bel lavoro! Non fermarti qui: la costanza è ciò che fa la differenza il giorno dell’esame.",
    "Simulazione superata: ottimo segnale, ma continua ad allenarti su scenari nuovi.",
    "Bravo, sei sopra la soglia! Ora alza l’asticella con i test di livello Avanzato.",
    "Superata! Goditi il risultato, poi torna sui domini dove hai perso più punti.",
  ],
};
const MOTIVATION_KEY = "ccdvf-simulation-motivation-last";

export function pickMotivation(score) {
  const band = score >= PASS_SCORE ? "passed" : score >= 650 ? "close" : "low";
  const phrases = MOTIVATION[band];
  let last = {};
  try {
    last = JSON.parse(localStorage.getItem(MOTIVATION_KEY) || "{}");
  } catch {
    /* senza archiviazione locale si sceglie e basta */
  }
  let index = Math.floor(Math.random() * phrases.length);
  if (index === last[band]) index = (index + 1 + Math.floor(Math.random() * (phrases.length - 1))) % phrases.length;
  try {
    localStorage.setItem(MOTIVATION_KEY, JSON.stringify({ ...last, [band]: index }));
  } catch {
    /* idem */
  }
  return { band, text: phrases[index] };
}
