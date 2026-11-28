# Dominio 4 · Applicare procedure di sviluppo moderne

**Peso: 10-15%.** Automazione e intelligenza artificiale: Actions, Copilot, Codespaces e github.dev. Se CI/CD, YAML, container o LLM sono concetti nuovi, leggi prima i moduli [PC2](./studio.html?doc=pc-software), [PC3](./studio.html?doc=pc-formati), [PC4](./studio.html?doc=pc-web-cloud) e [PC6](./studio.html?doc=pc-team-ia).

**In questa pagina**: GitHub Actions · GitHub Copilot · piani di Copilot · Codespaces · github.dev · trappole d'esame.

---

## 1. GitHub Actions

**GitHub Actions** è la piattaforma di **integrazione e consegna continue (CI/CD)** di GitHub: automatizza build, test e distribuzione, e anche attività del repository, come assegnare un'etichetta a ogni nuova issue o rispondere a un primo contributo.

### Le componenti

| Componente | Cos'è |
| --- | --- |
| **Workflow** | Processo automatico configurabile, definito in un file **YAML** in `.github/workflows/`. Un repository può averne molti. |
| **Evento** (*event*) | Attività che avvia un workflow: una pull request, un push, un'issue aperta, un orario pianificato, una chiamata REST o l'avvio manuale. |
| **Job** | Insieme di **passaggi** (*steps*) eseguiti sullo **stesso runner**. Per impostazione predefinita i job non dipendono l'uno dall'altro e girano **in parallelo**; con una dipendenza (`needs`) uno attende l'altro. |
| **Step** | Un singolo comando da eseguire oppure una action da usare. |
| **Action** | Blocco riutilizzabile che svolge un compito dentro un job. Si trovano nel **Marketplace** o si scrivono in proprio. |
| **Runner** | Il server che esegue i job, **uno alla volta**. Può essere **ospitato da GitHub** (Ubuntu Linux, Windows, macOS) oppure **self-hosted**. |

Ogni job eseguito su un runner ospitato da GitHub parte in una **macchina virtuale nuova**.

### Un workflow commentato

```yaml
name: ci                           # nome mostrato nella scheda Actions
on:                                # eventi che lo avviano
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:               # avvio manuale
jobs:
  test:
    runs-on: ubuntu-latest         # runner
    steps:
      - uses: actions/checkout@v4  # scarica il codice
      - run: npm ci                # installa le dipendenze
      - run: npm test              # esegue i test
  deploy:
    needs: test                    # parte solo dopo "test"
    runs-on: ubuntu-latest
    steps:
      - run: echo "distribuzione"
```

### Concetti da conoscere

| Concetto | In breve |
| --- | --- |
| **Matrice** (`strategy.matrix`) | Esegue lo stesso job con più combinazioni (sistemi operativi, versioni) |
| **Secrets** | Valori sensibili cifrati (token, chiavi), usati nei workflow come `${{ secrets.NOME }}` e mascherati nei log |
| **Variabili** | Valori non sensibili riusabili |
| **Artefatti** | File prodotti da un job (risultati dei test, pacchetti), conservati e scaricabili |
| **Cache** | Riuso di dipendenze tra esecuzioni per velocizzare |
| **Ambienti** (*environments*) | Destinazioni come *staging* e *produzione*, con regole come l'approvazione manuale |
| **Workflow riutilizzabili** | Un workflow richiamato da altri |
| **`GITHUB_TOKEN`** | Token temporaneo creato per ogni esecuzione, con permessi limitati al repository |
| **Badge di stato** | Immagine che mostra se l'ultimo workflow è riuscito |

I workflow di un repository si vedono nella scheda **Actions**, dove si consultano anche i **log** di ogni esecuzione, si **rilanciano** e si **annullano**.

> **Costi.** I minuti dei runner ospitati sono inclusi in una quota che dipende dal piano; i repository pubblici hanno condizioni di favore. Ricordare solo che l'uso ha una quota e può costare.

> **Trappola frequente.** L'esame chiede la differenza tra *workflow*, *job*, *step*, *action* e *runner*: un workflow contiene job; un job contiene step; uno step esegue un comando o un'action; il job gira su un runner.

---

## 2. GitHub Copilot

