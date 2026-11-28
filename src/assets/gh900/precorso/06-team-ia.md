# PC6 · Lavoro di squadra e intelligenza artificiale

Serve a: [D3](./studio.html?doc=domain-3), [D4](./studio.html?doc=domain-4), [D5](./studio.html?doc=domain-5), [D7](./studio.html?doc=domain-7).

## Lavorare in squadra sul codice

- **Revisione del codice (code review)**: un'altra persona legge le modifiche *prima* che entrino nel progetto, per trovare errori e condividere conoscenza. In GitHub avviene nelle pull request.
- **Conflitto**: due persone hanno modificato la stessa riga; Git non sa quale tenere e chiede di decidere.
- **Manutentore (maintainer)**: chi cura un progetto e decide cosa entra. **Contributore**: chi propone modifiche.
- **Upstream / downstream**: il progetto originale e le sue copie. Un fork ha il progetto originale come upstream.

## Metodi di organizzazione

| Metodo | Idea | Strumenti in GitHub |
| --- | --- | --- |
| **Kanban** | Il lavoro scorre per colonne (da fare → in corso → fatto); si limita il lavoro in corso | Layout *Board* di Projects |
| **Agile** | Consegnare poco e spesso, raccogliendo feedback | Issue, pull request, milestone |
| **Iterazioni / sprint** | Periodi di durata fissa con un obiettivo | Campo *Iteration* di Projects |
| **Roadmap** | Piano nel tempo di ciò che arriverà | Layout *Roadmap* di Projects |

Parole utili:

- **Backlog**: elenco del lavoro da fare.
- **User story**: una richiesta scritta dal punto di vista di chi la userà.
- **Priorità**: l'ordine con cui si affrontano le attività.
- **Stato**: a che punto è un'attività (da fare, in corso, fatta).
- **Definition of done**: i criteri per dire che un'attività è davvero finita.

## Comunicare bene online

Una buona issue o pull request ha: un **titolo chiaro**, il **contesto** (cosa succede e cosa ci si aspetta), i **passi per riprodurre** un problema, uno **screenshot** o un esempio. Si scrive in Markdown, si menzionano le persone con `@` e si collegano gli elementi con `#numero`.

## Open source e community

- **Open source**: il sorgente è pubblico e riusabile secondo la licenza.
- **Contribuire** non significa solo scrivere codice: anche documentare, tradurre, segnalare errori e rispondere alle domande.
- **Codice di condotta**: regole di comportamento della community.
- **InnerSource**: gli stessi metodi, ma dentro un'azienda.

## Intelligenza artificiale: il minimo che serve

GitHub Copilot si basa su **modelli linguistici di grandi dimensioni (LLM)**. Serve capire cinque cose:

1. Un LLM è addestrato su grandi quantità di testo e codice e **genera** il testo più probabile dato quello che gli si scrive.
2. L'istruzione che gli si dà si chiama **prompt**; la quantità di testo che può considerare è il **contesto**.
3. **Può sbagliare** in modo convincente: i suoi suggerimenti vanno sempre rivisti, testati e compresi.
4. Esistono **modelli diversi**, con costi, velocità e capacità differenti; per questo Copilot permette di scegliere.
5. Un **agente** è un LLM a cui si danno strumenti (leggere file, eseguire comandi) perché porti a termine un compito in più passaggi, invece di rispondere una volta sola.

Altri termini: **suggerimento (completion)** è il testo proposto mentre scrivi; **chat** è la conversazione; **istruzioni personalizzate** sono indicazioni persistenti sul modo di rispondere; **MCP** (Model Context Protocol) è un protocollo che collega un assistente a strumenti e dati esterni.

### Responsabilità

Chi usa un assistente di IA resta **responsabile** del risultato: verifica la correttezza, la sicurezza e la licenza di ciò che produce, e non inserisce nei prompt dati riservati senza le politiche giuste. Per questo i piani aziendali offrono controlli come l'esclusione di contenuti ([D4](./studio.html?doc=domain-4), [D6](./studio.html?doc=domain-6)).
