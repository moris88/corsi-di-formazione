// Home CCA-F: mostra a rotazione, ogni 15 secondi, una "regola d'oro" casuale presa dalle trappole d'esame
const INTERVAL = 15000;
const DOMAINS = [1, 2, 3, 4, 5];
const box = document.querySelector(".home-quote");
const text = document.querySelector("#tip-text");
const source = document.querySelector("#tip-source");
const link = document.querySelector("#tip-link");

function inlineMarkdown(value) {
  const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<em>$1</em>")
    .replace(/\*([^*]+)\*/g, "$1");
}

// Le voci numerate della sezione "Regole d'oro" di ogni consigli_D<n>.md
async function loadTips() {
  const tips = [];
  for (const domain of DOMAINS) {
    try {
      const response = await fetch(`../assets/ccaf/consigli/consigli_D${domain}.md`);
      if (!response.ok) continue;
      const section = (await response.text()).split(/^## Regole d'oro.*$/m)[1]?.split(/^## /m)[0] || "";
      for (const match of section.matchAll(/^\d+\.\s+(.+)$/gm)) tips.push({ domain, text: match[1].trim() });
    } catch {
      // senza server (file://) resta il consiglio predefinito
    }
  }
  return tips;
}

function show(tip) {
  text.innerHTML = `«${inlineMarkdown(tip.text)}»`;
  source.textContent = `— Trappole d’esame · Dominio ${tip.domain}`;
  link.href = `ccaf/studio.html?doc=consigli-domain-${tip.domain}`;
}

const tips = await loadTips();
if (box && tips.length) {
  let last = -1;
  const next = () => {
    let index;
    do index = Math.floor(Math.random() * tips.length);
    while (tips.length > 1 && index === last);
    last = index;
    return tips[index];
  };
  // Riavvia la barra di avanzamento a ogni cambio, così resta sincronizzata
  const restartTimer = () => {
    box.classList.remove("is-running");
    void box.offsetWidth;
    box.classList.add("is-running");
  };
  show(next());
  restartTimer();
  setInterval(() => {
    box.classList.add("is-changing");
    setTimeout(() => {
      show(next());
      box.classList.remove("is-changing");
      restartTimer();
    }, 600);
  }, INTERVAL);
}
