# Vocabolario dell'esame CCAF

Glossario dei termini tecnici che servono per l'esame, in ordine alfabetico. Ogni voce indica il dominio di riferimento (D1–D5) e una spiegazione in linguaggio semplice.

---

## A

**Agente** (D1): un modello linguistico messo in un ciclo, che può usare strumenti per fare azioni nel mondo, non solo rispondere con testo.

**`Agent`** (D1): lo strumento con cui il coordinatore lancia un subagente. Nei materiali più vecchi si chiama `Task`.

**`AGENTS.md`** (D3): file con istruzioni per agenti di programmazione in generale. Claude lo legge solo se manca `CLAUDE.md`; si può importare dentro `CLAUDE.md`.

**Applicazione programmatica** (D1): far rispettare una regola con codice che blocca l'azione, invece di affidarsi alle istruzioni. È deterministica.

**Applicazione basata sul prompt** (D1): far rispettare una regola scrivendola nelle istruzioni. È probabilistica: non garantita.

**Approvazione** (D2, D3): la conferma che Claude Code chiede prima di eseguire certe operazioni o usare server MCP definiti nel progetto.

**Auto** (D2): il valore predefinito di `tool_choice`: Claude decide se usare uno strumento o rispondere con testo. Non garantisce alcuna chiamata.

**Ambito** (D2, D3): il livello in cui si registra un server MCP (locale, progetto, utente, gestito) o si carica un file di istruzioni.

---

## B

**Batch API** (D3, D4): modalità in cui si inviano molte richieste insieme e si ricevono i risultati più tardi (fino a 24 ore). Costa il 50% in meno. Non supporta conversazioni a più turni.

**Blocco dei fatti del caso** (D5): un blocco di dati importanti (numeri, ID, date) scritto alla lettera, che non viene riassunto e sopravvive alla compressione del contesto.

**Budget dell'attività** (`task_budget`) (D5): limite di token che il modello vede e può usare per regolare il proprio ritmo. Diverso da `max_tokens`, che il modello non vede.

**`budget_tokens`** (D4): parametro dei modelli più vecchi per fissare quanto ragionare. Dà errore `400` sui modelli recenti.

---

## C

**Cache dei prompt** (D4): memoria veloce che riusa la parte iniziale, stabile, di una richiesta. Costa molto meno rispetto all'input normale.

**Client** (D2): nel protocollo MCP, il collegamento dedicato dentro l'host, uno per ogni server.

**Codebase** (D5): l'insieme dei file di un progetto software.

**Compattazione** (D5): riassunto della conversazione precedente, fatto su richiesta o a soglia dal server. Sostituisce la cronologia con un blocco firmato.

**`compaction_block_misplaced`** (D5): errore che segnala un blocco di compattazione messo in una posizione sbagliata della richiesta.

**`/compact`** (D3, D5): comando di Claude Code per riassumere la conversazione in modo proattivo.

**Conformità allo schema** (D4): garanzia che l'output rispetti tipi, campi obbligatori e valori ammessi. Non garantisce che i dati siano veri.

**Contesto** (D5): tutto ciò che Claude ha davanti in un dato momento: messaggi, risultati degli strumenti, istruzioni.

**Convalida** (D2, D4): il controllo di un dato, in codice, rispetto a regole. Può essere dello schema (forma) o semantica (significato).

**Convalida semantica** (D4): controllo del significato dei dati, per esempio che una somma torni. Va scritto nel codice.

**Coordinatore** (D1): l'agente che scompone il lavoro, delega ai subagenti e raccoglie i risultati.

**`content`** (D1, D5): il campo di una risposta che contiene i blocchi di testo e di strumenti. Nella compattazione va passato per intero.

**`custom_id`** (D3, D4): etichetta assegnata a ogni richiesta di un batch, per riconoscere le risposte, che arrivano in ordine casuale.

---

## D

**Descrizione** (D2): testo di uno strumento o di una skill che Claude legge per decidere quando usarlo.

**Dati in conflitto** (D5): situazione in cui due fonti danno valori diversi per lo stesso dato. Va annotata, non risolta in silenzio.

**Dominio** (generale): una delle cinque aree dell'esame. Il dominio 1 pesa il 27%, il 2 il 18%, il 3 il 20%, il 4 il 20%, il 5 il 15%.

---

## E

**`effort`** (D4): livello di profondità del lavoro del modello, impostato in `output_config`. Predefinito `high`, tranne Opus 5.5 con `medium`.

