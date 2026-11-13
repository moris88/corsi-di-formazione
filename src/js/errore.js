// Pulsante "Ricarica la pagina" della pagina di aggiornamento (errore-caricamento.html):
// torna alla pagina che aveva fallito (salvata da theme.js), non ricarica se stessa.
const RETURN_KEY = "ccaf-asset-return";

document.querySelector("[data-reload]")?.addEventListener("click", () => {
  let target = "index.html";
  try {
    target = sessionStorage.getItem(RETURN_KEY) || target;
  } catch {
    /* senza sessionStorage si va alla home */
  }
  location.replace(target);
});
