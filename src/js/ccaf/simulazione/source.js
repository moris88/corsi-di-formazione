// Caricamento della banca quesiti: test del workspace, file importati e ripresa della prova salvata
import { bankLoaderHtml } from "../../loader.js";
import { escapeHtml } from "../../utils.js";
import { finishExam } from "./exam.js";
import { resumeFullscreen } from "./focus.js";
import { hashSource, parseQuestionBank } from "./parser.js";
import { renderExam } from "./render/exam.js";
import { renderIntro } from "./render/intro.js";
import { app, BUILTIN_TESTS, state } from "./state.js";
import { safeStorageGet, safeStorageRemove } from "./storage.js";

export function setSource(raw, label) {
  const parsed = parseQuestionBank(raw);
  state.currentSource = { raw, name: label };
  state.questionBank = parsed.questions;
  state.testTitle = parsed.title;
  state.testDifficulty =
    parsed.difficulty ||
    (BUILTIN_TESTS.find((test) => test.file === state.selectedPreset)?.label.split("· ")[1] || "").toLowerCase();
  state.testDurationMinutes = parsed.durationMinutes;
  state.totalQuestions = state.questionBank.length;
  state.durationMs = state.testDurationMinutes * 60 * 1000;
  state.sourceFingerprint = hashSource(raw);
  state.sourceReady = true;
  state.sourceError = "";
  state.sourceMessage = `${state.questionBank.length} domande caricate · ${label}`;
  const saved = safeStorageGet();
  if (
    saved &&
    saved.status === "active" &&
    saved.sourceFingerprint === state.sourceFingerprint &&
    Array.isArray(saved.order) &&
    saved.order.length === state.questionBank.length
  ) {
    const ids = new Set(state.questionBank.map((question) => question.id));
    const valid = saved.order.every(
      (item) => ids.has(Number(item.id)) && Array.isArray(item.optionOrder) && item.optionOrder.length === 4,
    );
    if (valid) {
      state.exam = saved;
      if (state.exam.deadline && state.exam.deadline <= Date.now()) {
        finishExam(true);
      } else {
        renderExam();
        resumeFullscreen();
      }
      return;
    }
  }
  // Prova salvata non riprendibile (banca cambiata o assente): va eliminata, altrimenti
  // theme.js continuerebbe a riportare su questa pagina
  if (!state.exam && saved?.status === "active") safeStorageRemove();
  renderIntro();
}

export async function loadPreset(filename) {
  const preset = BUILTIN_TESTS.find((test) => test.file === filename);
  if (!preset) return;
  state.selectedPreset = preset.file;
  state.sourceReady = false;
  state.sourceError = "";
  state.sourceMessage = `Caricamento ${preset.label}…`;
  app.innerHTML = bankLoaderHtml("Preparo la simulazione", escapeHtml(preset.label));
  try {
    // Durata minima, così l'animazione si vede anche quando il file arriva subito
    const [response] = await Promise.all([
      fetch(new URL(preset.file, window.location.href), { cache: "no-store" }),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
    if (!response.ok) throw new Error(`Risposta HTTP ${response.status}`);
    setSource(await response.text(), preset.label);
  } catch (_error) {
    state.sourceReady = false;
    state.sourceMessage = "Banca quesiti non caricata";
    state.sourceError = `Non è stato possibile caricare ${preset.label}. Puoi importare il file manualmente.`;
    renderIntro();
  }
}

// All'avvio: se c'è una prova in corso si ricarica la sua banca e setSource la riprende
// (il timer usa una scadenza assoluta, quindi il tempo trascorso fuori dal sito è già scalato).
export function loadFromWorkspace() {
  const saved = safeStorageGet();
  if (saved?.status === "active" && saved.source?.file && BUILTIN_TESTS.some((t) => t.file === saved.source.file)) {
    loadPreset(saved.source.file);
    return;
  }
  if (saved?.status === "active" && saved.source?.raw) {
    try {
      const test = { file: "imported-1", label: "Test importato n.1", name: saved.source.name, raw: saved.source.raw };
      state.importedTests.push(test);
      state.selectedPreset = test.file;
      setSource(test.raw, test.name);
      return;
    } catch {
      /* banca salvata non più valida: si riparte dal test predefinito */
    }
  }
  loadPreset(BUILTIN_TESTS[0].file);
}

export async function importSourceFile(file) {
  if (!file) return;
  try {
    const raw = await file.text();
    parseQuestionBank(raw);
    const test = {
      file: `imported-${state.importedTests.length + 1}`,
      label: `Test importato n.${state.importedTests.length + 1}`,
      name: file.name,
      raw,
    };
    state.importedTests.push(test);
    state.selectedPreset = test.file;
    setSource(raw, file.name);
  } catch (error) {
    state.sourceReady = false;
    state.sourceMessage = "Banca quesiti non caricata";
    state.sourceError = error instanceof Error ? error.message : "Il file selezionato non è valido.";
    renderIntro();
  }
}