**Enum** (D4): un elenco chiuso di valori ammessi per un campo, per esempio `"sì"`, `"no"`, `"unclear"`.

**Escalation** (D5): passaggio di un caso a un operatore umano.

**Errore business** (D2): errore dovuto a una regola di policy, per esempio un importo oltre il limite. Non si risolve riprovando.

**Errore di autorizzazione** (D2): errore dovuto a credenziali scadute o insufficienti. Si passa a una persona.

**Errore di convalida** (D2): errore dovuto a input sbagliato. Si corregge l'input e si riprova.

**Errore temporaneo** (D2): errore che può risolversi da solo, come un timeout. Si riprova con attesa crescente.

**`is_error`** (D1, D2): campo che segnala che un `tool_result` è un errore e non un dato valido.

---

## F

**Few-shot** (D4): tecnica che consiste nel mostrare al modello 2–4 esempi completi prima di chiedere il lavoro.

**Fork** (D1): copia di una sessione o di un agente che eredita tutta la conversazione e condivide la cache.

**`--fork-session`** (D1): flag di Claude Code che crea un ramo con un nuovo ID per provare una strategia diversa partendo dalla stessa base.

**Frontmatter** (D3): il blocco iniziale, tra trattini, di un file di skill o di subagente, con i campi che ne regolano il comportamento.

---

## H

**Hook** (D1, D2): codice eseguito automaticamente in momenti precisi del ciclo (prima o dopo uno strumento, alla fine del turno). Serve per far rispettare regole in modo deterministico.

**Host** (D2): il programma che usi e che gestisce le connessioni MCP, per esempio Claude Code.

**Hub-and-spoke** (D1): modello a raggiera in cui un coordinatore centrale gestisce tutte le comunicazioni tra agenti.

---

## I

**Iniezione dinamica** (D3): comando inserito in una skill con il punto esclamativo, eseguito prima che il testo arrivi a Claude.

**Iterativo** (D3): approccio di affinamento per tentativi successivi.

---

## L

**Loop agentico** (D1): il ciclo in cui Claude risponde, usa strumenti e riprende finché non ha finito.

**`/loop`** (D3): comando di Claude Code che ripete un'operazione nella sessione corrente.

---

## M

**`max_tokens`** (D5): limite massimo di lunghezza della risposta. Se viene raggiunto, il testo si interrompe.

**Memoria automatica** (D3): appunti che Claude salva in `MEMORY.md`, letti all'avvio.

**`MEMORY.md`** (D3, D5): file della memoria automatica. Sopravvive alla compattazione.

**Modalità plan** (D3): modalità in cui Claude progetta e presenta un piano, senza modificare file, prima dell'approvazione.

**Modifica del contesto** (`context_management`, D5): meccanismo lato server che elimina vecchi risultati degli strumenti o blocchi di ragionamento.

**MCP** (Model Context Protocol) (D2): standard che permette a Claude di collegarsi a servizi esterni.

**Multi-agente** (D1): sistema con più agenti che collaborano.

---

## N

**`none`** (D2): valore di `tool_choice` che vieta le chiamate agli strumenti. Le definizioni restano nel contesto.

**Nullable** (D4): campo che può essere valorizzato oppure `null`, cioè assente. Si scrive come `["string", "null"]`.

---

## O

**Output strutturato** (D4): risposta in un formato preciso (per esempio JSON) secondo uno schema.

**`output_config`** (D4, D5): sezione della richiesta che contiene `format` (lo schema dell'output), `effort` (la profondità) e `task_budget` (il budget dell'attività).

---

## P

**`-p` / `--print`** (D3): modalità non interattiva di Claude Code, obbligatoria in CI.

**`PreToolUse`** (D1): hook che si attiva prima dell'esecuzione di uno strumento. Può bloccarla.

**`PostToolUse`** (D1): hook che si attiva dopo lo strumento, prima che Claude legga il risultato.

**`PostToolUseFailure`** (D1): hook che gestisce i casi in cui lo strumento è fallito.

**`pause_turn`** (D1): valore di `stop_reason` che indica che un processo lato server si è fermato e va fatto continuare.

**Prefill** (D4): tecnica che consiste nello scrivere in anticipo l'inizio della risposta del modello. Dà errore `400` sui modelli recenti.

**Prompt** (generale): il testo di istruzioni che si invia a Claude.

**Provenienza** (D5): l'origine di un'informazione: fonte, data, tipo di fonte.

---

## R

**`refusal`** (D1, D5): valore di `stop_reason` che indica che Claude ha rifiutato la richiesta.

