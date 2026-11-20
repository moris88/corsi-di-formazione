// Pagina "Animazioni": schede dei domini, elenco delle scene e riproduttore a passi.
// La scena aperta è nell'URL (?d=<dominio>&s=<scena>).
import { domains } from "./animazioni/domains.js";
import { createPlayer } from "./animazioni/player.js";

const $ = (selector) => document.querySelector(selector);
const tabs = $("#anim-tabs");
const sceneList = $("#anim-scene-list");

const player = createPlayer({
  root: $("#anim-player"),
  stage: $("#anim-stage"),
  title: $("#anim-scene-title"),
  counter: $("#anim-counter"),
  text: $("#anim-step-text"),
  timer: $("#anim-timer"),
  dots: $("#anim-dots"),
  prev: $("#anim-prev"),
  next: $("#anim-next"),
  play: $("#anim-play"),
  playIcon: $("#anim-play-icon"),
  playLabel: $("#anim-play-label"),
  restart: $("#anim-restart"),
});

let currentDomain = domains[0];

function updateUrl(domain, scene) {
  const url = new URL(location.href);
  url.searchParams.set("d", domain.id);
  url.searchParams.set("s", scene.id);
  history.replaceState(null, "", url);
}

function renderTabs() {
  tabs.replaceChildren(
    ...domains.map((domain) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "anim-tab";
      tab.setAttribute("role", "tab");
      tab.dataset.domain = domain.id;
      const index = document.createElement("span");
      index.className = "anim-tab-index";
      index.textContent = domain.index;
      const name = document.createElement("span");
      name.className = "anim-tab-name";
      name.textContent = domain.short;
      tab.append(index, name);
      return tab;
    }),
  );
}

function selectScene(scene) {
  sceneList.querySelectorAll("[data-scene]").forEach((button) => {
    button.setAttribute("aria-current", String(button.dataset.scene === scene.id));
  });
  player.load(scene);
  updateUrl(currentDomain, scene);
}

function selectDomain(domain, sceneId) {
  currentDomain = domain;
  tabs.querySelectorAll("[data-domain]").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.domain === domain.id));
  });
  $("#anim-domain-index").textContent = `${domain.index} · ${domain.weight}`;
  $("#anim-domain-title").textContent = domain.title;
  $("#anim-domain-text").textContent = domain.text;
  $("#anim-domain-link").href = `./studio.html?doc=${domain.doc}`;
  sceneList.replaceChildren(
    ...domain.scenes.map((scene, position) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "anim-scene-button";
      button.dataset.scene = scene.id;
      const number = document.createElement("span");
      number.className = "anim-scene-number";
      number.textContent = String(position + 1).padStart(2, "0");
      const label = document.createElement("span");
      label.className = "anim-scene-label";
      const title = document.createElement("strong");
      title.textContent = scene.title;
      const summary = document.createElement("span");
      summary.textContent = scene.summary;
      label.append(title, summary);
      button.append(number, label);
      item.append(button);
      return item;
    }),
  );
  selectScene(domain.scenes.find((scene) => scene.id === sceneId) ?? domain.scenes[0]);
}

tabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-domain]");
  if (tab) selectDomain(domains.find((domain) => domain.id === tab.dataset.domain));
});
sceneList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scene]");
  if (button) selectScene(currentDomain.scenes.find((scene) => scene.id === button.dataset.scene));
});
// Frecce sinistra/destra per i passi (non quando si scrive in un campo)
document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, select") || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowRight") player.next();
  if (event.key === "ArrowLeft") player.previous();
});

renderTabs();
const params = new URLSearchParams(location.search);
selectDomain(domains.find((domain) => domain.id === params.get("d")) ?? domains[0], params.get("s"));
