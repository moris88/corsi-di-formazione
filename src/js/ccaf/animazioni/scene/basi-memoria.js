// Le basi: Claude non ha memoria, il programma gli rimanda ogni volta tutta la conversazione
const MITTENTE = [38, 20];
const CLAUDE = [69, 20];

export const basiMemoria = {
  id: "memoria",
  title: "Claude non ricorda: rilegge",
  summary: "A ogni messaggio il programma rimanda tutta la conversazione",
  actors: [
    { id: "tu", kind: "node", tone: "person", icon: "☺", label: "Tu", at: [10, 56] },
    { id: "app", kind: "node", icon: "⚙", label: "Programma di chat", at: [38, 56] },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [88, 56] },
    { id: "ta", kind: "link", from: "tu", to: "app" },
    { id: "ac", kind: "link", from: "app", to: "claude" },
    { id: "foglio", kind: "card", label: "Foglio inviato a Claude", at: MITTENTE, w: 34, show: false },
    { id: "spazio", kind: "meter", label: "Spazio occupato", at: [63, 90], w: 30, value: 0, show: false },
    { id: "msg", kind: "token", at: "tu" },
  ],
  steps: [
    {
      text: "In chat sembra che Claude si ricordi tutto. In realtà, tra un messaggio e l'altro, Claude non conserva nulla: ogni richiesta riparte da zero.",
      set: { claude: { state: "muted", note: "memoria: vuota" } },
    },
    {
      text: "Primo messaggio: «Mi chiamo Anna». Lo riceve il programma, cioè l'applicazione di chat che stai usando.",
      set: {
        tu: { state: "active" },
        ta: { state: "active" },
        msg: { show: true, text: "Mi chiamo Anna", from: "tu", at: "app" },
      },
    },
    {
      text: "Il programma scrive il messaggio su un foglio e manda a Claude il foglio intero.",
      set: {
        tu: { state: "" },
        ta: { state: "" },
        ac: { state: "active" },
        msg: { show: false },
        foglio: { show: true, lines: ["Anna: Mi chiamo Anna"], from: MITTENTE, at: CLAUDE },
        claude: { state: "active", note: "" },
      },
    },
    {
      text: "Claude risponde «Piacere, Anna!», la risposta arriva a te e Claude dimentica tutto. Il programma aggiunge la risposta al foglio e lo tiene da parte.",
      set: {
        ac: { state: "" },
        claude: { state: "muted", note: "memoria: vuota" },
        foglio: { lines: ["Anna: Mi chiamo Anna", "Claude: Piacere, Anna!"], from: CLAUDE, at: MITTENTE },
        msg: { show: true, text: "Piacere, Anna!", state: "ok", from: "claude", at: "tu" },
      },
    },
    {
      text: "Secondo messaggio: «Come mi chiamo?». Il programma non manda solo la domanda: rimanda tutto il foglio, dall'inizio.",
      set: {
        ac: { state: "active" },
        claude: { state: "active", note: "" },
        msg: { show: false, state: "" },
        foglio: {
          lines: ["Anna: Mi chiamo Anna", "Claude: Piacere, Anna!", { t: "Anna: Come mi chiamo?", s: "accent" }],
          from: MITTENTE,
          at: CLAUDE,
        },
      },
    },
    {
      text: "Claude rilegge tutto e risponde «Ti chiami Anna». Non se lo ricordava: lo ha appena letto di nuovo sul foglio.",
      set: {
        ac: { state: "" },
        claude: { state: "ok" },
        msg: { show: true, text: "Ti chiami Anna", state: "ok", from: "claude", at: "tu" },
      },
    },
    {
      text: "Per questo il foglio, chiamato «contesto», si allunga a ogni turno e ha un limite di spazio. Gestirlo bene è il tema del dominio 5.",
      set: { msg: { show: false }, spazio: { show: true, value: 35 }, foglio: { state: "active" } },
    },
  ],
};
