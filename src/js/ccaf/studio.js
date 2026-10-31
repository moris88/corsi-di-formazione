import { alertDialog } from "../dialog.js";

const documents = [
  {
    id: "guide",
    title: "Guida d’esame",
    group: "Orientamento",
    path: "../../assets/ccaf/guide/guida_d_esame.md",
    description: "Panoramica, struttura dell’esame e piano di preparazione.",
    index: "00",
  },
  {
    id: "prerequisiti",
    title: "Prerequisiti tecnici · Il pre-corso",
    group: "Orientamento",
    path: "../../assets/ccaf/guide/prerequisiti.md",
    description: "I concetti di base dati per scontati dal corso: JSON, YAML, HTTP, database, OCR e altro.",
    index: "P0",
  },
  {
    id: "vocabolario",
    title: "Vocabolario dei termini tecnici",
    group: "Orientamento",
    path: "../../assets/ccaf/guide/vocabolario.md",
    description: "Glossario alfabetico dei termini tecnici dell’esame.",
    index: "P1",
  },
  {
    id: "appunti-domain-1",
    title: "Dominio 1 · Architettura agentica e orchestrazione",
    group: "Domini d’esame",
    path: "../../assets/ccaf/appunti/d1-spiegato.md",
    description: "Spiegazione passo passo dell’architettura agentica e dell’orchestrazione.",
    slidesPdf: "../../assets/ccaf/appunti/presentazioni/Dominio 1 – Architettura agentica e orchestrazione.pdf",
    index: "01",
  },
  {
    id: "appunti-domain-2",
    title: "Dominio 2 · Progettazione degli strumenti e integrazione MCP",
    group: "Domini d’esame",
    path: "../../assets/ccaf/appunti/d2-spiegato.md",
    description: "Spiegazione passo passo di design degli strumenti e MCP.",
    slidesPdf: "../../assets/ccaf/appunti/presentazioni/Dominio 2 – Design dei tool e integrazione MCP.pdf",
    index: "02",
  },
  {
    id: "appunti-domain-3",
    title: "Dominio 3 · Configurazione e workflow di Claude Code",
    group: "Domini d’esame",
    path: "../../assets/ccaf/appunti/d3-spiegato.md",
    description: "Spiegazione passo passo di configurazione e workflow di Claude Code.",
    slidesPdf: "../../assets/ccaf/appunti/presentazioni/Dominio 3 – Configurazione e workflow di Claude Code.pdf",
    index: "03",
  },
  {
    id: "appunti-domain-4",
    title: "Dominio 4 · Prompt engineering e output strutturato",
    group: "Domini d’esame",
    path: "../../assets/ccaf/appunti/d4-spiegato.md",
    description: "Spiegazione passo passo di prompt engineering e output strutturato.",
    slidesPdf: "../../assets/ccaf/appunti/presentazioni/Dominio 4 – Prompt engineering e output strutturato.pdf",
    index: "04",
  },
  {
    id: "appunti-domain-5",
    title: "Dominio 5 · Gestione del contesto e affidabilità",
    group: "Domini d’esame",
    path: "../../assets/ccaf/appunti/d5-spiegato.md",
    description: "Spiegazione passo passo di contesto e affidabilità.",
    slidesPdf: "../../assets/ccaf/appunti/presentazioni/Dominio 5 – Contesto e affidabilità.pdf",
    index: "05",
  },
  {
    id: "deep-domain-1",
    title: "Dominio 1 · Architettura agentica e orchestrazione",
    group: "Domini approfonditi",
    path: "../../assets/ccaf/appunti/domains/d1-agentic-architecture.md",
    description: "Approfondimento tecnico completo su loop agentico, sistemi multi-agente, hook e sessioni.",
    index: "D1",
  },
  {
    id: "deep-domain-2",
    title: "Dominio 2 · Progettazione degli strumenti e integrazione MCP",
    group: "Domini approfonditi",
    path: "../../assets/ccaf/appunti/domains/d2-tool-design-mcp.md",
    description: "Approfondimento tecnico completo su descrizioni e schemi dei tool, errori, tool_choice e MCP.",
    index: "D2",
  },
  {
    id: "deep-domain-3",
    title: "Dominio 3 · Configurazione e workflow di Claude Code",
    group: "Domini approfonditi",
    path: "../../assets/ccaf/appunti/domains/d3-claude-code-config.md",
    description: "Approfondimento tecnico completo su CLAUDE.md, rules, skill, plan mode, subagenti e CI/CD.",
    index: "D3",
  },
  {
    id: "deep-domain-4",
    title: "Dominio 4 · Prompt engineering e output strutturato",
    group: "Domini approfonditi",
    path: "../../assets/ccaf/appunti/domains/d4-prompt-engineering.md",
    description: "Approfondimento tecnico completo su criteri, few-shot, output strutturato, batch e cache.",
    index: "D4",
  },
  {
    id: "deep-domain-5",
    title: "Dominio 5 · Gestione del contesto e affidabilità",
    group: "Domini approfonditi",
    path: "../../assets/ccaf/appunti/domains/d5-context-reliability.md",
    description: "Approfondimento tecnico completo su contesto, escalation, errori, provenienza e compattazione.",
    index: "D5",
  },
  {
    id: "file-claude",
    title: "D3 · CLAUDE.md, rules, skill e settings",
    group: "Approfondimenti",
    path: "../../assets/ccaf/appunti/approfondimenti/file_CLAUDE.md",
    description:
      "Livelli di configurazione, cosa viene caricato e quando, priorità, chiavi di skill, agent, settings, hook e MCP.",
    index: "A1",
  },
  {
    id: "hook",
    title: "D1/D3 · Hook e controllo deterministico",
    group: "Approfondimenti",
    path: "../../assets/ccaf/appunti/approfondimenti/hook.md",
    description: "Prompt vs hook, eventi, exit code, PreToolUse e PostToolUse in Claude Code e nell’Agent SDK.",
    index: "A2",
  },
  {
    id: "errori-mcp",
    title: "D2 · Errori dei tool MCP",
    group: "Approfondimenti",
    path: "../../assets/ccaf/appunti/approfondimenti/errori_MCP.md",
    description: "Categorie di errore, risposte strutturate, retry nel tool o nell’agente, il caso “nessun risultato”.",
    index: "A3",
  },
  {
    id: "sessioni",
    title: "D1/D5 · Sessioni, resume, fork e subagent",
    group: "Approfondimenti",
    path: "../../assets/ccaf/appunti/approfondimenti/sessioni.md",
    description:
      "Continuare, riprendere, biforcare o ripartire; cosa vede un subagent; context: fork; compact e clear.",
    index: "A4",
  },
  {
    id: "multi-agente",
    title: "D1/D5 · Sistemi multi-agente",
    group: "Approfondimenti",
    path: "../../assets/ccaf/appunti/approfondimenti/multi_agente.md",
    description:
      "Coordinatore e subagent, delega con Task, contesto isolato, strumenti per ruolo, provenienza, errori parziali e cicli di rifinitura.",
    index: "A5",
  },
  {
    id: "api-code-sdk",
    title: "Claude API, Claude Code e Agent SDK",
    group: "Approfondimenti",
    path: "../../assets/ccaf/appunti/approfondimenti/api_code_sdk.md",
    description:
      "Cosa offre ciascuno, chi esegue il loop agentico, quando usare l'uno o l'altro e quale strumento c'è dietro ogni scenario d'esame.",
    index: "A6",
  },
  {
    id: "verifica-domain-1",
    title: "Verifica · Dominio 1",
    group: "Esercitazioni",
    path: "../../assets/ccaf/appunti/d1-verifica.md",
    description: "Esercitazione sull’architettura agentica e l’orchestrazione.",
    index: "V1",
  },
  {
    id: "verifica-domain-2",
    title: "Verifica · Dominio 2",
    group: "Esercitazioni",
    path: "../../assets/ccaf/appunti/d2-verifica.md",
    description: "Esercitazione su design degli strumenti e MCP.",
    index: "V2",
  },
  {
    id: "verifica-domain-3",
    title: "Verifica · Dominio 3",
    group: "Esercitazioni",
    path: "../../assets/ccaf/appunti/d3-verifica.md",
    description: "Esercitazione su configurazione di Claude Code.",
    index: "V3",
  },
  {
    id: "verifica-domain-4",
    title: "Verifica · Dominio 4",
    group: "Esercitazioni",
    path: "../../assets/ccaf/appunti/d4-verifica.md",
    description: "Esercitazione su prompt engineering e output strutturato.",
    index: "V4",
  },
  {
    id: "verifica-domain-5",
    title: "Verifica · Dominio 5",
    group: "Esercitazioni",
    path: "../../assets/ccaf/appunti/d5-verifica.md",
    description: "Esercitazione su contesto e affidabilità.",
    index: "V5",
  },
  {
    id: "consigli-domain-1",
    title: "Trappole · Dominio 1",
    group: "Trappole d’esame",
    path: "../../assets/ccaf/consigli/consigli_D1.md",
    description: "Risposte sbagliate ricorrenti su architettura agentica e orchestrazione.",
    index: "T1",
  },
  {
    id: "consigli-domain-2",
    title: "Trappole · Dominio 2",
    group: "Trappole d’esame",
    path: "../../assets/ccaf/consigli/consigli_D2.md",
    description: "Risposte sbagliate ricorrenti su design degli strumenti e MCP.",
    index: "T2",
  },
  {
    id: "consigli-domain-3",
    title: "Trappole · Dominio 3",
    group: "Trappole d’esame",
    path: "../../assets/ccaf/consigli/consigli_D3.md",
    description: "Risposte sbagliate ricorrenti su configurazione e workflow di Claude Code.",
    index: "T3",
  },
  {
    id: "consigli-domain-4",
    title: "Trappole · Dominio 4",
    group: "Trappole d’esame",
    path: "../../assets/ccaf/consigli/consigli_D4.md",
    description: "Risposte sbagliate ricorrenti su prompt engineering e output strutturato.",
    index: "T4",
  },
  {
    id: "consigli-domain-5",
    title: "Trappole · Dominio 5",
    group: "Trappole d’esame",
    path: "../../assets/ccaf/consigli/consigli_D5.md",
    description: "Risposte sbagliate ricorrenti su contesto e affidabilità.",
    index: "T5",
  },
  {
    id: "strategie-esame",
    title: "Strategie d’esame",
    group: "Trappole d’esame",
    path: "../../assets/ccaf/consigli/strategie_esame.md",
    description: "Come ragionare sulle domande, trabocchetti ricorrenti e gestione di tempo e ansia.",
    index: "T6",
  },
  {
    id: "official-pdf",
    title: "Guida ufficiale in italiano · PDF",
    group: "Riferimenti",
    path: "../../assets/ccaf/instructor_CCAF%2BExam%2BGuide_it.pdf",
    description: "Manuale ufficiale in formato PDF.",
    index: "↗",
    external: true,
  },
  {
    id: "official-pdf-en",
    title: "Guida ufficiale in inglese · PDF",
    group: "Riferimenti",
    path: "../../assets/ccaf/instructor_CCAF%2BExam%2BGuide_en.pdf",
    description: "Manuale ufficiale in lingua originale (inglese), in formato PDF.",
    index: "↗",
    external: true,
  },
  {
    id: "exam-policy-pdf",
    title: "Politica d’esame Anthropic · PDF",
    group: "Riferimenti",
    path: "../../assets/ccaf/Anthropic%2BCertification%2BExam%2BPolicy.pdf",
    description: "Regole e policy che si applicano all’esame di certificazione.",
    index: "↗",
    external: true,
  },
  {
    id: "terms-pdf",
    title: "Termini e condizioni di certificazione · PDF",
    group: "Riferimenti",
    path: "../../assets/ccaf/Certification%2BTerms%2Band%2BConditions.pdf",
    description: "Termini e condizioni della certificazione.",
    index: "↗",
    external: true,
  },
  {
    id: "feedback",
    title: "Segnala un errore / Lascia un feedback",
    group: "Riferimenti",
    path: "https://github.com/moris88/corsi-di-formazione/issues",
    description: "Apri una issue su GitHub per segnalare errori o proporre miglioramenti.",
    index: "!",
    external: true,
  },
];

