# Dominio 3: Claude Code (3,1%)

Dominio piccolo ma molto concreto. Per la CCDV-F serve una conoscenza operativa dei componenti di Claude Code, delle sue funzioni e della sua configurazione: dove mettere un'istruzione, come automatizzarlo, quali modalità di permesso usare.

| Competenza | Peso sull'esame |
| --- | --- |
| Uso di Claude Code | 3,1% |

> Tutte le informazioni tecniche di questa pagina sono verificate sulla documentazione ufficiale di Claude Code (novembre 2026). Le fonti sono elencate in fondo.

---

## 3.1 Componenti principali

| Componente | Che cos'è | Dove vive |
| --- | --- | --- |
| **CLAUDE.md** | Istruzioni persistenti scritte da te | `./CLAUDE.md`, `~/.claude/CLAUDE.md`, ... |
| **Regole** | Istruzioni modulari, anche limitate a certi percorsi | `.claude/rules/*.md`, `~/.claude/rules/` |
| **Skill** | Procedure riutilizzabili (`SKILL.md`) caricate quando servono o richiamate con `/nome` | `.claude/skills/<nome>/SKILL.md`, `~/.claude/skills/` |
| **Comandi** | Comandi slash personalizzati (ora unificati con le Skill) | `.claude/commands/<nome>.md` |
| **Sottoagenti** | Assistenti specializzati con contesto, strumenti e permessi propri | `.claude/agents/`, `~/.claude/agents/` |
| **Memoria** | Memoria automatica (note scritte da Claude) e memoria dei sottoagenti | Per repository, e `.claude/agent-memory/` |
| **Hook** | Comandi eseguiti in punti precisi del ciclo | Nei file `settings.json` |
| **Server MCP** | Strumenti e dati esterni | `.mcp.json`, `~/.claude.json` |
| **Plugin** | Pacchetti di Skill, agenti, hook e server MCP | Installati da un marketplace |

### CLAUDE.md e memoria automatica

| | CLAUDE.md | Memoria automatica |
| --- | --- | --- |
| Chi la scrive | Tu | Claude |
| Contenuto | Istruzioni e regole | Cose imparate e preferenze |
| Ambito | Progetto, utente o organizzazione | Per repository, condivisa tra i worktree |
| Caricamento | A ogni sessione | A ogni sessione (prime 200 righe o 25 KB) |

Entrambe sono **contesto**, non configurazione imposta: per bloccare un'azione qualunque cosa decida Claude serve un hook `PreToolUse`.

### Regole in `.claude/rules/`

Una regola senza frontmatter si carica sempre, come `CLAUDE.md`. Con il campo `paths` si carica solo quando Claude lavora su file che corrispondono:

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# Regole per le API

- Ogni endpoint valida l'input
- Usa il formato di errore standard
```

### Skill

Una Skill è una cartella con un file `SKILL.md`: frontmatter YAML seguito da istruzioni in Markdown.

```markdown
---
description: Riassume le modifiche non committate e segnala i rischi. Usala quando l'utente chiede cosa è cambiato o vuole un messaggio di commit.
---

## Modifiche attuali

!`git diff HEAD`

## Istruzioni

Riassumi le modifiche in due o tre punti, poi elenca eventuali rischi.
```

Campi del frontmatter da conoscere:

- `description` (consigliato): che cosa fa e quando usarla. È ciò che Claude vede per decidere.
- `disable-model-invocation: true`: solo tu puoi richiamarla (per procedure con effetti, come un deploy).
- `user-invocable: false`: solo Claude la usa (conoscenza di sfondo).
- `allowed-tools`: strumenti approvati senza chiedere mentre la Skill è attiva.
- `context: fork`: esegue la Skill in un sottoagente separato.
- `arguments` e i segnaposto `$ARGUMENTS`, `$0`, `$1` per gli argomenti.

**Divulgazione progressiva**: in contesto restano sempre solo nome e descrizione; il corpo si carica quando la Skill viene usata. Il materiale lungo va in file di supporto collegati da `SKILL.md` (si consiglia di restare sotto le 500 righe).

I **comandi personalizzati** sono stati unificati con le Skill: `.claude/commands/deploy.md` e `.claude/skills/deploy/SKILL.md` creano entrambi `/deploy`. Se esistono tutti e due con lo stesso nome, vince la Skill.

### Sottoagenti

```markdown
---
name: code-reviewer
description: Rivede il codice per qualità e buone pratiche
tools: Read, Glob, Grep
model: sonnet
---

