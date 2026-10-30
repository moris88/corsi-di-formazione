# Dominio 4: prompt engineering e output strutturato (20%)

## Domande di verifica

### Domanda 1

Un sistema di revisione del codice segnala problemi con la frase “segnala solo i problemi gravi, usa il tuo miglior giudizio”. Qual è la correzione più efficace?

- **A.** Aumentare la temperatura per ottenere valutazioni più sfumate.
- **B.** Aggiungere una soglia di affidabilità numerica.
- **C.** Definire criteri espliciti: cosa rientra nella segnalazione, cosa ne resta escluso, con esempi di confine.
- **D.** Aggiungere altri esempi di revisioni precedenti senza definire i criteri.

### Domanda 2

Un’estrazione da fatture usa `strict: true`. In alcuni casi il `total_amount` non corrisponde alla somma delle voci, pur essendo un numero valido. Qual è la spiegazione e la risposta corretta?

- **A.** La modalità `strict` non funziona: va disattivata.
- **B.** Lo schema è sbagliato: va aggiunto un vincolo `minimum`.
- **C.** La modalità `strict` garantisce la conformità allo schema, non la correttezza semantica: serve una convalida nel codice.
- **D.** Serve il fine-tuning del modello sulle fatture.

### Domanda 3

Un batch di 1.000 documenti termina con 50 richieste fallite. Qual è l’approccio corretto?

- **A.** Reinviare l’intero batch di 1.000 documenti.
- **B.** Passare alla modalità sincrona per tutti i documenti.
- **C.** Usare `custom_id` per individuare e reinviare solo le 50 richieste fallite.
- **D.** Aumentare `max_tokens` e ripetere il batch.

### Domanda 4

Un team migra un’applicazione da Sonnet 4.x a Opus 5.5. Il codice include `thinking={"type": "enabled", "budget_tokens": 8000}` e `temperature=0.2`. Dopo il cambio di modello, le chiamate falliscono con errore `400`. Qual è la correzione più appropriata?

- **A.** Aumentare `budget_tokens` oltre 8000 per compensare la mancanza di temperatura.
- **B.** Usare `thinking={"type": "adaptive"}`, impostare la profondità con `output_config.effort` e rimuovere `temperature`.
- **C.** Mantenere `budget_tokens` e rimuovere solo `temperature`.
- **D.** Passare il parametro `effort` al livello principale della richiesta.

### Domanda 5

Un’estrazione usa `tool_choice: {"type": "tool", "name": "extract_invoice"}` su Fable 5.1. La chiamata restituisce `400`. Qual è l’approccio corretto per ottenere un JSON conforme allo schema?

- **A.** Usare `tool_choice: {"type": "any"}` al posto della forma forzata.
- **B.** Usare `output_config.format` con `type: json_schema`.
- **C.** Aggiungere un prefill dell’assistente con `{` per guidare il modello.
- **D.** Rimuovere lo schema e convalidare il testo libero con una regex.

### Domanda 6

Uno schema con `strict: true` contiene `"quantity": {"type": "integer", "minimum": 1}` e `"sku": {"type": "string", "pattern": "^[A-Z]{3}-\\d{4}$"}`. Cosa succede e cosa fai?

- **A.** Lo schema è valido: `minimum` e `pattern` sono sempre supportati.
- **B.** Il vincolo `minimum` e il `pattern` non sono supportati in modalità `strict`: li verifichi nel codice dopo la risposta.
- **C.** Lo schema è valido solo se si rimuove `additionalProperties`.
- **D.** Il modello applica comunque i vincoli, quindi non serve la convalida.

### Domanda 7

Una pipeline estrae il numero d’ordine da fatture. Alcune fatture non lo riportano. La convalida fallisce e il sistema riprova fino a 3 volte, sempre con lo stesso errore. Qual è la correzione migliore?

- **A.** Aumentare il numero di tentativi a 10.
- **B.** Rendere `order_number` un campo nullable (`["string", "null"]`) e non considerare l’assenza come errore.
- **C.** Passare alla modalità batch per avere più tempo.
- **D.** Aggiungere al prompt la frase “trova sempre il numero d’ordine”.

### Domanda 8

Un’applicazione ha un tasso di cache hit molto basso. Il system prompt contiene `Data odierna: {datetime.now()}` all’inizio, seguito da strumenti e regole fisse. Qual è la causa più probabile e la correzione?

- **A.** La cache non funziona con più di 2 breakpoint: ridurli a 1.
- **B.** Il timestamp cambia a ogni richiesta e invalida il prefisso: spostarlo nei messaggi, dopo i contenuti stabili.
- **C.** I costi di scrittura sono troppo alti: usare la cache a 1 ora.
- **D.** La temperatura è diversa tra le chiamate: fissarla a 0.

### Domanda 9

Un team esegue la revisione di una PR di 25 file nella stessa sessione che ha generato il codice, con un unico prompt. Il revisore segnala pochissimi problemi e perde alcuni errori di integrazione tra moduli. Qual è la strategia migliore?

- **A.** Aumentare `max_tokens` per dare più spazio alla revisione.
- **B.** Usare una sessione indipendente, con un passaggio per file e un secondo passaggio per le interazioni tra file.
- **C.** Chiedere al modello di rileggere il codice due volte nella stessa risposta.
- **D.** Usare il Batch API perché la revisione è più economica.

### Domanda 10

Un agente di supporto prende decisioni incoerenti nei casi limite (rimborso, credito, rifiuto o escalation), anche se la policy è descritta in dettaglio nel prompt. Quale modifica migliora più direttamente la coerenza?

