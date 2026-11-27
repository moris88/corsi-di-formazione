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
          <li><strong>Leggi la domanda con attenzione.</strong> Hai 4 possibili risposte tra cui scegliere, solo una è quella corretta.</li>
          <li><strong>Seleziona una delle quattro opzioni.</strong> La risposta viene salvata automaticamente; puoi cambiarla finché la prova è aperta.</li>
          <li><strong>Naviga liberamente.</strong> Usa Precedente, Successiva o l’indice numerato. Contrassegna i quesiti da rivedere con “Segna”.</li>
          ${timedMode ? `<li><strong>Consegna entro ${testDurationMinutes} minuti.</strong> Puoi consegnare prima; allo scadere la prova viene inviata automaticamente.</li>` : `<li><strong>Consegna quando vuoi.</strong> La prova è senza limite di tempo: il timer mostra solo il tempo trascorso.</li>`}
          <li><strong>Rivedi il risultato.</strong> Alla consegna trovi corrette, errate e senza risposta, con spiegazioni e filtri.</li>
        </ol>
      </section>
      <section class="guide-section" aria-labelledby="exam-title">
        <h2 id="exam-title">Come funziona l’esame reale</h2>
        <ol class="guide-steps">
          <li><strong>53 domande in 120 minuti.</strong> Circa 2 minuti e 15 secondi a domanda. All’esame ci sono domande a scelta multipla e a risposta multipla, e ognuna dice quante risposte selezionare; in questo simulatore c’è una sola risposta corretta.</li>
          <li><strong>Otto domini con pesi diversi.</strong> Le applicazioni e l’integrazione valgono il 33,1% dell’esame, la scelta dei modelli il 16,8%, gli agenti il 14,7%: i domini più leggeri sono Claude Code (3,1%) ed eval (2,6%).</li>
          <li><strong>Tieni il ritmo.</strong> Se una domanda ti blocca, passa alla successiva e torna a rivederla prima della consegna: non conviene perdere minuti su una sola.</li>
          <li><strong>Punteggio scalare da 100 a 1000.</strong> Per superare l’esame servono almeno 720 punti.</li>
          <li><strong>Segna le domande da rivedere.</strong> Puoi contrassegnare le domande dubbie per rivederle prima della consegna.</li>
        </ol>
      </section>
    </div>
    ${
      inferno
        ? `<aside class="guide-inferno-warning" role="note">
      <strong>Livello Inferno.</strong>
      <span>Questa prova è volutamente più dura dell’esame reale: situazioni lunghe, vincoli nascosti e quattro opzioni tutte credibili. Un punteggio basso qui è normale; conta capire perché ogni distrattore è sbagliato.</span>
    </aside>`
        : ""
    }
    <aside class="guide-note" role="note">
      <span>Questa simulazione usa le domande delle banche quesiti del sito: domande e opzioni vengono mescolate a ogni prova. Ogni domanda è collegata a uno degli otto domini.</span>
    </aside>
    <aside class="guide-note" role="note">
      <span>Formato, domande e livello di difficoltà sono pensati per avvicinarsi il più possibile alla prova reale, ma l’esito ottenuto qui non ha alcun valore ai fini della certificazione. Il punteggio stimato è un’approssimazione sul peso dei domini: anche se qui superi la soglia di 720 su 1000, non hai la certezza di superare la prova ufficiale.</span>
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