**Regole per percorso** (D3): file in `.claude/rules/` che si applicano solo a determinati file, indicati con `paths:`.

**Riprovare** (D2, D4): inviare di nuovo una richiesta che è fallita. Ha senso solo se il problema è temporaneo o correggibile.

**`role: "system"`** (D5): messaggio di istruzioni inserito nella conversazione, usato per cambiare le istruzioni senza invalidare il ragionamento.

---

## S

**Scratchpad** (D5): file di appunti in cui si salvano i risultati importanti, per sopravvivere alla compressione del contesto.

**`SKILL.md`** (D3): il file che definisce una skill.

**Skill** (D3): un insieme di istruzioni riutilizzabili che Claude può usare quando serve.

**Soppressione silenziosa** (D2, D5): antipattern in cui un errore viene nascosto e restituito come risultato vuoto.

**`stop_reason`** (D1, D5): il motivo per cui Claude ha smesso di rispondere. Determina se il loop continua o si ferma.

**Strict** (`strict: true`) (D2, D4): modalità che obbliga lo strumento a rispettare esattamente lo schema.

**Strumento di memoria** (D5): strumento che permette a Claude di leggere e scrivere file persistenti, fuori dalla conversazione.

**Strumento** (tool) (D1, D2): funzione che il programma mette a disposizione di Claude per fare azioni, come cercare un dato o inviare un rimborso.

**Subagente** (D1, D3): agente lanciato da un coordinatore, con un contesto separato e un compito preciso.

**Sessione** (D1, D3): una conversazione con Claude Code che conserva la memoria del lavoro.

---

## T

**Temperature** (D4): parametro che regola la variabilità delle risposte. Dà errore `400` sui modelli recenti.

**Thinking** (D4, D5): il ragionamento interno che Claude fa prima di rispondere.

**Thinking adattivo** (`type: "adaptive"`) (D4): modalità in cui il modello decide da solo quanto ragionare.

**Token** (D5): pezzo di testo, più piccolo di una parola, che è l'unità di misura per costi e limiti.

**`tokenizer`** (D5): il meccanismo che trasforma il testo in token. Cambiato dal modello 4.7 in poi.

**`tool_choice`** (D2): parametro che stabilisce se Claude deve usare uno strumento e quale.

**`tool_result`** (D1, D2): la risposta che il programma restituisce a Claude dopo aver eseguito uno strumento.

**`tool_use`** (D1, D2): la richiesta con cui Claude chiede di usare uno strumento. Come valore di `stop_reason` indica che il loop deve continuare.

**`tool_use_id`** (D1): etichetta che collega un `tool_result` alla richiesta `tool_use` corrispondente.

**Trasporto** (D2): il modo in cui un server MCP si collega: `stdio`, `http`, `sse`, `ws`.

---

## V

**Vuoto vs errore** (D2, D5): distinzione essenziale tra "ho cercato e non c'è niente" (risultato vuoto, stato `200`) e "non sono riuscito a cercare" (errore, per esempio `503` o timeout).

---

## Termini tecnici di base

Concetti generali dell'informatica che il corso dà per scontati. Qui trovi una definizione breve; la spiegazione completa, con esempi, è nel **Pre-corso** (Prerequisiti tecnici).

**Allucinazione**: informazione inventata dal modello ma presentata come vera. Si riduce con fonti, citazioni e permettendo di rispondere "non lo so" o `null`.

**API**: il "contratto" con cui un programma offre funzioni ad altri programmi. La Claude API è quella con cui si inviano messaggi a Claude.

**Asincrono**: si invia la richiesta e si continua a fare altro; il risultato arriva più tardi. Contrario di sincrono.

**Audit trail**: traccia di chi ha fatto cosa e quando, usata per controlli e conformità.

**Backoff esponenziale**: tra un nuovo tentativo e l'altro si aspetta sempre di più (1 s, 2 s, 4 s…).

**Branch**: linea di sviluppo parallela in Git. Il branch principale si chiama di solito `main`.

**Cache**: copia temporanea di dati usati spesso, per non ricalcolarli o riscaricarli.

**Chiave API**: stringa segreta che identifica chi chiama un servizio. Va in una variabile d'ambiente o in un gestore di segreti, mai nel codice.

**Chiave primaria / chiave esterna**: la colonna che identifica in modo univoco una riga / la colonna che collega una riga a quella di un'altra tabella.

