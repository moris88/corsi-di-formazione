// Le basi: Claude scrive un pezzo alla volta e conosce solo il testo che ha davanti
export const basiParole = {
  id: "parole",
  title: "Dalla domanda alla risposta",
  summary: "Claude legge il testo e scrive una parola alla volta",
  actors: [
    { id: "tu", kind: "node", tone: "person", icon: "☺", label: "Tu", at: [12, 50] },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [50, 50] },
    { id: "gestionale", kind: "node", icon: "▤", label: "Gestionale", at: [86, 74], show: false },
    { id: "tc", kind: "link", from: "tu", to: "claude" },
    { id: "cg", kind: "link", from: "claude", to: "gestionale", dashed: true, show: false },
    { id: "parole", kind: "card", label: "Parole possibili", at: [50, 16], w: 30, show: false },
    { id: "domanda", kind: "token", at: "tu" },
    { id: "risposta", kind: "token", at: { of: "claude", dy: 26 } },
  ],
  steps: [
    {
      text: "Tu scrivi una richiesta in linguaggio normale, come la scriveresti a un collega: «Scrivi un invito per la cena di venerdì».",
      set: { tu: { state: "active" }, domanda: { show: true, text: "Scrivi un invito per la cena di venerdì" } },
    },
    {
      text: "Il testo arriva a Claude. Claude non cerca su internet e non apre archivi: lavora solo sul testo che ha davanti.",
      set: {
        tu: { state: "" },
        tc: { state: "active" },
        claude: { state: "active" },
        domanda: { from: "tu", at: "claude" },
      },
    },
    {
      text: "Per iniziare, Claude valuta quale parola è la più adatta. Non pesca una frase già pronta: sceglie un pezzo alla volta.",
      set: {
        tc: { state: "" },
        claude: { state: "thinking" },
        domanda: { show: false },
        parole: {
          show: true,
          label: "Prima parola",
          lines: [{ t: "Ciao → 61%", s: "accent" }, "Caro → 27%", "Gentile → 12%"],
        },
      },
    },
    {
      text: "Poi sceglie la parola dopo, e quella dopo ancora. Ogni scelta tiene conto di tutto ciò che è già stato scritto.",
      set: {
        parole: { label: "Dopo «Ciao Marco,»", lines: [{ t: "venerdì → 54%", s: "accent" }, "ti → 31%", "sei → 15%"] },
        risposta: { show: true, text: "Ciao Marco, venerdì…", from: { of: "claude" } },
      },
    },
    {
      text: "Pezzo dopo pezzo la risposta è completa e torna a te. Questo è un modello linguistico: bravissimo a scrivere, riassumere e ragionare sul testo.",
      set: {
        parole: { show: false },
        claude: { state: "ok" },
        tu: { state: "ok" },
        tc: { state: "active" },
        risposta: { text: "Ciao Marco, venerdì alle 20 cena da noi: ti aspettiamo!", state: "ok", at: "tu" },
      },
    },
    {
      text: "Ora chiedi: «Dov'è il mio ordine 67890?». Quel dato sta nel gestionale dell'azienda, non nel testo che Claude ha davanti.",
      set: {
        risposta: { show: false, state: "", at: { of: "claude", dy: 26 } },
        tu: { state: "" },
        tc: { state: "" },
        claude: { state: "thinking" },
        domanda: { show: true, text: "Dov'è il mio ordine 67890?", from: "tu", at: "claude" },
        gestionale: { show: true, state: "muted" },
        cg: { show: true, state: "warn" },
      },
    },
    {
      text: "Se rispondesse comunque, inventerebbe: è la cosiddetta «allucinazione». La soluzione è dargli degli strumenti per consultare il gestionale. Lo vedrai nel dominio 1.",
      set: {
        domanda: { show: false },
        claude: { state: "warn" },
        risposta: { show: true, text: "Non posso vedere i tuoi ordini", state: "warn", from: "claude", at: "tu" },
      },
    },
  ],
};
