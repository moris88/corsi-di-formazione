# PC1 · Computer, file e terminale

Serve a: [D1](./studio.html?doc=domain-1), [D2](./studio.html?doc=domain-2).

## File, cartelle e percorsi

Un **file** contiene dati (testo, immagine, programma). Una **cartella** (o *directory*) contiene file e altre cartelle. L'insieme forma un albero.

Un **percorso** (*path*) dice dove si trova un file:

- **assoluto**: parte dalla radice del disco (`/home/anna/progetto/README.md` su Linux e macOS, `C:\Users\Anna\progetto\README.md` su Windows);
- **relativo**: parte dalla cartella in cui ti trovi (`docs/guida.md`).

Due scorciatoie da conoscere: `.` è la cartella corrente e `..` è la cartella superiore.

### Estensioni e file di testo

L'**estensione** (`.md`, `.txt`, `.yml`, `.json`, `.js`) indica il tipo di contenuto. I **file di testo** si aprono con qualsiasi editor di testo e sono leggibili da un umano; i **file binari** (immagini, PDF, programmi compilati) no. Git lavora al meglio con i file di testo: ne mostra riga per riga le differenze.

### File nascosti

Su Linux e macOS i nomi che iniziano con un punto (`.gitignore`, `.github`) sono *nascosti*. Molti file di configurazione di GitHub hanno questa forma.

## L'editor di codice e l'IDE

- **Editor di testo**: modifica testo semplice (Blocco note).
- **Editor di codice**: aggiunge colori per la sintassi, ricerca, estensioni (Visual Studio Code è il più diffuso).
- **IDE** (ambiente di sviluppo integrato): editor più strumenti per eseguire, correggere e testare il programma.

Questi termini ricorrono nel [Dominio 4](./studio.html?doc=domain-4): Copilot vive dentro l'editor, e Codespaces e github.dev sono editor nel browser.

## Il terminale

Il **terminale** (o *riga di comando*, *shell*) è un'interfaccia in cui si digitano comandi invece di cliccare. Molti strumenti, Git compreso, nascono per il terminale.

| Comando | Cosa fa |
| --- | --- |
| `pwd` | Mostra la cartella corrente |
| `ls` (`dir` su Windows) | Elenca i file |
| `cd cartella` | Entra in una cartella |
| `cd ..` | Sale di un livello |
| `mkdir nome` | Crea una cartella |
| `cat file` | Mostra il contenuto di un file |
| `git status` | Mostra lo stato del repository (comando di Git) |

Il terminale non chiede conferma: se scrivi male un comando ottieni un errore, e questo è normale. Gli argomenti si separano con spazi; se un nome contiene spazi va tra virgolette.

### Perché conta per GH-900

L'esame non richiede di *saper usare* il terminale, ma di **riconoscere** a cosa serve un comando Git e quando preferire un'alternativa grafica (GitHub Desktop) o web.

## Per esercitarti

- Apri il terminale del tuo sistema e prova `pwd`, `ls`, `cd`.
- Crea una cartella di prova con un file `prova.txt` e leggilo con `cat`.
