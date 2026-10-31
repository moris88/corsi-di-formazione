/*
 * Finestre di dialogo con lo stile del sito, al posto di window.alert / window.confirm.
 * Basate su <dialog> (focus, Esc e sfondo modale gestiti dal browser) e restituiscono una Promise.
 *
 *   if (await confirmDialog({ message: "Vuoi continuare?" })) { ... }
 *   await alertDialog({ title: "Fatto", message: "Operazione completata." });
 */

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

function openDialog({ title, message, detail, confirmLabel, cancelLabel, danger }) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = `site-dialog${danger ? " is-danger" : ""}`;
    dialog.setAttribute("aria-labelledby", "site-dialog-title");
    dialog.setAttribute("aria-describedby", "site-dialog-message");
    dialog.innerHTML = `
      <form method="dialog" class="site-dialog-body">
        <h2 class="site-dialog-title" id="site-dialog-title">${escapeHtml(title)}</h2>
        <p class="site-dialog-message" id="site-dialog-message">${escapeHtml(message)}</p>
        ${detail ? `<p class="site-dialog-detail">${escapeHtml(detail)}</p>` : ""}
        <div class="site-dialog-actions">
          ${cancelLabel ? `<button class="button secondary" value="cancel">${escapeHtml(cancelLabel)}</button>` : ""}
          <button class="button" value="confirm" autofocus>${escapeHtml(confirmLabel)}</button>
        </div>
      </form>`;
    // Clic sullo sfondo (fuori dal riquadro) = annulla
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close("cancel");
    });
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "confirm");
      dialog.remove();
    });
    document.body.append(dialog);
    dialog.showModal();
  });
}

export function confirmDialog({
  title = "Conferma",
  message,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  danger = false,
}) {
  return openDialog({ title, message, confirmLabel, cancelLabel, danger });
}

// detail: testo secondario selezionabile (es. un link), mostrato in un riquadro sotto il messaggio
export function alertDialog({ title = "Avviso", message, detail = "", confirmLabel = "OK" }) {
  return openDialog({ title, message, detail, confirmLabel, cancelLabel: "", danger: false }).then(() => undefined);
}
