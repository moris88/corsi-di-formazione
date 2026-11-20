// D1: hub-and-spoke. Il coordinatore scompone il lavoro e scrive incarichi completi ai subagenti
const VERSO = (id) => ({ of: id, dx: -21 });

export const d1Subagenti = {
  id: "subagenti",
  title: "Coordinatore e subagenti",
  summary: "Un agente scompone il lavoro, altri lo svolgono",
  actors: [
    { id: "tu", kind: "node", tone: "person", icon: "☺", label: "Tu", at: [10, 50] },
    { id: "coord", kind: "node", tone: "claude", icon: "✳", label: "Coordinatore", at: [40, 50] },
    { id: "s1", kind: "node", tone: "claude", icon: "✳", label: "Ricerca web", at: [84, 18], show: false },
    { id: "s2", kind: "node", tone: "claude", icon: "✳", label: "Analisi documenti", at: [84, 50], show: false },
    { id: "s3", kind: "node", tone: "claude", icon: "✳", label: "Sintesi", at: [84, 80], show: false },
    { id: "c1", kind: "link", from: "coord", to: "s1", show: false },
    { id: "c2", kind: "link", from: "coord", to: "s2", show: false },
    { id: "c3", kind: "link", from: "coord", to: "s3", show: false },
    { id: "tc", kind: "link", from: "tu", to: "coord" },
    { id: "compito", kind: "token", at: "tu" },
    { id: "b1", kind: "token", at: "coord" },
    { id: "b2", kind: "token", at: "coord" },
    { id: "b3", kind: "token", at: "coord" },
  ],
  steps: [
    {
      text: "Arriva un compito grande: «Prepara un rapporto sull'IA nella musica». Troppo per un solo agente, che si perderebbe tra mille ricerche.",
      set: {
        tu: { state: "active" },
        tc: { state: "active" },
        compito: { show: true, text: "Rapporto: l'IA nella musica", from: "tu", at: "coord" },
      },
    },
    {
      text: "Un agente coordinatore (il mozzo, «hub») scompone il lavoro e lo affida a subagenti specializzati (i raggi, «spoke»), ognuno con i suoi strumenti.",
      set: {
        tu: { state: "" },
        tc: { state: "" },
        compito: { show: false },
        coord: { state: "active" },
        s1: { show: true },
        s2: { show: true },
        s3: { show: true },
        c1: { show: true },
        c2: { show: true },
        c3: { show: true },
      },
    },
    {
      text: "Punto fondamentale: un subagente non eredita nulla di ciò che sa il coordinatore. Parte con il foglio bianco.",
      set: {
        s1: { state: "muted", note: "sa: nulla" },
        s2: { state: "muted", note: "sa: nulla" },
        s3: { state: "muted", note: "sa: nulla" },
      },
    },
    {
      text: "Per questo il coordinatore scrive a ciascuno un incarico completo: obiettivo, informazioni già raccolte, limiti e formato del risultato.",
      set: {
        b1: { show: true, text: "incarico completo", from: "coord", at: VERSO("s1") },
        b2: { show: true, text: "incarico completo", from: "coord", at: VERSO("s2") },
        b3: { show: true, text: "incarico completo", from: "coord", at: VERSO("s3") },
        s1: { state: "", note: "incarico ✓" },
        s2: { state: "", note: "incarico ✓" },
        s3: { state: "", note: "incarico ✓" },
      },
    },
    {
      text: "Le due ricerche non dipendono l'una dall'altra, quindi partono in parallelo: si risparmia tempo. La sintesi aspetta i loro risultati.",
      set: {
        b1: { show: false },
        b2: { show: false },
        b3: { show: false },
        coord: { state: "" },
        s1: { state: "thinking", note: "al lavoro" },
        s2: { state: "thinking", note: "al lavoro" },
        s3: { note: "in attesa" },
        c1: { state: "active" },
        c2: { state: "active" },
      },
    },
    {
      text: "I risultati tornano al coordinatore, che non li inoltra a occhi chiusi: li valuta.",
      set: {
        s1: { state: "", note: "fatto" },
        s2: { state: "", note: "fatto" },
        c1: { state: "" },
        c2: { state: "" },
        coord: { state: "thinking" },
        b1: { show: true, text: "risultati + fonti", from: VERSO("s1"), at: { of: "coord", dy: -14 } },
        b2: { show: true, text: "risultati + fonti", from: VERSO("s2"), at: { of: "coord", dy: 23 } },
      },
    },
    {
      text: "Trova un buco: manca la musica classica. Rimanda la ricerca web con un incarico più preciso.",
      set: {
        b2: { show: false },
        b1: { text: "manca: musica classica", state: "warn", from: { of: "coord", dy: -14 }, at: VERSO("s1") },
        coord: { state: "active" },
        c1: { state: "warn" },
        s1: { state: "warn", note: "nuovo incarico" },
      },
    },
    {
      text: "Quando tutto è completo, la sintesi riceve i materiali con le fonti e il coordinatore ti consegna il rapporto.",
      set: {
        b1: { show: false },
        c1: { state: "" },
        s1: { state: "ok", note: "fatto" },
        s2: { state: "ok" },
        s3: { state: "ok", note: "fatto" },
        c3: { state: "ok" },
        coord: { state: "ok" },
        tu: { state: "ok" },
        compito: { show: true, text: "Rapporto completo, con le fonti", state: "ok", from: "coord", at: "tu" },
      },
    },
  ],
};
