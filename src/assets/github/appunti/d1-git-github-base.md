# Dominio 1 · Informazioni di base su Git e GitHub

**Peso: 25-30%.** È il dominio più pesante: studialo per primo. Se i termini tecnici ti sono nuovi, leggi prima il [pre-corso](./studio.html?doc=precorso).

**In questa pagina**: controllo della versione · come funziona Git · rami e merge · GitHub · account e piani · GitHub Flow · Markdown · GitHub Desktop e Mobile · trappole d'esame.

---

## 1. Nozioni fondamentali sul controllo della versione

Il **controllo della versione** registra i cambiamenti a un insieme di file nel tempo. Permette di:

- tornare a una versione precedente;
- capire **chi** ha cambiato **cosa**, **quando** e **perché**;
- lavorare in più persone sugli stessi file senza sovrascriversi;
- sperimentare in sicurezza su una copia (un ramo) e unire il lavoro solo se funziona.

### Tre modelli

| Modello | Come funziona | Esempio |
| --- | --- | --- |
| **Locale** | Le versioni stanno in un solo computer | Copie `file_v2_finale.doc` |
| **Centralizzato** | Un server unico custodisce la cronologia; senza server non si lavora | Subversion |
| **Distribuito** | Ogni persona ha una copia **completa** della cronologia | **Git** |

Con un sistema distribuito si lavora anche offline: commit, rami e cronologia sono locali; la rete serve solo per sincronizzare.

### Git e GitHub non sono la stessa cosa

| | Git | GitHub |
| --- | --- | --- |
| Cos'è | Sistema di controllo della versione distribuito, open source | Piattaforma che ospita repository Git e aggiunge strumenti di collaborazione |
| Dove gira | Sul tuo computer | Nel cloud (e, per le aziende, anche su server propri) |
| Fornisce | commit, rami, merge, cronologia | pull request, issue, Actions, Pages, controllo degli accessi, Copilot |
| Serve internet? | Quasi mai | Sì |

Esistono alternative a GitHub che ospitano repository Git (GitLab, Bitbucket): Git è lo stesso, cambiano le funzioni attorno. E si può usare Git senza alcun servizio online.

---

## 2. Come funziona Git

### I tre stati di un file

```text
Directory di lavoro  --git add-->  Area di staging  --git commit-->  Repository
 (le tue modifiche)               (modifiche scelte)               (cronologia)
```

1. **Directory di lavoro**: i file come li vedi e li modifichi.
2. **Area di staging** (*index*): le modifiche che hai scelto di includere nel prossimo commit.
3. **Repository** (cartella `.git`): la cronologia dei commit salvati.

Lo staging serve a costruire commit **coerenti**: puoi modificare dieci file e committarne solo tre, che riguardano la stessa cosa.

### Il commit

Un **commit** è un'istantanea dei file in un momento. Contiene:

- un identificativo univoco (**hash**, es. `a1b2c3d`);
- autore e data;
- un **messaggio** che spiega *perché* si è fatto il cambiamento;
- un riferimento al commit precedente (il **genitore**).

I commit formano una catena: la cronologia. Un commit **non si modifica**: per correggerlo se ne crea un altro.

Un buon messaggio è breve nella prima riga e dice cosa cambia: `Correggi il calcolo dell'IVA nel carrello`.

### Comandi essenziali

```bash
git init                     # crea un nuovo repository nella cartella corrente
git clone <url>              # copia un repository remoto
git status                   # mostra lo stato dei file
git add <file>               # sposta le modifiche nello staging
git commit -m "messaggio"    # salva lo staging come commit
git log                      # mostra la cronologia
git diff                     # mostra le modifiche non ancora in staging
git switch -c nuovo-ramo     # crea un ramo e ci passa
git switch main              # torna al ramo main
git merge altro-ramo         # unisce altro-ramo nel ramo corrente
git fetch                    # scarica novità dal remoto senza integrarle
git pull                     # fetch + integrazione
git push                     # invia i commit locali al remoto
```

> **Trappola frequente.** `git pull` = `git fetch` + integrazione. `git fetch` scarica soltanto: non tocca i tuoi file.

### Remoti

