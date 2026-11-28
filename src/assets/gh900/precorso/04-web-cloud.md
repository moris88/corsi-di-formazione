# PC4 · Web, API, cloud e container

Serve a: [D3](./studio.html?doc=domain-3), [D4](./studio.html?doc=domain-4).

## Come funziona il web

- Un **URL** è l'indirizzo di una risorsa: `https://github.com/utente/repo/issues/42`. Le parti sono lo schema (`https`), il dominio (`github.com`) e il percorso (`/utente/repo/issues/42`).
- Un **browser** (client) chiede la risorsa a un **server**, che risponde con la pagina.
- **HTTP** è il protocollo della richiesta e della risposta; **HTTPS** è la versione cifrata.
- Un **dominio** è il nome leggibile di un server. Un **sottodominio** ne è una parte (`github.dev`, `docs.github.com`).

Su GitHub ogni cosa ha un URL stabile: un'issue, una pull request, un file a una certa riga, un commit. Per questo si può *collegare* qualsiasi elemento in un commento.

## Siti statici e dinamici

- Un sito **statico** è fatto di file già pronti (HTML, CSS, JavaScript): il server li consegna senza elaborarli. È ciò che pubblica **GitHub Pages**.
- Un sito **dinamico** genera le pagine al momento, di solito consultando un database.

## API

Un'**API** (interfaccia di programmazione) è il modo in cui un programma ne chiede qualcosa a un altro. GitHub ne offre due:

- **REST**: indirizzi diversi per risorse diverse, con verbi HTTP (`GET` legge, `POST` crea, `PATCH` modifica, `DELETE` elimina);
- **GraphQL**: un solo indirizzo, in cui si descrive quali dati si vogliono.

Le risposte arrivano in [JSON](./studio.html?doc=pc-formati). Le API servono per automatizzare: Actions, app e integrazioni le usano continuamente. Per accedervi si usa un **token** (vedi [PC5](./studio.html?doc=pc-sicurezza)).

### Webhook

Un **webhook** è l'inverso: invece di chiedere, è GitHub che *avvisa* un indirizzo esterno quando succede un evento (un push, una pull request aperta).

## Cloud, server e macchine virtuali

- **Cloud**: potenza di calcolo e spazio affittati a consumo via internet, invece di avere i propri server.
- **Server**: computer che offre un servizio.
- **Macchina virtuale (VM)**: un computer simulato dentro un altro, con un sistema operativo completo.
- **Runner**: la macchina (spesso una VM) che esegue i lavori di GitHub Actions.

## Container e Docker

Un **container** impacchetta un programma con tutto ciò che gli serve (librerie, impostazioni), così funziona uguale ovunque. Rispetto a una VM è più leggero perché condivide il sistema operativo dell'host.

| | Macchina virtuale | Container |
| --- | --- | --- |
| Contiene | Sistema operativo completo | Solo il programma e le sue dipendenze |
| Avvio | Più lento | Rapido |
| Dimensione | Grande | Piccola |

**Docker** è lo strumento più diffuso per i container. Un **Dockerfile** è la ricetta con cui si costruisce un'*immagine*; un container è un'immagine in esecuzione.

In GitHub Codespaces un **dev container** è un container configurato come ambiente di lavoro: chiunque apra il progetto ottiene lo stesso ambiente, con gli stessi strumenti.

## Sistemi operativi e piattaforme

Windows, macOS e Linux sono i tre sistemi operativi su cui girano i runner di GitHub Actions. Un lavoro si può eseguire su uno o su tutti, per verificare che il programma funzioni ovunque.

## Per esercitarti

- Apri l'URL di un'issue di un progetto pubblico e riconosci le parti dell'indirizzo.
- Apri `https://api.github.com/users/octocat` nel browser: è una risposta di API in JSON.
