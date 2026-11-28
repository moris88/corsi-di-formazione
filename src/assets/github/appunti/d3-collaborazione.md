# Dominio 3 · Collaborare con GitHub

**Peso: 10-15%.**

**In questa pagina**: issue · pull request e revisioni · metodi di merge · discussioni · collegare gli elementi · modelli, filtri e assegnazioni · notifiche · Gist, Wiki e Pages · trappole d'esame.

---

## 1. Tre strumenti per tre bisogni

| Strumento | Quando usarlo |
| --- | --- |
| **Issue** | C'è qualcosa da **fare**: un bug, un'attività, una richiesta di funzione. |
| **Pull request** | C'è **codice da rivedere**: si propone di unire un ramo in un altro. |
| **Discussioni (Discussions)** | Serve **conversare**: domande, idee, annunci, sondaggi. Non c'è un lavoro da chiudere. |

---

## 2. Issue

Un'issue traccia un lavoro. Ha:

- **titolo** e **descrizione** (in Markdown);
- **assegnatari** (chi se ne occupa);
- **etichette**, **attività cardine** (milestone), **progetti**;
- **commenti**, menzioni e riferimenti ad altri elementi;
- uno **stato**: aperta o chiusa.

Funzioni utili:

- **Modelli e moduli di issue** (*issue forms*): guidano chi scrive a fornire le informazioni giuste, con campi strutturati.
- **Sotto-issue** (*sub-issues*): scompongono un lavoro grande in lavori più piccoli collegati.
- **Elenchi di attività** (`- [ ]`): dentro la descrizione, con avanzamento visibile.
- **Fissare (pin)** le issue importanti in cima alla lista.
- **Chiudere** come *completata* oppure *non pianificata*; **trasferire** o **bloccare** una conversazione.
- Un'issue può partire da un commento, da un file o da una riga di codice.

### Chiusura automatica

Nella descrizione di una pull request, le parole chiave `Closes`, `Fixes`, `Resolves` seguite da `#numero` chiudono l'issue **al merge nel ramo predefinito**.

---

## 3. Pull request

Una **pull request** (PR) propone di unire le modifiche di un ramo (*head*) in un altro (*base*). Contiene:

- **conversazione**: descrizione e commenti;
- **commit** inclusi;
- **controlli** (*checks*): esiti dei test automatici;
- **file modificati** (*Files changed*), con le differenze riga per riga.

### Ciclo di vita

```text
ramo → PR (anche bozza) → revisione → controlli superati → merge → ramo eliminato
```

- **Bozza (draft)**: segnala che il lavoro non è pronto; non può essere unita finché non la si contrassegna come *pronta per la revisione*.
- **Revisori (reviewers)**: persone o team richiesti per la revisione. Con i `CODEOWNERS` vengono richiesti in automatico.
- **Assegnatari**: chi porta avanti la PR.

### Revisione

Un revisore può lasciare un'**approvazione**, una **richiesta di modifiche** o un semplice **commento**.

| Esito | Effetto |
| --- | --- |
| **Comment** | Osservazioni, senza approvare né bloccare |
| **Approve** | Via libera alla fusione |
| **Request changes** | Blocca la fusione finché non viene risolto, se la protezione del ramo lo richiede |

I commenti si possono lasciare **su una riga precisa**, su più righe o sull'intero file. Un **suggerimento** (`suggestion`) permette all'autore di applicare la modifica proposta con un clic. Si può anche **segnare un file come visto**.

### Controlli e protezioni

Le **regole di protezione del ramo** (o *ruleset*) possono richiedere: un numero minimo di approvazioni, controlli di stato superati, la risoluzione di tutte le conversazioni, una cronologia lineare. Dettagli nel [Dominio 6](./studio.html?doc=domain-6).

### Metodi di merge

| Metodo | Risultato | Si sceglie quando |
| --- | --- | --- |
| **Merge commit** (predefinito) | Conserva tutti i commit della PR e aggiunge un commit di fusione | La cronologia completa è utile |
| **Squash and merge** | Riunisce tutti i commit della PR in **uno solo** sul ramo base | La PR è un'unica modifica logica, piena di piccoli commit di correzione |
| **Rebase and merge** | Aggiunge i commit uno a uno sul ramo base, **senza** commit di fusione | Si vuole una cronologia lineare e i commit sono già ordinati |

Per fondere una PR serve il permesso di scrittura, e il metodo deve essere consentito dal repository. Con lo squash si perdono i commit intermedi, perciò va bene per rami brevi; con il rebase su GitHub si creano nuovi identificativi di commit.

> **Trappola frequente.** Il merge **non** chiude da solo un'issue: serve una parola chiave nella descrizione, oppure il collegamento dalla barra laterale (*Development*).

### Fork e pull request

Chi non ha accesso in scrittura al repository fa il **fork**, lavora in un ramo del proprio fork e apre una PR verso l'originale. Se il maintainer lo consente, può **modificare** la PR anche lui.

---

## 4. Discussioni

Le **Discussions** sono uno spazio di conversazione del repository o dell'organizzazione.

- Si organizzano in **categorie** (Annunci, Domande e risposte, Idee, Mostra e racconta…).
- Le categorie di tipo **Domande e risposte** permettono di segnare una risposta come **accettata**.
- Esistono **sondaggi** e discussioni **fissate**.
- Si possono **promuovere a issue** quando da una conversazione nasce un lavoro.
- Vanno **abilitate** nelle impostazioni del repository.

