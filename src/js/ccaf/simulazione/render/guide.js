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
        <h2 id="procedure-title">Guida alla simulazione d'esame</h2>
        <ol class="guide-steps">
          <li><strong>Leggi lo scenario e la domanda.</strong> Hai 4 possibili risposte tra cui scegliere, solo una è quella corretta.</li>
          <li><strong>Seleziona una delle quattro opzioni.</strong> La risposta viene salvata automaticamente; puoi cambiarla finché la prova è aperta.</li>
          <li><strong>Naviga liberamente.</strong> Usa Precedente, Successiva o l’indice numerato. Contrassegna i quesiti da rivedere con “Segna”.</li>
          ${timedMode ? `<li><strong>Consegna entro ${testDurationMinutes} minuti.</strong> Puoi consegnare prima; allo scadere la prova viene inviata automaticamente.</li>` : `<li><strong>Consegna quando vuoi.</strong> La prova è senza limite di tempo: il timer mostra solo il tempo trascorso.</li>`}
          <li><strong>Rivedi il risultato.</strong> Alla consegna trovi corrette, errate e senza risposta, con spiegazioni e filtri.</li>
        </ol>
      </section>
      <section class="guide-section" aria-labelledby="exam-title">
        <h2 id="exam-title">Come funziona l’esame reale</h2>
        <ol class="guide-steps">
          <li><strong>60 domande in 120 minuti.</strong> Circa 2 minuti a domanda, in inglese e a scelta multipla con una sola risposta corretta.</li>
          <li><strong>Domande legate a scenari.</strong> All’esame compaiono 4 dei 6 scenari ufficiali, scelti a caso; ogni domanda si basa sul contesto dello scenario.</li>
          <li><strong>Nessuna penalità per gli errori.</strong> Una risposta sbagliata vale quanto una vuota: rispondi sempre, anche in modo provvisorio.</li>
          <li><strong>Punteggio scalare da 100 a 1000.</strong> Per superare l’esame servono almeno 720 punti.</li>
          <li><strong>Segna le domande da rivedere.</strong> Puoi contrassegnare le domande dubbie per rivederle prima della consegna.</li>
        </ol>
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
      <span>In questa simulazione sono presenti tutti gli scenari ufficiali, e tutti i domini dell’esame reale, ma le domande sono generate ogni volta casualmente.</span>
    </aside>
    <aside class="guide-note" role="note">
      <span>Formato, domande e livello di difficoltà sono pensati per avvicinarsi il più possibile alla prova reale, ma l’esito ottenuto qui non ha alcun valore ai fini della certificazione. Anche se qui raggiungi il 72% richiesto per superare l’esame, non hai comunque la certezza di superare la prova ufficiale.</span>
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
