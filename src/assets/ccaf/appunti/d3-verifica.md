# Dominio 3: configurazione e workflow di Claude Code (20%)

## Domande di verifica

### Domanda 1

Un team vuole che le convenzioni di test si applichino a tutti i file `*.test.ts`, distribuiti in molte directory. Quale approccio è più manutenibile?

- **A.** Un `CLAUDE.md` in ogni directory che contiene test.
- **B.** Un unico file in `.claude/rules/` con `paths: ["**/*.test.ts"]`.
- **C.** Le regole di test nel `CLAUDE.md` di progetto.
- **D.** Spostare tutti i test in `tests/` con un `CLAUDE.md`.

### Domanda 2

Una pipeline CI esegue Claude Code per la revisione automatica delle PR e resta bloccata in attesa di input. Quale flag manca?

- **A.** `--verbose`
- **B.** `-p` / `--print`
- **C.** `--force`
- **D.** `--no-cache`

### Domanda 3

Un team deve riscrivere l’autenticazione in 15 file, con più approcci validi e decisioni architetturali. Quale modalità conviene usare per iniziare?

- **A.** Esecuzione diretta, un file alla volta.
- **B.** Modalità plan, per esplorare, progettare e ottenere l’approvazione prima di modificare.
- **C.** `bypassPermissions`, per non interrompere il lavoro.
- **D.** Un subagente `general-purpose` con il contesto completo della conversazione.

### Domanda 4

Un developer vuole che un proprio stile di lavoro (ad esempio spiegazioni dettagliate) valga in tutti i progetti sui quali lavora, senza condividerlo con il team. Dove va scritto?

- **A.** `./CLAUDE.md` del progetto.
- **B.** `./CLAUDE.local.md` del progetto.
- **C.** `~/.claude/CLAUDE.md`.
- **D.** `./src/CLAUDE.md`.

### Domanda 5

Un repository usa `AGENTS.md` per tutti gli agenti di programmazione. Il team vuole anche regole specifiche per Claude, senza duplicare il contenuto. Qual è l’approccio corretto?

- **A.** Creare `CLAUDE.md` che importa `@AGENTS.md` e aggiunge una sezione con le regole specifiche per Claude.
- **B.** Copiare `AGENTS.md` dentro `CLAUDE.md`.
- **C.** Eliminare `AGENTS.md`, perché Claude preferisce `CLAUDE.md`.
- **D.** Creare un `CLAUDE.md` in ogni directory del progetto.

### Domanda 6

In un monorepo, un `CLAUDE.md` annidato appartenente a un altro team viene caricato ogni volta che Claude lavora nella directory del tuo team, con istruzioni che non vi riguardano. Qual è la soluzione più appropriata?

- **A.** Eliminare il file dell’altro team.
- **B.** Usare `claudeMdExcludes` nelle impostazioni, con un glob che lo esclude.
- **C.** Usare `--add-dir` per isolare la directory.
- **D.** Eseguire `/init` in modalità interattiva.

### Domanda 7

Una skill esegue un deploy in produzione. Il team vuole che Claude non possa mai attivarla da solo: deve essere lanciata esclusivamente dall’utente con `/deploy`. Quale campo del frontmatter serve?

- **A.** `description` più vaga, così Claude non la riconosce.
- **B.** `disable-model-invocation: true`.
- **C.** `user-invocable: false`.
- **D.** `context: fork`.

### Domanda 8

Una skill `pr-summary` deve includere il diff della pull request aggiornato al momento dell’invocazione, prima che Claude legga il corpo della skill. Come si realizza?

- **A.** Con l’iniezione dinamica ``!`gh pr diff` `` nel corpo della skill.
- **B.** Chiedendo a Claude, nel corpo della skill, di eseguire `gh pr diff` come secondo passo.
- **C.** Inserendo il diff in `CLAUDE.md`.
- **D.** Impostando `user-invocable: false`.

### Domanda 9

Una skill con i passi “1. Analizza, 2. Verifica, 3. Riepiloga” viene invocata all’inizio della sessione. Dieci turni dopo, Claude sembra aver dimenticato il passo 2. Qual è la causa più probabile e la correzione?

- **A.** La finestra di contesto del modello è troppo piccola: va usato un modello più grande.
- **B.** Il file `SKILL.md` viene riletto solo al primo avvio: va spostato in `CLAUDE.md`.
- **C.** Il corpo della skill entra nella conversazione una volta sola e non viene riletto: le istruzioni permanenti vanno scritte come regole, non come passaggi da eseguire una volta.
- **D.** `context: fork` cancella le istruzioni dopo il primo turno.

### Domanda 10

Un team deve capire l’architettura di una codebase di 40 file senza riempire il contesto della conversazione principale con i contenuti grezzi dei file. Quale soluzione è più adatta?

- **A.** Modalità plan nella sessione principale.
- **B.** Modalità `bypassPermissions` per leggere tutto più velocemente.
- **C.** Un subagente con l’intera cronologia della conversazione principale.
- **D.** Il subagente integrato `Explore`, che restituisce un riepilogo conciso.

