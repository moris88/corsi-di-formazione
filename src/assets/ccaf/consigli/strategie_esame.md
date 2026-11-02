# Strategie per superare l'esame CCA-F con tranquillità

Questa guida non ripassa gli argomenti: spiega **come ragionare** sulle domande, quali **trabocchetti** ricorrono e come gestire **tempo e ansia**. È basata sui pattern delle domande di pratica (test 1–6).

---

## 1. Il principio che risolve metà delle domande

> **Se una regola deve valere SEMPRE, va imposta dal codice, non chiesta nel prompt.**

| Situazione | Risposta probabilistica (di solito sbagliata) | Risposta deterministica (di solito giusta) |
| --- | --- | --- |
| Rimborsi oltre una soglia | "Aggiungi la regola nel system prompt in maiuscolo" | Hook `PreToolUse` che blocca la chiamata |
| Verificare il cliente prima del rimborso | "Ricorda all'agente di verificare" | Controllo nel codice che blocca `process_refund` |
| Formattare dopo ogni modifica | Riga in CLAUDE.md | Hook `PostToolUse` |
| Formati di data incoerenti | Tabella di conversione nel prompt | Hook che normalizza i risultati dei tool |
| Comandi distruttivi | Lista di divieti nel prompt | Regole di deny / hook / settings gestiti |
| Output JSON valido | "Rispondi solo in JSON" | Tool use / `--json-schema` |

**Trabocchetto:** l'opzione "rafforza il prompt" (maiuscole, ripetizioni, few-shot, "pensa con attenzione") è quasi sempre la risposta sbagliata quando il testo dice *"deve sempre"*, *"garantire"*, *"policy aziendale"*, *"compliance"*, *"0,7% dei casi viola..."*.

**Eccezione:** quando il problema è di **giudizio** (classificare, estrarre testi formulati in modi diversi, stile del codice), la risposta giusta è proprio lavorare sul prompt: **criteri espliciti + esempi**.

---

## 2. Come leggere una domanda (metodo in 4 passi)

1. **Salta il paragrafo di scenario.** È identico in tutte le domande dello stesso scenario ("You are building a customer support resolution agent..."). Leggilo bene la prima volta, poi riconoscilo e vai avanti: risparmi minuti preziosi.
2. **Trova la frase che descrive il sintomo.** Spesso contiene un numero ("3% dei rimborsi", "dopo 30 turni", "il 18% dei documenti non contiene il valore"). Il numero ti dice *quale* problema c'è.
3. **Individua la domanda vera**: "most reliable", "most effective", "best first step", "root cause", "least overhead". Sono domande diverse:
   - *most reliable* → cerca la soluzione deterministica;
   - *root cause* → cerca **dove** sta il problema, non la soluzione;
   - *first step* → spesso diagnosi (es. `/memory`) o chiarimento, non la soluzione completa;
   - *least overhead / most maintainable* → la soluzione più semplice che funziona.
4. **Elimina prima, scegli dopo.** Di solito 2 opzioni sono chiaramente sbagliate; la scelta vera è tra le altre 2.

---

## 3. Le opzioni-trappola che ricorrono sempre

Impara a riconoscerle: escono in quasi ogni domanda.

### 🚩 Il "più grande / di più"

- "Passa a un modello più grande", "aumenta la context window", "aumenta `max_tokens`", "aumenta i retry da 3 a 5".
- Quasi sempre **sbagliata**: non affronta la causa.

### 🚩 La confidenza auto-dichiarata

- "Chiedi al modello un confidence score da 1 a 10 e usa solo quelli ≥ 8".
- **Sbagliata** se usata da sola: la confidenza auto-dichiarata **non è calibrata**. Diventa giusta solo se *calibrata su un validation set etichettato*.

### 🚩 Il sentiment

- "Escala se il sentiment supera una soglia di frustrazione".
- **Sbagliata**: i trigger di escalation corretti sono espliciti (richiesta di un umano, policy non coperta, nessun progresso, soglie).

### 🚩 Il "nasconde il problema"

