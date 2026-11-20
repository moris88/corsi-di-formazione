// D4: few-shot. Pochi esempi diversi tra loro, ognuno con il suo ragionamento
const ESEMPI = [
  ["«Il pacco è arrivato aperto»", "→ reclamo_spedizione", "Perché: il problema è la consegna"],
  ["«Non riesco ad accedere!!! Nessuno risponde!»", "→ accesso_account", "Perché: conta il problema, non il tono"],
  ["«Manca un pezzo. E cambiate l'indirizzo»", "→ reclamo_spedizione", "Perché: vince il problema principale"],
];
// Le righe dell'esempio, con il ragionamento evidenziato o no
const righe = (index, evidenzia) => [
  ESEMPI[index][0],
  ESEMPI[index][1],
  evidenzia ? { t: ESEMPI[index][2], s: "accent" } : ESEMPI[index][2],
];

export const d4Esempi = {
  id: "esempi",
  title: "Insegnare con gli esempi",
  summary: "Il few-shot: pratiche già risolte, con il perché",
  actors: [
    ...ESEMPI.map((_, index) => ({
      id: `e${index + 1}`,
      kind: "card",
      label: `Esempio ${index + 1}`,
      at: [23, 17 + index * 33],
      w: 40,
      show: false,
      lines: righe(index, false),
    })),
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude", at: [66, 50] },
    ...ESEMPI.map((_, index) => ({
      id: `k${index + 1}`,
      kind: "link",
      from: `e${index + 1}`,
      to: "claude",
      show: false,
    })),
    { id: "nuova", kind: "token", at: "claude" },
    { id: "esito", kind: "token", at: { of: "claude", dy: 25 } },
  ],
  steps: [
    {
      text: "Vuoi che Claude smisti le email dei clienti per categoria. Spiegarlo solo a parole funziona fino a un certo punto: i casi ambigui sono tanti.",
      set: { claude: { state: "active" } },
    },
    {
      text: "Meglio fare come con un nuovo collega: mostrargli alcune pratiche già risolte. Si chiama «few-shot».",
      set: { claude: { state: "" }, e1: { show: true }, k1: { show: true } },
    },
    {
      text: "Da 2 a 4 esempi, diversi tra loro: uno semplice, uno arrabbiato, uno con due richieste insieme. Devono coprire proprio i casi difficili.",
      set: { e2: { show: true }, e3: { show: true }, k2: { show: true }, k3: { show: true } },
    },
    {
      text: "Ogni esempio mostra anche il ragionamento. Così Claude impara il principio, invece di copiare la forma.",
      set: {
        e1: { lines: righe(0, true) },
        e2: { lines: righe(1, true) },
        e3: { lines: righe(2, true) },
      },
    },
    {
      text: "Arriva un'email mai vista: «IL RIMBORSO NON È ANCORA ARRIVATO!!! E aggiornate il mio indirizzo».",
      set: {
        claude: { state: "thinking" },
        k1: { state: "active" },
        k2: { state: "active" },
        k3: { state: "active" },
        nuova: {
          show: true,
          text: "IL RIMBORSO NON È ARRIVATO!!! E aggiornate l'indirizzo",
          state: "warn",
          from: [66, 4],
        },
      },
    },
    {
      text: "Claude applica lo stesso ragionamento degli esempi: il tono non conta, vince il problema principale. Categoria: rimborso.",
      set: {
        claude: { state: "ok" },
        k1: { state: "" },
        k2: { state: "" },
        k3: { state: "" },
        nuova: { state: "" },
        esito: { show: true, text: "→ rimborso · il problema principale", state: "ok", from: { of: "claude" } },
      },
    },
  ],
};
