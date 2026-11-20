// D3: Claude Code dal terminale. Si avvia con `claude`, lavora sui file, chiede il permesso per i comandi
const AVVIO = ["$ claude"];
const RICHIESTA = [...AVVIO, "> Aggiungi il campo telefono al modulo e verifica i test"];
const AMBIENTI = ["editor", "desktop", "web"];

export const d3Terminale = {
  id: "terminale",
  title: "Dal terminale",
  summary: "Si avvia con «claude» e lavora sui file del progetto",
  actors: [
    { id: "tu", kind: "node", tone: "person", icon: "☺", label: "Tu", at: [8, 46] },
    { id: "term", kind: "card", tone: "terminal", label: "Terminale", at: [32, 46], w: 36, lines: AVVIO },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude Code", at: [66, 18], show: false },
    { id: "files", kind: "node", icon: "▭", label: "File del progetto", at: [85, 46], show: false },
    { id: "editor", kind: "node", icon: "‹›", label: "Editor", at: [52, 82], show: false },
    { id: "desktop", kind: "node", icon: "▣", label: "App desktop", at: [70, 82], show: false },
    { id: "web", kind: "node", icon: "◎", label: "Browser", at: [88, 82], show: false },
    { id: "lt", kind: "link", from: "tu", to: "term" },
    { id: "tc", kind: "link", from: "term", to: "claude", show: false },
    { id: "cf", kind: "link", from: "claude", to: "files", show: false },
    ...AMBIENTI.map((id) => ({ id: `l${id}`, kind: "link", from: "claude", to: id, dashed: true, show: false })),
  ],
  steps: [
    {
      text: "Claude Code si può usare dal terminale, la finestra in cui si scrivono comandi invece di cliccare. Si avvia con una parola sola: claude.",
      set: { tu: { state: "active" }, lt: { state: "active" }, term: { state: "active" } },
    },
    {
      text: "Si apre una conversazione dentro la cartella del progetto. La richiesta si scrive in italiano, come in una chat.",
      set: {
        lt: { state: "" },
        term: { lines: RICHIESTA },
        claude: { show: true, state: "active" },
        tc: { show: true, state: "active" },
      },
    },
    {
      text: "Claude Code legge i file del progetto e prepara la modifica, direttamente sul tuo computer.",
      set: {
        tu: { state: "" },
        tc: { state: "" },
        claude: { state: "thinking" },
        files: { show: true, state: "active", note: "letti" },
        cf: { show: true, state: "active" },
        term: { lines: [...RICHIESTA, "• Leggo modulo.tsx e i suoi test…"] },
      },
    },
    {
      text: "Prima di lanciare un comando chiede il permesso: «Posso eseguire npm test?». Sei tu a decidere cosa può fare.",
      set: {
        claude: { state: "warn" },
        cf: { state: "" },
        files: { state: "", note: "modificato" },
        tu: { state: "active" },
        lt: { state: "active" },
        tc: { state: "active" },
        term: {
          lines: [...RICHIESTA, "• Modifico modulo.tsx", { t: "? Posso eseguire npm test? (sì / no)", s: "accent" }],
        },
      },
    },
    {
      text: "Approvi: il test parte e il risultato torna a Claude, che lo legge e decide il passo successivo. Qui i test passano e il lavoro è finito.",
      set: {
        tu: { state: "" },
        lt: { state: "" },
        tc: { state: "" },
        claude: { state: "ok" },
        files: { state: "ok" },
        term: {
          state: "ok",
          lines: [...RICHIESTA, "• Modifico modulo.tsx", "$ npm test", { t: "✓ 12 test superati", s: "ok" }],
        },
      },
    },
    {
      text: "Il motore è lo stesso anche nell'editor, nell'app desktop e nel browser: valgono le stesse istruzioni (CLAUDE.md), impostazioni, skill e collegamenti MCP.",
      set: {
        term: { state: "" },
        claude: { state: "active", note: "stesso motore" },
        ...Object.fromEntries(AMBIENTI.map((id) => [id, { show: true }])),
        ...Object.fromEntries(AMBIENTI.map((id) => [`l${id}`, { show: true }])),
      },
    },
  ],
};
