// Punto di ingresso della simulazione d'esame: la logica è nei moduli di ./simulazione/
import { initAppEvents, initKeyboard } from "./simulazione/events.js";
import { initFocusGuards } from "./simulazione/focus.js";
import { loadFormatGuide } from "./simulazione/formatGuide.js";
import { measureExamBar } from "./simulazione/render/exam.js";
import { renderIntro } from "./simulazione/render/intro.js";
import { loadFromWorkspace } from "./simulazione/source.js";

loadFormatGuide();
initFocusGuards();
window.addEventListener("resize", measureExamBar);
initAppEvents();
initKeyboard();

renderIntro();
loadFromWorkspace();
