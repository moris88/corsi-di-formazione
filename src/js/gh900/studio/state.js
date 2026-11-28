// Stato condiviso della pagina (un unico oggetto: i binding importati sono in sola lettura)
export const state = {
  activeDocumentId: "",
  renderedHeadings: [],
  currentDocumentIndex: -1,
  observer: null,
  searchQuery: "",
  searchToken: 0,
};
