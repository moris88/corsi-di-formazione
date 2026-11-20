// D5: quando passare il caso a un operatore umano (e quando no)
const INGRESSO = "cliente";

export const d5Escalation = {
  id: "escalation",
  title: "Quando passare la mano a una persona",
  summary: "Escalation: i criteri giusti e quelli sbagliati",
  actors: [
    { id: "cliente", kind: "node", tone: "person", icon: "☺", label: "Cliente", at: [10, 42] },
    { id: "agente", kind: "node", tone: "claude", icon: "✳", label: "Agente", at: [44, 42] },
    { id: "ca", kind: "link", from: "cliente", to: "agente" },
    { id: "operatore", kind: "node", tone: "person", icon: "☎", label: "Operatore", at: [86, 42] },
    { id: "ao", kind: "link", from: "agente", to: "operatore", dashed: true },
    {
      id: "consegne",
      kind: "card",
      label: "Passaggio di consegne",
      at: [72, 76],
      w: 44,
      show: false,
      lines: [
        "ID cliente: 12345",
        "Richiesta: parlare con una persona",
        "Già fatto: verifica ordine 67890",
        "Serve: decisione sul rimborso",
      ],
    },
    { id: "caso", kind: "token", at: "agente" },
    { id: "esito", kind: "token", at: "agente" },
  ],
  steps: [
    {
      text: "Un agente di assistenza deve capire quando passare un caso a un operatore umano. Troppi passaggi intasano gli operatori, troppo pochi lasciano i clienti senza aiuto.",
      set: { agente: { state: "active" } },
    },
    {
      text: "Caso 1: «SONO FURIOSO!!! Mi avete addebitato 5 € due volte!». Tono acceso, ma il problema è semplice.",
      set: {
        agente: { state: "thinking" },
        caso: { show: true, text: "SONO FURIOSO!!! Addebito doppio di 5 €", state: "warn", from: INGRESSO },
      },
    },
    {
      text: "Nessun passaggio: l'agente rimborsa i 5 € e chiude il caso. L'emozione non equivale alla complessità.",
      set: {
        agente: { state: "ok" },
        caso: { show: false },
        esito: { show: true, text: "Fatto: rimborsati i 5 €", state: "ok", from: "agente", at: "cliente" },
        cliente: { state: "ok" },
      },
    },
    {
      text: "Caso 2: un cliente calmo chiede come il contratto di servizio (SLA) si combina con le norme europee sui dati. Tono tranquillo, problema fuori dalla policy.",
      set: {
        esito: { show: false },
        cliente: { state: "" },
        agente: { state: "thinking" },
        caso: {
          show: true,
          text: "Come si combina lo SLA con le norme UE sui dati?",
          state: "",
          from: INGRESSO,
          at: "agente",
        },
      },
    },
    {
      text: "Qui il passaggio è giusto: la policy non copre il caso, e l'agente non deve decidere da solo.",
      set: {
        agente: { state: "", note: "fuori dalla policy" },
        ao: { state: "active", dashed: false },
        operatore: { state: "active" },
        caso: { from: "agente", at: "operatore" },
      },
    },
    {
      text: "Caso 3: «Vorrei parlare con una persona». Si passa subito, senza fare altre domande.",
      set: {
        agente: { note: "richiesta esplicita" },
        caso: { text: "Vorrei parlare con una persona", from: INGRESSO, at: "operatore" },
      },
    },
    {
      text: "Il passaggio non è un «arrangiati»: l'operatore riceve un riepilogo con ID cliente, cosa è già stato fatto e cosa serve, così il cliente non deve ripetere tutto.",
      set: { caso: { show: false }, consegne: { show: true, state: "active" }, operatore: { state: "ok" } },
    },
    {
      text: "Da ricordare: non si decide in base al tono, alla durata della conversazione o a quanto il modello si dice «sicuro». Contano la richiesta esplicita, i casi che la policy non copre e la mancanza di progressi.",
      set: { ao: { state: "" }, consegne: { state: "ok" }, agente: { state: "ok", note: "" } },
    },
  ],
};
