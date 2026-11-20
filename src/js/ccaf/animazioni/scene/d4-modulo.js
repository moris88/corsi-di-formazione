// D4: output strutturato. Lo schema garantisce la forma, il codice controlla che i dati tornino
const FATTURA = ["Fornitore: Rossi Srl", "Voce A: 100 €", "Voce B: 75 €", "Sconto: −25 €", "Totale: 150 €"];

export const d4Modulo = {
  id: "modulo",
  title: "Il modulo da compilare",
  summary: "Lo schema dà la forma, il codice verifica i conti",
  actors: [
    { id: "doc", kind: "card", label: "Fattura (scansione)", at: [14, 40], w: 24, lines: FATTURA },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [38, 40] },
    {
      id: "form",
      kind: "card",
      label: "Modulo (schema)",
      at: [64, 40],
      w: 26,
      show: false,
      lines: ["fornitore: testo", "voci: importi", "totale: numero", "numero_ordine: testo o null"],
    },
    { id: "check", kind: "node", icon: "⚙", label: "Controllo del codice", at: [64, 80], show: false },
    { id: "gest", kind: "node", icon: "▤", label: "Gestionale", at: [90, 40] },
    { id: "dc", kind: "link", from: "doc", to: "claude" },
    { id: "cf", kind: "link", from: "claude", to: "form", show: false },
    { id: "fc", kind: "link", from: "form", to: "check", show: false },
    { id: "fg", kind: "link", from: "form", to: "gest", show: false },
    { id: "errore", kind: "token", at: "check" },
    { id: "invio", kind: "token", at: "gest" },
  ],
  steps: [
    {
      text: "Claude deve leggere una fattura e passarne i dati al gestionale. Il gestionale è un programma: vuole campi precisi, non un testo scritto bene.",
      set: { doc: { state: "active" }, gest: { note: "campi precisi" } },
    },
    {
      text: "Si dà a Claude un modulo da compilare, lo «schema»: quali campi ci sono, di che tipo, quali sono obbligatori.",
      set: { doc: { state: "" }, form: { show: true, state: "active" }, cf: { show: true } },
    },
    {
      text: "Claude compila il modulo leggendo la fattura. Il numero d'ordine non c'è: invece di inventarlo, scrive null, cioè «non presente».",
      set: {
        claude: { state: "active" },
        dc: { state: "active" },
        cf: { state: "active" },
        form: {
          state: "",
          lines: ["fornitore: Rossi Srl", "voci: 100, 75", "totale: 150", { t: "numero_ordine: null", s: "accent" }],
        },
      },
    },
    {
      text: "Lo schema garantisce la forma: i campi ci sono tutti e i numeri sono numeri. Ma non può sapere se i valori sono veri.",
      set: { claude: { state: "" }, dc: { state: "" }, cf: { state: "" }, form: { state: "ok" } },
    },
    {
      text: "Qui entra il controllo del codice: le voci estratte fanno 175 €, ma il totale è 150 €. I conti non tornano.",
      set: {
        form: {
          state: "warn",
          lines: ["fornitore: Rossi Srl", { t: "voci: 100, 75", s: "error" }, "totale: 150", "numero_ordine: null"],
        },
        check: { show: true, state: "error", note: "100 + 75 ≠ 150" },
        fc: { show: true, state: "error" },
      },
    },
    {
      text: "Il codice rimanda a Claude un errore preciso: «le voci sommano 175 €, il totale è 150 €». Un generico «riprova» non aiuterebbe.",
      set: {
        errore: {
          show: true,
          text: "Le voci sommano 175 €, il totale è 150 €",
          state: "warn",
          from: "check",
          at: "claude",
        },
        claude: { state: "thinking" },
      },
    },
    {
      text: "Claude rilegge la fattura e trova lo sconto di 25 € che aveva saltato. Ora i conti tornano e i dati vanno al gestionale.",
      set: {
        errore: { show: false },
        claude: { state: "ok" },
        doc: { lines: FATTURA.map((line, index) => (index === 3 ? { t: line, s: "accent" } : line)) },
        form: {
          state: "ok",
          lines: ["fornitore: Rossi Srl", { t: "voci: 100, 75, −25", s: "ok" }, "totale: 150", "numero_ordine: null"],
        },
        check: { state: "ok", note: "100 + 75 − 25 = 150 ✓" },
        fc: { state: "ok" },
        fg: { show: true, state: "ok" },
        gest: { state: "ok", note: "salvati ✓" },
        invio: { show: true, text: "dati verificati", state: "ok", from: "form", at: "gest" },
      },
    },
    {
      text: "Attenzione: riprovare serve solo se l'informazione è nel documento. Il numero d'ordine non c'è, e nessun nuovo tentativo lo farà comparire: si accetta null.",
      set: {
        doc: { lines: FATTURA },
        invio: { show: false },
        form: {
          lines: [
            "fornitore: Rossi Srl",
            "voci: 100, 75, −25",
            "totale: 150",
            { t: "numero_ordine: null ✓", s: "accent" },
          ],
        },
      },
    },
  ],
};