Un **remote** è una copia del repository ospitata altrove. Quello da cui cloni si chiama di solito **`origin`**. Con `push` invii i tuoi commit, con `pull` ricevi quelli degli altri. Un repository può avere più remoti: in un fork, per esempio, `origin` è la tua copia e `upstream` è il progetto originale.

### `.gitignore`

File di testo che elenca ciò che Git **non** deve tracciare: file temporanei, dipendenze scaricate, segreti, file di configurazione locale.

```gitignore
node_modules/
*.log
.env
```

Un file già tracciato non viene dimenticato aggiungendolo a `.gitignore`: va prima rimosso dal tracciamento.

---

## 3. Rami e merge

Un **ramo** (*branch*) è una linea di sviluppo indipendente: un puntatore mobile a un commit. Creare un ramo costa quasi nulla.

- Il ramo principale si chiama di solito **`main`** (in passato `master`).
- **`HEAD`** indica dove ti trovi ora: il ramo e il commit su cui stai lavorando.
- Ogni cambiamento nasce in un ramo dedicato (*feature branch*), poi si **unisce** al ramo principale.

### Il merge

**Merge** unisce la storia di due rami. Ci sono due casi:

- **Fast-forward**: il ramo principale non è cambiato nel frattempo, quindi Git sposta semplicemente il puntatore in avanti.
- **Merge commit**: entrambi i rami sono andati avanti; Git crea un commit speciale con due genitori.

### I conflitti

Un **conflitto** nasce quando due rami hanno modificato la **stessa parte dello stesso file** in modo diverso. Git non sceglie: ti segna le due versioni nel file e aspetta che tu decida.

```text
<<<<<<< HEAD
versione del ramo corrente
=======
versione dell'altro ramo
>>>>>>> altro-ramo
```

Si risolve modificando il file, togliendo i segni e facendo un commit. Su GitHub, i conflitti semplici si risolvono dall'editor web della pull request.

### Altre operazioni da riconoscere

| Operazione | Che cosa fa |
| --- | --- |
| **Tag** | Etichetta un commit (tipicamente una versione: `v1.2.0`) |
| **Cherry-pick** | Copia un singolo commit su un altro ramo |
| **Rebase** | Riapplica i commit su un'altra base, ottenendo una storia lineare |
| **Revert** | Crea un nuovo commit che annulla l'effetto di uno precedente |
| **Reset** | Sposta il ramo a un commit precedente (riscrive la storia locale) |
| **Stash** | Mette da parte temporaneamente le modifiche non committate |

`revert` è la scelta sicura per annullare qualcosa di già condiviso, perché non riscrive la cronologia.

---

## 4. Uso di GitHub

### Account, organizzazioni, enterprise

- **Account personale**: la tua identità. Può possedere repository e appartenere a organizzazioni.
- **Organizzazione**: spazio condiviso per un team o un'azienda, con membri, team, ruoli e politiche comuni. Possiede i repository, non le singole persone.
- **Enterprise**: livello superiore che raggruppa più organizzazioni, con fatturazione, identità e politiche centrali.

### Piani

| Piano | Per chi |
| --- | --- |
| **GitHub Free** | Persone e organizzazioni: repository pubblici e privati illimitati con funzioni di base |
| **GitHub Pro** | Singoli sviluppatori che vogliono funzioni avanzate su repository privati |
| **GitHub Team** | Organizzazioni che hanno bisogno di collaborazione avanzata e controlli sui repository privati |
| **GitHub Enterprise** | Grandi aziende: sicurezza, conformità, identità e amministrazione centralizzate |

