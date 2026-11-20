// D1: il loop agentico. Claude chiede uno strumento, il programma lo esegue, il risultato torna
export const d1Loop = {
  id: "loop",
  title: "Il loop agentico",
  summary: "Claude decide, il programma esegue, il risultato torna",
  actors: [
    { id: "cliente", kind: "node", tone: "person", icon: "☺", label: "Cliente", at: [10, 50] },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [42, 18] },
    { id: "prog", kind: "node", icon: "⚙", label: "Programma", at: [42, 74] },
    { id: "db", kind: "node", icon: "▤", label: "Gestionale", at: [86, 74] },
    {
      id: "strumenti",
      kind: "card",
      label: "Strumenti disponibili",
      at: [79, 22],
      w: 34,
      show: false,
      lines: ["lookup_order: cerca un ordine dal numero", "send_refund: invia un rimborso"],
    },
    { id: "l1", kind: "link", from: "cliente", to: "prog" },
    { id: "l2", kind: "link", from: "prog", to: "claude" },
    { id: "l3", kind: "link", from: "prog", to: "db" },
    { id: "m", kind: "token", at: "cliente" },
  ],
  steps: [
    {
      text: "Un cliente scrive: «Dov'è il mio ordine 67890?». Il messaggio arriva al programma, l'applicazione scritta dallo sviluppatore.",
      set: {
        cliente: { state: "active" },
        l1: { state: "active" },
        m: { show: true, text: "Dov'è il mio ordine 67890?", from: "cliente", at: "prog" },
      },
    },
    {
      text: "Il programma lo passa a Claude insieme all'elenco degli strumenti che Claude può chiedere di usare. Ognuno ha un nome e una descrizione.",
      set: {
        cliente: { state: "" },
        l1: { state: "" },
        l2: { state: "active" },
        claude: { state: "active" },
        strumenti: { show: true },
        m: { text: "messaggio + elenco strumenti", from: "prog", at: "claude" },
      },
    },
    {
      text: "Claude ragiona e non risponde ancora al cliente: chiede di usare uno strumento. «Voglio lookup_order con il numero 67890».",
      set: {
        claude: { state: "thinking" },
        strumenti: {
          lines: [{ t: "lookup_order: cerca un ordine dal numero", s: "accent" }, "send_refund: invia un rimborso"],
        },
        m: { text: "usa lookup_order(67890)", from: "claude", at: "prog" },
      },
    },
    {
      text: "Attenzione: Claude non esegue nulla. È il programma a eseguire davvero lo strumento, interrogando il gestionale.",
      set: {
        claude: { state: "" },
        prog: { state: "active" },
        l2: { state: "" },
        l3: { state: "active" },
        m: { text: "cerca l'ordine 67890", from: "prog", at: "db" },
      },
    },
    {
      text: "Il gestionale risponde: spedito il 3 marzo con il corriere X.",
      set: { db: { state: "ok" }, m: { text: "spedito il 3/3, corriere X", state: "ok", from: "db", at: "prog" } },
    },
    {
      text: "Il programma rimanda il risultato a Claude. Questo andirivieni (Claude chiede, il programma esegue, il risultato torna) è il loop agentico, e può ripetersi più volte.",
      set: {
        db: { state: "" },
        l3: { state: "" },
        l2: { state: "active" },
        prog: { note: "giro 1 completato" },
        claude: { state: "active" },
        m: { from: "prog", at: "claude" },
      },
    },
    {
      text: "Ora Claude ha il dato: risponde al cliente e dichiara di aver finito (stop_reason «end_turn»).",
      set: {
        l2: { state: "" },
        claude: { state: "ok", note: "end_turn" },
        cliente: { state: "ok" },
        m: { text: "Spedito il 3 marzo con il corriere X", from: "claude", at: "cliente" },
      },
    },
    {
      text: "Il programma chiude il ciclo perché Claude ha detto di aver finito, non perché il testo «sembra» una risposta. E per sicurezza c'è sempre un numero massimo di giri.",
      set: { prog: { state: "ok", note: "fine: end_turn · limite di giri" } },
    },
  ],
};
