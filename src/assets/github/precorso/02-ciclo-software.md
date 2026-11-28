# PC2 · Come nasce il software

Serve a: [D2](./studio.html?doc=domain-2), [D4](./studio.html?doc=domain-4).

## Codice sorgente e linguaggi

Un programma è scritto come **codice sorgente**: testo in un **linguaggio di programmazione** (Python, JavaScript, Java, C#…). Il computer lo esegue direttamente (linguaggi *interpretati*) oppure dopo una **compilazione**, che lo traduce in un file eseguibile.

Non devi saper programmare per l'esame, ma devi capire che **un repository GitHub contiene soprattutto testo** e che quel testo, se è codice, ha un ciclo di vita.

## Il ciclo di vita

```text
scrivere → costruire (build) → testare → rilasciare → distribuire (deploy) → monitorare
```

| Fase | Che cosa significa |
| --- | --- |
| **Build** | Trasformare il sorgente in qualcosa di eseguibile e impacchettato |
| **Test** | Eseguire controlli automatici per verificare che il programma faccia ciò che deve |
| **Rilascio (release)** | Dare un numero di versione a un insieme di modifiche e pubblicarlo |
| **Distribuzione (deploy)** | Mettere il programma dove gli utenti lo usano (un server, uno store) |
| **Monitoraggio** | Osservare errori e prestazioni dopo la distribuzione |

### Ambienti

Prima della produzione il software passa per ambienti separati: **sviluppo** (sul computer di chi scrive), **test o staging** (copia di prova) e **produzione** (quello vero). In GitHub Actions gli *environments* modellano proprio questi passaggi.

## CI e CD

- **Integrazione continua (CI)**: a ogni modifica, un sistema automatico costruisce il progetto ed esegue i test. Si scoprono presto i problemi.
- **Consegna continua (CD)**: il software che ha superato i test è pronto per il rilascio; nella *distribuzione continua* viene anche pubblicato in automatico.

**GitHub Actions** ([Dominio 4](./studio.html?doc=domain-4)) è lo strumento di GitHub per CI/CD.

## Versioni

Le versioni sono numeri che dicono quanto è cambiato un programma. Lo schema più diffuso è il **versionamento semantico**: `MAGGIORE.MINORE.PATCH`.

| Cifra | Aumenta quando… | Esempio |
| --- | --- | --- |
| **MAGGIORE** | cambia qualcosa che rompe la compatibilità | `2.0.0` |
| **MINORE** | si aggiunge una funzione compatibile | `2.4.0` |
| **PATCH** | si corregge un errore | `2.4.1` |

In Git, un punto della cronologia viene etichettato con un **tag** (per esempio `v2.4.1`); in GitHub un **release** è un tag con note e file scaricabili.

## Dipendenze e pacchetti

Quasi nessun programma è scritto da zero: usa **librerie** di altri, dette **dipendenze**, che si installano con un **gestore di pacchetti** (npm per JavaScript, pip per Python, NuGet per .NET, Maven per Java). L'elenco delle dipendenze sta in un file come `package.json` o `requirements.txt`.

Le dipendenze portano un rischio: se una libreria ha una **vulnerabilità**, la eredita ogni progetto che la usa. Per questo GitHub offre il *grafo delle dipendenze* e Dependabot ([D2](./studio.html?doc=domain-2), [D6](./studio.html?doc=domain-6)).

## Parole di uso comune

- **Bug**: difetto nel programma.
- **Regressione**: un bug che ricompare dopo essere stato corretto.
- **Refactoring**: riorganizzare il codice senza cambiarne il comportamento.
- **Branch di funzionalità (feature branch)**: ramo dedicato a una nuova funzione.
- **Hotfix**: correzione urgente a un programma già in produzione.
- **Backlog**: elenco del lavoro ancora da fare.
- **Documentazione**: testi che spiegano come usare o sviluppare il progetto.
