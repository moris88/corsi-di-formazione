# Dominio 2 · Collaborare con i repository GitHub

**Peso: 10-15%.**

**In questa pagina**: file chiave · cartella `.github` · creare e organizzare · gestire file · rami predefiniti e protetti · release e tag · visibilità e insights · buone pratiche · trappole d'esame.

---

## 1. Struttura e file chiave di un repository

Un **repository** contiene i file del progetto, la loro cronologia e le impostazioni di collaborazione. La pagina principale mostra l'elenco dei file e, sotto, il `README` renderizzato.

| File | A cosa serve |
| --- | --- |
| `README` | Presenta il progetto: cos'è, come si installa, come si usa. È la prima cosa che si vede. |
| `LICENSE` | Dice a chi riceve il codice cosa può farne. Senza licenza, per impostazione predefinita nessuno ha il permesso di riusarlo. |
| `CONTRIBUTING` | Spiega come contribuire: regole, flusso, standard di codice. GitHub lo segnala a chi apre un'issue o una pull request. |
| `CODEOWNERS` | Associa percorsi a persone o team: vengono richiesti automaticamente come revisori delle pull request che li toccano. |
| `SECURITY` | Spiega come segnalare in modo responsabile una vulnerabilità e quali versioni sono supportate. |
| `CODE_OF_CONDUCT` | Regole di comportamento della community. |
| `.gitignore` | File e cartelle che Git non deve tracciare. |
| `SUPPORT` | Dove chiedere aiuto. |
| `FUNDING.yml` | Abilita il pulsante **Sponsor** del repository. |

Questi file possono stare nella **radice**, nella cartella **`docs/`** o in **`.github/`**. Il `README` e il `LICENSE` si riconoscono anche con estensioni diverse (`README.md`, `LICENSE.txt`).

### Gli standard della community

La scheda **Insights → Community Standards** (standard della community) mostra una lista di controllo: descrizione, README, codice di condotta, licenza, `CONTRIBUTING`, modelli di issue e di pull request. Serve a vedere cosa manca per rendere il repository accogliente.

### La cartella `.github`

Contiene configurazioni specifiche di GitHub.

```text
.github/
├── workflows/                 # workflow di GitHub Actions (YAML)
├── ISSUE_TEMPLATE/            # modelli di issue
├── pull_request_template.md   # modello di pull request
├── CODEOWNERS
├── dependabot.yml             # configurazione degli aggiornamenti
├── FUNDING.yml
└── SECURITY.md
```

### Il file `README`

Un buon README risponde a: *che cos'è*, *a cosa serve*, *come si installa*, *come si usa*, *come si contribuisce*, *quale licenza ha*. GitHub genera un **indice automatico** dai titoli e mostra il README del repository `nome-utente/nome-utente` come presentazione del profilo.

---

## 2. Creare, organizzare e gestire repository

### Creare un repository

Si può partire da zero (con eventuale README, `.gitignore` e licenza), da un **modello**, da un **fork** o importando un progetto esistente. Un repository ha un **nome**, una **descrizione**, una **visibilità** e un proprietario (persona o organizzazione).

### Repository modello (template)

Un repository segnato come **template** permette di crearne altri con la **stessa struttura di file e cartelle**.

| | Template | Fork |
| --- | --- | --- |
| Cronologia dei commit | **Non** viene copiata: parte da zero | Viene copiata |
| Legame con l'originale | Nessuno | Resta il legame (si possono proporre modifiche) |
| Uso tipico | Partire da una struttura standard | Contribuire a un altro progetto |

### Fork, clone, branch: tre cose diverse

- **Clone**: copia **locale** sul tuo computer di un repository.
- **Fork**: copia **su GitHub**, nel tuo account, di un repository di un altro utente, con legame all'originale.
- **Branch**: linea di sviluppo **dentro** lo stesso repository.

### Altre gestioni

- **Rinominare** o **trasferire** un repository; GitHub reindirizza i vecchi indirizzi.
- **Archiviare** un repository che non si mantiene più: diventa di sola lettura.
- **Eliminare**: solo chi ha ruolo admin.
- **Topic**: parole chiave per farsi trovare nelle ricerche.

---

## 3. Aggiungere e gestire file

Tre vie principali:

1. **Interfaccia web**: *Add file* → *Create new file* oppure *Upload files*, poi si fa il commit direttamente sul ramo o su un nuovo ramo con pull request.
2. **GitHub Desktop** o editor locale.
3. **Riga di comando**: `git add`, `git commit`, `git push`.

Ogni modifica a un file — creare, rinominare, spostare, eliminare — **è un commit** e resta nella cronologia. Per ogni file si possono consultare **cronologia** (*History*), **blame** (chi ha scritto ciascuna riga), **permalink** a una riga precisa e le differenze tra versioni.