Sei un revisore del codice. Analizza il codice e fornisci indicazioni
specifiche e concrete su qualità, sicurezza e buone pratiche.
```

Solo `name` e `description` sono obbligatori. Altri campi: `tools`/`disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `effort`, `isolation: worktree`. Sottoagenti integrati: **Explore** (ricerca veloce, sola lettura), **Plan** (ricerca in plan mode, sola lettura) e **general-purpose**.

### Memoria degli agenti

Con il campo `memory` un sottoagente ha una cartella che persiste tra le conversazioni: `user` (`~/.claude/agent-memory/<agente>/`), `project` (`.claude/agent-memory/<agente>/`, consigliato e versionabile) o `local` (non versionata).

---

## 3.2 Funzioni

### Gestione delle sessioni

- `claude --continue` riprende l'ultima conversazione, `claude --resume <id>` una conversazione precisa.
- `/clear` svuota il contesto, `/compact` lo riassume.
- Ogni sessione parte da una finestra di contesto nuova: ciò che deve sopravvivere va in `CLAUDE.md` o nella memoria.

### Comandi slash

- **Integrati**: per esempio `/init` (genera un `CLAUDE.md` iniziale analizzando la codebase), `/memory`, `/config`, `/status`, `/model`, `/effort`, `/mcp`, `/plugin`, `/clear`, `/compact`.
- **Personalizzati**: le Skill e i comandi del progetto o dell'utente, richiamati con `/nome` (quelli dei plugin con `/nome-plugin:nome`).

### Modalità headless (non interattiva)

Con `-p` (o `--print`) Claude Code esegue un compito e termina: è la base per script e pipeline CI.

```bash
# Compito singolo con strumenti pre-approvati
claude -p "Trova e correggi il bug in auth.py" --allowedTools "Read,Edit,Bash"

# Output JSON conforme a uno schema
claude -p "Estrai i nomi delle funzioni da auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'

# Revisione di sicurezza di una PR
gh pr diff "$1" | claude -p \
  --append-system-prompt "Sei un ingegnere della sicurezza. Cerca vulnerabilità." \
  --output-format json
```

Dettagli utili:

- `--output-format`: `text` (predefinito), `json` (con risultato, `session_id`, costi stimati), `stream-json` (una riga JSON per evento).
- Con `--json-schema` il risultato strutturato è nel campo `structured_output`; se manca (per esempio dopo un rifiuto) lo script deve gestirlo.
- `--bare` salta il caricamento automatico di hook, Skill, plugin, server MCP, memoria e `CLAUDE.md`: è la modalità consigliata per CI, perché dà lo stesso risultato su ogni macchina. Usa `ANTHROPIC_API_KEY`.
- Senza `--bare`, una sessione `-p` esegue gli hook e collega i server MCP del progetto **senza** chiedere la fiducia sulla cartella: attenzione ai repository non fidati.
- Il codice di uscita è 0 in caso di successo, diverso da 0 in caso di errore.

### Modalità streaming

`--output-format stream-json --verbose --include-partial-messages` restituisce gli eventi man mano che arrivano. Il primo evento è `system/init` (modello, strumenti, server MCP, plugin caricati), l'ultimo è `result` con testo finale, costo e metadati della sessione.

### Modalità di permesso

| Modalità | Cosa gira senza chiedere | Per |
| --- | --- | --- |
| `default` (Manual) | Solo le letture | Rivedere ogni azione |
| `acceptEdits` | Letture, modifiche ai file e comandi comuni sul filesystem nella cartella di lavoro | Iterare su codice che rivedi con `git diff` |
| `plan` | Letture; le modifiche restano bloccate finché non approvi un piano | Esplorare prima di cambiare |
| `auto` | Tutto, con un classificatore che rivede le azioni | Compiti lunghi, meno interruzioni |
| `dontAsk` | Letture e strumenti pre-approvati; il resto è negato | CI e script blindati |
| `bypassPermissions` | Tutto, comprese le scritture su percorsi protetti | Solo container e VM isolati |

Nel terminale `Shift+Tab` cambia modalità; all'avvio si usa `--permission-mode`. Le regole `deny` valgono in **ogni** modalità.

La **modalità automatica** (`auto`) usa un classificatore separato che blocca ciò che va oltre la richiesta, tocca infrastrutture non riconosciute o sembra guidato da contenuti ostili. Riduce le richieste di conferma ma **non garantisce la sicurezza**; per impostazione blocca, tra l'altro, push forzati, deploy in produzione e `terraform destroy`.

---

## 3.3 Configurazione

### Gerarchia dei file CLAUDE.md

