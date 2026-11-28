/*
 * Tema chiaro/scuro condiviso da tutte le pagine.
 * La scelta viene salvata in localStorage; senza scelta salvata
 * si segue la preferenza del sistema operativo.
 */

// Aggiornamento del sito mentre una pagina è aperta (o in cache): l'HTML salvato può citare file
// CSS o JS con l'hash di una versione precedente, che non esiste più. Il file non si carica e la
// pagina resta rotta. In quel caso si ricarica la pagina: l'HTML viene rivalidato e torna quello nuovo.
// La prova salvata in sessionStorage evita cicli di ricaricamento (al massimo una volta ogni due minuti).
(() => {
  const RELOAD_KEY = "ccaf-asset-reload";
  const COOLDOWN_MS = 120000;
  const ERROR_PAGE = "/errore-caricamento.html";
  const RETURN_KEY = "ccaf-asset-return";
  const isBuiltAsset = (url) => /\/assets\/[^/]+\.(css|js)$/.test(url || "");

  function reloadOnce() {
    const onErrorPage = location.pathname.endsWith(ERROR_PAGE);
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      // Già ricaricata da poco e il file manca ancora: si mostra la pagina di aggiornamento
      if (Date.now() - last < COOLDOWN_MS) {
        if (!onErrorPage) {
          // Si salva la pagina che ha fallito, così il pulsante della pagina di aggiornamento la ricarica
          try {
            sessionStorage.setItem(RETURN_KEY, location.href);
          } catch {
            /* senza sessionStorage il pulsante torna alla home */
          }
          location.replace(ERROR_PAGE);
        }
        return;
      }
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      return; // senza sessionStorage non si ricarica, per non entrare in un ciclo
    }
    location.reload();
  }

  // Errore di caricamento di un <link> o di uno <script> (non viene propagato, quindi si ascolta in cattura)
  window.addEventListener(
    "error",
    (event) => {
      const el = event.target;
      if (el instanceof HTMLLinkElement || el instanceof HTMLScriptElement) {
        if (isBuiltAsset(el.href || el.src)) reloadOnce();
      }
    },
    true,
  );

  // Moduli importati dinamicamente (import()) che non si scaricano: il rifiuto della promessa non è un errore di risorsa
  window.addEventListener("unhandledrejection", (event) => {
    const message = String(event.reason?.message || "");
    if (/dynamically imported module|Importing a module script failed/i.test(message)) reloadOnce();
  });
})();

// Simulazione d'esame in corso (salvata da js/<sigla>/simulazione.js): qualunque pagina del sito
// riporta subito alla simulazione, come all'esame vero non si può uscire dalla prova.
(() => {
  const SESSIONS = [
    { key: "ccaf-simulation-session-v1", page: "ccaf/simulazione" },
    { key: "ccdvf-simulation-session-v1", page: "ccdvf/simulazione" },
  ];
  try {
    const script = document.currentScript?.src;
    if (!script) return;
    for (const { key, page } of SESSIONS) {
      const session = JSON.parse(localStorage.getItem(key) || "null");
      if (session?.status !== "active") continue;
      // Già sulla pagina della simulazione in corso: nessun reindirizzamento
      if (location.pathname.replace(/\.html$/, "").endsWith(`/${page}`)) return;
      location.replace(new URL(`../pages/${page}.html`, script));
      return;
    }
  } catch {
    /* senza archiviazione locale non c'è nessuna prova da riprendere */
  }
})();

