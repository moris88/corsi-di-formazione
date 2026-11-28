# Cosa è cambiato nella guida d'esame

## Introduzione

Questa pagina confronta la guida ufficiale **precedente** (versione 1.1, novembre 2026) con quella **in vigore dal 7 dicembre 2026**. L'etichetta resta "1.1", ma il contenuto è stato rivisto in profondità: nel registro delle modifiche la voce 1.1 passa da "Registration, identification, and support updates" (novembre 2026) a "Revised objectives, descriptions, and sample items" (dicembre 2026).

Il [PDF aggiornato](../../assets/ccdvf/Claude-Certified-Developer-Foundations-Exam-Guide.pdf) sostituisce quello precedente. In caso di dubbio fa fede la guida ufficiale.

---

## In sintesi

- L'esame passa da **53 a 70 domande**: 60 contano per il punteggio e 10 no, ma non si sa quali.
- **I pesi dei domini cambiano molto.** Applicazioni e integrazione scende dal 33,1% al 20%; eval e Claude Code, quasi irrilevanti prima, salgono al 10% e all'8%.
- I pesi diventano **numeri interi** e spariscono le percentuali per singola competenza.
- Le competenze sono **riscritte come compiti** (analizzare una traccia, valutare un'architettura, diagnosticare un guasto) e passano da 25 a 24, con alcune competenze nuove.
- **Durata, soglia e costo non cambiano**: 120 minuti, 720 su 1000, 125 USD.
- Le **domande di esempio** sono sostituite da tre scenari più lunghi e più vicini al lavoro reale.

---

## Formato dell'esame

| Parametro | Prima | Ora |
| --- | --- | --- |
| Numero di domande | 53 | **70**, di cui 60 valutate e 10 non valutate (non identificabili, non influiscono sul punteggio) |
| Tipo di domanda | Scelta multipla e risposta multipla | Domande **a scenario** a scelta multipla; ogni domanda dice quante risposte selezionare |
| Durata | 120 minuti | 120 minuti |
| Tempo per domanda | circa 2 min 15 s | circa **1 min 43 s** |
| Punteggio per superare l'esame | 720 su 1000 | 720 su 1000 |
| Costo | 125 USD | 125 USD |
| Prerequisiti | Indicati nel testo | Nella tabella: nessuno, conta solo il risultato dell'esame |

Il ritmo è più serrato: con 17 domande in più nello stesso tempo conviene non fermarsi troppo su una sola. Siccome le domande non valutate non si riconoscono, vanno affrontate tutte con la stessa cura.

---

## I pesi dei domini

| Dominio | Prima | Ora | Variazione |
| --- | --- | --- | --- |
| 1. Agenti e workflow | 14,7% | **17%** | +2,3 |
| 2. Applicazioni e integrazione | 33,1% | **20%** | −13,1 |
| 3. Claude Code | 3,1% | **8%** | +4,9 |
| 4. Eval, test e debug | 2,6% | **10%** | +7,4 |
| 5. Scelta e ottimizzazione dei modelli | 16,8% | **12%** | −4,8 |
| 6. Prompt e context engineering | 11,0% | **15%** | +4,0 |
| 7. Sicurezza e protezione | 8,1% | **8%** | −0,1 |
| 8. Strumenti e MCP | 10,6% | **10%** | −0,6 |

Cosa significa per lo studio:

- Il dominio 2 non vale più un terzo dell'esame ma un quinto, e resta il più pesante. Insieme ai domini 1 e 6 arriva al 52%.
- **Eval (D4) e Claude Code (D3) non si possono più trascurare**: valgono insieme il 18%, contro il 5,7% di prima.
- Le percentuali indicano la quota di domande valutate: su 60 sono indicativamente 10, 12, 5, 6, 7, 9, 5 e 6 domande per i domini da D1 a D8.
- Il dominio 8 si chiama ora "Tools and MCP" (prima "Tools and MCPs").
- Prima ogni competenza aveva un peso proprio (per esempio 4,5% o 8,6%): ora le competenze sono elencate senza percentuale.

---

## Le competenze, dominio per dominio

Le competenze passano da **25 a 24**. Le descrizioni non elencano più argomenti da conoscere, ma compiti da saper svolgere su un caso concreto: leggere una traccia, un errore o un dato di costo e scegliere la correzione giusta.

### D1 · Agenti e workflow (3 competenze, come prima)

- Scegliere tra workflow e architettura agentica in base a requisiti, tolleranza agli errori e vincoli di audit, e scegliere l'ambiente di esecuzione: harness autogestito o runtime gestito e isolato.
- Costruire e correggere agenti con il Claude Agent SDK, cicli personalizzati e hook, perché le azioni obbligatorie avvengano in modo deterministico.
- Nuova: **diagnosi degli schemi**, cioè capire da una traccia quale schema manca o è applicato male (chiusura del ciclo di strumenti, isolamento dei subagenti, memoria, gestione della finestra di contesto).
- I framework agentici (Strands, LangGraph, PydanticAI) non sono più citati.

### D2 · Applicazioni e integrazione (da 6 a 4 competenze)

- Restano la meccanica della Messages API (ora con output strutturato e stop reason in elenco), la progettazione dell'applicazione e la configurazione, ora legata all'integrazione continua.
- Nuova: **resilienza dell'integrazione**: correggere gestione dello streaming e degli eventi finali, retry e fallback che non distinguono le classi di errore (rate limit, sovraccarico, richiesta non valida, timeout) e acquisizione di formati diversi con la Files API.
- Non sono più competenze a sé: comprensione dei requisiti, ciclo di vita dei sistemi e fondamenti di ingegneria del software (REST, JSON, programmazione asincrona, versionamento, code review, refactoring).

### D3 · Claude Code (da 1 a 2 competenze)

- L'uso di Claude Code ora comprende le diverse superfici (CLI, desktop, IDE, web, mobile), la precedenza dei file `CLAUDE.md`, le modalità di permessi, la modalità headless e quella in streaming.
- Nuova: **personalizzazione ed estensione**: scegliere il meccanismo adatto a un flusso di lavoro del team (Skill, plugin, file Rules, hook, subagente, comando slash), poi scriverlo e distribuirlo.

### D4 · Eval, test e debug (da 1 a 2 competenze)

- Nuova: **progettazione delle valutazioni**: giudici LLM tarati su dati etichettati da persone, insiemi di riferimento (golden set), test di regressione e controlli sul comportamento, con metriche difendibili.
- **Diagnosi dei guasti**: riconoscere dalla traccia allucinazione, rifiuto, azione mancata, perdita di contesto, deriva del formato o output incoerente, isolare se la causa è nell'integrazione o nel modello e correggere la causa, non il sintomo.

### D5 · Scelta e ottimizzazione dei modelli (da 4 a 3 competenze)

- La parte sulle opzioni dei modelli cita ora il pensiero adattivo e i livelli di effort; modalità veloce e pensiero esteso non sono più nominati.
- La scelta del livello di modello include la **pianificazione dei cambiamenti tra una versione e l'altra**, con valutazioni di regressione.
- Nuova impostazione della competenza sui costi: **trovare la voce di costo dominante** nei dati d'uso, scegliere l'ottimizzazione (prompt caching con punti di cache singoli, a più livelli o mobili, batch, budget di token) e stimarne l'effetto.
- Sparisce la competenza sui fondamenti tecnici (SDK, websocket).

### D6 · Prompt e context engineering (da 3 a 4 competenze)

- **Gestione del contesto nelle sessioni lunghe**: compattazione, potatura dell'output degli strumenti, isolamento tramite subagenti e criteri per aprire una sessione nuova.
- **Revisione del prompt** guidata dalle valutazioni di regressione (chiarezza, posizione in system o user, esempi, vincoli sull'output, pulizia dell'input). Zero, uno o più esempi passano qui dal D5.
- **Output strutturato e parsing difensivo**, con validazione rigorosa dello schema.
- Nuova: **ancoraggio ai documenti e citazione delle fonti**: rispondere solo in base ai documenti forniti, citarli, rispondere "non trovato" quando manca la risposta e decidere, in base a dimensione del corpus, costo e freschezza, se passare tutto il contesto o recuperare solo i passaggi utili.

### D7 · Sicurezza e protezione (da 4 a 3 competenze)

- **Difesa da prompt injection e jailbreak** con mitigazioni a più livelli, senza rompere la funzione dell'agente.
- **Guardrail deterministici e privilegio minimo**: gli hook diventano parte di questa competenza (prima erano a sé) perché le azioni distruttive non possano avvenire nemmeno sotto istruzioni ostili.
- **Gestione di chiavi API e credenziali**: proxy lato server invece di chiavi nel client, chiavi limitate a un workspace contro chiavi admin, ambienti separati, rotazione e monitoraggio degli accessi.

### D8 · Strumenti e MCP (3 competenze, riscritte)

- **Progettazione degli strumenti e forma delle risposte**: schema, descrizione che guida la chiamata giusta, risposta minima e utile, gestione degli errori, lato di esecuzione, schema di approvazione e composizione dell'insieme di strumenti.
- **Sviluppo e integrazione di server MCP**: risorse, strumenti e prompt, scelta del trasporto (stdio o HTTP) e autenticazione.
- **Scelta del meccanismo**: strumenti integrati, strumenti personalizzati, Skill o MCP, in base a dove deve stare la capacità, chi la mantiene e come Claude la scopre e la usa.

---

## Altre parti della guida

- **A chi è rivolta.** La sezione è riscritta: ingegneri del software, AI/ML, full-stack e backend, solution engineer, in settori come sanità, retail, fintech e SaaS. Citati esplicitamente Messages API, Claude Agent SDK, Claude Managed Agents, Claude Code su tutte le superfici, CI/CD con Git e GitHub Actions e ambienti aziendali con politiche IT restrittive.
- **Il candidato minimo.** La sezione dedicata e l'elenco dell'esperienza consigliata sono stati tolti; l'esperienza resta indicata (da uno a cinque anni di ingegneria del software e almeno sei mesi con Claude) nella parte su chi è il candidato.
- **Come prepararsi.** Ora è più concreto: costruire e rilasciare almeno un agente o workflow con strumenti, con Agent SDK o harness proprio, che includa strumenti personalizzati o un server MCP, output strutturato, prompt caching, una valutazione su un golden set e guardrail deterministici. Si aggiungono Managed Agents alla documentazione e le differenze tra API di Anthropic e piattaforme cloud.
- **Domande di esempio.** Le tre domande sono sostituite. Prima riguardavano Batch API, prompt injection e server MCP; ora sono scenari più lunghi su streaming e stop reason (D2), prompt caching a più livelli (D5) e descrizione di uno strumento (D8).
- **Punteggio.** Aggiunto il paragrafo sulle domande non valutate. Il resto non cambia.
- **Numerazione.** Le sezioni passano da 16 a 15, perché è stata tolta quella sul candidato minimo.
- **Pearson.** Il testo dice ora "Pearson" invece di "Pearson VUE"; il sito di supporto resta lo stesso.

### Cosa non cambia

Soglia di 720, scala da 100 a 1000, durata di 120 minuti, costo di 125 USD, iscrizione tramite Partner Academy e Pearson, regole su documento d'identità, annullamento e spostamento, attese per i nuovi tentativi (14, 30 e 90 giorni, al massimo quattro in dodici mesi), riservatezza, validità di 12 mesi e rinnovo, ricorsi.

---

## Effetto sui materiali di questo sito

- La **simulazione** e il **prompt per generare test** usano ora 70 domande e i nuovi pesi.
- Le pagine di teoria dei domini (D1–D8) sono ancora organizzate secondo l'elenco di competenze della versione precedente: i contenuti restano validi, ma la suddivisione può non coincidere con quella nuova.
- Il [vocabolario](./studio.html?doc=vocabolario) e la [guida d'esame](./studio.html?doc=guide) restano il punto di partenza per orientarsi.

---

## Fonti ufficiali

Confronto tra due versioni del PDF ufficiale *Claude Certified Developer – Foundations Exam Guide*: quella precedente (1.1, novembre 2026) e quella in vigore dal 7 dicembre 2026.
