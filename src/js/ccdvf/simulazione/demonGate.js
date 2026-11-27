// "Entra nell'inferno": un demone sale dal fondo, afferra la schermata, la squarcia in due e ti trascina dentro.
// Al termine chiama onDone (che avvia il normale caricamento della prova). Stili in simulazione.css.
const DURATION = 3000;

export function playDemonGate(onDone) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onDone();
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "demon-gate";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="demon-hell"></div>
    <div class="demon-door is-left"></div>
    <div class="demon-door is-right"></div>
    <svg class="demon" viewBox="0 0 200 220">
      <path class="demon-horn" d="M52 70 Q20 30 34 0 Q50 40 76 56 Z" />
      <path class="demon-horn" d="M148 70 Q180 30 166 0 Q150 40 124 56 Z" />
      <path class="demon-head" d="M40 90 Q40 40 100 40 Q160 40 160 90 L150 150 Q130 190 100 192 Q70 190 50 150 Z" />
      <path class="demon-brow" d="M58 88 L92 102 M142 88 L108 102" />
      <ellipse class="demon-eye" cx="76" cy="108" rx="11" ry="6" />
      <ellipse class="demon-eye" cx="124" cy="108" rx="11" ry="6" />
      <path class="demon-mouth" d="M64 142 Q100 176 136 142 Q100 156 64 142 Z" />
      <path class="demon-teeth" d="M74 147 l5 9 l5 -7 l6 10 l6 -9 l8 9 l6 -9 l6 9 l5 -10 l4 6" />
      <path class="demon-claw is-left" d="M10 220 Q0 150 30 120 l-6 -24 l14 18 l2 -26 l10 24 l8 -20 l2 30 Q50 170 50 220 Z" />
      <path class="demon-claw is-right" d="M190 220 Q200 150 170 120 l6 -24 l-14 18 l-2 -26 l-10 24 l-8 -20 l-2 30 Q150 170 150 220 Z" />
    </svg>`;
  document.body.append(overlay);
  setTimeout(() => {
    onDone();
    overlay.remove();
  }, DURATION);
}