Enterprise è disponibile in due forme: **Enterprise Cloud** (ospitato da GitHub) ed **Enterprise Server** (installato sui server dell'azienda). Alcune funzioni, come Copilot, non sono disponibili su Enterprise Server. Per le differenze di dettaglio fa fede la [pagina dei piani](https://github.com/pricing).

### Il profilo

Il profilo mostra repository, contributi e organizzazioni. Con un repository speciale con lo **stesso nome del tuo utente** e un `README.md` puoi personalizzare la pagina del profilo.

### Collegarsi a GitHub dal computer

Un repository si può clonare con **HTTPS** (con un token di accesso) o con **SSH** (con una chiave); la password non è più accettata per le operazioni Git. Dettagli nel [Dominio 6](./studio.html?doc=domain-6).

---

## 5. GitHub Flow

Flusso leggero, adatto al rilascio continuo. Si basa su **un solo ramo duraturo** (`main`, sempre pronto per il rilascio) e rami brevi per ogni cambiamento.

1. **Crea un ramo** da `main`, con un nome che descrive il lavoro.
2. **Fai commit** con le modifiche, in piccoli passi.
3. **Apri una pull request**, anche prima di aver finito, per far vedere il lavoro e raccogliere opinioni.
4. **Fai rivedere**: i colleghi commentano e approvano; i controlli automatici verificano il codice.
5. **Unisci** (merge) in `main`.
6. **Elimina il ramo**, ormai inutile; la storia resta nei commit.

Caratteristiche chiave: `main` è sempre distribuibile, i rami sono brevi, la revisione avviene nella pull request.

> **Trappola frequente.** Non confondere GitHub Flow con *Git Flow*, un modello più pesante con rami di lunga durata (`develop`, `release`, `hotfix`). L'esame parla di GitHub Flow.

---

## 6. Markdown per comunicare

Il Markdown è il linguaggio di formattazione di README, issue, pull request, discussioni, commenti e Wiki. Sintassi completa nel [pre-corso](./studio.html?doc=pc-formati). Funzioni specifiche di GitHub:

| Sintassi | Effetto |
| --- | --- |
| `@utente` o `@organizzazione/team` | Menziona e notifica una persona o un team |
| `#123` | Collega l'issue o la pull request 123 |
| `- [ ]` / `- [x]` | Lista di attività con caselle |
| Blocco `suggestion` | In una revisione, propone una modifica applicabile con un clic |
| Emoji `:+1:` | Inserisce un'emoji |
| Diagrammi Mermaid in un blocco di codice | Disegna diagrammi nei documenti |

Nel testo di un commit o di una pull request, `Closes #12`, `Fixes #12` o `Resolves #12` chiudono l'issue al merge.

---

## 7. GitHub Desktop e GitHub Mobile

| Strumento | Per cosa | Quando sceglierlo |
| --- | --- | --- |
| **Interfaccia web** | Modifiche rapide, revisione, gestione di issue e progetti | Piccole correzioni, lavoro di sola lettura |
| **GitHub Desktop** | Clone, commit, rami, push e pull con un'interfaccia grafica | Chi preferisce evitare il terminale |
| **GitHub CLI (`gh`)** | Funzioni di GitHub dal terminale (pull request, issue, Actions) | Chi lavora da riga di comando |
| **GitHub Mobile** | Notifiche, revisione di pull request, risposte a issue | Quando non sei al computer; non per sviluppare |
| **Editor / IDE con estensione** | Sviluppo vero e proprio | Lavoro quotidiano |

---

## Trappole d'esame

- **Git ≠ GitHub**: Git è locale; GitHub è la piattaforma.
- **Fetch ≠ pull**.
- **Staging**: `git add` non salva nella cronologia; lo fa `git commit`.
- **Revert** annulla senza riscrivere la storia; **reset** la riscrive.
- **Fork ≠ clone**: il clone è una copia locale; il fork è una copia sul tuo account GitHub.
- **GitHub Flow** ha un solo ramo duraturo.

## Punti da ricordare

- Git è distribuito: ogni copia ha tutta la cronologia.
- Commit → istantanea con messaggio; ramo → linea di sviluppo; merge → unione.
- Il flusso tipico: ramo → commit → pull request → revisione → merge → elimina il ramo.
- Account personale, organizzazione, enterprise: tre livelli.

## Documentazione ufficiale

- [Informazioni su Git](https://docs.github.com/en/get-started/using-git/about-git)
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Tipi di account GitHub](https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts)
- [Piani di GitHub](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)
- [Sintassi di scrittura e formattazione](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- [GitHub Desktop](https://docs.github.com/en/desktop) · [GitHub Mobile](https://docs.github.com/en/get-started/using-github/github-mobile)