- Rendere un campo opzionale per far passare la validazione, riempire con valori di default, rimuovere la metrica, escludere la cartella dalla review.
- **Sbagliata**: elimina il sintomo, non il problema.

### 🚩 Il "fallo inventare"

- "Se il valore manca, stima un valore realistico", "usa il valore più comune", "compensa con la tua conoscenza".
- **Sempre sbagliata**. La risposta giusta è: campo **nullable** + `null` quando l'informazione manca.

### 🚩 Il "retry senza feedback"

- "Rimanda lo stesso prompt", "riprova 3 volte e accetta la prima risposta non vuota".
- **Sbagliata**. Il retry giusto include **output precedente + errori di validazione specifici**. E se l'informazione **non c'è nel documento**, il retry è inutile.

### 🚩 Il meccanismo inventato

- Flag, variabili o file che non esistono: `CLAUDE_HEADLESS=true`, `--memory`, `CLAUDE.ci.md`, "i subagent condividono gli ultimi 5 turni", "Edit modifica la prima occorrenza".
- Se un'opzione suona troppo comoda e non l'hai mai vista nella documentazione, **probabilmente è inventata**.

### 🚩 L'"esagerazione"

- "Riscrivi tutto il modulo", "leggi tutti i 2.000 file", "rimani in plan mode finché non prevedi ogni firma di funzione", "100% di revisione umana per sempre".
- La risposta giusta è proporzionata al problema.

### 🚩 Lo "sposta il lavoro sugli umani"

- "Chiedi al cliente di inoltrare il riassunto", "lascia che i developer correggano a mano", "chiedi ai fornitori di avvisarti".
- Raramente è la risposta migliore.

---

## 4. Le coppie da non confondere (domande-trabocchetto classiche)

| Confusione | Regola |
| --- | --- |
| `~/.claude/CLAUDE.md` vs `CLAUDE.md` di progetto | Il primo è **personale**, il secondo **condiviso** via git |
| CLAUDE.md di sottocartella vs `.claude/rules/` con `paths` | Scope **per cartella** → CLAUDE.md di sottocartella; **tipo di file sparso ovunque** (`**/*.test.ts`) → rule con glob |
| CLAUDE.md vs skill | Sempre rilevante → CLAUDE.md; procedura occasionale → skill (caricata su richiesta) |
| `.claude/commands/` vs `~/.claude/commands/` | Progetto (condiviso) vs personale. Stessa logica per `skills/` |
| `.mcp.json` vs `~/.claude.json` | Server MCP del team (con `${ENV_VAR}` per i segreti) vs server personale |
| `settings.json` vs `settings.local.json` | Condiviso vs personale (non committato) |
| `context: fork` vs `allowed-tools` | Isolare il **contesto** vs limitare gli **strumenti/effetti collaterali** |
| `/clear` vs `/compact` | Task **non correlato** → `/clear`; stesso task, contesto pieno → `/compact` (con istruzioni su cosa conservare) |
| `--resume` vs fork session | Riprendere la stessa sessione vs esplorare **alternative** dalla stessa base |
| Grep vs Glob | Grep cerca nel **contenuto**; Glob cerca per **nome/percorso** di file |
| Edit vs Write | Modifica mirata (`old_string` **univoca**) vs riscrittura completa |
| `tool_choice: auto` / `any` / tool specifico | `any` = deve chiamare **un** tool, sceglie lui quale; tool specifico = forza quel tool |
| Tool use / schema | Elimina errori di **sintassi**, NON errori **semantici** |
| Message Batches API | ~50% di costo, **fino a 24h**, nessuna garanzia di latenza, **nessun loop di tool a più turni**, risultati correlati da `custom_id` |
| `stop_reason` | `tool_use` → esegui i tool e continua; `end_turn` → fine. Mai fare il parsing del testo |
| Subagent | **Non** ereditano il contesto del coordinatore: tutto va passato esplicitamente nel prompt di delega. Il coordinatore deve avere `Task` negli `allowedTools` |
| Esecuzione diretta vs plan mode | Fix localizzato con causa nota → diretto; molti file, alternative architetturali, decisioni aperte → plan mode |

