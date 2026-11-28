# Prerequisiti tecnici

La guida ufficiale non richiede corsi né titoli per sostenere l'esame, ma descrive un profilo di partenza ben preciso. Questa pagina serve a controllare se lo hai e dove colmare le lacune prima di studiare i domini.

---

## Esperienza consigliata

| Area | Cosa ci si aspetta |
| --- | --- |
| Ingegneria del software | Da uno a cinque anni di esperienza |
| Claude e LLM | Almeno sei mesi di pratica con Claude o con sistemi simili |
| Linguaggi | Python e/o TypeScript |
| Interfacce | API REST e riga di comando (CLI) |
| Concetti | Fondamenti degli LLM, agenti, gestione del contesto, MCP |

L'esperienza è **consigliata, non obbligatoria**: il titolo dipende solo dal risultato dell'esame.

---

## Lista di controllo

Prima di cominciare, verifica di saper fare queste cose senza cercare ogni volta la sintassi.

### Ingegneria del software (pesa nel dominio 2)

- Chiamare un'API REST, leggere e scrivere JSON, gestire codici di stato ed errori.
- Scrivere codice asincrono (`async`/`await`, promesse, stream).
- Usare il controllo di versione e partecipare a una revisione del codice.
- Fare piccoli e grandi refactoring senza rompere il comportamento esistente.
- Inserire una nuova funzione nel ciclo di sviluppo del software (test, integrazione continua, rilascio).

### Fondamenti degli LLM (pesa nel dominio 5)

- Spiegare che cosa sono i token e la finestra di contesto.
- Sapere perché le risposte di un modello non sono deterministiche.
- Distinguere i prompt senza esempi, con un esempio e con più esempi.

### Strumenti da riga di comando

- Muoverti in un terminale, usare variabili d'ambiente e file di configurazione.
- Eseguire strumenti come Claude Code in modalità interattiva e non interattiva.

### Primo contatto con la piattaforma

- Aver inviato almeno una richiesta all'API Messages con uno degli SDK.
- Aver definito almeno uno strumento (tool) e gestito la chiamata che Claude restituisce.
- Aver letto un file `CLAUDE.md` e sapere a che cosa serve.

---

## Se ti manca qualcosa

Per colmare le lacune c'è il [pre-corso](./studio.html?doc=precorso): TypeScript, Node.js, Git, HTTP e API, SDK, ciascuno collegato ai domini d'esame, con mini-laboratori e [link di studio](./studio.html?doc=pc-risorse).

- **API e SDK**: parti dalla documentazione ufficiale della Claude API e prova gli esempi nel linguaggio che usi.
- **Agenti e strumenti**: costruisci un piccolo agente con un ciclo che chiama uno strumento, prima a mano e poi con l'Agent SDK.
- **Concetti**: leggi il [vocabolario](./studio.html?doc=vocabolario) e poi i [domini](./studio.html?doc=domain-1).

Il profilo **non** è pensato per chi usa Claude solo come utente finale o per chi scrive soltanto prompt senza sviluppare applicazioni.
