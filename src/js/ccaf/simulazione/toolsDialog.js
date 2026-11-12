// Popup dell'ingranaggio: importazione di un Markdown, esportazione di un test
// del workspace e guida al formato. Creato una volta, contenuto rigenerato a ogni apertura.
import { escapeHtml } from "../../utils.js";
import { AI_PROMPT, copyAiPrompt, formatGuideSource } from "./formatGuide.js";
import { renderGuideMarkdown } from "./guideMarkdown.js";
import { importSourceFile } from "./source.js";
import { BUILTIN_TESTS, state } from "./state.js";

function testFileName(path) {
  return decodeURIComponent(path.split("/").pop());
}

export function openToolsDialog() {
  if (!state.toolsDialog) {
    const toolsDialog = document.createElement("dialog");
    state.toolsDialog = toolsDialog;
    toolsDialog.className = "site-dialog tools-dialog";
    toolsDialog.setAttribute("aria-labelledby", "tools-dialog-title");
    document.body.append(toolsDialog);
    toolsDialog.addEventListener("click", (event) => {
      if (event.target === toolsDialog) toolsDialog.close();
      else if (event.target.closest('[data-action="choose-source"]'))
        toolsDialog.querySelector("#source-file")?.click();
      else if (event.target.closest('[data-action="copy-ai-prompt"]')) copyAiPrompt(event.target.closest("button"));
    });
    toolsDialog.addEventListener("change", (event) => {
      if (event.target.matches("#source-file")) {
        toolsDialog.close();
        importSourceFile(event.target.files?.[0]);
      } else if (event.target.matches("#export-test")) {
        const link = toolsDialog.querySelector("#export-link");
        link.href = event.target.value;
        link.download = testFileName(event.target.value);
      }
    });
  }
  const { toolsDialog } = state;
  const exportFile = BUILTIN_TESTS.some((test) => test.file === state.selectedPreset)
    ? state.selectedPreset
    : BUILTIN_TESTS[0].file;
  toolsDialog.innerHTML = `
    <div class="site-dialog-body">
      <h2 class="site-dialog-title" id="tools-dialog-title">Gestione dei test</h2>
      <section class="tools-section">
        <h3>Importa</h3>
        <p class="site-dialog-message">Carica una banca quesiti in formato Markdown dal tuo computer. Il file non viene salvato: se aggiorni la pagina andrà perso e dovrai ricaricare le domande.</p>
        <button class="button secondary" type="button" data-action="choose-source">Importa un altro Markdown</button>
        <input class="file-input" type="file" accept=".md,text/markdown,text/plain" id="source-file" aria-label="Seleziona il file Markdown con i quesiti">
        <details class="format-help">
          <summary>Formato per creare un altro test</summary>
          <p>Usa un titolo, scenari facoltativi, quesiti numerati, quattro opzioni A–D e la riga della risposta corretta.</p>
          <p><a class="button secondary" href="../../assets/ccaf/template-test.md" download="template-test.md">Scarica il template (template-test.md)</a></p>
          <div class="format-guide">${renderGuideMarkdown(formatGuideSource()).html}</div>
        </details>
        <details class="format-help">
          <summary>Prompt per far generare un test all’IA</summary>
          <p>Copia questo prompt in Claude (o in un’altra IA): contiene già il modello del formato e otterrai un file .md pronto da importare.</p>
          <p><button class="button secondary" type="button" data-action="copy-ai-prompt">Copia il prompt</button></p>
          <div class="format-guide ai-prompt"><pre>${escapeHtml(AI_PROMPT)}</pre></div>
        </details>
      </section>
      <section class="tools-section">
        <h3>Esporta</h3>
        <p class="site-dialog-message">Scarica il file Markdown di un test del workspace.</p>
        <div class="tools-export">
          <label class="preset-select-label"><span>Test da esportare</span><select id="export-test">${BUILTIN_TESTS.map((test) => `<option value="${escapeHtml(test.file)}" ${exportFile === test.file ? "selected" : ""}>${escapeHtml(test.label)}</option>`).join("")}</select></label>
          <a class="button" id="export-link" href="${escapeHtml(exportFile)}" download="${escapeHtml(testFileName(exportFile))}">Esporta (.md)</a>
        </div>
      </section>
      <section class="tools-section">
        <h3>Livelli di difficoltà</h3>
        <dl class="difficulty-legend">
          <div><dt><span class="difficulty-tag" data-level="facile">Facile</span></dt><dd>Concetti di base, una risposta chiaramente migliore delle altre.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="medio">Medio</span></dt><dd>Scenari realistici con distrattori plausibili su un singolo concetto.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="difficile">Difficile</span></dt><dd>Più concetti insieme, trappole tipiche d’esame, opzioni simili tra loro.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="avanzato">Avanzato</span></dt><dd>Vicino all’esame reale: più vincoli da combinare, un dettaglio decisivo, risposte lunghe e tutte credibili.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="inferno">Inferno</span></dt><dd>Oltre l’esame reale: scenari lunghi pieni di vincoli, eccezioni ai principi, opzioni tutte in parte giuste e una sola che regge ogni vincolo.</dd></div>
          <div><dt><span class="difficulty-tag" data-level="custom">Custom</span></dt><dd>Test importato: la difficoltà non è nota a priori.</dd></div>
        </dl>
      </section>
      <form method="dialog" class="site-dialog-actions tools-dialog-close"><button class="button secondary" type="submit">Chiudi</button></form>
    </div>`;
  toolsDialog.showModal();
}