---

## 5. Euristiche rapide per scenario

### Customer Support Resolution Agent

- Il cliente chiede esplicitamente un umano → **escala**, anche se potresti risolvere.
- Policy che non copre il caso → **escala**, non inventare per analogia.
- Più account con lo stesso nome → **chiedi un identificativo aggiuntivo**.
- Nessun progresso dopo vari tentativi → **escala** con un riassunto.
- Handoff → riassunto **strutturato** (chi, cosa, cosa è stato fatto, perché escali, cosa proponi).
- Dettagli che si perdono nelle conversazioni lunghe → blocco **"case facts"** persistente.
- Errori dei tool → `isError` + categoria + se si può riprovare.

### Code Generation con Claude Code

- Chiediti sempre: *condiviso o personale?* e *sempre o su richiesta?*
- Convenzioni difficili da descrivere → **esempi concreti** di codice esistente.
- Requisiti vaghi → fai **intervistare** da Claude / plan mode.
- Iterazioni che non convergono → **input/output concreti trasformati in test**.

### Multi-Agent Research System

- Ogni subagent ha fatto bene il suo lavoro ma il report è incompleto → colpa della **decomposizione del coordinatore**.
- Subtask indipendenti → più chiamate `Task` **nella stessa risposta** (parallelo).
- Tutta la comunicazione passa dal **coordinatore** (hub-and-spoke).
- Fonti in conflitto → riporta **entrambe** con fonte e data, non fare la media.
- Conserva la **provenienza**: affermazione + URL + data + estratto.
- Fallimenti parziali → risultati parziali + **metadati su cosa manca**.
- Strumenti limitati al ruolo (**privilegio minimo**).

### Structured Data Extraction

- Informazione che può mancare → **nullable**.
- Categorie non coperte → `"other"` + campo di dettaglio; casi ambigui → `"unclear"`/`"multiple"`.
- Totali incoerenti → estrai **entrambi** i valori e segnala la discrepanza, non riconciliarli.
- Accuratezza aggregata alta → **misura stratificata** per tipo di documento prima di ridurre la revisione.
- Diagnosi degli errori sistematici → campi `supporting_excerpt` / `detected_pattern`.

### Claude Code per la CI

- Non interattivo → `-p`; output per uno script → `--output-format json` + `--json-schema`.
- Review → istanza **separata** da quella che ha generato il codice.
- PR grandi → passaggi **per file** + passaggio di **integrazione** tra file.
- Falsi positivi → **criteri espliciti** su cosa segnalare e cosa no, con esempi; "nessun problema" è una risposta valida.
- Bloccante per lo sviluppatore → **sincrono**; job notturno → **Batches**.
- La CI legge comunque il `CLAUDE.md` del progetto.

### Developer Productivity

- Cerca con Grep/Glob, poi **leggi solo quello che serve**.
- Output enormi dei tool → **taglia** prima che entrino nel contesto.
- Cambiamenti ripetitivi su larga scala → fai **scrivere e testare uno script**, poi eseguilo in modo deterministico.
- Sessioni lunghe che degradano → **scratchpad** + nuova sessione.
- Integrazione standard → usa un **server MCP esistente**; server custom solo per esigenze specifiche.

---

## 6. Gestione del tempo

- **120 minuti / 60 domande = 2 minuti a domanda.** Le domande sono lunghe: leggi solo la frase del sintomo e la domanda.
- **Primo giro:** rispondi a tutto ciò su cui sei sicuro in meno di 90 secondi. Segna (flag) quelle dubbie e **dai comunque una risposta provvisoria**: non lasciare mai vuoto.
- **Secondo giro:** torna sulle domande segnate. Hai circa 30 minuti di margine.
- **Non cambiare risposta** senza un motivo concreto (hai trovato un dettaglio che avevi perso). Il primo istinto, basato sui principi, è spesso giusto.
- Gli ultimi 5 minuti: controlla che non ci siano domande senza risposta.

