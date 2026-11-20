// D3: plan mode (prima il piano, poi le modifiche) e hook che scattano sempre
export const d3Plan = {
  id: "plan",
  title: "Plan mode e hook",
  summary: "Prima il piano approvato, poi le modifiche",
  actors: [
    { id: "tu", kind: "node", tone: "person", icon: "☺", label: "Tu", at: [10, 34] },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude Code", at: [42, 34] },
    { id: "files", kind: "node", icon: "▭", label: "File del progetto", at: [84, 34] },
    {
      id: "piano",
      kind: "card",
      label: "Piano",
      at: [36, 80],
      w: 40,
      show: false,
      lines: [
        "1. Nuovo modulo per i token",
        "2. Aggiorna login e logout",
        "3. Adegua i test",
        "Rischio: sessioni già aperte",
      ],
    },
    {
      id: "hook",
      kind: "card",
      label: "Hook PostToolUse",
      at: [82, 80],
      w: 30,
      show: false,
      lines: ["Dopo ogni modifica → formatta il file"],
    },
    { id: "tc", kind: "link", from: "tu", to: "claude" },
    { id: "cf", kind: "link", from: "claude", to: "files", dashed: true },
    { id: "fh", kind: "link", from: "files", to: "hook", show: false },
    { id: "msg", kind: "token", at: "tu" },
  ],
  steps: [
    {
      text: "Chiedi un cambiamento grande: «Passa il login dalle sessioni ai token». Tocca molti file e ci sono scelte da fare.",
      set: {
        tu: { state: "active" },
        tc: { state: "active" },
        msg: { show: true, text: "Passa il login ai token", from: "tu", at: "claude" },
      },
    },
    {
      text: "In plan mode Claude prima esplora: legge i file, ma non può modificarne nessuno.",
      set: {
        tu: { state: "" },
        tc: { state: "" },
        msg: { show: false },
        claude: { state: "thinking", note: "plan mode · sola lettura" },
        cf: { state: "active" },
        files: { note: "letti, non toccati" },
      },
    },
    {
      text: "Poi scrive un piano, come un architetto prima di chiamare i muratori: quali file cambiare, in che ordine, con quali rischi.",
      set: { claude: { state: "active" }, cf: { state: "" }, piano: { show: true, state: "active" } },
    },
    {
      text: "Il piano arriva a te. Finché non lo approvi, nessun file viene toccato.",
      set: {
        piano: { state: "" },
        tu: { state: "active" },
        tc: { state: "active" },
        msg: { show: true, text: "Approvi il piano?", from: "claude", at: "tu" },
      },
    },
    {
      text: "Approvi, e Claude passa alle modifiche.",
      set: {
        tu: { state: "" },
        msg: { text: "Approvato ✓", state: "ok", from: "tu", at: "claude" },
        claude: { state: "active", note: "modifica i file" },
        cf: { state: "active", dashed: false },
        files: { state: "active", note: "in modifica" },
      },
    },
    {
      text: "Ogni volta che Claude modifica un file, l'hook PostToolUse lancia il formattatore. Non dipende dalla memoria di Claude: succede sempre.",
      set: {
        msg: { show: false },
        tc: { state: "" },
        hook: { show: true, state: "active" },
        fh: { show: true, state: "active" },
        files: { state: "ok", note: "formattato ✓" },
      },
    },
    {
      text: "Per correggere un refuso in un solo file, invece, il plan mode è uno spreco: si procede direttamente.",
      set: {
        claude: { state: "ok", note: "" },
        cf: { state: "" },
        fh: { state: "" },
        hook: { state: "ok" },
        piano: { state: "muted" },
      },
    },
  ],
};
