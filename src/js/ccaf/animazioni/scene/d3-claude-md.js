// D3: i file CLAUDE.md a livelli, dal più generale al più specifico
const LIVELLI = ["l1", "l2", "l3", "l4"];
const UTENTE = ["Rispondimi sempre in italiano"];

export const d3ClaudeMd = {
  id: "claude-md",
  title: "CLAUDE.md: istruzioni a livelli",
  summary: "Chi riceve quali regole, e perché",
  actors: [
    {
      id: "l1",
      kind: "card",
      label: "Policy aziendale",
      at: [25, 13],
      w: 42,
      show: false,
      lines: ["Mai inviare dati dei clienti all'esterno"],
    },
    { id: "l2", kind: "card", label: "Utente (~/.claude)", at: [25, 37], w: 42, show: false, lines: UTENTE },
    {
      id: "l3",
      kind: "card",
      label: "Progetto (./CLAUDE.md)",
      at: [25, 61],
      w: 42,
      lines: ["Test con npm test, codice in TypeScript"],
    },
    {
      id: "l4",
      kind: "card",
      label: "Cartella (src/api)",
      at: [25, 85],
      w: 42,
      show: false,
      lines: ["Errori delle API gestiti così…"],
    },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude Code", at: [78, 40] },
    { id: "collega", kind: "node", tone: "person", icon: "☺", label: "Collega nuovo", at: [78, 78], show: false },
    ...LIVELLI.map((id) => ({ id: `k${id}`, kind: "link", from: id, to: "claude", show: false })),
    { id: "kc", kind: "link", from: "l3", to: "collega", show: false },
  ],
  steps: [
    {
      text: "Quando apri un progetto, Claude Code legge dei file di istruzioni chiamati CLAUDE.md: regole scritte in linguaggio normale, non in codice.",
      set: { l3: { state: "active" }, kl3: { show: true, state: "active" }, claude: { state: "active" } },
    },
    {
      text: "Non ce n'è uno solo: si caricano a livelli, dal più generale al più specifico, come i regolamenti di un'azienda.",
      set: {
        l1: { show: true },
        l2: { show: true },
        l3: { state: "" },
        kl1: { show: true },
        kl2: { show: true },
        kl3: { state: "" },
        claude: { state: "" },
      },
    },
    {
      text: "La policy aziendale vale per tutti. Il file utente contiene le tue preferenze: vale in tutti i tuoi progetti, ma resta sul tuo computer.",
      set: { l1: { state: "active" }, l2: { state: "active" } },
    },
    {
      text: "Il file di progetto sta nel repository: con Git lo riceve tutto il team. È qui che vanno le convenzioni comuni.",
      set: {
        l1: { state: "" },
        l2: { state: "" },
        l3: { state: "active" },
        collega: { show: true, state: "ok", note: "riceve ./CLAUDE.md" },
        kc: { show: true, state: "ok" },
      },
    },
    {
      text: "Errore tipico: le convenzioni del progetto scritte nel file utente. Il collega nuovo non le riceve, perché quel file non lascia il tuo computer.",
      set: {
        l3: { state: "" },
        l2: { state: "error", lines: [{ t: "Usiamo TypeScript e npm test", s: "error" }] },
        kc: { state: "" },
        collega: { state: "warn", note: "non le riceve" },
      },
    },
    {
      text: "Le istruzioni di una cartella si caricano solo quando Claude lavora lì dentro: niente rumore nel resto del progetto.",
      set: {
        l2: { state: "", lines: UTENTE },
        collega: { show: false },
        kc: { show: false },
        l4: { show: true, state: "active" },
        kl4: { show: true, state: "active", dashed: true },
        claude: { note: "lavora in src/api" },
      },
    },
    {
      text: "Tutto finisce nel contesto di Claude all'inizio della sessione, e viene riletto dal disco dopo un riassunto: per questo le regole importanti stanno in un file.",
      set: {
        ...Object.fromEntries(LIVELLI.map((id) => [id, { state: "ok" }])),
        ...Object.fromEntries(LIVELLI.map((id) => [`k${id}`, { state: "ok", dashed: false }])),
        claude: { state: "ok", note: "istruzioni caricate" },
      },
    },
  ],
};
