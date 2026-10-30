# Dominio 5: gestione del contesto e affidabilità (15%)

## Domande di verifica

### Domanda 1

Un cliente scrive in maiuscole per un addebito duplicato di $12, chiaro dalla cronologia. Un altro scrive con calma e chiede come una clausola di rescissione interagisce con un’eccezione di policy non documentata. Quale azione è corretta?

- **A.** Escalare entrambi per prudenza.
- **B.** Risolvere il primo, escalare il secondo.
- **C.** Escalare il primo, risolvere il secondo.
- **D.** Non escalare nessuno: la bassa affidabilità dichiarata dal modello è sufficiente per decidere.

### Domanda 2

Il motore di ricerca della knowledge base è inattivo e restituisce `503`. L’agente riceve `{"results": []}` e risponde «Non ho trovato nulla». Qual è il problema e la correzione più efficace?

- **A.** Nessun problema: un array vuoto è un risultato valido.
- **B.** Il coordinatore deve interrompere l’intero workflow.
- **C.** Il servizio deve restituire un errore strutturato, con tipo, riprovabilità e risultati parziali, e l’agente deve comunicare il fallimento.
- **D.** Aumentare il timeout a 60 secondi.

### Domanda 3

Un’applicazione con Opus 5.5 e thinking attivo deve aggiungere una regola al system prompt a metà conversazione. Quale approccio evita di invalidare i blocchi di thinking dei turni precedenti?

- **A.** Ricostruire il system prompt a ogni richiesta con la nuova regola.
- **B.** Eliminare i blocchi di thinking di tutti i turni precedenti.
- **C.** Cambiare il modello a metà conversazione.
- **D.** Aggiungere un messaggio `role: "system"` dopo l’ultimo turno utente, senza modificare system e tools.

### Domanda 4

Un sistema di estrazione restituisce per ogni campo un punteggio di confidenza. Un responsabile chiede se può fidarsi dei punteggi. Quale affermazione è corretta?

- **A.** Un punteggio di `0.9` deve significare che il campo è corretto circa il 90% delle volte, e va verificato su un set etichettato.
- **B.** I punteggi sono affidabili perché il modello li calcola da solo.
- **C.** Un punteggio alto garantisce che il campo sia corretto.
- **D.** Basta chiedere al modello di rivedere le proprie risposte.

### Domanda 5

Un team stima i budget di token con `tiktoken` su un modello della famiglia 4.7 o successiva e ottiene valori sistematicamente bassi. Qual è la correzione corretta?

- **A.** Ricalibrare i budget con `messages.count_tokens`.
- **B.** Moltiplicare i risultati di `tiktoken` per 1.3.
- **C.** Mantenere `tiktoken` e aumentare la finestra di contesto.
- **D.** Passare a un modello con finestra più piccola.

### Domanda 6

Un harness usa sia `clear_tool_uses` sia `clear_thinking` nella stessa richiesta di modifica del contesto. Quale affermazione è corretta?

- **A.** L’ordine non conta.
- **B.** Vanno inviate in richieste separate.
- **C.** `clear_thinking` deve comparire per primo.
- **D.** `clear_tool_uses` deve comparire per primo e `clear_thinking` non può essere usato con Opus 5.5.

### Domanda 7

Una compattazione su richiesta restituisce `stop_reason: "max_tokens"` e nessun blocco `compaction`. Qual è il comportamento corretto?

- **A.** Usare comunque il primo blocco della risposta come riepilogo.
- **B.** Non considerare il riepilogo restituito: continuare la conversazione e riprovare più avanti.
- **C.** Ripetere subito la stessa richiesta con `instructions` più lunghe.
- **D.** Aggiungere `task_budget` alla richiesta.

### Domanda 8

Un’applicazione legge `response.content` senza controllare `stop_reason`. Ogni tanto riceve una risposta HTTP `200` con `stop_reason: "refusal"`. Qual è la correzione più appropriata?

- **A.** Aumentare `max_tokens` per evitare il rifiuto.
- **B.** Ignorare il contenuto vuoto e proseguire.
- **C.** Riprovare automaticamente la richiesta finché non risponde.
- **D.** Controllare `stop_reason` prima di leggere il contenuto e gestire il rifiuto in modo esplicito.

### Domanda 9

Due subagenti di ricerca riportano per la stessa metrica valori diversi: un comunicato stampa dice $2.3B (dati preliminari), un deposito SEC dice $2.28B (dati sottoposti ad audit). Qual è il comportamento migliore del coordinatore?

- **A.** Annotare il conflitto con le fonti e le note, indicando quale fonte è più autorevole.
- **B.** Usare il valore più recente senza segnalare nulla.
- **C.** Calcolare la media dei due valori.
- **D.** Scartare entrambi e ripetere la ricerca.

### Domanda 10

Un sistema di estrazione ha un’accuratezza complessiva del 96%. Hai un budget per revisionare 500 documenti umanamente. Quale piano di campionamento è il più appropriato?

- **A.** Estrarre 500 documenti a caso dal totale.
- **B.** Campionare il 10% di ogni categoria, indipendentemente dal rischio.
- **C.** Campionare per rischio, con percentuali più alte sulle categorie più rischiose, e riportare l’accuratezza per tipo di documento e per campo.
- **D.** Revisionare solo la categoria con più volume.

