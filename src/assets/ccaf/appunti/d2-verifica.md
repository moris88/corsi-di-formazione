# Dominio 2: progettazione degli strumenti e integrazione MCP (18%)

## Domande di verifica

### Domanda 1

Un agente ha 18 strumenti e sceglie spesso quello sbagliato. Qual è la soluzione più efficace?

- **A.** Rendere più dettagliate le descrizioni di tutti e 18 gli strumenti.
- **B.** Distribuire gli strumenti tra subagenti specializzati, con 4–5 strumenti per ciascuno.
- **C.** Impostare `tool_choice` su `any` per forzare l’uso degli strumenti.
- **D.** Aggiungere al prompt di sistema esempi di selezione corretta.

### Domanda 2

Una ricerca restituisce un array vuoto con stato `200`, mentre durante un’altra chiamata lo stesso strumento va in timeout. Come deve rispondere l’agente nei due casi?

- **A.** In entrambi i casi: “Non ho trovato nulla”.
- **B.** In entrambi i casi: “Il servizio è momentaneamente non disponibile”.
- **C.** Nel primo caso: “Nessun risultato per questa query”. Nel secondo: “Non riesco a eseguire la ricerca, riprovo”.
- **D.** In entrambi i casi, ripetere la ricerca con parametri diversi.

### Domanda 3

In un progetto con `.mcp.json` condiviso con il team, dove vanno inserite le credenziali di un server MCP?

- **A.** Direttamente nel file `.mcp.json`, così il team le ha tutte.
- **B.** In una variabile d’ambiente, richiamata nel file con `${VAR_NAME}`.
- **C.** In un file `.mcp-secrets.json` committato insieme al progetto.
- **D.** Nel `package.json` del progetto.

### Domanda 4

Un team vuole attivare `strict: true` sullo strumento `extract_invoice`. Quale requisito dello schema deve essere rispettato?

- **A.** Il campo `strict` deve comparire anche in `required`.
- **B.** Lo schema può avere al massimo cinque proprietà.
- **C.** `additionalProperties: false` e tutte le proprietà devono comparire in `required`.
- **D.** Nessun requisito: `strict` è solo un flag informativo.

### Domanda 5

Due strumenti, `analyze_content` e `analyze_document`, hanno descrizioni quasi identiche. L’agente sceglie spesso lo strumento sbagliato. Qual è la correzione più adeguata?

- **A.** Aumentare la temperatura del modello, per una scelta più variata.
- **B.** Rinominare o descrivere i due strumenti in modo che i loro scopi siano distinti, oppure unirli.
- **C.** Impostare `tool_choice` su `any`.
- **D.** Ridurre `max_tokens`.

### Domanda 6

Quale descrizione è la più adatta per uno strumento di ricerca in una knowledge base interna?

- **A.** “Cerca elementi”.
- **B.** “Strumento di ricerca”.
- **C.** “Ricerca versione 2, uguale alla precedente”.
- **D.** “Cerca nella knowledge base interna articoli di supporto e FAQ. Usalo quando il cliente pone una domanda che potrebbe avere una risposta documentata. Restituisce titoli, estratti e ID”.

### Domanda 7

Uno strumento di rimborso restituisce un timeout con `isRetryable: true`. Un subagente gestisce l’operazione. Qual è il comportamento corretto?

- **A.** Il subagente riprova con attesa progressiva e propaga l’errore solo se il recupero non riesce.
- **B.** Il coordinatore termina subito l’intero workflow.
- **C.** Il caso viene inoltrato subito a una persona.
- **D.** Il cliente viene informato che il rimborso è stato rifiutato.

### Domanda 8

Uno strumento restituisce un errore business: il rimborso supera il limite previsto dalla policy. Come deve reagire l’agente?

- **A.** Riprovare con attesa progressiva.
- **B.** Correggere l’input e riprovare.
- **C.** Spiegare la policy all’utente oppure inoltrare il caso.
- **D.** Riprovare con parametri diversi, finché l’operazione non passa.

### Domanda 9

Un servizio di ricerca restituisce `{"results": []}` con stato `200`, mentre il motore di ricerca in realtà è inattivo. Quale antipattern descrive questa situazione?

- **A.** Errore di convalida.
- **B.** Soppressione silenziosa dell’errore.
- **C.** Messaggio di errore generico.
- **D.** Errore di autorizzazione.

### Domanda 10

Un sistema deve rispettare il principio di massimo 4–5 strumenti per agente. Quale configurazione è coerente con questo principio?

