import { escapeHtml } from "../../utils.js";
import { documents } from "./documents.js";
import { contentNode } from "./dom.js";
import { state } from "./state.js";

const groups = [...new Set(documents.map((document) => document.group))];
const sourceCache = new Map();

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

export function renderCatalog(filter = "") {
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
            if (item.variant === "feedback")
              return `<a class="feedback-link nav-feedback" href="${escapeHtml(item.path)}" target="_blank" rel="noopener" title="${escapeHtml(item.title)}"><span class="feedback-icon" aria-hidden="true">!</span><span class="feedback-text">Segnala / Feedback</span></a>`;
            return item.external
              ? `<a class="doc-link" href="${escapeHtml(item.path)}" target="_blank" rel="noopener"><span class="doc-index">${item.index}</span><span class="doc-title">${escapeHtml(item.title)}</span></a>`
              : `<button class="doc-link" type="button" data-doc="${escapeHtml(item.id)}" aria-current="${state.activeDocumentId === item.id ? "page" : "false"}"><span class="doc-index">${item.index}</span><span class="doc-title">${escapeHtml(item.title)}${extra}</span></button>`;
          })
          .join("")}</div></section>`;
      })
      .join("");
    if (!nav.textContent.trim()) nav.innerHTML = '<p class="no-results">Nessun materiale trovato.</p>';
  }
}

export function highlightContent(filter) {
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

export async function applySearch(value) {
  state.searchQuery = value;
  renderCatalog(value);
  document.querySelectorAll("[data-search]").forEach((input) => {
    if (input.value !== value) input.value = value;
  });
  if (value.trim().length < 2) return;
  const token = ++state.searchToken;
  await loadSources();
  if (token === state.searchToken) renderCatalog(value);
}