const groups = [...new Set(documents.map((document) => document.group))];
const titleNode = document.querySelector("#article-title");
const descriptionNode = document.querySelector("#article-description");
const categoryNode = document.querySelector("#article-category");
const metaNode = document.querySelector("#article-meta");
const contentNode = document.querySelector("#article-content");
const statusNode = document.querySelector("#reader-status");
const tocNode = document.querySelector("#toc-list");
const tocEmptyNode = document.querySelector("#toc-empty");
const mobileTocNode = document.querySelector("#mobile-toc");
const mobileTocListNode = document.querySelector("#mobile-toc-list");
const progressFill = document.querySelector("#read-progress-fill");
const _searchInputs = [...document.querySelectorAll("[data-search]")];
let activeDocumentId = "";
let renderedHeadings = [];
let currentDocumentIndex = -1;
let observer = null;

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

function safeHref(value) {
  const href = String(value || "")
    .replace(/&amp;/g, "&")
    .trim();
  if (/^(https?:|mailto:|\.\.?\/|\/|#)/i.test(href)) return escapeHtml(href);
  return "#";
}

function inlineMarkdown(source) {
  let text = escapeHtml(source);
  const code = [];
  text = text.replace(/`([^`]+)`/g, (_match, value) => {
    const token = `@@INLINECODE${code.length}@@`;
    code.push(`<code>${value}</code>`);
    return token;
  });
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, href) => {
    const safe = safeHref(href);
    if (safe === "#") return alt;
    return `<img src="${safe}" alt="${alt}" loading="lazy">`;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const safe = safeHref(href);
    if (safe === "#") return label;
    const external = /^https?:/i.test(safe);
    return `<a href="${safe}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  return text.replace(/@@INLINECODE(\d+)@@/g, (_match, index) => code[Number(index)]);
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

function renderMarkdown(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const output = [];
  const headings = [];
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
      // La recinzione di chiusura deve avere almeno tanti backtick quanti l'apertura,
      // così un blocco ```` può contenere esempi con ```
      const fence = trimmed.match(/^`+/)[0];
      const language = trimmed.slice(fence.length).trim();
      const closing = new RegExp(`^${fence}\`*\\s*$`);
      const codeLines = [];
      index++;
      while (index < lines.length && !closing.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index++;
      }
      if (index < lines.length) index++;
      output.push(
        `<pre>${language ? `<span class="code-language">${escapeHtml(language)}</span>` : ""}<button class="copy-code" type="button" data-copy="true">Copia</button><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].replace(/\s+#+\s*$/, "");
      const id = slugify(text);
      if (level >= 2 && level <= 4) headings.push({ id, text: plainHeading(text), level });
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
      output.push(`<blockquote>${renderMarkdown(quote.join("\n")).html}</blockquote>`);
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
  return { html: output.join("\n"), headings };
}

const sourceCache = new Map();
let searchQuery = "";
let searchToken = 0;

function isSearchable(item) {
  return !item.external && item.group !== "Esercitazioni";
}

function normalize(value) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function plainText(markdown) {
  return markdown
    .replace(/```[^\n]*\n/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadSources() {
  const pending = documents.filter((item) => isSearchable(item) && !sourceCache.has(item.id));
  await Promise.all(
    pending.map(async (item) => {
      try {
        const response = await fetch(new URL(item.path, window.location.href));
        if (!response.ok) return;
        const text = plainText(await response.text());
        sourceCache.set(item.id, { text, norm: normalize(text) });
      } catch {}
    }),
  );
}

function findMatches(item, query) {
  const source = sourceCache.get(item.id);
  if (!source || !isSearchable(item)) return null;
  let count = 0;
  let first = -1;
  let position = source.norm.indexOf(query);
  while (position !== -1) {
    if (first === -1) first = position;
    count++;
    position = source.norm.indexOf(query, position + query.length);
  }
  if (!count) return null;
  const start = Math.max(0, first - 50);
  const end = Math.min(source.text.length, first + query.length + 70);
  const snippet =
    (start > 0 ? "…" : "") +
    escapeHtml(source.text.slice(start, first)) +
    `<mark>${escapeHtml(source.text.slice(first, first + query.length))}</mark>` +
    escapeHtml(source.text.slice(first + query.length, end)) +
    (end < source.text.length ? "…" : "");
  return { count, snippet };
}

function renderCatalog(filter = "") {
  const query = normalize(filter.trim());
  const fullText = query.length >= 2;
  const navs = [document.querySelector("#catalog-nav"), document.querySelector("#mobile-catalog-nav")];
  for (const nav of navs) {
    nav.innerHTML = groups
      .map((group) => {
        const items = documents
          .filter((item) => item.group === group)
          .map((item) => ({
            item,
            inTitle: normalize(`${item.title} ${item.description} ${item.group}`).includes(query),
            matches: fullText ? findMatches(item, query) : null,
          }))
          .filter((entry) => entry.inTitle || entry.matches);
        if (!items.length) return "";
        return `<section class="nav-group"><h2 class="nav-group-title">${escapeHtml(group)}</h2><div class="doc-list">${items
          .map(({ item, matches }) => {
            const extra = matches
              ? `<span class="doc-hits">${matches.count} ${matches.count === 1 ? "risultato" : "risultati"}</span><span class="doc-snippet">${matches.snippet}</span>`
              : "";
            return item.external
              ? `<a class="doc-link" href="${escapeHtml(item.path)}" target="_blank" rel="noopener"><span class="doc-index">${item.index}</span><span class="doc-title">${escapeHtml(item.title)}</span></a>`
              : `<button class="doc-link" type="button" data-doc="${escapeHtml(item.id)}" aria-current="${activeDocumentId === item.id ? "page" : "false"}"><span class="doc-index">${item.index}</span><span class="doc-title">${escapeHtml(item.title)}${extra}</span></button>`;
          })
          .join("")}</div></section>`;
      })
      .join("");
    if (!nav.textContent.trim()) nav.innerHTML = '<p class="no-results">Nessun materiale trovato.</p>';
  }
}

function highlightContent(filter) {
  const query = normalize(filter.trim());
  if (query.length < 2) return;
  const walker = document.createTreeWalker(contentNode, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let first = null;
  for (const node of nodes) {
    if (node.parentElement.closest("button, mark")) continue;
    const text = node.nodeValue;
    const norm = normalize(text);
    if (norm.length !== text.length || !norm.includes(query)) continue;
    const fragment = document.createDocumentFragment();
    let last = 0;
    let position = norm.indexOf(query);
    while (position !== -1) {
      fragment.append(text.slice(last, position));
      const mark = document.createElement("mark");
      mark.className = "search-hit";
      mark.textContent = text.slice(position, position + query.length);
      fragment.append(mark);
      first ||= mark;
      last = position + query.length;
      position = norm.indexOf(query, last);
    }
    fragment.append(text.slice(last));
    node.replaceWith(fragment);
  }
  first?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function loadDocument(id, options = {}) {
  const item = documents.find((documentItem) => documentItem.id === id && !documentItem.external);
  if (!item) return;
  const index = documents.filter((doc) => !doc.external).findIndex((doc) => doc.id === id);
  currentDocumentIndex = index;
  activeDocumentId = id;
  renderCatalog(document.querySelector("#catalog-search").value || "");
  document.querySelector("#previous-doc").disabled = index <= 0;
  document.querySelector("#next-doc").disabled = index >= documents.filter((doc) => !doc.external).length - 1;
  categoryNode.textContent = item.group;
  titleNode.textContent = item.title;
  descriptionNode.textContent = item.description;
  metaNode.innerHTML = `<span><b>${item.index}</b> · Materiale di studio</span><span>Formato <b>Markdown</b></span>`;
  contentNode.hidden = true;
  contentNode.innerHTML = "";
  statusNode.hidden = false;
  statusNode.className = "status";
  statusNode.textContent = "Caricamento del documento…";
  tocNode.innerHTML = "";
  mobileTocListNode.innerHTML = "";
  tocEmptyNode.hidden = true;
  mobileTocNode.hidden = true;
  if (!options.keepScroll) window.scrollTo({ top: 0, behavior: "auto" });
  const mobileCatalog = document.querySelector(".mobile-catalog");
  if (mobileCatalog.open) mobileCatalog.open = false;
  history.replaceState(
    null,
    "",
    `?doc=${encodeURIComponent(item.id)}${options.anchor ? `#${encodeURIComponent(options.anchor)}` : ""}`,
  );
  try {
    const response = await fetch(new URL(item.path, window.location.href), { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const source = await response.text();
    const rendered = renderMarkdown(source);
    const pdfLinks = [
      item.slidesPdf &&
        `<a href="${escapeHtml(encodeURI(item.slidesPdf))}" target="_blank" rel="noopener" class="pdf-download">Presentazione</a>`,
    ].filter(Boolean);
    contentNode.innerHTML = pdfLinks.length
      ? `<p class="pdf-links">${pdfLinks.join("")}</p>${rendered.html}`
      : rendered.html;
    renderedHeadings = rendered.headings;
    statusNode.hidden = true;
    contentNode.hidden = false;
    renderToc(rendered.headings);
    updateProgress();
    observeHeadings();
    if (options.highlight) highlightContent(options.highlight);
    if (options.anchor) document.getElementById(options.anchor)?.scrollIntoView({ behavior: "auto", block: "start" });
  } catch (_error) {
    statusNode.hidden = false;
    statusNode.className = "status error";
    statusNode.innerHTML = `Impossibile caricare il documento. Apri il portale tramite un server locale e riprova. <button type="button" id="retry-load">Riprova</button>`;
    document.querySelector("#retry-load")?.addEventListener("click", () => loadDocument(id, { keepScroll: true }));
  }
}

function renderToc(headings) {
  const links = headings
    .map(
      (heading) =>
        `<a class="toc-link level-${heading.level}" href="#${encodeURIComponent(heading.id)}" data-toc="${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a>`,
    )
    .join("");
  tocNode.innerHTML = links;
  mobileTocListNode.innerHTML = links;
  const empty = headings.length === 0;
  tocEmptyNode.hidden = !empty;
  mobileTocNode.hidden = empty;
}

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
}

function observeHeadings() {
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      document.querySelectorAll("[data-toc]").forEach((link) => {
        link.classList.toggle("active", link.dataset.toc === visible.target.id);
      });
    },
    { rootMargin: "-90px 0px -72% 0px", threshold: 0 },
  );
  renderedHeadings.forEach((heading) => {
    const node = document.getElementById(heading.id);
    if (node) observer.observe(node);
  });
}

async function applySearch(value) {
  searchQuery = value;
  renderCatalog(value);
  document.querySelectorAll("[data-search]").forEach((input) => {
    if (input.value !== value) input.value = value;
  });
  if (value.trim().length < 2) return;
  const token = ++searchToken;
  await loadSources();
  if (token === searchToken) renderCatalog(value);
}

document.querySelectorAll("[data-search]").forEach((input) => {
  input.addEventListener("input", () => applySearch(input.value));
});
document.querySelectorAll("nav").forEach((nav) => {
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-doc]");
    if (button) loadDocument(button.dataset.doc, { highlight: searchQuery });
  });
});
document.querySelectorAll("nav.toc-list").forEach((nav) => {
  nav.addEventListener("click", (event) => {
    const link = event.target.closest("[data-toc]");
    if (!link) return;
    event.preventDefault();
    document.getElementById(link.dataset.toc)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const mobileToc = document.querySelector("#mobile-toc");
    if (mobileToc.open) mobileToc.open = false;
  });
});
document.querySelector("#previous-doc").addEventListener("click", () => {
  const list = documents.filter((doc) => !doc.external);
  if (currentDocumentIndex > 0) loadDocument(list[currentDocumentIndex - 1].id);
});
document.querySelector("#next-doc").addEventListener("click", () => {
  const list = documents.filter((doc) => !doc.external);
  if (currentDocumentIndex < list.length - 1) loadDocument(list[currentDocumentIndex + 1].id);
});
// Condivide il link al documento aperto (con la sezione nell'hash): menu di condivisione del sistema
// dove disponibile (mobile), altrimenti copia negli appunti e lo conferma con una finestra di dialogo
document.querySelector("#share-doc").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const url = window.location.href;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title: document.title, url });
    } catch {
      // Condivisione annullata dall'utente
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    button.classList.add("is-done");
    await alertDialog({
      title: "Link copiato",
      message: "Il link a questa pagina (con la sezione aperta) è negli appunti: incollalo dove vuoi condividerlo.",
      detail: url,
    });
  } catch {
    await alertDialog({
      title: "Copia non riuscita",
      message: "Il browser non ha permesso di copiare il link. Selezionalo qui sotto e copialo a mano.",
      detail: url,
    });
  }
  button.classList.remove("is-done");
});
// Link tra documenti del portale (./studio.html?doc=<id>#<sezione>): si aprono senza ricaricare
contentNode.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank") return;
  const url = new URL(link.getAttribute("href"), window.location.href);
  const id = url.searchParams.get("doc");
  if (url.pathname !== window.location.pathname || !id) return;
  if (!documents.some((item) => item.id === id && !item.external)) return;
  event.preventDefault();
  loadDocument(id, { anchor: decodeURIComponent(url.hash.slice(1)) });
});
contentNode.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const code = button.parentElement.querySelector("code")?.textContent || "";
  try {
    await navigator.clipboard.writeText(code);
    button.textContent = "Copiato";
    window.setTimeout(() => {
      button.textContent = "Copia";
    }, 1400);
  } catch {
    button.textContent = "Non disponibile";
  }
});
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const requested = new URLSearchParams(window.location.search).get("doc");
const initialDocument = documents.some((item) => item.id === requested && !item.external) ? requested : "guide";
renderCatalog();
loadDocument(initialDocument, {
  anchor: decodeURIComponent(window.location.hash.slice(1)),
});
