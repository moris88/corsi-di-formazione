// D1: regola scritta nel prompt contro regola imposta dal codice (hook)
export const d1Hook = {
  id: "hook",
  title: "Regola scritta o regola vera?",
  summary: "Il prompt chiede, l'hook impone",
  actors: [
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [12, 40] },
    { id: "prog", kind: "node", icon: "⚙", label: "Programma", at: [48, 40] },
    { id: "pay", kind: "node", icon: "€", label: "Pagamenti", at: [86, 40] },
    { id: "human", kind: "node", tone: "person", icon: "☎", label: "Operatore", at: [86, 78], state: "muted" },
    {
      id: "prompt",
      kind: "card",
      label: "Istruzioni (prompt)",
      at: [17, 82],
      w: 30,
      show: false,
      lines: ["Rimborsi oltre 500 €: serve un operatore"],
    },
    {
      id: "hook",
      kind: "card",
      label: "Hook (controllo nel codice)",
      at: [50, 82],
      w: 30,
      show: false,
      lines: ["importo > 500 € → blocca e passa all'operatore"],
    },
    { id: "cp", kind: "link", from: "claude", to: "prog" },
    { id: "pp", kind: "link", from: "prog", to: "pay" },
    { id: "ph", kind: "link", from: "prog", to: "human", dashed: true },
    { id: "hk", kind: "link", from: "prog", to: "hook", show: false },
    { id: "req", kind: "token", at: "claude" },
    { id: "back", kind: "token", at: "prog" },
  ],
  steps: [
    {
      text: "Regola aziendale: i rimborsi oltre 500 € li approva una persona. Primo tentativo: la scriviamo nelle istruzioni di Claude.",
      set: { prompt: { show: true, state: "active" } },
    },
    {
      text: "Quasi sempre funziona. Ma con un cliente insistente o una conversazione molto lunga, prima o poi Claude chiede lo stesso un rimborso di 800 €.",
      set: {
        prompt: { state: "" },
        claude: { state: "warn" },
        cp: { state: "active" },
        req: { show: true, text: "send_refund(800 €)", from: "claude", at: "prog" },
      },
    },
    {
      text: "Il programma esegue ciò che gli viene chiesto: il rimborso parte. Un'istruzione nel prompt è una richiesta, non una garanzia.",
      set: {
        cp: { state: "" },
        pp: { state: "error" },
        pay: { state: "error", note: "800 € pagati" },
        req: { state: "error", from: "prog", at: "pay" },
      },
    },
    {
      text: "Secondo tentativo: la regola diventa codice. Un hook è un controllo che il programma esegue sempre, prima di ogni strumento.",
      set: {
        req: { show: false, state: "" },
        pp: { state: "" },
        pay: { state: "", note: "" },
        claude: { state: "" },
        hook: { show: true, state: "active" },
        hk: { show: true },
      },
    },
    {
      text: "Claude chiede di nuovo 800 €. Questa volta l'hook intercetta la richiesta prima che parta.",
      set: {
        cp: { state: "active" },
        hk: { state: "active" },
        prog: { state: "active", note: "controllo dell'hook" },
        req: { show: true, from: "claude", at: "prog" },
      },
    },
    {
      text: "Bloccato: il pagamento non parte e la pratica passa a un operatore. A Claude torna un messaggio che spiega cosa è successo.",
      set: {
        cp: { state: "" },
        hk: { state: "" },
        req: { text: "pratica da approvare: 800 €", from: "prog", at: "human" },
        ph: { state: "active", dashed: false },
        human: { state: "active" },
        pay: { state: "muted", note: "nessun pagamento" },
        prog: { state: "ok", note: "bloccato" },
        back: { show: true, text: "bloccato: serve un operatore", state: "warn", from: "prog", at: "claude" },
      },
    },
    {
      text: "La regola d'oro: se una regola deve valere sempre, va imposta dal codice, non chiesta nel prompt.",
      set: {
        req: { show: false },
        back: { show: false },
        ph: { state: "" },
        human: { state: "ok" },
        prompt: { state: "muted" },
        hook: { state: "ok" },
      },
    },
  ],
};