(() => {
  const STORAGE_KEY = "ccaf-theme";
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  // Moduli Google Forms proposti dal pulsante "Segnala / Feedback" (il primo è anche il link di riserva)
  const FEEDBACK_FORMS = [
    {
      title: "Segnala un bug o lascia un feedback",
      description:
        "Hai trovato un errore nei contenuti, una domanda sbagliata o qualcosa che non funziona? Oppure hai un suggerimento per migliorare il sito? Raccontacelo qui.",
      url: "https://forms.gle/wuPM9cL7cqiaPzQJ8",
    },
    {
      title: "Questionario (facoltativo)",
      description:
        "Poche domande sulla tua esperienza con il sito e con la preparazione all’esame: ci aiutano a capire cosa funziona e cosa migliorare.",
      url: "https://forms.gle/3NvXVDYVc4z3kJVf8",
    },
  ];

  function savedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  }

  function currentTheme() {
    return savedTheme() || (systemDark.matches ? "dark" : "light");
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#101010" : "#1e1e1e";
    const button = document.querySelector(".theme-toggle");
    if (button) {
      const dark = theme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Passa al tema chiaro" : "Passa al tema scuro");
      button.title = button.getAttribute("aria-label");
      button.textContent = dark ? "☀" : "☾";
    }
  }

  // Applicato subito, prima del rendering, per evitare il lampo di tema chiaro
  applyTheme(currentTheme());

  systemDark.addEventListener("change", () => {
    if (!savedTheme()) applyTheme(currentTheme());
  });

  document.addEventListener("DOMContentLoaded", () => {
    const actions = document.querySelector(".topbar-actions");
    if (!actions) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Archiviazione non disponibile: il tema cambia solo per questa visita
      }
      applyTheme(next);
    });
    actions.prepend(button);
    applyTheme(root.dataset.theme);

    // Pulsante "Segnala / Feedback", uguale in tutte le pagine: apre la scelta tra i moduli
    const feedback = document.createElement("a");
    feedback.className = "feedback-link";
    feedback.href = FEEDBACK_FORMS[0].url;
    feedback.title = "Segnala un errore, lascia un feedback o compila il questionario";
    feedback.setAttribute("aria-haspopup", "dialog");
    feedback.innerHTML =
      '<span class="feedback-icon" aria-hidden="true">!</span><span class="feedback-text">Segnala / Feedback</span>';
    button.after(feedback);

    // Link "Home": nelle pagine di una certificazione porta alla sua home
    // (data-home sul body); nella home della certificazione si chiama "Corsi"
    // e porta al portale (href del logo). Assente nel portale.
    if (!document.body.classList.contains("page-portal")) {
      const brand = document.querySelector(".topbar .brand");
      const certHome = document.body.dataset.home;
      const onCertHome = document.body.classList.contains("page-home");
      const home = document.createElement("a");
      home.className = "home-link";
      home.href = certHome && !onCertHome ? certHome : brand ? brand.getAttribute("href") : "../index.html";
      const toPortal = !(certHome && !onCertHome);
      home.title = toPortal ? "Torna a tutti i corsi" : "Torna alla home della certificazione";
      home.setAttribute("aria-label", home.title);
      home.innerHTML = `<span class="home-icon" aria-hidden="true">⌂</span><span class="home-text">${toPortal ? "Corsi" : "Home"}</span>`;
      button.before(home);
    }
  });

  // Popup di scelta del modulo: si apre da ogni .feedback-link (header e menu dello studio)
  function openFeedbackDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "site-dialog feedback-dialog";
    dialog.setAttribute("aria-labelledby", "feedback-dialog-title");
    dialog.innerHTML = `
      <form method="dialog" class="site-dialog-body">
        <h2 class="site-dialog-title" id="feedback-dialog-title">Segnala / Feedback</h2>
        <p class="site-dialog-message">Scegli il modulo da compilare: si apre in una nuova scheda e richiede l’accesso con un account Google, così possiamo risponderti via email se serve.</p>
        <div class="feedback-choices">
          ${FEEDBACK_FORMS.map(
            (form) =>
              `<a class="feedback-choice" href="${form.url}" target="_blank" rel="noopener noreferrer"><strong>${form.title}</strong><span>${form.description}</span></a>`,
          ).join("")}
        </div>
        <div class="site-dialog-actions">
          <button class="button secondary" value="cancel">Chiudi</button>
        </div>
      </form>`;
    dialog.addEventListener("click", (event) => {
      // Clic sullo sfondo o su un modulo: la finestra si chiude. Aprire il questionario vale come "fatto"
      const choice = event.target.closest(".feedback-choice");
      if (choice?.getAttribute("href") === SURVEY.url) markSurveyDone();
      if (event.target === dialog || choice) dialog.close();
    });
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.(".feedback-link");
    if (!link || typeof HTMLDialogElement === "undefined") return;
    event.preventDefault();
    openFeedbackDialog();
  });

  // Popup del questionario facoltativo: a tutto schermo, si chiude solo con la X o con "Annulla".
  // Compare una volta sola: se l'utente apre il questionario non torna più; se lo chiude
  // (X, Annulla o Esc) viene riproposto più tardi, con pause sempre più lunghe.
  // Stato in localStorage: { done, dismissed, nextAt }. Non compare nelle pagine di allenamento
  // e simulazione (page-exam), per non interrompere chi si sta esercitando.
  const SURVEY = {
    key: "ccaf-survey-v1",
    startKey: "ccaf-survey-start",
    url: FEEDBACK_FORMS[1].url,
    firstDelayMs: 4 * 60 * 1000, // dopo quanto dall'apertura del sito (nella sessione del browser)
    snoozeMs: [30 * 60 * 1000, 3 * 60 * 60 * 1000, 24 * 60 * 60 * 1000], // 1ª, 2ª, dalla 3ª chiusura in poi
    retryMs: 60 * 1000, // se c'è già una finestra aperta
  };

  function readSurvey() {
    try {
      const state = JSON.parse(localStorage.getItem(SURVEY.key) || "null");
      return {
        done: state?.done === true,
        dismissed: Number(state?.dismissed) || 0,
        nextAt: Number(state?.nextAt) || 0,
      };
    } catch {
      return { done: false, dismissed: 0, nextAt: 0 };
    }
  }

  function writeSurvey(state) {
    try {
      localStorage.setItem(SURVEY.key, JSON.stringify(state));
    } catch {
      // Archiviazione non disponibile: il popup non si ripresenta in questa visita
      surveyBlocked = true;
    }
  }

  let surveyBlocked = false;
  let surveyCheck = null; // controllo dei tempi, richiamato dopo ogni chiusura per riproporre il popup nella stessa pagina

  function markSurveyDone() {
    writeSurvey({ ...readSurvey(), done: true });
  }

  function snoozeSurvey() {
    const state = readSurvey();
    const dismissed = state.dismissed + 1;
    const pause = SURVEY.snoozeMs[Math.min(dismissed - 1, SURVEY.snoozeMs.length - 1)];
    writeSurvey({ ...state, dismissed, nextAt: Date.now() + pause });
  }

  function openSurveyDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "site-dialog survey-dialog";
    dialog.setAttribute("aria-labelledby", "survey-title");
    dialog.innerHTML = `
      <div class="survey-card">
        <button type="button" class="survey-close" data-survey="cancel" aria-label="Chiudi e riproponi più tardi" title="Chiudi">×</button>
        <p class="survey-kicker">Questionario facoltativo</p>
        <h2 class="survey-title" id="survey-title">Ci aiuti a migliorare il sito?</h2>
        <p class="survey-text">Poche domande sulla tua esperienza con il sito e con la preparazione all’esame: ci dicono cosa funziona e cosa va migliorato.</p>
        <p class="survey-note">Si apre in una nuova scheda e richiede l’accesso con un account Google. Se ora non puoi, premi Annulla: te lo riproporremo più avanti.</p>
        <div class="survey-actions">
          <button type="button" class="button secondary" data-survey="cancel">Annulla</button>
          <a class="button" href="${SURVEY.url}" target="_blank" rel="noopener noreferrer" data-survey="open">Compila il questionario</a>
        </div>
      </div>`;
    let handled = false;
    // Esc non chiude: restano solo la X e "Annulla" (un secondo Esc può comunque chiudere, ed è trattato come Annulla)
    dialog.addEventListener("cancel", (event) => event.preventDefault());
    dialog.addEventListener("click", (event) => {
      // Clic sullo sfondo: nessun effetto
      const action = event.target.closest?.("[data-survey]")?.dataset.survey;
      if (!action) return;
      handled = true;
      if (action === "open") markSurveyDone();
      else snoozeSurvey();
      dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!handled) snoozeSurvey();
      document.documentElement.classList.remove("survey-open");
      dialog.remove();
      surveyCheck?.();
    });
    document.body.append(dialog);
    document.documentElement.classList.add("survey-open");
    dialog.showModal();
  }

  function scheduleSurvey() {
    if (typeof HTMLDialogElement === "undefined" || document.body.classList.contains("page-exam")) return;
    if (readSurvey().done) return;
    // Inizio della visita: salvato nella sessione del browser, così il conteggio prosegue cambiando pagina
    let start = Date.now();
    try {
      start = Number(sessionStorage.getItem(SURVEY.startKey)) || start;
      sessionStorage.setItem(SURVEY.startKey, String(start));
    } catch {
      /* senza sessionStorage il conteggio riparte a ogni pagina */
    }
    const check = () => {
      if (surveyBlocked) return;
      const state = readSurvey();
      if (state.done) return;
      const remaining = Math.max(start + SURVEY.firstDelayMs, state.nextAt) - Date.now();
      if (remaining > 0) {
        setTimeout(check, remaining);
        return;
      }
      // Scheda in secondo piano: si aspetta che l'utente torni
      if (document.hidden) {
        document.addEventListener("visibilitychange", check, { once: true });
        return;
      }
      // Un'altra finestra è già aperta: non si sovrappone
      if (document.querySelector("dialog[open]")) {
        setTimeout(check, SURVEY.retryMs);
        return;
      }
      openSurveyDialog();
    };
    surveyCheck = check;
    check();
  }

  document.addEventListener("DOMContentLoaded", scheduleSurvey);

  // Barre di scorrimento coral mentre il contenitore scorre: classe "is-scrolling" tolta poco dopo l'ultimo scroll
  const scrollTimers = new WeakMap();
  document.addEventListener(
    "scroll",
    (event) => {
      const target = event.target === document ? document.documentElement : event.target;
      if (!(target instanceof Element)) return;
      target.classList.add("is-scrolling");
      clearTimeout(scrollTimers.get(target));
      scrollTimers.set(
        target,
        setTimeout(() => target.classList.remove("is-scrolling"), 700),
      );
    },
    { capture: true, passive: true },
  );
})();
