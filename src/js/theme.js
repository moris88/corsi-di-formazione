/*
 * Tema chiaro/scuro condiviso da tutte le pagine.
 * La scelta viene salvata in localStorage; senza scelta salvata
 * si segue la preferenza del sistema operativo.
 */
(() => {
  const STORAGE_KEY = "ccaf-theme";
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

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

    // Link per segnalare errori o lasciare un feedback, uguale in tutte le pagine
    const feedback = document.createElement("a");
    feedback.className = "feedback-link";
    feedback.href = "https://forms.gle/FVrJ6skGrEWvtrHE7";
    feedback.target = "_blank";
    feedback.rel = "noopener noreferrer";
    feedback.title = "Segnala un errore o lascia un feedback";
    feedback.setAttribute("aria-label", `${feedback.title} (si apre in una nuova scheda)`);
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
