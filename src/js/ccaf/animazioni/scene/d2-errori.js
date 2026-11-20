// D2: un risultato vuoto è un'informazione, un errore va segnalato come errore
export const d2Errori = {
  id: "errori",
  title: "Vuoto non vuol dire errore",
  summary: "Come raccontare a Claude cosa è andato storto",
  actors: [
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [14, 55] },
    { id: "prog", kind: "node", icon: "⚙", label: "Programma", at: [48, 55] },
    { id: "db", kind: "node", icon: "▤", label: "Archivio clienti", at: [86, 55] },
    { id: "cp", kind: "link", from: "claude", to: "prog" },
    { id: "pd", kind: "link", from: "prog", to: "db" },
    { id: "q", kind: "token", at: "claude" },
    { id: "r", kind: "token", at: "prog" },
  ],
  steps: [
    {
      text: "Claude chiede di cercare il cliente «Mario Rossi». Possono succedere due cose molto diverse, e vanno raccontate a Claude in modo diverso.",
      set: {
        cp: { state: "active" },
        q: { show: true, text: "cerca_cliente(«Mario Rossi»)", from: "claude", at: "prog" },
      },
    },
    {
      text: "Caso A: l'archivio risponde, ma non c'è nessun Mario Rossi. Non è un errore: è un'informazione valida.",
      set: {
        cp: { state: "" },
        pd: { state: "active" },
        q: { from: "prog", at: "db" },
        db: { state: "ok", note: "0 risultati" },
      },
    },
    {
      text: "Il programma lo riferisce così com'è: «nessun cliente trovato». Claude reagisce nel modo giusto e chiede al cliente la sua email.",
      set: {
        q: { show: false },
        pd: { state: "" },
        r: { show: true, text: "nessun cliente trovato", state: "ok", from: "db", at: "claude" },
        claude: { state: "ok", note: "chiede l'email" },
      },
    },
    {
      text: "Caso B: l'archivio non risponde (timeout). Questo sì è un errore, e va segnalato come tale, con dettagli utili.",
      set: {
        r: { show: false },
        claude: { state: "", note: "" },
        q: { show: true, from: "prog", at: "db" },
        pd: { state: "error" },
        db: { state: "error", note: "timeout" },
      },
    },
    {
      text: "Il programma lo segnala come errore (is_error) e specifica che è temporaneo. Claude sa che può riprovare, invece di dire al cliente che non esiste.",
      set: {
        q: { show: false },
        r: { show: true, text: "is_error · timeout · temporaneo, riprova", state: "warn", from: "prog", at: "claude" },
        claude: { state: "ok", note: "riproverà" },
      },
    },
    {
      text: "L'errore da evitare: rispondere «nessun risultato» anche quando l'archivio è irraggiungibile. Claude concluderebbe che il cliente non esiste.",
      set: {
        r: { text: "[ ] nessun risultato", state: "error", from: "prog", at: "claude" },
        claude: { state: "error", note: "conclusione ✕" },
      },
    },
  ],
};