- **A.** Un solo agente con tutti i 18 strumenti.
- **B.** Un coordinatore con tutti gli strumenti di ricerca e subagenti senza strumenti.
- **C.** Ogni subagente con 12 strumenti, per coprire ogni caso.
- **D.** Un coordinatore con `Agent` e `AskUser`, e un subagente di ricerca con `search_web`, `search_docs` e `search_db`.

### Domanda 11

Su un modello Sonnet 5, il team vuole che Claude chiami sempre `extract_metadata` come primo passo, prima di qualsiasi altro strumento. Quale impostazione di `tool_choice` è adatta?

- **A.** `{"type": "tool", "name": "extract_metadata"}`
- **B.** `{"type": "auto"}`
- **C.** `{"type": "none"}`
- **D.** `{"type": "any"}`

### Domanda 12

Un turno deve produrre solo un riepilogo testuale, ma le definizioni degli strumenti devono restare nel contesto. Quale valore di `tool_choice` usi?

- **A.** `auto`
- **B.** `any`
- **C.** `none`
- **D.** Una forma forzata su uno specifico strumento.

### Domanda 13

Claude emette tre blocchi `tool_use` in un unico messaggio. Il team esegue i tre strumenti e invia tre messaggi utente separati, ciascuno con un solo `tool_result`. Qual è la conseguenza?

- **A.** Nessuna: il risultato è identico.
- **B.** Claude impara a non effettuare più chiamate parallele.
- **C.** Il problema c’è solo quando un risultato è un errore.
- **D.** Il problema si risolve con `disable_parallel_tool_use`.

### Domanda 14

Uno strumento fallisce durante l’esecuzione. Quale risposta va restituita a Claude?

- **A.** Nessuna: se il `tool_result` manca, Claude non riprova.
- **B.** Un messaggio di successo, per non confonderlo.
- **C.** Un nuovo tentativo silenzioso, senza informare Claude.
- **D.** Un `tool_result` con `is_error: true` e una descrizione dell’errore.

### Domanda 15

Un server MCP deve essere disponibile solo al tuo lavoro in un progetto specifico, senza finire nel repository condiviso. Dove va registrato?

- **A.** Nel file `.mcp.json` del progetto.
- **B.** Nel prompt di sistema dell’agente.
- **C.** Nell’ambito utente, che vale per tutti i progetti.
- **D.** Nell’ambito locale, memorizzato in `~/.claude.json` e indicizzato per percorso del progetto.

---

## Risposte

- **1. B.** Con troppi strumenti la scelta peggiora: distribuirli tra subagenti specializzati (4–5 ciascuno) è più efficace che migliorare le descrizioni.
- **2. C.** Un array vuoto con `200` è un risultato valido (“non c’è”); un timeout è un errore (“non riesco a controllare”). Vanno distinti.
- **3. B.** Le credenziali non vanno mai nel file condiviso: si usa `${VAR_NAME}` e ognuno imposta la variabile localmente.
- **4. C.** `strict: true` richiede `additionalProperties: false` e tutte le proprietà elencate in `required`.
- **5. B.** Se due strumenti si sovrappongono, Claude non può distinguerli: vanno differenziati con nomi e descrizioni chiari, oppure uniti.
- **6. D.** Una buona descrizione dice cosa fa lo strumento, quando usarlo e cosa restituisce.
- **7. A.** Un errore transitorio e riprovabile si gestisce localmente con backoff; si propaga solo se il recupero fallisce.
- **8. C.** Un errore business non si risolve riprovando: si spiega la policy all’utente o si inoltra il caso.
- **9. B.** Restituire “nessun risultato” quando il servizio è guasto nasconde l’errore: è una soppressione silenziosa.
- **10. D.** Pochi strumenti mirati per ruolo: il coordinatore delega, il subagente di ricerca ha solo i suoi tre strumenti.
- **11. A.** La forma forzata `{"type": "tool", "name": ...}` garantisce la chiamata a quello strumento specifico (`any` garantisce solo “uno strumento qualsiasi”).
- **12. C.** `none` vieta le chiamate agli strumenti ma lascia le definizioni nel contesto.
- **13. B.** Tutti i `tool_result` di una risposta parallela vanno in un unico messaggio utente; separarli insegna a Claude a evitare le chiamate parallele.
- **14. D.** Claude deve sapere che lo strumento ha fallito: `is_error: true` con una descrizione utile gli permette di decidere come procedere.
- **15. D.** L’ambito locale vale solo per te e per quel progetto, e non finisce nel repository.