> **File grandi.** Git non è adatto a file molto grandi o binari che cambiano spesso. Per questi si usa **Git LFS** (*Large File Storage*), che tiene nel repository solo dei puntatori e archivia i file veri altrove.

---

## 4. Rami predefiniti, protetti e di lavoro

- Il **ramo predefinito** (*default branch*) è quello che si vede aprendo il repository e verso cui puntano di norma le pull request. Di solito è `main`. Si può cambiare nelle impostazioni.
- Un **ramo protetto** ha regole che impediscono, per esempio, il push diretto o l'eliminazione (vedi [Dominio 6](./studio.html?doc=domain-6)).
- I rami di lavoro si nominano in modo descrittivo: `feature/login`, `fix/crash-avvio`, `docs/readme`.

---

## 5. Tag e release

- Un **tag** etichetta in modo permanente un commit, di solito per segnare una versione (`v1.4.0`).
- Una **release** è la pubblicazione di una versione su GitHub: parte da un tag e aggiunge **note di rilascio** (anche generate automaticamente) e **file allegati** da scaricare. Una release si può contrassegnare come *pre-release*.
- Le versioni seguono spesso il [versionamento semantico](./studio.html?doc=pc-software).

**GitHub Packages** è invece il servizio per ospitare **pacchetti** (librerie, immagini di container) accanto al codice.

---

## 6. Visibilità, stelle e informazioni dettagliate

### Visibilità

| Tipo | Chi lo vede |
| --- | --- |
| **Pubblico** | Chiunque su internet |
| **Privato** | Solo chi ha ricevuto l'accesso |
| **Interno** | I membri dell'enterprise (solo con GitHub Enterprise) |

### Per farsi scoprire

- **Stelle (stars)**: segnalibro pubblico e segnale di apprezzamento. Aiutano a ritrovare un progetto e a farlo emergere nelle classifiche.
- **Watch**: segui le notifiche del repository.
- **Fork**: quante copie sono state fatte.
- **Topic** e descrizione: aiutano la ricerca.
- **Anteprima delle funzionalità** (*feature preview*): dal tuo profilo puoi provare nuove funzioni prima del rilascio generale.

### Insights

La scheda **Insights** del repository raccoglie:

| Sezione | Cosa mostra |
| --- | --- |
| **Pulse** | Riepilogo dell'attività recente (pull request, issue, commit) |
| **Contributors** | Chi contribuisce e quanto |
| **Traffic** | Visite, cloni e provenienza (richiede accesso in scrittura) |
| **Commits** | Frequenza dei commit |
| **Code frequency** | Righe aggiunte e rimosse nel tempo |
| **Dependency graph** | Da cosa dipende il progetto e chi dipende da esso |
| **Network** | Grafico dei rami e dei fork |
| **Forks** | Elenco dei fork |
| **Community Standards** | Lista di controllo del repository |

### Grafo delle dipendenze

Il **dependency graph** riassume i pacchetti da cui dipende il progetto (letti da file come `package.json`) e quelli che dipendono da esso. Da qui nascono gli avvisi di Dependabot sulle vulnerabilità ([Dominio 6](./studio.html?doc=domain-6)).

---

## 7. Buone pratiche di manutenzione e collaborazione

- **README** chiaro e aggiornato; **licenza** esplicita; `CONTRIBUTING` e codice di condotta.
- **Modelli** di issue e di pull request, per ottenere informazioni complete.
- **Pull request piccole** e rami di breve durata: più facili da rivedere.
- **Protezione del ramo principale** e revisione obbligatoria.
- **CODEOWNERS** per coinvolgere le persone giuste.
- **Etichette** come `good first issue` e `help wanted` per chi vuole iniziare.
- **Release** con note chiare, **versionamento semantico**.
- **Dependabot** attivo; nessun segreto nel codice.
- **Archiviare** ciò che non è più mantenuto, dichiarandolo nel README.

---

## Trappole d'esame

- **Template ≠ fork**: il template non porta la cronologia e non mantiene il legame.
- **Clone ≠ fork**: il clone è locale; il fork è un repository separato su GitHub.
- **Senza licenza non c'è permesso di riuso**.
- **`CODEOWNERS`** richiede automaticamente la revisione, non assegna il lavoro.
- **Interno** esiste solo con GitHub Enterprise.
- **Tag ≠ release**: la release si costruisce sopra un tag.
- **Traffic** richiede accesso in scrittura.

## Punti da ricordare

- README, LICENSE, CONTRIBUTING, CODEOWNERS, SECURITY: sapere cosa fa ciascuno.
- Insights, stelle, dependency graph e Community Standards migliorano la visibilità e la salute del progetto.
- Ogni modifica a un file è un commit.

## Documentazione ufficiale

- [Informazioni sui README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [Creare un repository da un modello](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)
- [Informazioni sui CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Informazioni sulle release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Informazioni sul grafo delle dipendenze](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph)
- [Standard della community](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories)
