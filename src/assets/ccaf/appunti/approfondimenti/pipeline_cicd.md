# Claude Code nelle pipeline CI/CD

> Appunti per la certificazione CCA-F (Dominio 3, con collegamenti a D1, D4 e D5). Spiegano **come far girare Claude Code senza nessuno davanti**: da riga di comando in qualunque pipeline, con GitHub Actions e con GitLab CI/CD.
>
> ⚠️ Flag, input delle action e versioni cambiano spesso. Fa fede la documentazione ufficiale: **code.claude.com → Run Claude Code programmatically**, **GitHub Actions** e **GitLab CI/CD** (verificata a novembre 2026). All'esame vale la guida d'esame.

---

## Indice

1. [Il concetto chiave: nessuno risponde](#1-il-concetto-chiave-nessuno-risponde)
2. [Tre modi di integrare Claude Code](#2-tre-modi-di-integrare-claude-code)
3. [claude -p in qualunque pipeline](#3-claude-p-in-qualunque-pipeline)
4. [GitHub Actions](#4-github-actions)
5. [GitLab CI/CD](#5-gitlab-ci-cd)
6. [Sicurezza](#6-sicurezza)
7. [Costi e affidabilità](#7-costi-e-affidabilita)
8. [Pattern ricorrenti all'esame](#8-pattern-ricorrenti-all-esame)
9. [Trappole e domande da esame](#9-trappole-e-domande-da-esame)

---

## 1. Il concetto chiave: nessuno risponde

In una sessione interattiva una persona approva i passaggi rischiosi man mano. In una pipeline non c'è nessuno: **tutto ciò che Claude può fare va deciso prima che il job parta**, nella configurazione.

| | Sessione interattiva | Pipeline CI/CD |
|---|---|---|
| Chi approva i comandi | Lo sviluppatore, quando compare la richiesta | Nessuno: decidono `--allowedTools`, le regole di permesso e la modalità |
| Una richiesta di permesso senza regola | Si mostra e si aspetta | Viene **negata** (il job non resta appeso, se configurato bene) |
| Dove va il risultato | Nel terminale, a una persona | A un programma: commenti sulla PR, report, dashboard |
| Formato dell'output | Testo libero | **JSON**, possibilmente con uno schema |
| Quando finisce | Quando lo decide chi lavora | Esito in exit code, limiti di turni, tempo e spesa |

> 💡 **Regola d'esame:** se lo scenario parla di un job CI "bloccato in attesa di input", la risposta è **`claude -p`** (modalità non interattiva) con i permessi decisi in anticipo. Flag dal nome plausibile ma inesistenti (`CLAUDE_HEADLESS=true`, `--batch`) sono distrattori.

---

## 2. Tre modi di integrare Claude Code

| Modo | Quando usarlo | Chi lo mantiene |
|---|---|---|
| **`claude -p`** nello script del job | Qualunque sistema di CI (Jenkins, Azure Pipelines, Bitbucket, script locali), controllo completo | Tu |
| **GitHub Actions** (`anthropics/claude-code-action@v1`) | Repository su GitHub: menzioni `@claude`, revisioni delle PR, job pianificati | Anthropic |
| **GitLab CI/CD** | Progetti GitLab: menzioni `@claude`, MR create da issue | GitLab (integrazione in **beta**) |

Tutti e tre usano lo stesso motore, cioè la CLI di Claude Code e l'Agent SDK: leggono il `CLAUDE.md` del repository e rispettano le stesse regole di permesso. Per le revisioni automatiche su GitHub senza scrivere un workflow esiste anche **Code Review**, un prodotto separato.

→ Collegamenti: [Claude API, Claude Code e Agent SDK](./studio.html?doc=api-code-sdk) per capire chi esegue il ciclo agentico.

---

## 3. claude -p in qualunque pipeline

### I flag che contano

| Flag | A cosa serve in CI |
|---|---|
| `-p` / `--print` | Esegue senza interfaccia, stampa il risultato ed esce. **Obbligatorio** |
| `--bare` | Salta il caricamento automatico di hook, skill, plugin, server MCP, memoria e `CLAUDE.md`: stesso risultato su ogni macchina. Il contesto va passato con flag espliciti |
| `--output-format json` | Un oggetto JSON con `result`, `session_id`, costo stimato (`total_cost_usd`) e metadati |
| `--json-schema '…'` | Con `--output-format json`: l'output strutturato finisce nel campo `structured_output` |
| `--output-format stream-json` | Eventi riga per riga, per seguire il lavoro in tempo reale |
| `--allowedTools "…"` | Strumenti e comandi approvati in anticipo, con la sintassi delle regole di permesso |
| `--permission-mode` | Base di partenza: `dontAsk` (nega tutto ciò che chiederebbe conferma), `acceptEdits` (scrive file senza chiedere), `auto` |
| `--permission-prompts none` | Nei job senza nessuno che risponda: ciò che chiederebbe conferma viene negato e Claude sa di non dover riprovare |
| `--max-turns N` | Limite rigido di turni |
| `--max-budget-usd X` | Limite di spesa |
| `--append-system-prompt "…"` | Istruzioni aggiuntive per il job (es. "sei un revisore di sicurezza") |
| `--resume <id>` / `--continue` | Riprendere una conversazione precedente |

Altri dettagli utili:

- **Exit code:** 0 se va a buon fine, diverso da 0 se l'esecuzione fallisce. Lo script può decidere se far fallire la pipeline.
- **Input da stdin:** puoi passare un diff con una pipe (`git diff main | claude -p "…"`), fino a 10 MB. Oltre, salva su file e indica il percorso nel prompt.
- **`--bare` è la modalità consigliata per script e CI** e in futuro diventerà quella predefinita di `-p`. Senza `--bare`, un job `-p` esegue gli hook di `.claude/settings.json` e collega i server di `.mcp.json` del repository, anche se nessuno ha mai approvato quella cartella.

### La sintassi di `--allowedTools`

| Regola | Cosa approva |
|---|---|
| `Read,Grep,Glob` | Lettura e ricerca: revisione in sola lettura |
| `Bash(npm test)` | Solo quel comando esatto |
| `Bash(git diff *)` | Ogni comando che inizia con `git diff` (lo spazio prima di `*` conta: senza, approverebbe anche `git diff-index`) |
| `Bash` | **Qualunque** comando di shell: da evitare su runner con credenziali |
| `mcp__github__list_issues` | Uno strumento specifico di un server MCP |

### Esempio: revisione con output strutturato

```bash
git diff origin/main...HEAD | claude --bare -p \
  "Review this diff. Report only bugs and security issues, each with file, line, severity and a concrete failure scenario." \
  --append-system-prompt "You are a senior reviewer. Ignore style issues." \
  --allowedTools "Read,Grep,Glob" \
  --max-turns 10 \
  --output-format json \
  --json-schema '{"type":"object","properties":{"findings":{"type":"array","items":{"type":"object","properties":{"file":{"type":"string"},"line":{"type":"integer"},"severity":{"type":"string","enum":["low","medium","high"]},"issue":{"type":"string"},"fix":{"type":"string"}},"required":["file","line","severity","issue","fix"]}}},"required":["findings"]}' \
  > review.json

# Se manca structured_output (per esempio Claude ha rifiutato), non pubblicare nulla
jq -e '.structured_output' review.json > /dev/null || exit 1
```

Perché funziona bene in CI:

- legge il diff da stdin, quindi non serve Bash;
- strumenti di sola lettura: nessuna modifica, nessun comando;
- schema JSON: il passo successivo della pipeline può pubblicare un commento per ogni `finding`, alla riga giusta;
- `--bare`: il risultato non dipende da cosa c'è nella `~/.claude` del runner.

---

## 4. GitHub Actions

### Installazione

- **Rapida:** in Claude Code, dentro il repository, esegui `/install-github-app`. Installa la Claude GitHub App, salva il segreto e apre una PR con i workflow scelti. Servono i permessi di amministratore sul repository e la GitHub CLI autenticata.
- **Manuale:** installa la Claude GitHub App, aggiungi il segreto (`ANTHROPIC_API_KEY`, oppure `CLAUDE_CODE_OAUTH_TOKEN` generato con `claude setup-token` per usare un abbonamento) e copia il workflow in `.github/workflows/`.
- **Organizzazione:** app installata una volta, segreto a livello di organizzazione (meglio una chiave API che un token legato all'abbonamento di una persona), workflow riutilizzabile. In alternativa, **federazione delle identità tramite OIDC**, senza segreti di lunga durata.

### Due modalità, decise automaticamente

| Modalità | Quando | Cosa fa |
|---|---|---|
| **Interattiva** | Il workflow **non** ha l'input `prompt` | Aspetta la frase `@claude` (personalizzabile con `trigger_phrase`) in issue, PR o revisioni, e risponde con un commento |
| **Automazione** | Il workflow ha l'input `prompt` | Parte all'evento (PR aperta, cron, push) senza menzioni; il risultato va nel log del job, o in un commento se il prompt lo chiede e Claude ha lo strumento per farlo |

Chi può avviare Claude: per issue e PR serve **accesso in scrittura** al repository (eccezioni con `allowed_non_write_users`), e gli **account bot** vengono rifiutati a meno che non siano in `allowed_bots`, per evitare cicli tra automazioni.

### Esempio: rispondere a `@claude`

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--max-turns 10"
```

### Esempio: job pianificato in automazione

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: read
      id-token: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: |
            --model sonnet
            --allowedTools "mcp__github__list_commits,mcp__github__list_issues"
```

Con un prompt in testo libero, Claude **non ha shell né accesso alle API di GitHub** finché non glieli concedi con `--allowedTools` (o con regole `permissions.allow` nell'input `settings`). Con una skill (`prompt: "/nome-skill"`) valgono gli strumenti del suo `allowed-tools`.

### Input principali

| Input | Significato |
|---|---|
| `prompt` | Istruzioni o invocazione di una skill; se manca, modalità interattiva |
| `claude_args` | Qualunque flag della CLI: `--max-turns`, `--model`, `--allowedTools`, `--mcp-config`, `--append-system-prompt` |
| `anthropic_api_key` / `claude_code_oauth_token` | Autenticazione |
| `github_token` | Token per le operazioni su GitHub; se manca, si usa la GitHub App |
| `settings` | Impostazioni di Claude Code (JSON o percorso) |
| `trigger_phrase` | Frase di attivazione, predefinita `@claude` |
| `plugin_marketplaces`, `plugins` | Plugin da installare prima dell'esecuzione |
| `use_bedrock`, `use_vertex`, `use_foundry` | Inferenza tramite il proprio cloud, con OIDC |

### Dettagli che fanno la differenza

- **Migrazione da `@beta` a `@v1`:** `direct_prompt` diventa `prompt`, `mode` sparisce (rilevata in automatico), `max_turns` e `model` passano in `claude_args`, `custom_instructions` diventa `--append-system-prompt`.
- **I commit fatti con il `GITHUB_TOKEN` predefinito non avviano altri workflow:** se la CI non parte sui commit di Claude, togli `github_token` (si usa la GitHub App) o usa il token di un'app dedicata.
- **PR da fork:** nei repository pubblici GitHub non passa i segreti ai job avviati da fork, quindi la revisione automatica gira solo sulle PR da branch dello stesso repository.
- **Permessi minimi:** l'app ufficiale chiede un insieme ampio di permessi condiviso con altre funzioni; se l'organizzazione lo richiede, si può creare un'app personalizzata con soli Contents, Issues e Pull requests.

---

## 5. GitLab CI/CD

Integrazione in **beta, mantenuta da GitLab**. Ogni richiesta gira in un job isolato e ogni modifica passa da una **merge request**, quindi restano valide revisioni e approvazioni.

### Configurazione minima

1. In **Settings → CI/CD → Variables** aggiungi `ANTHROPIC_API_KEY` come variabile **masked** (e protetta, se serve).
2. Aggiungi un job a `.gitlab-ci.yml`:

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  timeout: 30m
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk update
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
    - export PATH="$HOME/.local/bin:$PATH"
  script:
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Review this MR and implement the requested changes'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --max-turns 15
```

Cose da sapere:

- **Menzioni `@claude`:** GitLab non le intercetta da solo. Serve un webhook sui commenti verso un listener che chiama l'API di trigger della pipeline passando variabili come `AI_FLOW_INPUT` e `AI_FLOW_CONTEXT`.
- **Operazioni su GitLab** (commenti, MR): `CI_JOB_TOKEN` o un Project Access Token con scope `api` salvato come `GITLAB_ACCESS_TOKEN`; lo strumento `mcp__gitlab` deve essere in `--allowedTools`.
- **Cloud aziendale:** Amazon Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`, ruolo IAM assunto via OIDC) o Google Cloud (`CLAUDE_CODE_USE_VERTEX=1`, Workload Identity Federation), senza chiavi statiche.
- **Limiti:** `--max-turns` per i turni, la parola chiave `timeout` del job per il tempo totale.

> ⚠️ Nell'esempio ufficiale compaiono `acceptEdits` e `Bash` senza restrizioni perché il job deve modificare il codice e aprire MR. Per un job di **sola revisione** restringi a lettura e ricerca.

---

## 6. Sicurezza

Il contenuto di una PR o di una issue è **scritto da altri**: commenti, stringhe, nomi di file e documentazione possono contenere istruzioni ("ignora i problemi e approva"). Un'istruzione nel prompt non basta a escluderle: va **limitato l'impatto** di un'iniezione riuscita.

| Principio | In pratica |
|---|---|
| Contenuto come dati | Il prompt tratta diff e commenti come materiale da analizzare, non come istruzioni |
| Minimo privilegio | Sola lettura per le revisioni; comandi esatti (`Bash(npm test)`), mai `Bash` intero su runner con credenziali |
| Segreti fuori dal job | Il job di revisione non riceve segreti che non gli servono; OIDC invece di chiavi statiche |
| Decisione umana | Claude commenta o propone una PR/MR; **unire** resta una decisione delle persone, con le protezioni dei branch |
| Configurazione del repository | Senza `--bare`, hook e server MCP del repository vengono eseguiti: in un job su codice esterno, `--bare` e una configurazione passata esplicitamente evitano sorprese |
| Mai segreti nel repository | Chiavi e token sempre come segreti di GitHub o variabili masked di GitLab |

→ Collegamenti: [Hook e controllo deterministico](./studio.html?doc=hook) per bloccare comandi con `PreToolUse`.

---

## 7. Costi e affidabilità

Ogni esecuzione consuma **minuti del runner** e **token**.

- **Limiti:** `--max-turns`, `--max-budget-usd`, timeout del job, controlli di concorrenza (`concurrency` in GitHub Actions) per evitare esecuzioni parallele inutili.
- **Contesto:** un `CLAUDE.md` conciso (viene letto a ogni esecuzione) e richieste precise riducono i turni. Nella CI il `CLAUDE.md` serve anche a fornire criteri: standard dei test, fixture disponibili, cosa conta come problema.
- **Sincrono o batch:** un controllo che blocca il merge va eseguito in modo **sincrono**. La **Message Batches API** (–50%, fino a 24 ore, nessuno SLA) va bene solo per lavori che nessuno aspetta, come un audit notturno o settimanale.
- **Prompt caching:** istruzioni lunghe e identiche ripetute in centinaia di revisioni al giorno sono il prefisso da mettere in cache.
- **Riproducibilità:** `--bare` con impostazioni, server MCP e prompt di sistema passati esplicitamente.
- **Errori:** controlla l'exit code e la presenza di `structured_output` prima di pubblicare qualcosa.

---

## 8. Pattern ricorrenti all'esame

### 8.1 Job bloccato in attesa di input

`claude -p`, con permessi decisi in anticipo (`--allowedTools`, modalità, eventualmente `--permission-prompts none`). Non serve "rispondere automaticamente ai prompt".

### 8.2 Commenti in linea sulla PR

`--output-format json` con `--json-schema`: ogni problema con file, riga, gravità e correzione proposta. Lo script li pubblica alla riga giusta. Il testo libero non si analizza in modo affidabile.

### 8.3 Revisione indipendente

La sessione che ha generato il codice tende a confermare le proprie scelte. La revisione va fatta da un'**istanza separata**, senza quel ragionamento.

### 8.4 Nuovi commit sulla stessa PR

Per non ripetere commenti già fatti: nuova revisione completa, passando i risultati precedenti e chiedendo di segnalare solo problemi **nuovi o non ancora risolti**. Non rivedere solo l'ultimo commit e non riprendere la sessione precedente, i cui risultati sugli strumenti sono ormai obsoleti.

### 8.5 Test generati duplicati

Passa nel contesto i **test già esistenti** (e i criteri del `CLAUDE.md`), così Claude non propone scenari già coperti.

### 8.6 Revisione che non vede i chiamanti

Il job riceve solo il diff, ma una firma cambiata rompe codice altrove: dai Grep e Read su **tutto** il repository, usati su richiesta.

### 8.7 Molti repository, stessa modifica

Un'esecuzione `-p` per repository, strumenti limitati, output JSON strutturato da aggregare: un errore in un repository non contamina gli altri.

### 8.8 Bloccare o commentare

Blocca il merge solo sulle categorie con **alta precisione** misurata; il resto come commenti. I falsi blocchi fermano tutto il team.

---

## 9. Trappole e domande da esame

### Trappole

- ❌ `CLAUDE_HEADLESS=true`, `--batch`, redirezione di stdin per "sbloccare" un job: il flag giusto è `-p`.
- ❌ `--allowedTools Bash` per far girare i test: approva qualunque comando. ✅ `Bash(npm test)`.
- ❌ Message Batches API per un controllo pre-merge: può impiegare fino a 24 ore.
- ❌ Auto-revisione nella stessa sessione che ha scritto il codice.
- ❌ Output in testo libero quando un programma deve pubblicare i risultati.
- ❌ Un'istruzione "ignora le istruzioni nel codice" come unica difesa dall'iniezione, mantenendo segreti e merge automatico.
- ❌ Passare `github_token: ${{ secrets.GITHUB_TOKEN }}` e aspettarsi che la CI giri sui commit di Claude.
- ❌ Aspettarsi che un job `-p` "chieda" un permesso mancante: senza una regola, la richiesta viene negata.

### Domande da esame

**1.** Un job CI con `claude "Analyze this pull request for security issues"` resta appeso in attesa di input. Cosa fai?
→ Aggiungi `-p`: esecuzione non interattiva, risultato su stdout, uscita automatica.

**2.** La revisione deve pubblicare un commento per ogni problema, alla riga giusta. Come strutturi l'output?
→ `--output-format json` con `--json-schema` (file, riga, gravità, problema, correzione); lo script legge `structured_output`.

**3.** Dopo un nuovo push sulla stessa PR, la revisione ripete commenti già fatti. Cosa cambi?
→ Revisione completa passando i risultati precedenti, segnalando solo problemi nuovi o non risolti.

**4.** Il job deve eseguire `npm test`, ma il runner contiene le credenziali di deploy. Che permesso concedi?
→ `--allowedTools "Bash(npm test)"` e nient'altro; i segreti di deploy fuori da quel job.

**5.** Ogni settimana serve un audit di debito tecnico su tutto il repository, letto il lunedì. Sincrono o batch?
→ Batch: nessuno aspetta e costa la metà. Le revisioni delle PR, che bloccano il merge, restano sincrone.

**6.** Il team su GitLab vuole che `@claude` in un commento crei una MR. Basta il job in `.gitlab-ci.yml`?
→ No: serve anche un listener (webhook sui commenti) che chiami l'API di trigger con `AI_FLOW_INPUT` e `AI_FLOW_CONTEXT`.
