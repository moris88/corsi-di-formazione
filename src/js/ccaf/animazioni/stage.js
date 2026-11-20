// Palco dell'animazione: crea gli elementi degli attori e applica lo stato di un passo.
// Le posizioni sono in percentuale del palco ([x, y] al centro dell'attore); il CSS anima gli spostamenti.

const SVG_NS = "http://www.w3.org/2000/svg";
// Livello di disegno per tipo: zone sotto, collegamenti, schede, nodi, messaggi in primo piano
const LAYER = { zone: 0, link: 1, card: 2, meter: 2, node: 3, token: 5 };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createActor(actor) {
  const root = element("div", `actor actor-${actor.kind}${actor.tone ? ` tone-${actor.tone}` : ""}`);
  if (actor.w) root.style.setProperty("--w", `${actor.w}%`);
  if (actor.h) root.style.setProperty("--h", `${actor.h}%`);
  if (actor.kind === "node")
    root.append(element("span", "node-icon"), element("span", "node-label"), element("span", "node-note"));
  if (actor.kind === "card") root.append(element("strong", "card-title"), element("ul", "card-lines"));
  if (actor.kind === "token") root.append(element("span", "token-text"));
  if (actor.kind === "zone") root.append(element("span", "zone-label"));
  if (actor.kind === "meter") {
    const track = element("span", "meter-track");
    track.append(element("span", "meter-fill"));
    root.append(element("span", "meter-label"), track, element("span", "meter-value"));
  }
  return root;
}

export function buildStage(stage, scene) {
  stage.replaceChildren();
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "anim-links");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  stage.append(svg);
  const elements = new Map();
  const ordered = [...scene.actors].sort((a, b) => (LAYER[a.kind] ?? 2) - (LAYER[b.kind] ?? 2));
  for (const actor of ordered) {
    if (actor.kind === "link") {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("class", "anim-link");
      svg.append(line);
      elements.set(actor.id, line);
    } else {
      const node = createActor(actor);
      stage.append(node);
      elements.set(actor.id, node);
    }
  }
  return elements;
}

// Stato di ogni attore al passo index: i passi si sommano, così si può saltare a qualsiasi punto
export function stateAt(scene, index) {
  const states = new Map(scene.actors.map((actor) => [actor.id, { show: actor.kind !== "token", ...actor }]));
  for (let step = 0; step <= index; step++) {
    for (const [id, partial] of Object.entries(scene.steps[step].set ?? {})) {
      const { from, ...rest } = partial;
      Object.assign(states.get(id), rest);
    }
  }
  return states;
}

// Una posizione è [x, y], l'id di un attore o { of: id, dx, dy }. I messaggi diretti a un nodo
// si fermano sopra di esso (o sotto, se il nodo è in alto) per non coprirlo.
function resolve(ref, states, forToken = false) {
  if (Array.isArray(ref)) return ref;
  if (typeof ref === "string") {
    const [x, y] = resolve(states.get(ref).at, states);
    return forToken ? [x, y >= 30 ? y - 13 : y + 21] : [x, y];
  }
  const [x, y] = resolve(ref.of, states);
  return [x + (ref.dx ?? 0), y + (ref.dy ?? 0)];
}

// I messaggi sono larghi fino a un terzo del palco: si tengono lontani dai bordi per non tagliarli
const TOKEN_MARGIN = 17;
const keepInside = (kind, [x, y]) =>
  kind === "token" ? [Math.min(100 - TOKEN_MARGIN, Math.max(TOKEN_MARGIN, x)), y] : [x, y];

function place(node, [x, y]) {
  node.style.setProperty("--x", `${x}%`);
  node.style.setProperty("--y", `${y}%`);
}

function renderLines(list, lines) {
  list.replaceChildren(
    ...lines.map((line) => {
      const item = element("li", "", typeof line === "string" ? line : line.t);
      if (line.s) item.dataset.state = line.s;
      return item;
    }),
  );
}

function fill(node, kind, state) {
  const set = (selector, value) => {
    const target = node.querySelector(selector);
    if (target.textContent !== (value ?? "")) target.textContent = value ?? "";
  };
  if (kind === "node") {
    set(".node-icon", state.icon);
    set(".node-label", state.label);
    set(".node-note", state.note);
  }
  if (kind === "card") {
    set(".card-title", state.label);
    renderLines(node.querySelector(".card-lines"), state.lines ?? []);
  }
  if (kind === "token") set(".token-text", state.text);
  if (kind === "zone") set(".zone-label", state.label);
  if (kind === "meter") {
    set(".meter-label", state.label);
    set(".meter-value", `${state.value ?? 0}%`);
    node.style.setProperty("--value", `${state.value ?? 0}%`);
  }
}

// animate: passo successivo riprodotto in sequenza (con gli spostamenti "from" → "at")
export function applyStep(stage, scene, elements, index, animate) {
  const states = stateAt(scene, index);
  const partials = scene.steps[index].set ?? {};
  const travelling = [];
  for (const [id, node] of elements) {
    const state = states.get(id);
    const wasHidden = node.classList.contains("is-hidden");
    node.classList.toggle("is-hidden", !state.show);
    node.dataset.state = state.state ?? "";
    if (state.kind === "link") {
      const [x1, y1] = resolve(state.from, states);
      const [x2, y2] = resolve(state.to, states);
      node.setAttribute("x1", x1);
      node.setAttribute("y1", y1);
      node.setAttribute("x2", x2);
      node.setAttribute("y2", y2);
      node.classList.toggle("is-dashed", Boolean(state.dashed));
      continue;
    }
    fill(node, state.kind, state);
    const target = keepInside(state.kind, resolve(state.at, states, state.kind === "token"));
    const from = partials[id]?.from;
    if (animate && from && state.show) {
      node.classList.add("no-motion");
      place(node, keepInside(state.kind, resolve(from, states, state.kind === "token")));
      travelling.push([node, target]);
    } else if (wasHidden && state.show) {
      // Un attore che compare non deve "volare" dalla posizione in cui era nascosto
      node.classList.add("no-motion");
      place(node, target);
      travelling.push([node, target]);
    } else {
      place(node, target);
    }
  }
  if (travelling.length) {
    void stage.offsetWidth;
    for (const [node, target] of travelling) {
      node.classList.remove("no-motion");
      place(node, target);
    }
  }
}
