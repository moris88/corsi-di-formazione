# Dominio 1: architettura agentica e orchestrazione (27%)

## Domande di verifica

### Domanda 1

Un agente di supporto usa un loop che invia la richiesta a Claude e continua finché la risposta contiene la frase “Posso aiutarti altro?”. In produzione il loop a volte si ferma prima che il cliente abbia ricevuto il rimborso, altre volte continua a chiamare strumenti senza fine. Qual è la correzione più corretta?

- **A.** Aumentare `max_tokens` per dare a Claude più spazio per concludere.
- **B.** Far uscire il loop quando `stop_reason` è `end_turn` e usare un limite di sicurezza solo come protezione secondaria.
- **C.** Imporre un massimo fisso di quattro iterazioni, così il loop non può mai girare a vuoto.
- **D.** Chiedere nel system prompt di scrivere “CHIUSO” alla fine di ogni risposta conclusiva.

### Domanda 2

Un coordinatore di ricerca deve far analizzare a un subagente un documento che il cliente ha caricato all’inizio della conversazione, insieme alle preferenze già espresse dal cliente. Il subagente produce un’analisi generica, che ignora le preferenze. Qual è la causa più probabile e la correzione giusta?

- **A.** Il subagente ha una temperatura troppo alta: va abbassata.
- **B.** Il subagente non eredita la cronologia del coordinatore: le preferenze e il contenuto pertinente vanno inclusi esplicitamente nel suo prompt.
- **C.** Il subagente non può leggere documenti caricati: va usato un altro modello.
- **D.** Il coordinatore non può delegare più di un’attività alla volta: va ridotto il numero di subagenti.

### Domanda 3

Un sistema deve analizzare una pull request di 40 file. Un singolo passaggio di revisione produce commenti dettagliati sui primi file, ma non rileva due problemi in cui una funzione modificata in un file rompe il chiamante in un altro. Qual è l’approccio più adeguato?

- **A.** Aumentare il numero di token di output per permettere una revisione più completa in un unico passaggio.
- **B.** Eseguire una revisione locale di ogni file con lo stesso livello di approfondimento, poi un passaggio separato dedicato alle interazioni tra i file.
- **C.** Revisionare solo i file modificati più di recente, per ridurre il lavoro.
- **D.** Affidare la revisione a un subagente che riceve tutti i 40 file in un unico prompt.

### Domanda 4

Un agente di elaborazione ordini deve garantire che nessun ordine venga spedito se il pagamento non è stato confermato. Il team ha scritto questa regola nel prompt di sistema. In fase di test, in alcuni casi l’agente chiama `ship_order` prima di `check_payment`. Quale modifica offre la garanzia più solida?

- **A.** Riscrivere la regola con parole più forti e ripeterla due volte nel prompt.
- **B.** Aggiungere un esempio few-shot in cui `check_payment` precede `ship_order`.
- **C.** Usare un hook `PreToolUse` su `ship_order` che blocca l’esecuzione finché `check_payment` non ha restituito un esito positivo.
- **D.** Abbassare la temperatura del modello per renderlo più prevedibile.

### Domanda 5

Un agente di ricerca ha ottenuto un risultato parziale e l’utente torna il giorno dopo per continuare. Nel frattempo alcuni file della base di codice sono stati modificati. Qual è l’approccio corretto?

- **A.** Riprendere la sessione precedente senza modifiche, perché il contesto si aggiorna da solo.
- **B.** Riprendere la sessione e segnalare esplicitamente a Claude quali file sono cambiati, chiedendo di rianalizzarli.
- **C.** Eliminare la sessione e ricominciare da capo senza conservare nulla del lavoro precedente.
- **D.** Creare un fork della sessione originale, che eredita automaticamente i file aggiornati.

### Domanda 6

Un team usa un loop che termina quando Claude scrive “ho finito”. Ogni tanto si interrompe troppo presto, altre volte gira a vuoto. Qual è la correzione più corretta?