### Domanda 11

Una conversazione di supporto molto lunga viene compattata. Dopo la compattazione, l’agente sbaglia l’importo del rimborso concordato e il numero d’ordine. Qual è la prevenzione più efficace?

- **A.** Disattivare la compattazione e lasciare crescere il contesto.
- **B.** Conservare i fatti critici (importi, ID, decisioni, vincoli) in un blocco strutturato riportato a ogni turno o in un file persistente.
- **C.** Ripetere la compattazione più spesso.
- **D.** Aumentare `max_tokens` della risposta.

### Domanda 12

Una pipeline di estrazione continua a superare la convalida dello schema JSON, ma nuovi fornitori usano formati diversi e gli utenti segnalano valori sbagliati. Quale monitoraggio rileva il degrado?

- **A.** Monitorare solo la percentuale di JSON conformi allo schema.
- **B.** Un confronto manuale su un piccolo campione due volte l’anno.
- **C.** Metriche continue di confidenza a livello di campo, segmentate per fornitore e tipo di documento, con avvisi sui cali e campioni inviati a revisione umana.
- **D.** Un test di regressione su un benchmark congelato a fine rilascio.

### Domanda 13

Un revisore può controllare solo 200 campi al giorno, su 20.000 estratti. Errori plausibili e ben formattati sfuggono alla convalida dello schema. Qual è la strategia migliore?

- **A.** Revisionare solo i record con campi mancanti.
- **B.** Calibrare la confidenza per campo su un set etichettato e inviare in revisione i casi a rischio più alto, con una soglia adattata alla capacità del revisore.
- **C.** Revisionare a caso il 10% dei record a settimana.
- **D.** Revisionare per primi i documenti con più rumore OCR.

### Domanda 14

Dopo dieci tentativi falliti di correggere un bug, il contesto della sessione è pieno di ipotesi scartate e Claude continua a riproporle. Qual è la scelta migliore?

- **A.** Continuare nella stessa sessione con istruzioni più forti.
- **B.** Usare `/clear` (o una nuova sessione) e ripartire con un riepilogo mirato di ciò che si sa e di ciò che è già stato escluso.
- **C.** Usare `/compact` senza istruzioni, mantenendo tutte le ipotesi.
- **D.** Aumentare la finestra di contesto passando a un modello più grande.

### Domanda 15

Un sistema di estrazione genera esempi etichettati per addestrare un classificatore più piccolo. Alcuni record sono plausibili ma non chiaramente supportati dal testo di origine. Come prepari i dati per l’addestramento?

- **A.** Includere tutti i record conformi allo schema, finché l’F1 complessivo resta sopra la soglia.
- **B.** Abbassare la soglia di inclusione per avere più esempi rari.
- **C.** Richiedere per ogni record una confidenza calibrata e il passaggio di origine, usare soglie di inclusione prudenti e fare audit umani periodici a campione.
- **D.** Riutilizzare la pipeline di produzione senza modifiche.

---

## Risposte

- **1. B.** L’escalation dipende dalla complessità del caso, non dal tono: l’addebito duplicato è semplice, l’eccezione non documentata no.
- **2. C.** Un guasto non deve sembrare un risultato vuoto: serve un errore strutturato e l’agente deve dire che la ricerca non è riuscita.
- **3. D.** Un messaggio `role: "system"` dopo l’ultimo turno utente cambia le istruzioni senza toccare `system` e `tools`, e quindi senza invalidare il thinking.
- **4. A.** Una confidenza è utile solo se calibrata: `0.9` deve corrispondere a circa il 90% di correttezza, da verificare su dati etichettati.
- **5. A.** Dai modelli 4.7 il tokenizer è cambiato: il conteggio ufficiale si fa con `messages.count_tokens`.
- **6. C.** Quando le due modifiche sono usate insieme, `clear_thinking` deve comparire per primo.
- **7. B.** Se non c’è il blocco `compaction` non esiste un riepilogo valido: si continua e si riprova più tardi.
- **8. D.** Un `200` non garantisce una risposta utile: `stop_reason` va sempre controllato prima di leggere il contenuto.
- **9. A.** Il conflitto non va nascosto né mediato: si riportano entrambi i valori con le fonti, indicando quella più autorevole.
- **10. C.** Un’accuratezza complessiva può nascondere categorie deboli: si campiona per rischio e si misura per tipo di documento e per campo.
- **11. B.** La compattazione riassume e può perdere dettagli: i fatti critici vanno conservati in un blocco strutturato o in un file persistente.
- **12. C.** Uno schema rispettato non significa valori corretti: servono metriche continue per segmento, con avvisi e campioni in revisione.
- **13. B.** Con una capacità limitata si revisionano i casi a rischio più alto, individuati da una confidenza calibrata.
- **14. B.** Un contesto pieno di ipotesi scartate condiziona Claude: si ripulisce e si riparte con un riepilogo mirato.
- **15. C.** I dati di addestramento devono essere affidabili: confidenza calibrata, passaggio di origine, soglie prudenti e audit a campione.