| Livello | Percorso | Per chi |
| --- | --- | --- |
| Policy gestita | macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux `/etc/claude-code/CLAUDE.md`, Windows `C:\Program Files\ClaudeCode\CLAUDE.md` | Tutta l'organizzazione |
| Utente | `~/.claude/CLAUDE.md` | Tu, in tutti i progetti |
| Progetto | `./CLAUDE.md` oppure `./.claude/CLAUDE.md` | Tutto il team (versionato) |
| Locale | `./CLAUDE.local.md` | Solo tu, in questo progetto (da mettere in `.gitignore`) |

Regole di caricamento:

- I file nella cartella di lavoro **e in quelle superiori** si caricano all'avvio; quelli nelle sottocartelle si caricano quando Claude lavora sui loro file.
- I file si **sommano**, non si sostituiscono: l'ordine va dalla radice del filesystem fino alla cartella di lavoro, quindi le istruzioni più vicine vengono lette per ultime.
- `@percorso/file` importa un altro file; gli import possono essere annidati fino a **quattro livelli**.
- Si consiglia di restare **sotto le 200 righe** per file: istruzioni lunghe consumano contesto e vengono seguite meno.
- Se nel repository c'è solo `AGENTS.md`, Claude legge quello; se ci sono sia `AGENTS.md` sia `CLAUDE.md`, legge `CLAUDE.md` (che può importare `AGENTS.md`).

### Inizializzare un repository

`/init` analizza la codebase e crea un `CLAUDE.md` con comandi di build e test, convenzioni e architettura. Va poi rivisto e tenuto breve; le istruzioni valide solo per una parte del codice vanno in regole con `paths`.

### settings.json

| Ambito | File | Per chi |
| --- | --- | --- |
| Utente | `~/.claude/settings.json` | Tu, in ogni progetto |
| Progetto condiviso | `.claude/settings.json` | Tutto il team (da versionare) |
| Progetto locale | `.claude/settings.local.json` | Solo tu, in questo progetto (fuori da git) |
| Gestito | `managed-settings.json`, MDM o impostazioni dal server | Tutta l'organizzazione |

**Precedenza** (dalla più alta): impostazioni gestite → riga di comando (`--settings`) → progetto locale → progetto condiviso → utente. Le liste come `permissions.allow` si **uniscono** tra i livelli invece di sostituirsi.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  }
}
```

Nelle regole, `Bash(npm run test *)` con lo spazio prima di `*` è un prefisso: vale per ogni comando che inizia con `npm run test`. Altre chiavi frequenti: `permissions.defaultMode`, `hooks`, `env`, `model`, `enabledPlugins`, `apiKeyHelper`. `/status` mostra quali file di impostazioni sono stati caricati.

### Server MCP in Claude Code

```bash
# Server locale (stdio): tutto ciò che segue -- è il comando del server
claude mcp add --transport stdio --env AIRTABLE_API_KEY=CHIAVE airtable -- npx -y airtable-mcp-server

# Server remoto (HTTP), condiviso con il team in .mcp.json
claude mcp add --transport http --scope project notion https://mcp.notion.com/mcp
```

Ambiti: `local` (predefinito, solo tu in questo progetto), `project` (file `.mcp.json` versionato, richiede approvazione) e `user` (tutti i tuoi progetti). Il dettaglio sui server MCP è nel [dominio 8](./studio.html?doc=domain-8).

### Plugin

Un plugin è una cartella con un manifesto `.claude-plugin/plugin.json` e componenti come `skills/`, `agents/`, `hooks/hooks.json` e `.mcp.json`. Si installa con `/plugin` da un marketplace, con ambito utente, progetto o locale; le Skill di un plugin si richiamano come `/nome-plugin:nome-skill`.

---

## Ripasso rapido

- Istruzioni → `CLAUDE.md` o regole; procedure → Skill; lavoro isolato → sottoagente; vincoli garantiti → hook e permessi.
- I `CLAUDE.md` si sommano dalla radice alla cartella di lavoro; `@import` fino a quattro livelli; meno di 200 righe.
- `settings.json`: gestito > riga di comando > locale > progetto > utente; le liste si uniscono.
- Headless: `claude -p`, `--output-format json`, `--json-schema`, `--bare` in CI.
- `dontAsk` per CI blindate, `plan` per esplorare, `bypassPermissions` solo in ambienti isolati; le regole `deny` valgono sempre.

Vedi anche: [Applicazioni e integrazione](./studio.html?doc=domain-2) e [Strumenti e MCP](./studio.html?doc=domain-8).

---

## Fonti ufficiali

- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Settings files and precedence](https://code.claude.com/docs/en/settings)
- [Skills](https://code.claude.com/docs/en/skills) e [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [Plugins overview](https://code.claude.com/docs/en/plugins)