- **A.** Aumentare `max_tokens`.
- **B.** Uscire su `stop_reason`, con un limite di sicurezza come protezione secondaria.
- **C.** Fermarsi dopo tre iterazioni, come unico criterio.
- **D.** Chiedere a Claude di scrivere “FINE” alla fine di ogni risposta.

### Domanda 7

Un coordinatore lancia tre subagenti su tre turni separati, e il sistema è troppo lento. Qual è la modifica giusta?

- **A.** Inviare tutte e tre le chiamate `Agent` nella stessa risposta del coordinatore.
- **B.** Aumentare il timeout dei subagenti.
- **C.** Passare a un modello più piccolo.
- **D.** Dare a ogni subagente tutta la cronologia del coordinatore.

### Domanda 8

Un agente di rimborsi talvolta salta la verifica dell’identità, nonostante l’istruzione nel system prompt. Qual è la soluzione più affidabile?

- **A.** Abbassare la temperatura.
- **B.** Ripetere l’istruzione in maiuscolo nel prompt.
- **C.** Aggiungere un hook `PreToolUse` che blocchi `process_refund` finché `get_customer` non ha restituito un ID verificato.
- **D.** Passare a un modello più grande.

### Domanda 9

Dopo un’analisi approfondita di una codebase, gli architetti vogliono valutare tre strategie di rimedio alternative. Ogni strategia deve partire dalla stessa analisi, ma le ipotesi di una non devono influenzare le altre. Quale approccio è corretto?

- **A.** Valutare le tre strategie in sequenza nella stessa sessione, separandole con un titolo.
- **B.** Creare tre fork della sessione dallo stato successivo all’analisi, uno per strategia.
- **C.** Aprire tre sessioni nuove e incollare in ciascuna un breve riassunto dell’analisi.
- **D.** Riprendere la sessione originale per una strategia e usare sessioni nuove per le altre due.

### Domanda 10

Un coordinatore di ricerca riceve la richiesta “impatto dell’intelligenza artificiale sul mercato del lavoro europeo”. Il report finale tratta solo il settore manifatturiero. Qual è la causa più probabile?

- **A.** Il subagente di sintesi ha una temperatura troppo bassa.
- **B.** La scomposizione del coordinatore è stata troppo ristretta: i sotto-compiti non coprivano l’intero perimetro della richiesta.
- **C.** Il subagente di ricerca web ha esaurito i token di output.
- **D.** Il report è stato generato con il Batch API.

### Domanda 11

Un subagente deve solo leggere documenti e restituire citazioni. Durante i test, modifica per errore un file di configurazione. Qual è la correzione più solida?

- **A.** Scrivere nel suo system prompt che non deve mai modificare file.
- **B.** Limitare i suoi strumenti con `allowedTools` a quelli di sola lettura necessari al compito.
- **C.** Abbassare la temperatura del subagente.
- **D.** Far controllare ogni sua azione al coordinatore dopo la fine del lavoro.

### Domanda 12

Un subagente di ricerca web deve verificare un’affermazione per cui le prime ricerche fanno emergere nomi alternativi e fonti contraddittorie. Quale progettazione è più adatta?

- **A.** Una sequenza fissa: cerca il testo esatto, apri i primi tre risultati, restituisci gli estratti.
- **B.** Il coordinatore genera tutte le query all’inizio e il subagente le esegue in parallelo senza modificarle.
- **C.** Dare al subagente gli strumenti di ricerca, l’obiettivo e i requisiti di citazione, lasciandolo raffinare le query in base ai risultati finché ha prove sufficienti.
- **D.** Il coordinatore chiama il subagente una volta per ogni query e decide lui la successiva.

### Domanda 13

Un subagente deve restituire una struttura con campi obbligatori (`data`, `fonte`, `citazione`), ma a volte restituisce testo libero che poi altera il lavoro del coordinatore. Come garantisci il formato prima che il risultato entri nel contesto del coordinatore?

