# PC3 · Formati: Markdown, YAML e JSON

Serve a: [D1](./studio.html?doc=domain-1), [D3](./studio.html?doc=domain-3), [D4](./studio.html?doc=domain-4).

Sono tre modi di scrivere testo con una struttura. Li incontrerai ovunque su GitHub: Markdown per le persone, YAML e JSON per le macchine.

## Markdown (per comunicare)

Testo semplice con simboli che diventano formattazione. Si usa in README, issue, pull request, discussioni, Wiki e commenti.

```markdown
# Titolo di primo livello
## Titolo di secondo livello

Testo con **grassetto**, *corsivo* e `codice`.

- punto di un elenco
- altro punto

1. primo passo
2. secondo passo

> citazione

[testo del link](https://github.com)
![descrizione dell'immagine](immagine.png)

| Colonna A | Colonna B |
| --- | --- |
| uno | due |

- [x] attività completata
- [ ] attività da fare
```

Blocchi di codice: tre apici inversi, con il nome del linguaggio per colorare la sintassi.

Su GitHub il Markdown ha estensioni: `@utente` menziona una persona, `#42` richiama l'issue o la pull request 42, i suggerimenti di codice si inseriscono con un blocco `suggestion`.

## YAML (per configurare)

Formato leggibile per le configurazioni. **L'indentazione è significativa**: si usano spazi, mai tabulazioni.

```yaml
nome: mio-progetto          # coppia chiave: valore
attivo: true                # booleano
versione: 2                 # numero
tag:                        # elenco
  - web
  - demo
autore:                     # oggetto annidato
  nome: Anna
  ruolo: manutentrice
```

I **commenti** iniziano con `#`. Un elenco ha un trattino per elemento; un oggetto annidato è indentato sotto la sua chiave.

È il formato dei **workflow di GitHub Actions** (`.github/workflows/*.yml`), dei modelli di issue e dei file di configurazione di Dependabot. Un errore di indentazione basta a invalidare il file.

## JSON (per scambiare dati)

Formato con parentesi graffe e virgolette, usato dalle API e da molti file di configurazione (`package.json`, `devcontainer.json`).

```json
{
  "nome": "mio-progetto",
  "attivo": true,
  "versione": 2,
  "tag": ["web", "demo"],
  "autore": { "nome": "Anna", "ruolo": "manutentrice" }
}
```

- Un **oggetto** è racchiuso tra `{ }` e contiene coppie `"chiave": valore`.
- Una **lista** è tra `[ ]`.
- Le chiavi sono sempre tra virgolette doppie; i commenti non sono ammessi nel JSON puro.
- Non si mette la virgola dopo l'ultimo elemento.

## Quale usare e dove

| Formato | Pensato per | Dove lo incontri su GitHub |
| --- | --- | --- |
| Markdown | Persone | README, issue, pull request, Wiki, discussioni |
| YAML | Configurazione leggibile | Workflow Actions, modelli di issue, Dependabot |
| JSON | Scambio dati e configurazione | `devcontainer.json`, API di GitHub, `package.json` |

## Per esercitarti

- Scrivi un README di prova con titolo, elenco, tabella e link.
- Apri un workflow di esempio e individua chiavi, elenchi e livelli di indentazione.
