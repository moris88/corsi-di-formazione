// D5: il contesto come scrivania. Si riempie, i riassunti perdono i dettagli, i fatti vanno scritti alla lettera
export const d5Scrivania = {
  id: "scrivania",
  title: "La scrivania di Claude",
  summary: "Il contesto si riempie e i riassunti perdono i dettagli",
  actors: [
    { id: "desk", kind: "zone", label: "Contesto · la scrivania di Claude", at: [39, 53], w: 74, h: 86 },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [89, 36] },
    { id: "spazio", kind: "meter", label: "Scrivania occupata", at: [89, 80], w: 18, value: 0 },
    {
      id: "sys",
      kind: "card",
      label: "Istruzioni fisse",
      at: [22, 32],
      w: 30,
      show: false,
      lines: ["Sei l'assistente clienti del negozio", "Rimborsi oltre 500 €: operatore"],
    },
    { id: "conv", kind: "card", label: "Conversazione", at: [57, 32], w: 32, show: false },
    { id: "tool", kind: "card", label: "Risultato di uno strumento", at: [22, 72], w: 30, show: false },
    { id: "facts", kind: "card", label: "Fatti del caso (non riassumere)", at: [57, 72], w: 32, show: false },
  ],
  steps: [
    {
      text: "Il contesto è tutto ciò che Claude ha davanti in un dato momento: istruzioni, conversazione, risultati degli strumenti. È la sua scrivania.",
      set: { sys: { show: true }, claude: { state: "active" }, spazio: { value: 10 } },
    },
    {
      text: "A ogni turno la scrivania si riempie: la conversazione si allunga e viene riletta per intero ogni volta.",
      set: {
        conv: {
          show: true,
          lines: [
            "Cliente: ordine 67890, totale 149,99 €",
            "Claude: verifico subito…",
            "Cliente: l'ho pagato il 15 gennaio",
            "…",
          ],
        },
        spazio: { value: 40 },
      },
    },
    {
      text: "Uno strumento restituisce 40 campi quando ne servono 5: codice di magazzino, peso, storico dei prezzi… Carta inutile che occupa spazio.",
      set: {
        tool: {
          show: true,
          state: "warn",
          lines: ["stato, spedizione, corriere…", { t: "+ 37 campi che non servono", s: "error" }],
        },
        spazio: { value: 78, state: "warn" },
      },
    },
    {
      text: "Il rimedio: filtrare il risultato prima di darlo a Claude. Restano solo i campi utili.",
      set: {
        tool: { state: "ok", lines: ["stato: spedito", "corriere: X", "tracciamento: AB123"] },
        spazio: { value: 55, state: "" },
      },
    },
    {
      text: "Quando la scrivania è troppo piena, la conversazione viene riassunta. Ma un riassunto è una parafrasi: «149,99 €» diventa «circa 150 €».",
      set: {
        conv: {
          label: "Riassunto",
          state: "warn",
          lines: [{ t: "Il cliente chiede un rimborso di circa 150 € per un ordine di metà gennaio", s: "error" }],
        },
        spazio: { value: 30 },
      },
    },
    {
      text: "La soluzione: un blocco dei fatti scritto alla lettera, che il riassunto non tocca. I numeri esatti vanno ripetuti identici.",
      set: {
        facts: {
          show: true,
          state: "ok",
          lines: ["ID cliente: 12345", "Ordine: 67890", "Totale: 149,99 €", "Pagato il: 15/01"],
        },
        spazio: { value: 34 },
      },
    },
    {
      text: "E le regole importanti stanno in un file, come CLAUDE.md: dopo un riassunto vengono rilette. Si perde solo ciò che esisteva soltanto nella conversazione.",
      set: { sys: { state: "ok" }, conv: { state: "muted" }, claude: { state: "ok" } },
    },
  ],
};