---

## 7. Tecniche per scegliere tra le ultime due opzioni

1. **Quale affronta la causa e non il sintomo?**
2. **Quale funziona *sempre*, non "di solito"?**
3. **Quale è proporzionata?** Né troppo poco (un'istruzione nel prompt) né troppo (riscrivere tutto).
4. **Quale conserva le informazioni?** Escludere, scartare, rendere opzionale o fare la media perde dati.
5. **Quale usa il meccanismo nativo** di Claude Code / Agent SDK / API invece di un workaround fatto a mano?
6. **Diffida dei superlativi assoluti** nelle opzioni: "always", "never", "guarantees", "eliminates all". Spesso sono quelle sbagliate (salvo quando descrivono un meccanismo deterministico reale).
7. **Le opzioni corrette sono spesso le più articolate** e contengono un "e" ("fai X **e** mantieni Y"), perché bilanciano due esigenze. Non è una regola assoluta: usala solo per decidere tra due opzioni equivalenti.

---

## 8. Come allenarsi nelle ultime settimane

- Fai i test di pratica **a tempo** (120 minuti), senza interruzioni.
- Per ogni errore, scrivi **quale trappola ti ha fregato** (sezione 3). Dopo 2–3 test vedrai che sbagli sempre per gli stessi 2–3 motivi: quelli sono i tuoi punti deboli.
- Rileggi le **spiegazioni anche delle risposte giuste**: spesso hai indovinato per il motivo sbagliato.
- Ripassa la tabella della sezione 4 la sera prima: sono i dettagli che fanno perdere punti facili.
- Obiettivo: **stabilmente sopra l'80%** nei test di pratica prima di sostenere l'esame.

---

## 9. Il giorno dell'esame

- Leggi la *Exam Policy* (`Anthropic-Certification-Exam-Policy.pdf`) qualche giorno prima: requisiti tecnici, documento, ambiente.
- Prepara l'ambiente in anticipo (connessione, stanza, webcam se richiesta).
- Dormi bene: con domande lunghe e simili la stanchezza fa sbagliare la lettura, non la conoscenza.
- Durante l'esame, se una domanda ti blocca: **segnala, rispondi provvisoriamente, passa oltre**.

---

## 10. Consigli extra

1. **Tieni un diario degli errori.** Dopo ogni test annota: numero della domanda → trappola in cui sei caduto → regola corretta. Dopo 2–3 test emergono i tuoi punti deboli: ripassa solo quelli.
2. **Decidi la causa prima di leggere le opzioni.** Leggi la domanda, copri le risposte e chiediti: *il problema è nel prompt, nel codice, nella configurazione o nel contesto?* Poi cerca l'opzione che corrisponde. Così le opzioni-trappola ti influenzano meno.
3. **Dai priorità ai domini con più peso.** Le architetture ad agenti e la configurazione di Claude Code valgono più domande: se hai poco tempo, ripassa prima quelle.
4. **Attento alle opzioni quasi corrette.** Spesso due opzioni dicono la stessa cosa, ma una aggiunge un dettaglio sbagliato (un file che non esiste, "always" invece di "when needed"). Leggi ogni opzione **fino all'ultima parola**.
5. **Ripassa la documentazione ufficiale sui dettagli pratici:** comandi di Claude Code (`/memory`, `/compact`, `/clear`), campi del frontmatter delle skill (`context`, `allowed-tools`, `argument-hint`), configurazione degli hook (`PreToolUse`, `PostToolUse`), `tool_choice`, Batches API. Sono punti "facili" che si perdono per un dettaglio.
6. **Prima dell'esame vero fai almeno 2 test completi senza guardare le spiegazioni**, per simulare la pressione reale; correggili solo alla fine.

---

### Il mantra finale

> **Deterministico batte probabilistico. Esplicito batte vago. Esempi battono descrizioni. Isolare batte accumulare. Segnalare batte nascondere. Mai inventare dati.**
