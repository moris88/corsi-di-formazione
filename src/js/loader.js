// Animazione di caricamento delle banche quesiti (stili .bank-loader in style.css)
export function bankLoaderHtml(title, status) {
  return `<section class="screen bank-loader" role="status" aria-label="${title}">
    <div class="loader-stage" aria-hidden="true">
      <span class="loader-ring"></span><span class="loader-ring"></span><span class="loader-ring"></span>
      <div class="loader-orbit">${["A", "B", "C", "D"].map((letter) => `<b>${letter}</b>`).join("")}</div>
      <div class="loader-stack">${"<i></i>".repeat(5)}</div>
      <div class="loader-sparks">${"<i></i>".repeat(12)}</div>
    </div>
    <p class="loader-title">${title}</p>
    <p class="loader-count" id="loader-count">${status}</p>
  </section>`;
}
