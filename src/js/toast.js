// Toast del sito: avvisi temporanei impilati in verticale in basso a destra, chiudibili,
// che si nascondono da soli. Il timer si ferma finché il puntatore o il focus sono sul toast.

const DEFAULT_DURATION_MS = 10000;

// Contenitore unico: più toast si dispongono uno sotto l'altro nell'ordine in cui vengono mostrati
function toastStack() {
  let stack = document.querySelector(".site-toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "site-toast-stack";
    document.body.append(stack);
  }
  return stack;
}

export function showToast({ title, message, duration = DEFAULT_DURATION_MS }) {
  const toast = document.createElement("aside");
  toast.className = "site-toast";
  toast.setAttribute("role", "status");

  const icon = document.createElement("span");
  icon.className = "site-toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "i";

  const body = document.createElement("div");
  body.className = "site-toast-body";
  const heading = document.createElement("strong");
  heading.textContent = title;
  body.append(heading);
  if (message) {
    const text = document.createElement("p");
    text.textContent = message;
    body.append(text);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.className = "site-toast-close";
  close.setAttribute("aria-label", "Chiudi l'avviso");
  close.textContent = "×";

  toast.append(icon, body, close);
  toastStack().append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));

  let timer = null;
  const hide = () => {
    clearTimeout(timer);
    toast.classList.remove("is-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400); // se le transizioni sono disattivate
  };
  const start = () => {
    clearTimeout(timer);
    timer = setTimeout(hide, duration);
  };
  const pause = () => clearTimeout(timer);

  close.addEventListener("click", hide);
  toast.addEventListener("mouseenter", pause);
  toast.addEventListener("mouseleave", start);
  toast.addEventListener("focusin", pause);
  toast.addEventListener("focusout", start);
  start();
  return hide;
}

// Avviso comune alle pagine con le domande (simulazione e allenamento).
// Aggiornare la data a ogni revisione delle banche quesiti.
export const QUESTIONS_REVISED_ON = "16/11/2026";

export function showSimulationNotice() {
  showToast({
    title: "Questa è una simulazione, non l’esame ufficiale.",
    message:
      "Formato, domande e livello di difficoltà sono pensati per avvicinarsi il più possibile alla prova reale, ma l’esito ottenuto qui non ha alcun valore ai fini della certificazione. Anche se qui raggiungi il 72% richiesto per superare l’esame, non hai comunque la certezza di superare la prova ufficiale.",
  });
}