**Chunk / chunking**: pezzo di un documento lungo / divisione del documento in pezzi, per la ricerca o per stare nella finestra di contesto.

**CI/CD**: integrazione continua (controlli automatici a ogni modifica) e rilascio continuo (rilascio automatico del codice verificato).

**CLI**: programma che si usa dal terminale scrivendo comandi. Claude Code è una CLI.

**Codice di stato HTTP**: numero nella risposta HTTP. 2xx successo (`200` OK, `201` creato, `204` nessun contenuto), 4xx errore di chi chiede (`400`, `401`, `403`, `404`, `429`), 5xx errore del server (`500`, `503`).

**Commit**: "fotografia" delle modifiche salvata in Git, con un messaggio descrittivo.

**CRUD**: le quattro operazioni base sui dati: crea, leggi, aggiorna, cancella.

**CSV**: tabella salvata come testo, con valori separati da virgola o punto e virgola. Non ha uno schema.

**Database**: sistema che conserva dati organizzati e permette di cercarli e modificarli. Relazionale (tabelle, SQL) o NoSQL (documenti, chiave-valore, vettoriale).

**Database vettoriale**: database che conserva embedding e trova rapidamente quelli più vicini, cioè i testi più simili per significato.

**Dato strutturato / non strutturato**: con una forma fissa (tabella, JSON) / testo libero (email, contratti).

**Dipendenza**: libreria di cui un'altra libreria o un programma ha bisogno per funzionare.

**Diff**: elenco delle differenze tra due versioni di un file, riga per riga.

**Embedding**: rappresentazione di un testo come lista di numeri; testi di significato simile hanno numeri vicini.

**Endpoint**: l'indirizzo (URL) di una specifica funzione di un'API.

**Exit code**: numero restituito da un programma quando termina: `0` successo, diverso da zero errore. Usato da hook e pipeline.

**Few-shot / zero-shot**: prompt con alcuni esempi di input e output / senza esempi.

**Finestra di contesto**: quantità massima di token che il modello considera in una richiesta (istruzioni, conversazione, documenti, risultati dei tool e risposta).

**Funzione**: blocco di codice con nome, parametri e valore di ritorno. Un tool è la descrizione di una funzione per Claude.

**GDPR**: il regolamento europeo sulla protezione dei dati personali.

**Git**: sistema di controllo di versione che registra la storia delle modifiche a un progetto.

**GitHub / GitHub Actions**: servizio online per ospitare repository Git, con pull request e issue / il suo sistema di automazione, configurato con file YAML.

**Glob**: pattern con caratteri jolly per selezionare file, per esempio `src/**/*.ts`.

**Header**: informazione aggiuntiva in una richiesta o risposta HTTP, come l'autenticazione o il formato dei dati.

**HTTP / HTTPS**: il protocollo con cui i programmi comunicano sul web / la sua versione cifrata.

**Idempotente**: operazione che, eseguita più volte, dà lo stesso risultato di una volta sola. Solo queste si possono riprovare senza rischi.

**Issue**: segnalazione su GitHub di un problema o di una richiesta.

**JSON**: formato di testo per dati, fatto di oggetti `{ }`, array `[ ]` e coppie chiave-valore.

**JSON Schema**: JSON che descrive la forma di un altro JSON (`type`, `properties`, `required`, `enum`). Usato per l'`input_schema` dei tool e per l'output strutturato.

**Latenza**: tempo che passa tra la richiesta e la risposta.

