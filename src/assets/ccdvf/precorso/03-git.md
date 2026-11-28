# PC3 · Git e flusso di lavoro

## Perché serve all'esame

Per la certificazione Git non è un argomento a sé: è il **terreno comune** su cui poggiano prompt, configurazioni, revisioni del codice e pipeline. Le domande lo danno per scontato e verificano che tu sappia che cosa va versionato, che cosa non va mai versionato e come si rimedia a un errore.

| Dove compare | Cosa chiede l'esame | Dominio |
| --- | --- | --- |
| Prompt, schemi, `CLAUDE.md`, `.mcp.json`, dataset delle eval nel repository | Versionare come il codice, con revisione | [D2](./studio.html?doc=domain-2) |
| Pipeline CI e Claude Code in modalità headless | Integrare Claude nel ciclo di sviluppo | [D2](./studio.html?doc=domain-2), [D3](./studio.html?doc=domain-3) |
| Chiave API finita in un commit | Revocare e sostituire, non solo cancellare | [D7](./studio.html?doc=domain-7) |
| File di configurazione condivisi con il team | Distinguere ciò che si condivide da ciò che resta locale | [D3](./studio.html?doc=domain-3) |
| Valutazioni di regressione tra versioni di prompt o modello | Confrontare versioni, tornare indietro | [D4](./studio.html?doc=domain-4), [D5](./studio.html?doc=domain-5) |

---

## 1. Il modello mentale

Git registra **istantanee** del progetto, chiamate commit, e le collega in una storia. Un file passa per tre aree:

| Area | Che cos'è | Comando |
| --- | --- | --- |
| Directory di lavoro | I file come li stai modificando | (modifichi i file) |
| Area di staging | Le modifiche scelte per il prossimo commit | `git add` |
| Repository | La storia dei commit | `git commit` |

```bash
git status                 # che cosa è cambiato
git add src/agente.ts      # prepara un file per il commit
git commit -m "feat: aggiunge il ciclo dell'agente"
git log --oneline          # la storia, in breve
git diff                   # che cosa cambia rispetto all'ultimo commit
```

## 2. Rami, unioni e pull request

Un **ramo** è una linea di sviluppo parallela. Si lavora su un ramo, si apre una **pull request** (richiesta di unione) e il team la rivede prima di unirla al ramo principale.

```bash
git switch -c feat/streaming      # crea e passa al nuovo ramo
git push -u origin feat/streaming # pubblica il ramo
# ... apri la pull request, ottieni la revisione, unisci ...
git switch main && git pull       # aggiorna il ramo principale
```

- La **revisione del codice** vale anche quando il codice lo ha scritto Claude: è il controllo umano che l'esame si aspetta.
- `merge` unisce due rami conservando la storia; `rebase` riscrive i propri commit sopra un altro ramo. **Non si riscrive mai la storia già condivisa.**
- Un messaggio di commit chiaro (per esempio nello stile *Conventional Commits*: `feat:`, `fix:`, `docs:`) rende la storia leggibile e facilita le revisioni.

## 3. Tornare indietro senza danni

| Situazione | Comando | Nota |
| --- | --- | --- |
| Annullare un commit **già condiviso** | `git revert <commit>` | Crea un nuovo commit che lo inverte: la storia resta intatta |
| Scartare modifiche non committate di un file | `git restore <file>` | Operazione che non si può annullare |
| Mettere da parte il lavoro a metà | `git stash` | Poi `git stash pop` |
| Spostare i propri commit **locali** | `git reset` | Solo su commit non pubblicati |

Per l'esame basta la regola: **su ciò che è già condiviso si usa `revert`, non `reset`**.

## 4. Che cosa non va mai nel repository

Il file `.gitignore` elenca ciò che Git deve ignorare.

```gitignore
.env
node_modules/
dist/
*.log
```

- **Segreti**: `.env`, chiavi, token, certificati.
- **Dipendenze e risultati di build**: `node_modules/`, `dist/`.
- **Impostazioni personali**: in Claude Code esistono file di impostazioni condivisi con il team e file **locali**, che restano fuori dal repository (vedi il [dominio 3](./studio.html?doc=domain-3)).

> **Una chiave API è finita in un commit?** Cancellare il file e fare un nuovo commit **non basta**: la chiave resta nella storia e in ogni copia del repository. La risposta corretta è **revocare la chiave**, crearne una nuova e poi, se serve, ripulire la storia. Vedi il [dominio 7](./studio.html?doc=domain-7).

## 5. Che cosa si versiona per un progetto con Claude

- Il codice dell'applicazione e dei server MCP.
- I **prompt** e le istruzioni di sistema, versionati come il codice, così si può confrontare una versione con l'altra e tornare indietro ([dominio 2](./studio.html?doc=domain-2)).
- Gli **schemi** degli strumenti e le definizioni degli agenti.
- I file di configurazione condivisi: `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`.
- I **dataset di valutazione** (golden set) e i test di regressione ([dominio 4](./studio.html?doc=domain-4)).
- Il file `package-lock.json` ([PC2](./studio.html?doc=pc-node)).

## 6. Integrazione continua

Una pipeline di **integrazione continua** (CI) esegue controlli a ogni modifica: test, analisi del codice, eventualmente una revisione con Claude Code in modalità non interattiva. Per l'esame contano tre idee:

1. i controlli si eseguono **in modo automatico e ripetibile** a ogni pull request;
2. le chiavi della pipeline stanno nei **segreti** del servizio di CI, non nel repository;
3. con Claude Code in CI si usa la modalità headless con strumenti pre-approvati e un output leggibile da un programma (vedi il [dominio 3](./studio.html?doc=domain-3)).

---

## Mini-laboratorio (30–45 minuti)

1. Crea un repository di prova, aggiungi un file `.env` finto e verifica con `git status` che, dopo averlo messo nel `.gitignore`, non compaia più.
2. Crea un ramo, fai due commit con messaggi chiari e osserva la storia con `git log --oneline`.
3. Su un commit di prova usa `git revert` e osserva che la storia **non** viene riscritta.
4. Scrivi in tre righe che cosa faresti se la chiave API fosse finita nel secondo commit.

## Controlla di saper

- spiegare directory di lavoro, staging e repository;
- creare un ramo, aprire una pull request e dire perché serve la revisione;
- scegliere tra `revert` e `reset`;
- elencare che cosa non si versiona mai e come si risponde a una chiave esposta.

## Dove studiare

- [Pro Git in italiano](https://git-scm.com/book/it/v2): il libro ufficiale e gratuito, con traduzione parziale (alcuni capitoli compaiono ancora in inglese). Parti dal capitolo 1, poi dal 2 (basi) e dal 3 (rami).
- [Git: Learn](https://git-scm.com/learn): libro, video e riepilogo dei comandi nella versione originale.
- Elenco completo in [Dove studiare](./studio.html?doc=pc-risorse).