**GitHub Copilot** è l'assistente di programmazione basato sull'IA: propone codice, risponde a domande e, con gli agenti, porta a termine compiti. Per i concetti di base su modelli e prompt vedi [PC6](./studio.html?doc=pc-team-ia).

### Funzioni

| Funzione | Cosa fa |
| --- | --- |
| **Suggerimenti in linea** (code completion) | Propone codice mentre scrivi, anche intere funzioni; segue i commenti |
| **Prossimi suggerimenti di modifica** | Prevede dove farai la prossima modifica |
| **Copilot Chat** | Conversazione nell'editor, su github.com e su GitHub Mobile |
| **Modalità ask** | Risponde a domande sul codice e sulla tecnologia |
| **Modalità agente** (*agent mode*) | Nell'IDE, Copilot compie modifiche autonome e in più passi sul tuo ambiente locale |
| **Copilot coding agent** | Lavora **su GitHub**, in background e in modo indipendente: assegni un'issue, apre una pull request |
| **Revisione del codice con Copilot** | Propone commenti su una pull request |
| **Copilot CLI** | Copilot dal terminale |
| **Supporto multimodello** | Si sceglie il modello in chat, secondo il piano |
| **Istruzioni personalizzate** | Indicazioni persistenti (personali, del repository o dell'organizzazione) |
| **MCP** | Collega Copilot a strumenti e dati esterni |

### Agent mode e coding agent

| | Modalità agente | Copilot coding agent |
| --- | --- | --- |
| Dove | Nell'**IDE** | Su **GitHub** |
| Ambiente | Il tuo ambiente locale | Un ambiente temporaneo gestito da GitHub, basato su Actions |
| Interazione | **Sincrona**: la segui e la correggi mentre lavora | **Asincrona**: lavora in background e apre una pull request |
| Risultato | Modifiche ai file locali | Commit su un ramo e pull request da rivedere |
| Costi | Richieste premium | Minuti di Actions e richieste premium |

> **Trappola frequente.** Non sono la stessa cosa, e l'esame le distingue.

### Esclusione di contenuti e privacy

Con la funzione di **esclusione dei contenuti** (*content exclusion*) amministratori di repository, proprietari di organizzazioni e di enterprise indicano file o percorsi che Copilot deve ignorare, e che quindi non usa come contesto. È disponibile per i piani **Business** ed **Enterprise** e ha dei limiti: non è supportata dalla modalità agente delle IDE né dalla CLI. Copilot può inoltre filtrare i suggerimenti che corrispondono a **codice pubblico**.

### Richieste premium

Alcune funzioni e modelli consumano **richieste premium**, una quota mensile che dipende dal piano; per i piani individuali a pagamento se ne possono acquistare altre.

---

## 3. I piani di Copilot

### Individuali e di organizzazione

| Piano | Per chi | Idea |
| --- | --- | --- |
| **Copilot Free** | Sviluppatori singoli | Funzioni e quote limitate; solo per chi non riceve Copilot da un'organizzazione |
| **Copilot Pro** | Sviluppatori singoli | Funzioni complete, più richieste premium e più modelli |
| **Copilot Pro+** | Sviluppatori singoli con uso intenso | Quota più ampia e accesso alla maggior parte dei modelli |
| **Copilot Business** | **Organizzazioni** (Free o Team) ed enterprise su Cloud | Gestione centralizzata, politiche per i membri, esclusione di contenuti |
| **Copilot Enterprise** | **Enterprise Cloud** | Tutto di Business più funzioni aziendali, come la personalizzazione sul codice dell'organizzazione |

Copilot **non** è disponibile per GitHub Enterprise Server. Gli studenti hanno un piano dedicato.

### Che differenza c'è tra i tre profili

| Aspetto | Singolo | Business | Enterprise |
| --- | --- | --- | --- |
| Gestione utenti e licenze | Personale | Centrale, per organizzazione | Centrale, per enterprise |
| Politiche (funzioni e modelli consentiti) | No | **Sì** | **Sì** |
| Esclusione di contenuti | No | **Sì** | **Sì** |
| Metriche d'uso | No | **Sì** | **Sì** |
| Personalizzazione sulla base di codice dell'organizzazione | No | No | **Sì** |

> **Nota.** I nomi dei piani, i prezzi, le quote e l'elenco dei modelli cambiano spesso. Per l'esame ricorda la **logica** (singoli / organizzazioni / aziende e governo centrale) e consulta la [tabella ufficiale](https://docs.github.com/en/copilot/get-started/plans).

---

## 4. GitHub Codespaces

**Codespaces** è un **ambiente di sviluppo completo nel cloud**, usabile dal browser o da VS Code. Ogni codespace è un **dev container** (un container Docker) su una macchina virtuale.

### Perché serve

Chiunque apra il progetto ottiene lo **stesso ambiente**, già configurato: niente "da me funziona". Si parte in pochi minuti, da qualsiasi computer.

### Configurazione: `devcontainer.json`

- File principale, di solito in **`.devcontainer/devcontainer.json`** (o `.devcontainer.json` nella radice).
- Può puntare a un **Dockerfile** o a un'immagine pronta.
- Definisce **estensioni** dell'editor, **impostazioni**, **variabili d'ambiente**, **porte da inoltrare**, **comandi di avvio** e *Features* (componenti riusabili).
- Senza `devcontainer.json` si usa la **configurazione predefinita**, con molti linguaggi e strumenti.
- Per avere più configurazioni, ognuna sta in una **sottocartella** di `.devcontainer/`; all'avvio si sceglie quale usare. Non si ereditano tra loro.

```json
{
  "name": "Mio progetto",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "customizations": {
    "vscode": { "extensions": ["biomejs.biome"] }
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}
```

### Altri aspetti

| Aspetto | In breve |
| --- | --- |
| **Dotfiles** | Un repository con le tue impostazioni personali, applicate a ogni nuovo codespace |
| **Prebuild** | Prepara in anticipo l'ambiente, per avviare più in fretta |
| **Tipi di macchina** | Più o meno core e memoria, a seconda del bisogno |
| **Inoltro delle porte** | Rende accessibile un'app che gira nel codespace |
| **Costi** | Quota mensile gratuita per account personali, poi a consumo (calcolo e archiviazione) |
| **Scadenza** | Un codespace inattivo si sospende e può essere eliminato dopo un periodo |

---

## 5. github.dev e differenze con Codespaces

**github.dev** è l'**editor web leggero**: apre il repository in un editor nel browser, senza macchina dietro. Si avvia premendo il tasto **`.`** (punto) in un repository o cambiando `github.com` in `github.dev` nell'indirizzo.

| | github.dev | Codespaces |
| --- | --- | --- |
| Costo | Gratuito | Quota gratuita per account personali, poi a consumo |
| Cos'è | Editor nel browser | Ambiente di sviluppo completo |
| Macchina e terminale | **No** | **Sì** |
| Esecuzione e debug del codice | **No** | **Sì** |
| Avvio | Immediato | Richiede la creazione dell'ambiente |
| Uso tipico | Modifiche rapide, lettura, revisione di PR | Sviluppare, compilare, eseguire e testare |

Regola pratica: *ritoccare* un file o *rivedere* una PR → github.dev. *Eseguire* il codice → Codespaces.

---

## Trappole d'esame

- **Workflow ⊃ job ⊃ step**; l'action è un blocco riutilizzabile usato in uno step.
- **Job paralleli** per impostazione predefinita; `needs` crea dipendenze.
- **Agent mode** (IDE, locale, sincrono) ≠ **coding agent** (GitHub, in background, apre una PR).
- **Content exclusion**: Business ed Enterprise; non copre la modalità agente né la CLI.
- **Copilot** non è disponibile per Enterprise Server.
- **github.dev**: nessun terminale né esecuzione. **Codespaces**: ambiente completo.
- **`devcontainer.json`**: in `.devcontainer/`; più configurazioni = sottocartelle.

## Punti da ricordare

- Actions = automazione guidata da eventi, definita in YAML in `.github/workflows/`.
- Copilot ha piani per singoli, organizzazioni (Business) e aziende (Enterprise).
- Codespaces e github.dev sono due livelli di editor nel cloud.

## Documentazione ufficiale

- [Comprendere GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- [Sintassi dei workflow](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Piani di GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)
- [Panoramica del Copilot coding agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)
- [Esclusione di contenuti per Copilot](https://docs.github.com/en/copilot/concepts/context/content-exclusion)
- [Introduzione ai dev container](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers)
- [Codespaces e github.dev a confronto](https://learn.microsoft.com/training/modules/code-with-github-codespaces/4-codespaces-versus-github-dev-editor)
