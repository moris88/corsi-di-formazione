// Salvataggio dell'allenamento in corso in localStorage, per riprenderlo dopo un blocco del browser
const SESSION_KEY = "ccaf-training-session";
const FIELDS = [
  "index",
  "confirmed",
  "correct",
  "wrong",
  "startedAt",
  "marathon",
  "deadline",
  "questionDeadline",
  "frozenLeft",
  "pausedAt",
];

export function saveSession(session, minutesPerQuestion) {
  const data = { minutesPerQuestion, savedAt: Date.now() };
  for (const field of FIELDS) data[field] = session[field];
  data.items = session.items.map((it) => ({ k: it.question.key, o: it.optionOrder, a: it.answer, t: it.timedOut }));
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // Storage non disponibile: la sessione non sarà ripristinabile
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage non disponibile
  }
}

// Ricostruisce la sessione con le domande del pool; null se manca o se una domanda non esiste più
export function loadSavedSession(pool) {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
  if (!data || !Array.isArray(data.items) || !data.items.length) return null;
  const byKey = new Map(pool.map((q) => [q.key, q]));
  const items = data.items.map((it) => ({
    question: byKey.get(it.k),
    optionOrder: it.o,
    answer: it.a,
    timedOut: it.t,
  }));
  if (items.some((it) => !it.question) || data.index >= items.length) return null;
  const session = { items };
  for (const field of FIELDS) session[field] = data[field];
  // Il tempo trascorso a pagina chiusa non conta: si riparte in pausa dall'ultimo salvataggio
  if ((session.marathon || session.deadline) && !session.pausedAt) session.pausedAt = data.savedAt;
  return { session, minutesPerQuestion: data.minutesPerQuestion, savedAt: data.savedAt };
}