- **A.** Chiedere nel prompt del subagente di controllare da solo il formato prima di rispondere.
- **B.** Chiedere al coordinatore di ignorare i risultati incompleti in fase di sintesi.
- **C.** Registrare un hook `PostToolUse` sulle chiamate al subagente che verifica i campi obbligatori e rifiuta o chiede di correggere i risultati non validi.
- **D.** Far approvare ogni risultato da un secondo subagente revisore, senza bloccare quelli non approvati.

### Domanda 14

La risposta di Claude ha `stop_reason: "tool_use"` e contiene un blocco `tool_use` per `lookup_order`. Cosa deve fare il runtime dell’agente?

- **A.** Considerare la conversazione conclusa e mostrare la risposta all’utente.
- **B.** Eseguire lo strumento con gli argomenti del blocco `tool_use`, aggiungere il `tool_result` alla conversazione e richiamare Claude.
- **C.** Leggere nome e parametri dello strumento dal campo `stop_reason`.
- **D.** Richiamare subito Claude con la stessa conversazione, senza eseguire lo strumento.

### Domanda 15

Un agente di supporto deve mantenere un’alta risoluzione al primo contatto ma sapere quando passare la conversazione a una persona. Quale criterio di escalation è più adatto?

- **A.** Escalare tutti i clienti che usano un tono arrabbiato o sarcastico.
- **B.** Escalare dopo esattamente tre chiamate agli strumenti, qualunque sia il loro esito.
- **C.** Escalare quando il cliente chiede esplicitamente una persona, quando il rimedio richiesto va oltre i poteri dell’agente o quando non resta alcun percorso conforme alle policy.
- **D.** Escalare tutti gli ordini sopra i 500 €, indipendentemente dal caso.

---

## Risposte

- **1. B.** La fine del loop si decide con `stop_reason` (`end_turn`), non cercando frasi nel testo. Il limite di iterazioni serve solo come rete di sicurezza.
- **2. B.** I subagenti partono con un contesto pulito e non ereditano la cronologia del coordinatore: tutto ciò che serve va passato esplicitamente nel prompt.
- **3. B.** Un unico passaggio su molti file diluisce l’attenzione. Una revisione per file più un passaggio dedicato alle interazioni coglie anche i problemi tra file.
- **4. C.** Un prompt è una guida probabilistica; un hook `PreToolUse` è un vincolo deterministico che blocca davvero la chiamata.
- **5. B.** Il contesto della sessione ripresa non si aggiorna da solo: bisogna dire a Claude cosa è cambiato, così rianalizza solo quei file.
- **6. B.** Come la domanda 1: si esce su `stop_reason`, con un limite di iterazioni solo come protezione secondaria.
- **7. A.** Più chiamate `Agent` nella stessa risposta fanno partire i subagenti in parallelo; su turni separati vengono eseguiti in sequenza.
- **8. C.** Per un passaggio obbligatorio serve un controllo programmatico: l’hook blocca `process_refund` finché l’identità non è verificata.
- **9. B.** Il fork parte dallo stesso stato (l’analisi completa) ma ogni ramo resta isolato dagli altri.
- **10. B.** Se il report copre solo una parte del tema, il problema sta a monte: la scomposizione del coordinatore era troppo ristretta.
- **11. B.** Il principio del minimo privilegio si applica con `allowedTools`: se lo strumento di scrittura non c’è, l’errore non può accadere.
- **12. C.** Con informazioni ambigue serve un agente che adatti le query ai risultati: obiettivo e criteri chiari, non una sequenza fissa.
- **13. C.** Un hook `PostToolUse` convalida il risultato in modo deterministico prima che entri nel contesto del coordinatore.
- **14. B.** `tool_use` significa “esegui questo strumento”: il runtime lo esegue, aggiunge il `tool_result` e richiama Claude.
- **15. C.** L’escalation si basa su criteri oggettivi (richiesta esplicita, poteri insufficienti, nessun percorso conforme), non sul tono o su soglie arbitrarie.
