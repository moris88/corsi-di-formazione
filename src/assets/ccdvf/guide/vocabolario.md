# Vocabolario dell'esame CCDV-F

Glossario dei termini che compaiono nel programma dell'esame, in ordine alfabetico. Ogni voce indica il dominio di riferimento (D1–D8) e una spiegazione in linguaggio semplice.

---

## A

**Adaptive thinking** (D5): pensiero adattivo, la modalità predefinita sui modelli attuali: il modello decide da solo se e quanto ragionare, guidato dal parametro `effort`. Su Opus 5.5 e Fable 5.2 non si può disattivare.

**Agente** (D1): un modello messo in un ciclo, che può usare strumenti per agire e non solo rispondere con testo. Decide da sé i passi da fare.

**Agent SDK** (D1): libreria di Anthropic per costruire agenti con Claude, che fornisce ciclo, strumenti, hook e sottoagenti.

## B

**Batch (Message Batches API)** (D2, D5): invio asincrono di molte richieste (fino a 100.000 per batch) con sconto del 50% e risultati entro 24 ore. Adatto ai lavori non urgenti, non alle risposte in tempo reale.

## C

**Cache check-pointing** (D5): scelta del punto in cui termina la parte del prompt da mettere in cache, in modo che le richieste successive la riusino.

**CLAUDE.md** (D2, D3): file di istruzioni che Claude Code legge per conoscere il progetto e le regole da seguire. Esiste una gerarchia di file a più livelli.

**Compaction** (D6): riassunto della conversazione per liberare spazio nella finestra di contesto mantenendo le informazioni utili.

**Context rot** (D5, D6): calo della capacità del modello di richiamare con precisione le informazioni quando il contesto cresce. Per questo il contesto va curato, non solo riempito.

**Context drift** (D6): perdita graduale di aderenza al compito quando il contesto cresce e si riempie di dettagli non più utili.

**Contesto, finestra di contesto** (D5, D6): la quantità di testo (in token) che il modello può considerare in una singola richiesta.

## D

**Defensive parsing** (D6): leggere l'output del modello senza fidarsi che abbia sempre il formato atteso, gestendo campi mancanti o valori inattesi.

## E

**Effort (livelli di impegno)** (D5): parametro `output_config.effort` (`low`, `medium`, `high`, `xhigh`, `max`) che regola quanti token il modello spende su testo, strumenti e pensiero. È un segnale di comportamento, non un budget rigido.

**Eval** (D4): insieme di test ripetibili che misurano la qualità delle risposte di un'applicazione Claude.

**Extended thinking** (D5): pensiero esteso manuale (`thinking: {"type": "enabled", "budget_tokens": N}`). È deprecato su Opus 4.6 e Sonnet 4.6 e non è accettato dai modelli successivi, che usano il pensiero adattivo.

## F

**Few-shot / multi-shot** (D5, D6): prompt con più esempi di ingresso e uscita. Con un solo esempio si parla di single-shot, senza esempi di zero-shot.

**Function calling** (D8): vedi *Tool use*.

## G

**Guardrail** (D7): controllo che limita ciò che l'applicazione può fare o dire. Funzionano meglio a più livelli e applicati dal codice, non solo chiesti nel prompt.

## H

**Harness** (D1): il codice che circonda il modello in un agente: costruisce le richieste, esegue gli strumenti, gestisce errori e ciclo.

**Headless mode** (D3): esecuzione non interattiva di Claude Code, per script e pipeline.

**Hook** (D1, D3, D7): codice che scatta in momenti precisi del ciclo (per esempio prima di usare uno strumento) e può bloccare o modificare l'azione. È un controllo deterministico.

## I

**Iniezione di prompt (prompt injection)** (D7): istruzioni nascoste in contenuti non fidati (una pagina web, un documento) che cercano di far cambiare comportamento al modello.

## J

**Jailbreak** (D7): tentativo di far aggirare al modello le sue regole di sicurezza.

## L

**LangGraph, PydanticAI, Strands** (D1): framework che offrono astrazioni per costruire agenti e workflow a più passi.

**Least privilege (privilegio minimo)** (D7): dare a un agente solo i permessi strettamente necessari.

## M

**MCP (Model Context Protocol)** (D8): protocollo aperto per collegare strumenti, risorse e prompt a un'applicazione che usa Claude.

**Messages API** (D2): l'interfaccia principale per inviare messaggi a Claude e ricevere risposte.

**Model pinning (versione fissata)** (D2, D5): indicare una versione precisa del modello, così che un nuovo rilascio non cambi il comportamento senza avviso.

## P

**PII** (D7): dati personali che permettono di identificare una persona, da trattare con particolare cura.

**Plugin** (D2, D3): pacchetto che aggiunge a Claude Code comandi, Skill o altri componenti.

**Prompt caching** (D2, D5): riuso di una parte iniziale del prompt già elaborata, per ridurre costi e latenza.

**Pruning dell'output degli strumenti** (D6): eliminare dal contesto i risultati di strumenti che non servono più.

## S

**Server-side / client-side tool** (D8): uno strumento lato server è eseguito dalla piattaforma, uno lato client è eseguito dal tuo codice.

**Skill** (D3, D8): cartella di istruzioni e risorse che Claude carica quando serve per un tipo di compito.

**Sottoagente (subagent)** (D1, D6): agente lanciato da un altro per un compito specifico, con un contesto separato.

**Stop reason** (D2, D4): campo `stop_reason` della risposta che dice perché il modello si è fermato: `end_turn`, `max_tokens`, `tool_use`, `pause_turn`, `refusal` e altri.

**Streaming** (D2): ricezione della risposta mentre viene generata, a pezzi.

**Strict tool use** (D8): `strict: true` sulla definizione di uno strumento garantisce che gli argomenti rispettino lo schema.

**Structured output** (D6): `output_config.format` con uno schema JSON garantisce una risposta JSON valida e conforme.

## T

**Temperatura / campionamento** (D5): il modello sceglie (campiona) ogni token da una distribuzione di probabilità, per questo le risposte non sono deterministiche. Sui modelli attuali i parametri `temperature`, `top_p` e `top_k` con valori non predefiniti restituiscono errore 400.

**Token** (D5): unità di testo con cui il modello lavora e con cui si misurano contesto e costi.

**Tool use** (D8): meccanismo con cui Claude chiede di eseguire una funzione definita da te, indicando il nome e gli argomenti, e riceve il risultato.

**Traccia (trace)** (D4): registrazione dei passi di una richiesta, utile per capire dove è nato un errore.

## W

**Workflow** (D1): sequenza di passi con un percorso deciso dal codice, a differenza dell'agente che decide da solo.
