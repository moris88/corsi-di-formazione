// I test vengono scoperti automaticamente: "questions/Domande e risposte test N - ..."
// finché non si incontrano due numeri consecutivi mancanti.
export const FILE_PATTERN = (n) =>
  `../../assets/ccaf/questions/Domande e risposte test ${n} - Claude Certified Architect.md`;
export const PRESETS = [5, 10, 20, 30, 60];
export const MAX_QUESTIONS = PRESETS[PRESETS.length - 1];
export const MARATHON_MS = 2 * 60000;
export const EXTRA_PRESETS = [5, 10, 20];

// Difficoltà dei test (come nelle etichette di simulazione.html).
// Un file può sovrascriverla con "difficulty: facile|medio|difficile|avanzato|inferno" nel frontmatter.
export const DIFFICULTIES = ["inferno", "avanzato", "difficile", "medio", "facile"];
export const DIFFICULTY_LABELS = {
  casuale: "Casuale (tutti)",
  inferno: "Inferno",
  avanzato: "Avanzato",
  difficile: "Difficile",
  medio: "Medio",
  facile: "Facile",
};
export const TEST_DIFFICULTY = {
  1: "facile",
  2: "medio",
  3: "medio",
  4: "difficile",
  5: "difficile",
  6: "difficile",
  7: "difficile",
  8: "difficile",
  9: "difficile",
  10: "difficile",
  11: "avanzato",
  12: "avanzato",
  13: "inferno",
};
