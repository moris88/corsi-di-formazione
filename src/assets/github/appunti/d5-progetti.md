# Dominio 5 · Gestire i progetti con GitHub

**Peso: 5-10%.** Se kanban, sprint o roadmap sono termini nuovi, leggi prima [PC6](./studio.html?doc=pc-team-ia).

**In questa pagina**: GitHub Projects · viste e layout · campi · automazioni · etichette e milestone · risposte salvate · insights · trappole d'esame.

---

## 1. GitHub Projects

**Projects** è uno strumento flessibile per pianificare e tracciare il lavoro. È una **tabella, una bacheca e una roadmap** integrate con issue e pull request: le informazioni si **sincronizzano automaticamente** quando cambi qualcosa nell'elemento originale.

- Può esistere a livello di **utente** o di **organizzazione**.
- Raccoglie elementi di **più repository**.
- Ogni elemento può essere un'**issue**, una **pull request** o una **bozza** (*draft issue*), un'idea scritta direttamente nel progetto che può diventare issue in seguito.
- Si può partire da zero o da un **modello di progetto** (*template*), che include viste, campi, automazioni e grafici. I modelli possono essere proposti dall'organizzazione.
- Il progetto ha **descrizione** e **README** per spiegarne lo scopo e l'uso delle viste.

---

## 2. Viste e layout

Un progetto ha **più viste**. Ognuna è una combinazione di layout, filtri, raggruppamenti e ordinamenti, salvata con un nome.

| Layout | Che cosa è | Quando usarlo |
| --- | --- | --- |
| **Tabella** (*Table*) | Righe e colonne ad alta densità, come un foglio di calcolo | Backlog, ordinamenti, modifica massiva dei campi |
| **Bacheca** (*Board*) | Colonne kanban basate sul campo *Status*; si trascinano le schede | Seguire l'avanzamento, flusso di lavoro |
| **Roadmap** | Linea temporale basata su date o iterazioni | Pianificare e comunicare scadenze |

Per ogni vista si può:

- **filtrare** (`status:Todo label:bug`);
- **raggruppare** (per assegnatario, per priorità…);
- **ordinare**;
- **suddividere (slice)** per vedere solo una fetta del lavoro;
- nascondere o riordinare i campi;
- in una bacheca, impostare un **limite di elementi per colonna** per mantenere il focus.

---

## 3. Campi

Un progetto può avere fino a **50 campi**, compresi quelli predefiniti e quelli personalizzati.

- **Predefiniti**: titolo, assegnatari, etichette, milestone, repository, stato, revisori, pull request collegate.
- **Personalizzati**:

| Tipo | Uso tipico |
| --- | --- |
| **Testo** | Note libere |
| **Numero** | Stima, punti, priorità numerica |
| **Data** | Scadenza, data di inizio |
| **Selezione singola** | Priorità (Alta/Media/Bassa), dimensione |
| **Iterazione** | Sprint o periodi di durata fissa |

Il campo **Status** è quello che dà le colonne alla bacheca.

---

## 4. Automazioni (workflow del progetto)

I **workflow integrati** di Projects automatizzano il lavoro ripetitivo senza scrivere codice. Esempi:

- quando un'issue viene **chiusa**, imposta lo stato su *Done*;
- quando una PR viene **unita**, imposta lo stato su *Done*;
- **aggiunge automaticamente** al progetto gli elementi di un repository che corrispondono a un filtro;
- **archivia** gli elementi che soddisfano certi criteri (per esempio chiusi da tempo);
- imposta lo stato iniziale degli elementi nuovi.

Per automazioni più complesse si usano **GitHub Actions** e l'**API GraphQL**.

> **Trappola frequente.** I *workflow del progetto* sono automatismi integrati in Projects; i *workflow di Actions* sono file YAML. Sono cose diverse.

---

## 5. Etichette, milestone e relazioni

### Etichette (labels)

Categorie colorate applicate a issue e pull request. Un repository ne ha di **predefinite** (`bug`, `documentation`, `enhancement`, `good first issue`, `help wanted`, `question`, `duplicate`, `invalid`, `wontfix`) e se ne possono creare altre. Chi ha accesso almeno **triage** può applicarle. Servono a filtrare e a ordinare il lavoro.

### Milestone (attività cardine)

Raggruppano issue e pull request verso un **obiettivo con una scadenza** (per esempio una versione). Mostrano la **percentuale di avanzamento** in base agli elementi chiusi. Sono per **repository**.

### Label, milestone o progetto?

| Strumento | Domanda a cui risponde | Ambito |
| --- | --- | --- |
| **Etichetta** | *Che tipo di cosa è?* | Repository |
| **Milestone** | *Per quale obiettivo e quando?* | Repository |
| **Progetto** | *In che stato è e chi se ne occupa?* | Più repository |

### Sotto-issue e riferimenti

Le **sotto-issue** scompongono un lavoro grande in lavori più piccoli, creando una gerarchia. I campi e le viste di un progetto mostrano le relazioni.

---

## 6. Risposte salvate e assegnatari

- **Risposte salvate** (*saved replies*): testi riutilizzabili per i commenti più frequenti ("Grazie per la segnalazione, puoi indicare la versione?"). Si creano nelle impostazioni personali e si inseriscono dal menu del commento. Sono **personali**.
- **Assegnatari**: indicano chi è responsabile di un'issue o di una PR. Un elemento può avere **più assegnatari**, e dal filtro `assignee:@me` si vede tutto ciò che spetta a te.
- **Menzioni** (`@utente`) avvisano ma non assegnano.

---

## 7. Insights e grafici

Le **Insights** di un progetto sono **grafici configurabili** che si aggiornano da soli e mostrano, per esempio, il numero di elementi per stato, per assegnatario o per iterazione, o un andamento nel tempo. Servono a misurare l'avanzamento e la produttività del team. Si possono salvare e filtrare come le viste.

Per l'attività complessiva di un repository si usano invece le **Insights del repository** ([Dominio 2](./studio.html?doc=domain-2)).

---

## Trappole d'esame

- **Tre layout**: tabella, bacheca, roadmap. La bacheca usa il campo *Status*.
- **Project ≠ milestone ≠ label**: ambito e scopo diversi.
- **Draft issue**: un elemento di progetto che non è ancora un'issue.
- I **workflow del progetto** non sono i workflow di Actions.
- Le **risposte salvate** sono personali.

## Punti da ricordare

- Un progetto si sincronizza con issue e PR e ha più viste salvabili.
- Campi personalizzati: testo, numero, data, selezione singola, iterazione.
- Le automazioni integrate impostano stato e archiviazione; le insights mostrano l'avanzamento.

## Documentazione ufficiale

- [Informazioni su Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [Best practice per Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects)
- [Gestire le etichette](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [Informazioni sulle milestone](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones)
- [Risposte salvate](https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies/about-saved-replies)
