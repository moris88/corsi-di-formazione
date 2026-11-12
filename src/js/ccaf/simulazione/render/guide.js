// Istruzioni mostrate prima di iniziare la prova
import { escapeHtml } from "../../../utils.js";
import { setFocusMode } from "../focus.js";
import { app, state, timedMode, topStatus } from "../state.js";

export function renderExamGuide() {
  const { questionBank, testDurationMinutes } = state;
  if (!state.sourceReady || questionBank.length === 0) return;
  setFocusMode(false);
  if (topStatus) topStatus.textContent = "Istruzioni d’esame";
  const inferno = state.testDifficulty === "inferno";
  app.innerHTML = `
  <section class="screen guide-screen${inferno ? " is-inferno" : ""}" aria-labelledby="guide-title">
    ${inferno ? `<div class="guide-embers" aria-hidden="true">${"<i></i>".repeat(18)}</div>` : ""}
    <div class="guide-heading">
      <div class="eyebrow">Prima di iniziare · ${escapeHtml(state.testTitle)}</div>
      <h1 id="guide-title">Come affrontare<br><span>la simulazione</span></h1>
      <p class="intro-copy">${timedMode ? "La prova inizia solo quando selezioni “Inizia la prova”. Fino ad allora il timer resta fermo." : "Prova senza limite di tempo: consegna quando hai finito."}</p>
    </div>
    <div class="guide-grid">
      <section class="guide-section" aria-labelledby="procedure-title">
        <div class="panel-kicker">01 · Procedura</div>
        <h2 id="procedure-title">Durante la prova</h2>
        <ol class="guide-steps">
          <li><strong>Leggi il caso e la domanda.</strong> Cerca l’obiettivo, il vincolo e il problema da risolvere.</li>
          <li><strong>Seleziona una delle quattro opzioni.</strong> La risposta viene salvata automaticamente; puoi cambiarla finché la prova è aperta.</li>
          <li><strong>Naviga liberamente.</strong> Usa Precedente, Successiva o l’indice numerato. Contrassegna i quesiti da rivedere con “Segna”.</li>
          ${timedMode ? `<li><strong>Consegna entro ${testDurationMinutes} minuti.</strong> Puoi consegnare prima; allo scadere la prova viene inviata automaticamente.</li>` : `<li><strong>Consegna quando vuoi.</strong> La prova è senza limite di tempo: il timer mostra solo il tempo trascorso.</li>`}
          <li><strong>Rivedi il risultato.</strong> Alla consegna trovi corrette, errate e senza risposta, con spiegazioni e filtri.</li>
        </ol>
      </section>
      <section class="guide-section" aria-labelledby="strategy-title">
        <div class="panel-kicker">02 · Strategia</div>
        <h2 id="strategy-title">Per puntare al superamento</h2>
        <ul class="guide-tips">
          <li><strong>Rispondi a tutto.</strong> La guida d’esame indica che non ci sono penalità per le risposte errate; se sei incerto, scegli l’opzione più plausibile.</li>
          <li><strong>Gestisci il tempo.</strong> Con ${questionBank.length} quesiti in ${testDurationMinutes} minuti, la media è di circa ${Math.floor((testDurationMinutes * 60) / questionBank.length)} secondi per domanda. Segna i dubbi e torna a rivederli.</li>
          <li><strong>Leggi i vincoli con attenzione.</strong> Distingui il problema principale da sintomi secondari e scarta le soluzioni che contraddicono i requisiti dello scenario.</li>
          <li><strong>Scegli la soluzione proporzionata.</strong> Preferisci l’intervento che affronta la causa alla radice senza aggiungere complessità non necessaria; usa vincoli programmatici quando serve una garanzia deterministica.</li>
          <li><strong>Concentrati sui domini più pesanti.</strong> Architettura e orchestrazione (27%); Claude Code (20%); prompt e output strutturato (20%); strumenti e MCP (18%); contesto e affidabilità (15%).</li>
        </ul>
      </section>
    </div>
    ${
      inferno
        ? `<aside class="guide-inferno-warning" role="note">
      <strong>Livello Inferno.</strong>
      <span>Questa prova è volutamente più dura dell’esame reale: scenari lunghi, vincoli nascosti e quattro opzioni tutte credibili. Un punteggio basso qui è normale; conta capire perché ogni distrattore è sbagliato.</span>
    </aside>`
        : ""
    }
    <aside class="guide-note" role="note">
      <strong>Soglia ufficiale: 720 su 1000.</strong>
      <span>È un punteggio scalare: la percentuale corretta mostrata da questa simulazione è un risultato grezzo e non equivale direttamente al punteggio ufficiale né garantisce il superamento.</span>
    </aside>
    <div class="guide-docs" aria-label="Documenti ufficiali">
      <a class="button secondary" href="../../assets/ccaf/Anthropic-Certification-Exam-Policy.pdf" target="_blank" rel="noopener">Politica d’esame Anthropic (PDF)</a>
      <a class="button secondary" href="../../assets/ccaf/Certification-Terms-and-Conditions.pdf" target="_blank" rel="noopener">Termini e condizioni (PDF)</a>
    </div>
    <div class="guide-actions">
      <button class="button secondary" type="button" data-action="back-to-intro">Torna alla selezione</button>
      <button class="button" type="button" data-action="start">${inferno ? "Entra nell’inferno" : "Inizia la prova"} <span aria-hidden="true">→</span></button>
    </div>
  </section>`;
}