- **A.** Aggiungere al system prompt alcuni esempi rappresentativi di casi limite, con la decisione corretta e la motivazione.
- **B.** Accorciare il prompt, eliminando gli esempi per ridurre i token.
- **C.** Spostare gli esempi in un set di test separato, usato solo per misurare il comportamento.
- **D.** Aumentare la temperatura per ottenere valutazioni più sfumate.

### Domanda 11

Un subagente produce bibliografie in JSON valido, ma tratta i post di blog come articoli peer-reviewed e non declassa le fonti poco pertinenti. Quale insieme di esempi few-shot è più efficace?

- **A.** Solo le migliori voci di bibliografia dei report precedenti.
- **B.** Un piccolo insieme di esempi annotati che include voci corrette, voci declassate o rifiutate e casi ambigui, ciascuno con l’output esatto atteso.
- **C.** Nessun esempio, ma uno schema JSON più dettagliato.
- **D.** Solo i dati di input tipici, senza l’output atteso, per evitare l’overfitting sul formato.

### Domanda 12

Un team deve estrarre dati da 200.000 documenti storici di tipi molto diversi (PDF, scansioni OCR, moduli standard, lettere). Cosa conviene fare prima di avviare l’elaborazione completa?

- **A.** Testare un singolo documento recente e, se il JSON è valido, avviare tutto.
- **B.** Avviare subito tutta l’elaborazione e correggere il prompt in base agli errori di produzione.
- **C.** Eseguire un pilota su un campione stratificato per tipo di documento, confrontare manualmente gli output con le fonti, poi perfezionare prompt e schema.
- **D.** Fidarsi dello schema JSON, che garantisce la correttezza dei valori estratti.

### Domanda 13

Uno script di CI deve pubblicare i risultati della revisione di Claude Code come commenti in linea, leggendo i campi `file`, `line`, `severity` e `message`. Oggi una regex analizza testo libero e fallisce nel 5% dei casi. Qual è la soluzione più robusta?

- **A.** Scrivere nel prompt “rispondi solo con JSON valido” e riprovare quando l’analisi fallisce.
- **B.** Eseguire Claude Code con `-p --output-format json` e uno schema JSON che definisce la struttura dei risultati.
- **C.** Chiedere una tabella Markdown e usare un parser più tollerante.
- **D.** Pubblicare tutto il testo come un unico commento, senza analizzarlo.

### Domanda 14

In un fascicolo di sinistro compaiono due indirizzi diversi dell’assicurato (postale e dell’immobile). La piattaforma invia automaticamente in revisione i campi marcati come incerti. Come conviene modellare il campo `insured_address` nello schema?

- **A.** Come stringa con l’indirizzo che compare più spesso.
- **B.** Come stringa con il primo indirizzo trovato.
- **C.** Come oggetto con valore normalizzato, elenco dei candidati con la loro fonte e un flag di conflitto.
- **D.** Come campo obbligatorio che fa rifiutare l’intera estrazione se ci sono più indirizzi.

### Domanda 15

Un job notturno deve generare suggerimenti di test per 8.000 diff indipendenti. I risultati servono entro il giorno lavorativo successivo e nessuno li attende in tempo reale. Quale scelta riduce di più i costi?

- **A.** La Messages API standard con lo streaming attivo.
- **B.** Il prompt caching sulle singole diff, così le risposte vengono riutilizzate.
- **C.** La Message Batches API, con elaborazione asincrona entro 24 ore.
- **D.** Raggruppare più diff in un’unica richiesta molto lunga.

---

## Risposte

- **1. C.** Istruzioni vaghe producono risultati incoerenti: servono criteri espliciti di inclusione ed esclusione, con esempi di confine.
- **2. C.** `strict` garantisce la forma, non la coerenza dei valori: i controlli semantici (come le somme) vanno fatti nel codice.
- **3. C.** `custom_id` collega ogni risultato alla sua richiesta, così si reinviano solo quelle fallite.
- **4. B.** Sui modelli recenti `budget_tokens` e `temperature` non sono accettati: si usa il thinking `adaptive` con `output_config.effort`.
- **5. B.** Fable 5.1 non accetta il `tool_choice` forzato: per un JSON conforme si usa `output_config.format` con `json_schema`.
- **6. B.** In modalità `strict` vincoli come `minimum` e `pattern` non sono supportati: si verificano nel codice dopo la risposta.
- **7. B.** Se il dato può mancare davvero, riprovare non serve: il campo deve essere nullable, così l’assenza non diventa un errore.
- **8. B.** La cache funziona sul prefisso: un timestamp all’inizio lo cambia a ogni richiesta. I contenuti variabili vanno dopo quelli stabili.
- **9. B.** Sessione indipendente (niente autoconferma) e revisione in più passaggi: per file, poi sulle interazioni.
- **10. A.** Gli esempi few-shot di casi limite, con decisione e motivazione, sono il modo più diretto per ottenere coerenza.
- **11. B.** Gli esempi devono mostrare anche i casi da declassare o rifiutare e quelli ambigui, ciascuno con l’output atteso.
- **12. C.** Prima di elaborare tutto, un pilota su un campione stratificato fa emergere i problemi di ogni tipo di documento.
- **13. B.** `--output-format json` con uno schema produce un output strutturato e affidabile, senza regex fragili.
- **14. C.** Un oggetto con candidati, fonti e flag di conflitto conserva l’ambiguità e permette di inviare il campo in revisione.
- **15. C.** Lavori numerosi, indipendenti e non urgenti sono il caso ideale per la Batch API (circa 50% di risparmio).
