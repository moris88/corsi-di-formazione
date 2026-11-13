import { alertDialog } from "../dialog.js";
import { documents } from "./studio/documents.js";
import { backToTop, contentNode } from "./studio/dom.js";
import { currentSectionId, loadDocument, updateProgress } from "./studio/reader.js";
import { applySearch, renderCatalog } from "./studio/search.js";
import { state } from "./studio/state.js";

document.querySelectorAll("[data-search]").forEach((input) => {
  input.addEventListener("input", () => applySearch(input.value));
});
document.querySelectorAll("nav").forEach((nav) => {
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-doc]");
    if (button) loadDocument(button.dataset.doc, { highlight: state.searchQuery });
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
  if (state.currentDocumentIndex > 0) loadDocument(list[state.currentDocumentIndex - 1].id);
});
document.querySelector("#next-doc").addEventListener("click", () => {
  const list = documents.filter((doc) => !doc.external);
  if (state.currentDocumentIndex < list.length - 1) loadDocument(list[state.currentDocumentIndex + 1].id);
});
// Condivide il link al documento aperto (con la sezione nell'hash): menu di condivisione del sistema
// dove disponibile (mobile), altrimenti copia negli appunti e lo conferma con una finestra di dialogo
document.querySelector("#share-doc").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const section = currentSectionId();
  const link = new URL(window.location.href);
  link.hash = section ? encodeURIComponent(section) : "";
  const url = link.href;
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
// "Torna su": riporta all'inizio della pagina
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