### Domanda 11

Un subagente personalizzato ha `permissionMode: plan` nel frontmatter. La sessione genitore è avviata con `bypassPermissions`. Cosa succede?

- **A.** Il subagente usa la modalità plan come scritto nel frontmatter.
- **B.** Il subagente eredita `bypassPermissions` dal genitore e non può cambiarla.
- **C.** Il subagente chiede conferma per ogni strumento che usa.
- **D.** La configurazione è invalida e il subagente non parte.

### Domanda 12

Un team deve eseguire due attività con Claude: un controllo bloccante prima del merge di una PR, che lo sviluppatore attende, e un report sul debito tecnico generato di notte e letto al mattino. Il manager propone di usare il Batch API per risparmiare il 50%. Qual è la scelta corretta?

- **A.** Entrambe le attività sul Batch API.
- **B.** Entrambe le attività in modalità sincrona.
- **C.** Il controllo pre-merge in modalità sincrona, il report notturno sul Batch API.
- **D.** Il controllo pre-merge sul Batch API con polling, il report notturno in modalità sincrona.

### Domanda 13

Una sessione Claude Code ha appena scritto una funzionalità. Lo stesso team chiede alla stessa sessione di revisionarla. Qual è il problema e la soluzione?

- **A.** Nessun problema: la stessa sessione è più veloce e ha più contesto.
- **B.** La sessione che ha scritto il codice conserva il ragionamento e tende a metterlo meno in discussione: serve una sessione di revisione indipendente.
- **C.** Il flag `--bare` sostituisce la revisione con una verifica automatica.
- **D.** La revisione va affidata al subagente `Plan`, che è l’unico a non modificare il codice.

### Domanda 14

Un team vuole condividere tramite il repository un server MCP che richiede un token personale. Il token non deve finire nel controllo di versione. Qual è la configurazione corretta?

- **A.** Scrivere il token direttamente in `.mcp.json` e aggiungere `.mcp.json` al `.gitignore`.
- **B.** Committare `.mcp.json` con un riferimento a una variabile d’ambiente, ad esempio `${API_TOKEN}`, che ogni sviluppatore imposta localmente.
- **C.** Inserire il token in `CLAUDE.md`, così Claude lo legge all’avvio.
- **D.** Salvare il token in una regola in `.claude/rules/` con `paths: ["**"]`.

### Domanda 15

Un repository ha un `CLAUDE.md` di progetto e tre regole in `.claude/rules/` con `paths` rispettivamente `src/**`, `**/*.ts` e `src/api/**`. Claude modifica `src/api/users.ts`. Quali istruzioni sono attive?

- **A.** Solo la regola più specifica, `src/api/**`.
- **B.** Solo il `CLAUDE.md` di progetto, perché le regole vanno importate esplicitamente.
- **C.** Il `CLAUDE.md` di progetto e tutte e tre le regole, perché i loro pattern corrispondono al file.
- **D.** Il `CLAUDE.md` di progetto e la prima regola in ordine alfabetico che corrisponde al file.

---

## Risposte

- **1. B.** Le regole in `.claude/rules/` con `paths` si applicano per pattern di file, ovunque si trovino: un solo file da mantenere.
- **2. B.** `-p` / `--print` esegue Claude Code in modalità non interattiva, adatta alla CI.
- **3. B.** Per modifiche ampie con più approcci validi, la modalità plan permette di esplorare e far approvare il piano prima di toccare il codice.
- **4. C.** `~/.claude/CLAUDE.md` è il livello utente: vale in tutti i progetti e non viene condiviso.
- **5. A.** L’import `@AGENTS.md` evita la duplicazione; le regole specifiche per Claude si aggiungono sotto.
- **6. B.** `claudeMdExcludes` esclude i `CLAUDE.md` non pertinenti senza toccare il lavoro dell’altro team.
- **7. B.** `disable-model-invocation: true` impedisce a Claude di attivare la skill da solo; resta invocabile dall’utente.
- **8. A.** L’iniezione dinamica ``!`comando` `` viene eseguita al momento dell’invocazione e il suo output entra nella skill prima che Claude la legga.
- **9. C.** Il corpo della skill entra nel contesto una volta sola: ciò che deve valere sempre va scritto come regola permanente.
- **10. D.** `Explore` legge i file nel proprio contesto e restituisce solo un riepilogo, senza riempire la conversazione principale.
- **11. B.** I permessi scendono dal genitore: con `bypassPermissions` il subagente non può impostare una modalità diversa.
- **12. C.** Il Batch API conviene solo quando nessuno attende il risultato: sì per il report notturno, no per il controllo bloccante.
- **13. B.** Chi ha scritto il codice tende a confermare il proprio ragionamento: la revisione va fatta da una sessione indipendente.
- **14. B.** Il file condiviso contiene solo il riferimento `${API_TOKEN}`; il valore resta nell’ambiente di ciascuno.
- **15. C.** Tutte le regole il cui pattern corrisponde al file si attivano insieme al `CLAUDE.md` di progetto: non vince solo la più specifica.
