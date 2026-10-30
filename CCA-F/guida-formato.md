# Formato dei test Markdown

Questa guida descrive il formato accettato da `simulazione.html`. Puoi creare un nuovo file `.md` copiando il modello qui sotto, sostituendo testo e opzioni, poi caricarlo con **Carica il Markdown** nella schermata iniziale.

## Modello

````markdown
---
title: "Nome del nuovo test"
duration_minutes: 90
---

# Nome del nuovo test

## Scenario: Nome dello scenario

### Domanda 1

Scrivi qui il testo della domanda. Puoi usare paragrafi, codice inline e blocchi di codice Markdown.

- **A.** Prima opzione.
- **B.** Seconda opzione.
- **C.** Terza opzione.
- **D.** Quarta opzione.

#### Risposta corretta alla domanda 1: B

Spiegazione facoltativa della risposta corretta.

### Domanda 2

Scrivi il testo della seconda domanda.

- **A.** Prima opzione.
- **B.** Seconda opzione.
- **C.** Terza opzione.
- **D.** Quarta opzione.

#### Risposta corretta alla domanda 2: D

Spiegazione facoltativa.
````

## Regole

- `title` e `duration_minutes` sono facoltativi. Se mancano, il titolo viene letto dal primo titolo `#` e la durata predefinita è di 120 minuti.
- `duration_minutes` deve essere un numero intero maggiore di zero.
- Ogni domanda inizia con `### Domanda N`, dove `N` è un identificatore numerico univoco. I numeri non devono essere consecutivi.
- Ogni domanda deve contenere testo, quattro opzioni con le etichette `A`, `B`, `C`, `D` e una sola risposta corretta.
- La risposta corretta si indica con `#### Risposta corretta alla domanda N: X`, usando lo stesso numero della domanda e la lettera corretta. È accettata anche la forma breve `#### Risposta corretta: X`.
- Le spiegazioni dopo la risposta corretta sono facoltative; possono includere elenchi e blocchi di codice.
- Gli scenari sono facoltativi. Per crearne uno, usa `## Scenario: Nome dello scenario` prima delle domande interessate.
- Puoi aggiungere tutti gli scenari e le domande che vuoi: la simulazione ricava automaticamente il numero totale dal file.

## Importazione

1. Apri `simulazione.html` tramite il server locale: il test più recente della cartella `questions/` viene caricato automaticamente.
2. Per usare un altro test, seleziona **Importa un altro Markdown** e scegli il file `.md`.
3. Avvia la prova: il numero di domande viene letto dal file, domande e opzioni vengono mescolate e il timer usa la durata indicata nel frontmatter.

Il banco attuale è un esempio valido del formato: non richiede frontmatter e usa la durata predefinita di 120 minuti.
