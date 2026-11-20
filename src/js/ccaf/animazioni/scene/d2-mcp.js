// D2: MCP come presa standard tra Claude e i sistemi esterni; credenziali fuori dai file condivisi
export const d2Mcp = {
  id: "mcp",
  title: "MCP: la presa universale",
  summary: "Un unico standard per collegare Claude ai sistemi",
  actors: [
    { id: "app", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [50, 50] },
    { id: "git", kind: "node", icon: "‹›", label: "Codice (Git)", at: [12, 16] },
    { id: "db", kind: "node", icon: "▤", label: "Database", at: [12, 74] },
    { id: "chat", kind: "node", icon: "✉", label: "Chat aziendale", at: [88, 16] },
    { id: "docs", kind: "node", icon: "▭", label: "Documenti", at: [88, 74] },
    { id: "l1", kind: "link", from: "app", to: "git", dashed: true, state: "warn" },
    { id: "l2", kind: "link", from: "app", to: "db", dashed: true, state: "warn" },
    { id: "l3", kind: "link", from: "app", to: "chat", dashed: true, state: "warn" },
    { id: "l4", kind: "link", from: "app", to: "docs", dashed: true, state: "warn" },
    {
      id: "offre",
      kind: "card",
      label: "Ogni server MCP offre",
      at: [50, 17],
      w: 44,
      show: false,
      lines: ["Strumenti: azioni (es. apri una segnalazione)", "Risorse: dati da leggere", "Prompt: modelli pronti"],
    },
    {
      id: "config",
      kind: "card",
      label: ".mcp.json · condiviso con il team",
      at: [50, 86],
      w: 38,
      show: false,
    },
    { id: "tool", kind: "token", at: "git" },
  ],
  steps: [
    {
      text: "Claude deve collegarsi a tanti sistemi: codice, database, chat, documenti. Senza uno standard, ogni collegamento va costruito su misura.",
      set: { app: { note: "4 collegamenti diversi" } },
    },
    {
      text: "MCP (Model Context Protocol) è come la presa USB: un formato unico. Chi offre un sistema scrive una volta un «server MCP», che funziona con qualunque applicazione compatibile.",
      set: {
        app: { note: "", state: "active" },
        ...Object.fromEntries(["l1", "l2", "l3", "l4"].map((id) => [id, { dashed: false, state: "ok" }])),
        ...Object.fromEntries(["git", "db", "chat", "docs"].map((id) => [id, { note: "server MCP" }])),
      },
    },
    {
      text: "Ogni server MCP può offrire a Claude tre cose: strumenti (azioni), risorse (dati da leggere) e prompt (modelli pronti).",
      set: { offre: { show: true } },
    },
    {
      text: "Gli strumenti dei server compaiono a Claude come tutti gli altri: con un nome e una descrizione. Le regole del buon annuncio valgono anche qui.",
      set: {
        offre: {
          lines: [
            { t: "Strumenti: azioni (es. apri una segnalazione)", s: "accent" },
            "Risorse: dati da leggere",
            "Prompt: modelli pronti",
          ],
        },
        l1: { state: "active" },
        tool: { show: true, text: "apri_segnalazione · «Apre una segnalazione…»", from: "git", at: "app" },
      },
    },
    {
      text: "Il collegamento si configura in un file condiviso con il team. Scriverci dentro la propria password sarebbe un errore grave: la vedrebbero tutti.",
      set: {
        tool: { show: false },
        l1: { state: "ok" },
        config: { show: true, state: "error", lines: [{ t: "token: ghp_9xK2…  ✕", s: "error" }] },
      },
    },
    {
      text: "Si scrive invece il nome di una variabile d'ambiente: ognuno la imposta sul proprio computer con le sue credenziali, e il file si condivide senza rischi.",
      set: {
        // biome-ignore lint/suspicious/noTemplateCurlyInString: è il testo letterale del file .mcp.json
        config: { state: "ok", lines: [{ t: "token: ${GITHUB_TOKEN}  ✓", s: "ok" }] },
        app: { state: "ok" },
      },
    },
  ],
};