Regola pratica: *"Come faccio…?"* o *"Cosa ne pensate di…?"* → discussione. *"C'è un errore in…"* → issue.

---

## 5. Collegare gli elementi

Su GitHub ogni cosa si collega scrivendo il suo riferimento in un commento:

| Scrivi | Collega |
| --- | --- |
| `#42` | Issue o PR 42 dello stesso repository |
| `utente/repo#42` | Issue o PR di un altro repository |
| `@utente` | Menziona una persona e le invia una notifica |
| `@organizzazione/team` | Menziona un intero team |
| L'hash di un commit | Quel commit |

I riferimenti incrociati compaiono nella *cronologia* dell'elemento citato. Si possono collegare anche dalla barra laterale di una PR (*Development*) per chiudere l'issue al merge.

---

## 6. Modelli, filtri e assegnazioni

### Modelli

- **Modelli di issue**: in `.github/ISSUE_TEMPLATE/`, anche come moduli YAML con campi (testo, menu a tendina, caselle).
- **Modello di pull request**: `.github/pull_request_template.md`, con le domande da compilare.
- Un file `config.yml` può scegliere se consentire issue vuote e aggiungere link (per esempio verso le discussioni).

### Filtri e ricerca

Si filtra la lista per stato, autore, etichetta, assegnatario, milestone, ecc.:

```text
is:open is:issue label:bug assignee:@me
is:pr is:open review-requested:@me
```

I filtri si possono salvare come *viste* in un progetto.

### Assegnatari e revisori

- **Assegnatario**: chi si occupa del lavoro.
- **Revisore**: chi deve rivedere una PR.
- **Etichette** e **milestone** (vedi [Dominio 5](./studio.html?doc=domain-5)) organizzano e raggruppano.

---

## 7. Notifiche

Le notifiche avvisano di menzioni, assegnazioni, richieste di revisione e attività su ciò che segui.

### Dove arrivano

- **Casella di notifiche** su GitHub (la campanella).
- **Email**.
- **GitHub Mobile** (notifica push).

### Cosa ti segue: *Watch*

Per ogni repository scegli il livello:

| Livello | Notifiche |
| --- | --- |
| **Participating and @mentions** | Solo ciò a cui partecipi o dove sei menzionato |
| **All activity** | Tutte le attività |
| **Custom** | Solo certi eventi (issue, PR, release, discussioni, avvisi di sicurezza) |
| **Ignore** | Nessuna |

Si possono anche **sottoscrivere** o **disattivare** singole conversazioni.

### Gestire il flusso

Nella casella: filtrare (per repository, motivo, stato), **salvare** per dopo, segnare come **fatte** o come **lette**, **archiviare**. Le notifiche si possono instradare su email diverse per organizzazione.

---

## 8. Gist, Wiki e GitHub Pages

| Strumento | A cosa serve | Note |
| --- | --- | --- |
| **Gist** | Condividere frammenti di codice, comandi o appunti | Ogni Gist è un repository Git: ha cronologia, si può clonare e biforcare. Può essere **pubblico** (cercabile) o **segreto** (non cercabile, ma visibile a chi ha il link). |
| **Wiki** | Documentazione estesa di un progetto | Più pagine in Markdown, in un repository Git separato dal codice. Va abilitata. |
| **GitHub Pages** | Pubblicare un sito web statico da un repository | HTML, CSS e JavaScript, oppure un generatore di siti statici. |

### Dettagli su GitHub Pages

- Esistono tre tipi di siti: **utente**, **organizzazione** e **progetto**. Per ogni account si può creare un solo sito utente o organizzazione; i siti di progetto sono illimitati.
- La **sorgente di pubblicazione** è il ramo e la cartella (radice o `/docs`) da cui si pubblica, oppure un workflow di GitHub Actions.
- È disponibile in repository **pubblici** con il piano Free e in quelli pubblici e privati con piani a pagamento.
- Ha dei **limiti d'uso**: il sito pubblicato non deve superare 1 GB, la distribuzione ha un timeout di 10 minuti e c'è un limite indicativo di banda di 100 GB al mese.
- Non è pensato per attività commerciali o per servizi che raccolgono dati sensibili.

> **Gist segreto non è privato.** Chiunque ne conosca il link può leggerlo.

---

## Trappole d'esame

- **Issue / PR / discussione**: fare vs rivedere vs conversare.
- **Merge** non chiude l'issue senza parola chiave o collegamento.
- **Squash** = un solo commit; **rebase** = lineare, senza commit di fusione; **merge commit** = conserva tutto.
- **Bozza**: non si può unire finché non è pronta.
- **Gist segreto** non è privato.
- **Wiki** è un repository a parte; **Pages** pubblica siti statici, non dinamici.

## Punti da ricordare

- `Closes #n` collega e chiude. `@utente` menziona. `#n` richiama.
- Le revisioni hanno tre esiti: commento, approvazione, richiesta di modifiche.
- Le notifiche si regolano con *Watch* e con i filtri della casella.

## Documentazione ufficiale

- [Informazioni sulle issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)
- [Informazioni sulle pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [Metodi di merge su GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github)
- [Collegare una pull request a un'issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [Informazioni sulle discussioni](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions)
- [Informazioni sulle notifiche](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/about-notifications)
- [Che cos'è GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [Limiti di GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
