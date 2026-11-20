// D2: Claude sceglie lo strumento leggendone nome e descrizione, come un annuncio di lavoro
export const d2Annuncio = {
  id: "annuncio",
  title: "Lo strumento è un annuncio di lavoro",
  summary: "Descrizioni vaghe, scelte sbagliate",
  actors: [
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [15, 50] },
    { id: "t1", kind: "card", label: "cerca", at: [64, 26], w: 50, lines: ["«Cerca informazioni.»"] },
    { id: "t2", kind: "card", label: "trova", at: [64, 70], w: 50, lines: ["«Trova i dati.»"] },
    { id: "l1", kind: "link", from: "claude", to: "t1" },
    { id: "l2", kind: "link", from: "claude", to: "t2" },
    { id: "req", kind: "token", at: "claude" },
    { id: "ris", kind: "token", at: "claude" },
  ],
  steps: [
    {
      text: "Claude non vede il codice degli strumenti: vede solo un nome e una descrizione. Come un candidato che legge un annuncio di lavoro.",
      set: { claude: { state: "active" } },
    },
    {
      text: "Arriva la richiesta: «Dov'è il mio ordine 67890?». Con descrizioni vaghe come queste, quale strumento scegliere?",
      set: {
        req: { show: true, text: "Dov'è il mio ordine 67890?", from: [17, 2] },
        claude: { state: "thinking", note: "quale dei due?" },
        t1: { state: "warn" },
        t2: { state: "warn" },
      },
    },
    {
      text: "Claude tira a indovinare e sceglie lo strumento sbagliato: ottiene dati inutili. Il problema non era Claude, era l'annuncio.",
      set: {
        claude: { state: "warn", note: "scelta sbagliata" },
        t1: { state: "" },
        t2: { state: "error" },
        l2: { state: "error" },
      },
    },
    {
      text: "Riscriviamo le descrizioni: cosa fa lo strumento, quali dati vuole, cosa restituisce e quando NON usarlo.",
      set: {
        claude: { state: "", note: "" },
        l2: { state: "" },
        t1: {
          state: "active",
          label: "cerca_ordine",
          lines: [
            "Cerca un ordine dal suo numero (es. 67890).",
            "Restituisce stato e spedizione.",
            "Non usarlo per i dati del cliente.",
          ],
        },
        t2: {
          state: "active",
          label: "cerca_cliente",
          lines: [
            "Cerca un cliente dalla sua email.",
            "Restituisce nome e storico degli ordini.",
            "Non usarlo per lo stato di un ordine.",
          ],
        },
      },
    },
    {
      text: "Ora la scelta è ovvia: cerca_ordine, che restituisce il dato giusto. Quando Claude sbaglia strumento, la prima cosa da migliorare è la descrizione.",
      set: {
        req: { show: false },
        ris: { show: true, text: "stato: spedito il 3/3", state: "ok", from: "t1", at: "claude" },
        claude: { state: "ok", note: "cerca_ordine ✓" },
        t1: { state: "ok" },
        t2: { state: "muted" },
        l1: { state: "ok" },
      },
    },
    {
      text: "Ultimo consiglio: pochi strumenti per agente, 4 o 5. Con venti annunci simili anche il candidato migliore si confonde.",
      set: { ris: { show: false }, claude: { note: "max 4-5 strumenti" }, t2: { state: "" }, l1: { state: "" } },
    },
  ],
};