**Libreria / SDK**: codice già scritto da riusare / insieme di librerie e strumenti per una piattaforma (Claude SDK per l'API, Claude Agent SDK per gli agenti).

**Linter**: strumento che controlla stile ed errori comuni del codice senza eseguirlo.

**LLM**: modello linguistico di grandi dimensioni, che genera testo prevedendo la continuazione più probabile. Claude è un LLM.

**Log**: registro degli eventi di un programma.

**Markdown**: formattazione del testo con simboli semplici (`#`, `-`, `**`). È il formato di `CLAUDE.md` e delle skill.

**Merge**: unione delle modifiche di un branch in un altro.

**Metodo HTTP**: l'azione richiesta: `GET` leggi, `POST` crea, `PUT`/`PATCH` modifica, `DELETE` cancella.

**OAuth**: sistema con cui un utente concede a un'app un accesso limitato e revocabile ai propri dati, senza darle la password.

**OCR**: riconoscimento ottico dei caratteri: trasforma l'immagine di un testo in testo. Può scambiare caratteri simili o confondere l'ordine delle colonne.

**Package manager**: strumento che installa librerie e dipendenze (`pip`, `uv`, `npm`); `npx` e `uvx` eseguono un pacchetto al volo.

**Permesso**: ciò che un utente o un programma può fare (leggere, scrivere, eseguire). In Claude Code: regole allow, ask e deny.

**Pipe**: il simbolo `|`, che passa l'output di un comando come input al successivo.

**Pipeline**: sequenza di passaggi automatici, per esempio nella CI/CD.

**PII**: dati personali che identificano una persona (nome, email, codice fiscale, carta).

**Polling**: chiedere a intervalli regolari "ci sono novità?". Alternativa meno efficiente al webhook.

**Privilegio minimo**: concedere solo i permessi strettamente necessari al compito.

**Probabilistico**: che può dare output diversi con lo stesso input, come un modello linguistico. Contrario di deterministico.

**Pull request (PR)**: proposta di unire un branch nel progetto principale, con revisione e controlli automatici.

**Query**: richiesta di dati a un database.

**RAG**: recuperare i documenti pertinenti e inserirli nel prompt prima di far rispondere il modello.

**Rate limit**: limite di richieste o token utilizzabili in un certo tempo; superarlo produce l'errore `429`.

**Regex**: espressione regolare, modello per cercare o validare testo (per esempio `\d{5}` per un CAP). Deterministica: controlla la forma, non il significato.

**Repository**: cartella di progetto gestita da Git, con tutta la sua storia.

**REST**: stile di API su HTTP in cui ogni URL è una risorsa e il metodo indica l'azione. Senza stato.

**Ricerca semantica**: ricerca per significato, basata sugli embedding, invece che per parole esatte.

**Rollback**: annullamento di tutte le operazioni di una transazione fallita.

**Server / client**: programma che offre un servizio e attende richieste / programma che le invia.

**Sincrono**: si invia la richiesta e si aspetta la risposta prima di proseguire.

**SLA**: impegno sul livello di servizio, per esempio "risposta entro 24 ore".

**SQL**: linguaggio per interrogare i database relazionali (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).

**SQL injection**: attacco in cui un testo malevolo modifica una query. Si evita con le query parametrizzate.

**Stateless**: senza stato: ogni richiesta contiene tutto ciò che serve. La Claude API è stateless, quindi si reinvia ogni volta la conversazione.

**stdin / stdout / stderr**: i canali di ingresso, uscita normale e uscita degli errori di un programma da riga di comando.

**Streaming**: ricevere la risposta a pezzi mentre viene generata.

**Subprocess**: processo avviato da un altro processo. Un server MCP `stdio` è un subprocess di Claude Code.

**Timeout**: tempo massimo di attesa di una risposta, oltre il quale la richiesta è considerata fallita.

**Transazione**: gruppo di operazioni su un database che riescono tutte o nessuna.

**Variabile d'ambiente**: valore impostato fuori dal codice e letto dai programmi, per esempio `ANTHROPIC_API_KEY`.

**Webhook**: chiamata HTTP che un servizio esterno fa al tuo sistema quando succede un evento. Può arrivare più volte: va gestita in modo idempotente.

**Worktree**: seconda cartella di lavoro collegata allo stesso repository Git, su un altro branch. Utile per sessioni parallele.

**XML / tag XML**: formato con tag di apertura e chiusura / nei prompt, tag come `<documento>` per separare istruzioni, dati ed esempi.

**YAML**: formato di dati basato sull'indentazione, usato nel frontmatter e nelle pipeline.

---

## Parole che compaiono spesso nelle domande

**Conformità** vs **correttezza** (D4): lo schema garantisce la conformità, non la correttezza.

**Condiviso** vs **personale** (D3): `CLAUDE.md` di progetto è condiviso; `CLAUDE.local.md` e `~/.claude/CLAUDE.md` sono personali.

**Deterministico** vs **probabilistico** (D1): il controllo nel codice è deterministico; le istruzioni nel prompt sono probabilistiche.

**Parallelo** vs **sequenziale** (D1): chiamate nella stessa risposta = parallele; in turni diversi = sequenziali.

**Batch** vs **sincrono** (D3, D4): il batch è economico e differito; il sincrono è immediato e costa di più.

**Riepilogo** vs **parafrasi** (D5): un riepilogo perde i dettagli esatti; per i numeri serve il blocco dei fatti.

**Null** vs **nuovo tentativo** (D4): se il dato non è nel documento, si accetta `null`; riprovare non lo farà comparire.
