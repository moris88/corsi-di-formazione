import { escapeHtml } from "../../utils.js";
import { documents } from "./documents.js";
import {
  backToTop,
  categoryNode,
  contentNode,
  descriptionNode,
  metaNode,
  mobileTocListNode,
  mobileTocNode,
  progressFill,
  statusNode,
  titleNode,
  tocEmptyNode,
  tocNode,
} from "./dom.js";
import { renderMarkdown } from "./markdown.js";
import { highlightContent, renderCatalog } from "./search.js";
import { state } from "./state.js";

export async function loadDocument(id, options = {}) {
  const item = documents.find((documentItem) => documentItem.id === id && !documentItem.external);
  if (!item) return;
  const index = documents.filter((doc) => !doc.external).findIndex((doc) => doc.id === id);
  state.currentDocumentIndex = index;
  state.activeDocumentId = id;
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
  statusNode.className = "status loading";
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
    state.renderedHeadings = rendered.headings;
    statusNode.hidden = true;
    contentNode.hidden = false;
    contentNode.classList.remove("doc-enter");
    void contentNode.offsetWidth; // riavvia l'animazione a ogni documento
    contentNode.classList.add("doc-enter");
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

export function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  // "Torna su" fisso in basso a destra appena si scorre la pagina
  backToTop.classList.toggle("is-visible", window.scrollY > 200);
}

function observeHeadings() {
  state.observer?.disconnect();
  state.observer = new IntersectionObserver(
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
  state.renderedHeadings.forEach((heading) => {
    const node = document.getElementById(heading.id);
    if (node) state.observer.observe(node);
  });
}

// Sezione in lettura: l'ultimo titolo già passato sotto la barra in alto (nessuna se si è ancora all'inizio)
export function currentSectionId() {
  let current = "";
  for (const heading of state.renderedHeadings) {
    const node = document.getElementById(heading.id);
    if (node && node.getBoundingClientRect().top <= 120) current = heading.id;
  }
  return current;
}
