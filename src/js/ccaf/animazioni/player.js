// Riproduttore: passo corrente, comandi (avanti, indietro, riproduci) e didascalia
import { applyStep, buildStage } from "./stage.js";

// Tempo di lettura di un passo in riproduzione automatica
const BASE_MS = 2600;
const PER_CHAR_MS = 42;
const MAX_MS = 11000;

export function createPlayer(refs) {
  let scene = null;
  let elements = null;
  let index = 0;
  let playing = false;
  let timeout = 0;

  const last = () => scene.steps.length - 1;
  const duration = () => Math.min(MAX_MS, BASE_MS + scene.steps[index].text.length * PER_CHAR_MS);

  function updatePlayButton() {
    const ended = !playing && index === last();
    refs.playIcon.textContent = playing ? "❚❚" : ended ? "↻" : "▶";
    refs.playLabel.textContent = playing ? "Pausa" : ended ? "Rivedi" : "Riproduci";
    refs.play.setAttribute("aria-pressed", String(playing));
    refs.root.classList.toggle("is-playing", playing);
  }

  function restartTimer() {
    refs.timer.style.setProperty("--duration", `${duration()}ms`);
    refs.timer.classList.remove("is-running");
    void refs.timer.offsetWidth;
    if (playing) refs.timer.classList.add("is-running");
  }

  function schedule() {
    clearTimeout(timeout);
    restartTimer();
    if (!playing) return;
    timeout = setTimeout(() => {
      if (index < last()) show(index + 1, true);
      else stop();
    }, duration());
  }

  function renderDots() {
    refs.dots.replaceChildren(
      ...scene.steps.map((_, step) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "anim-dot";
        dot.dataset.step = String(step);
        dot.setAttribute("aria-label", `Vai al passo ${step + 1}`);
        return dot;
      }),
    );
  }

  function show(step, animate = false) {
    index = Math.max(0, Math.min(step, last()));
    if (!animate) refs.stage.classList.add("is-jumping");
    applyStep(refs.stage, scene, elements, index, animate);
    if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => refs.stage.classList.remove("is-jumping")));
    refs.text.textContent = scene.steps[index].text;
    refs.counter.textContent = `Passo ${index + 1} di ${scene.steps.length}`;
    refs.dots.querySelectorAll(".anim-dot").forEach((dot, position) => {
      dot.classList.toggle("is-done", position < index);
      dot.classList.toggle("is-current", position === index);
      dot.setAttribute("aria-current", position === index ? "step" : "false");
    });
    refs.prev.disabled = index === 0;
    refs.next.disabled = index === last();
    updatePlayButton();
    schedule();
  }

  function stop() {
    playing = false;
    clearTimeout(timeout);
    refs.timer.classList.remove("is-running");
    updatePlayButton();
  }

  function toggle() {
    if (playing) return stop();
    playing = true;
    if (index === last()) show(0);
    else schedule();
    updatePlayButton();
  }

  refs.play.addEventListener("click", toggle);
  refs.next.addEventListener("click", () => show(index + 1, true));
  refs.prev.addEventListener("click", () => show(index - 1));
  refs.restart.addEventListener("click", () => show(0));
  refs.dots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-step]");
    if (dot) show(Number(dot.dataset.step), Number(dot.dataset.step) === index + 1);
  });
  // Scheda nascosta: la riproduzione si ferma, per non perdere passi
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) stop();
  });

  return {
    load(nextScene) {
      scene = nextScene;
      index = 0;
      stop();
      refs.title.textContent = scene.title;
      elements = buildStage(refs.stage, scene);
      renderDots();
      show(0);
    },
    next: () => show(index + 1, true),
    previous: () => show(index - 1),
    toggle,
  };
}
