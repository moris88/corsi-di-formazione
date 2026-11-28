# Pre-corso · Mappa e percorso di studio

L'esame GH-900 è pensato anche per **chi non sviluppa software**. Per questo la guida non spiega, ma *dà per scontati*, alcuni concetti di base: cos'è un file e una cartella, cosa significa "compilare" o "distribuire", cos'è un formato come YAML, come funziona un indirizzo web, perché una chiave pubblica è sicura. Se uno di questi concetti ti è nuovo, i domini ti sembreranno più difficili di quanto siano.

Questo pre-corso colma quei vuoti. Non è materiale d'esame: **serve a capire il resto**.

## Come usarlo

1. Fai il **test di ingresso** qui sotto.
2. Leggi solo i moduli per i quali hai risposto "non so".
3. Torna ai domini: ogni modulo indica a quali domini serve.

## Moduli e collegamenti ai domini

| Modulo | Concetti | Serve soprattutto a |
| --- | --- | --- |
| [PC1 · Computer, file e terminale](./studio.html?doc=pc-terminale) | File, cartelle, percorsi, riga di comando, editor | [D1](./studio.html?doc=domain-1), [D2](./studio.html?doc=domain-2) |
| [PC2 · Come nasce il software](./studio.html?doc=pc-software) | Codice, build, test, rilascio, versioni, dipendenze, CI/CD | [D2](./studio.html?doc=domain-2), [D4](./studio.html?doc=domain-4) |
| [PC3 · Formati: Markdown, YAML, JSON](./studio.html?doc=pc-formati) | Come si scrivono testi e configurazioni | [D1](./studio.html?doc=domain-1), [D3](./studio.html?doc=domain-3), [D4](./studio.html?doc=domain-4) |
| [PC4 · Web, API, cloud e container](./studio.html?doc=pc-web-cloud) | URL, HTTP, API, server, macchine virtuali, Docker | [D3](./studio.html?doc=domain-3), [D4](./studio.html?doc=domain-4) |
| [PC5 · Identità e sicurezza](./studio.html?doc=pc-sicurezza) | Password, 2FA, chiavi, token, vulnerabilità, licenze | [D6](./studio.html?doc=domain-6), [D7](./studio.html?doc=domain-7) |
| [PC6 · Lavoro di squadra e IA](./studio.html?doc=pc-team-ia) | Revisione, agile, kanban, open source, modelli di IA | [D3](./studio.html?doc=domain-3), [D4](./studio.html?doc=domain-4), [D5](./studio.html?doc=domain-5), [D7](./studio.html?doc=domain-7) |
| [PC7 · Risorse per esercitarsi](./studio.html?doc=pc-risorse) | Dove praticare ogni concetto | tutti |

Il controllo della versione e Git sono trattati direttamente nel [Dominio 1](./studio.html?doc=domain-1): non servono prerequisiti per iniziare.

## Test di ingresso

Rispondi mentalmente. Se non sai rispondere, leggi il modulo indicato.

1. Qual è la differenza tra un percorso assoluto e uno relativo? → PC1
2. Cosa fa il comando `cd ..`? → PC1
3. Che differenza c'è tra *compilare*, *testare* e *distribuire* un programma? → PC2
4. Cosa significano le tre cifre di una versione come `2.4.1`? → PC2
5. Perché in YAML l'indentazione è importante? → PC3
6. Cosa distingue un oggetto da una lista in JSON? → PC3
7. Cosa fa un'API e cosa significa "richiesta GET"? → PC4
8. Che differenza c'è tra una macchina virtuale e un container? → PC4
9. Perché una chiave pubblica si può condividere, quella privata no? → PC5
10. Cos'è una vulnerabilità e perché si numerano (CVE)? → PC5
11. Che differenza c'è tra kanban e iterazioni (sprint)? → PC6
12. Cosa significa che un modello di IA "genera" testo e perché può sbagliare? → PC6

**Punteggio.** Da 10 a 12 risposte sicure: salta il pre-corso e leggi solo i moduli dove hai dubbi. Da 5 a 9: leggi i moduli segnati. Meno di 5: leggi tutto, in ordine; richiede poco più di un'ora.
