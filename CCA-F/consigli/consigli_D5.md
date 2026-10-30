# Trappole d'esame — Dominio 5: Gestione del contesto e affidabilità

> **Come usare questo file.** Per ogni trappola: risposta sbagliata (❌), perché, risposta corretta (✅), segnale nella domanda (🔎).
> **⚠️ Guida vs docs** segnala dove la guida d'esame e la documentazione attuale (ottobre 2026) divergono: all'esame vale la guida.

## Regole d'oro del dominio

1. **I riassunti distruggono numeri, date e ID** → teneteli in un blocco di "fatti del caso" persistente.
2. **I problemi di posizione nel contesto si risolvono con la struttura**, non con le raccomandazioni nel prompt.
3. **Escalation su criteri espliciti**, non su sentimento né su confidenza auto-dichiarata. Se il cliente chiede un umano, lo ottiene.
4. **Errori strutturati che risalgono al coordinatore**; un risultato vuoto valido non è un errore.
5. **Il degrado del contesto si cura salvando lo stato fuori dal contesto** (scratchpad), non con finestre più grandi.
6. **L'accuratezza aggregata nasconde i segmenti deboli** → valida per tipo di documento e campo; campiona anche i casi ad alta confidenza.
7. **Fonti in conflitto → conservare entrambe con attribuzione e data**, non scegliere.

---

## 1. Gestione della finestra di contesto

### Trappola 1 — Considerare sicuro il riassunto progressivo per dati transazionali

**Perché è sbagliato:** riassumere elimina sistematicamente valori numerici, date e identificatori precisi ("il cliente ha chiesto un rimborso" invece di "rimborso di 127,40 € sull'ordine #A-55812 del 3 ottobre").

✅ Un **blocco persistente di fatti del caso** (ID, importi, date, stato) tenuto **fuori** dai riassunti e reinserito integralmente a ogni turno.

### Trappola 2 — Pensare che l'effetto "lost in the middle" si risolva dicendo al modello di fare attenzione a tutto

**Perché è sbagliato:** i promemoria nel prompt non correggono in modo affidabile un effetto legato alla posizione: le informazioni al centro di input lunghi ricevono meno attenzione.

✅ Soluzione **strutturale**: metti le informazioni chiave **all'inizio** dell'input e usa **intestazioni di sezione esplicite**.

### Trappola 3 — Tenere i risultati completi degli strumenti "perché potrebbero servire dopo"

**Perché è sbagliato:** un lookup che restituisce 40+ campi, ripetuto per molti turni, esaurisce il budget di token.

✅ **Taglia ai campi rilevanti prima** che il risultato entri nella cronologia (es. con un hook `PostToolUse`, vedi D1).

### Trappola 4 — Troncare selettivamente la cronologia pensando di non perdere nulla

**Perché è sbagliato:** l'API è stateless; ciò che togli dalla cronologia il modello non lo vede più. Eliminare messaggi in modo improvvisato fa perdere fatti.

✅ Guida d'esame: invia la **cronologia completa** a ogni richiesta; per contenere la crescita usa **blocco dei fatti del caso + riassunto** del resto.

⚠️ **Guida vs docs:** la documentazione attuale introduce il *context editing*, che elimina contenuti selezionati in modo deliberato e controllato. Resta sbagliata la rimozione improvvisata.

---

## 2. Escalation e risoluzione delle ambiguità

| Segnale | Escalation? |
| --- | --- |
| Richiesta esplicita di un operatore umano | ✅ **subito** |
| Lacuna nella policy / caso non coperto | ✅ |
| Azione oltre i limiti dell'agente (es. rimborso sopra soglia) | ✅ |
| Cliente arrabbiato ma problema semplice | ❌ risolvi (puoi offrire l'escalation) |
| Confidenza bassa auto-dichiarata | ❌ non è un segnale affidabile |

### Trappola 5 — Escalation quando la frustrazione o il sentimento negativo superano una soglia

**Perché è sbagliato:** la frustrazione non è correlata alla complessità del caso. Un cliente furioso per una consegna in ritardo ha un problema semplice; un cliente calmo con un caso che la policy non copre ha bisogno di un umano.

✅ Escalation su **criteri espliciti** legati al caso.

### Trappola 6 — Usare la confidenza auto-dichiarata come segnale di escalation

**Perché è sbagliato:** la confidenza degli LLM è mal calibrata: spesso il modello è sicuro sui casi difficili e incerto su quelli facili.

✅ **Criteri espliciti** nel system prompt, con **esempi few-shot** di casi limite.

### Trappola 7 — Provare comunque a risolvere quando il cliente chiede esplicitamente un umano

**Perché è sbagliato:** "Voglio parlare con una persona" è un'istruzione chiara; insistere la trasforma in una trattativa.

✅ **Esegui subito l'escalation.** Offrire prima una soluzione va bene solo quando il cliente è frustrato **ma non** ha chiesto un umano.

### Trappola 8 — Con più clienti corrispondenti, scegliere il record più recente o più attivo

**Perché è sbagliato:** un'euristica può portarti sull'account sbagliato: violazione della privacy e azioni sulla persona sbagliata.

✅ **Chiedi un identificatore aggiuntivo** (email, numero d'ordine, CAP) per disambiguare.

---

## 3. Propagazione degli errori nei sistemi multi-agente

Contesto di errore che un sottoagente dovrebbe restituire al coordinatore:

```json
{
  "status": "error",
  "errorType": "timeout",
  "attemptedQuery": "normativa UE batterie 2026",
  "partialResults": [ ... ],
  "suggestedAlternatives": ["fonte alternativa X", "query più ristretta"]
}
```

### Trappola 9 — Su timeout, restituire un risultato vuoto marcato come successo

**Perché è sbagliato:** il coordinatore crede che la ricerca sia andata a buon fine senza trovare nulla e non tenta alternative.

✅ Restituisci il **contesto di errore strutturato** (tipo di errore, query tentata, risultati parziali, alternative): il coordinatore può riprovare o procedere con quello che ha.

### Trappola 10 — Terminare l'intera pipeline perché un sottoagente è andato in timeout

**Perché è sbagliato:** butti via i risultati degli altri sottoagenti che hanno completato con successo.

✅ Il **coordinatore valuta** l'errore e decide un recupero mirato (riprovare quel ramo, usare un'alternativa, procedere con copertura parziale dichiarandola).

### Trappola 11 — Dopo aver esaurito i retry, restituire un generico "ricerca non disponibile"

**Perché è sbagliato:** un errore generico nasconde la query, i risultati parziali e le possibili alternative.

✅ Contesto di errore strutturato → recupero informato.

### Trappola 12 — Riprovare un risultato vuoto valido perché "sembra un fallimento"

**Perché è sbagliato:** la query è stata eseguita correttamente e non ci sono corrispondenze: **quella è la risposta**. Riprovando restituirà sempre zero.

✅ Accetta il risultato. (Stesso principio di D2, trappola 5.)

🔎 Distingui sempre **"non ho trovato nulla"** (successo, vuoto) da **"non sono riuscito a cercare"** (errore).

---

## 4. Esplorazione del codebase e degrado del contesto

### Trappola 13 — Aumentare la finestra di contesto per risolvere il degrado

**Perché è sbagliato:** il degrado nasce dall'**output verboso che sommerge i risultati precedenti**, non dall'esaurimento dei token. Una finestra più grande si riempie dello stesso rumore.

✅ Annota i risultati chiave in un **file scratchpad** fuori dal contesto e rimandaci l'agente quando servono.

### Trappola 14 — Pensare che i sottoagenti della fase 2 ereditino la cronologia della fase 1, oppure passare a ognuno la trascrizione completa

**Perché è sbagliato:** il sottoagente parte da un contesto isolato (non vede la cronologia del padre), e la trascrizione completa copiata in ognuno può superare il suo budget.

✅ **Riassumi i risultati chiave** della fase 1 e inserisci quel riassunto nel contesto iniziale di ogni sottoagente.

### Trappola 15 — Riavviare la sessione per il degrado senza salvare lo stato

**Perché è sbagliato:** il riavvio cancella tutta la conoscenza accumulata.

✅ Prima **persisti lo stato** (scratchpad, manifest con file analizzati, risultati, prossimi passi), poi riavvia e **inietta** quei file nella nuova sessione.

### Trappola 16 — Usare `/compact` solo quando si è al limite del contesto

**Perché è sbagliato:** a quel punto la qualità è già peggiorata.

✅ `/compact` **in modo proattivo** durante sessioni lunghe (es. tra una fase e l'altra), eventualmente con istruzioni su cosa preservare.

---

## 5. Revisione umana e calibrazione della confidenza

### Trappola 17 — Usare l'accuratezza aggregata (es. 97%) per automatizzare tutte le estrazioni ad alta confidenza

**Perché è sbagliato:** la media nasconde i segmenti deboli: 97% complessivo può voler dire 40% su un tipo di documento raro.

✅ Valida **per tipo di documento e per campo** prima di automatizzare.

🔎 Un numero aggregato molto alto in una domanda è spesso un'esca.

### Trappola 18 — Mandare a revisione umana solo le estrazioni a bassa confidenza

**Perché è sbagliato:** le estrazioni ad alta confidenza sono automatizzate e nessuno le guarda; se compare un nuovo tipo di errore che le colpisce, nessuno se ne accorge.

✅ **Campionamento casuale stratificato** anche sugli elementi ad alta confidenza.

### Trappola 19 — Usare i punteggi di confidenza grezzi senza calibrazione

**Perché è sbagliato:** lo stesso 0,90 può corrispondere a precisioni reali diverse: 94% sulle date, 82% sugli importi.

✅ **Calibra per campo su set di validazione etichettati.**

### Trappola 20 — Distribuire uniformemente la capacità dei revisori su tutte le estrazioni

**Perché è sbagliato:** si spreca tempo sugli elementi quasi sicuramente corretti.

✅ Concentra la capacità limitata sugli elementi **più incerti**, dove il giudizio umano aggiunge più valore (più il campionamento della trappola 18).

---

## 6. Provenienza delle informazioni e sintesi multi-fonte

### Trappola 21 — Con due fonti credibili in conflitto, scegliere la più recente

**Perché è sbagliato:** scegliere arbitrariamente distrugge informazione.

✅ Riporta **entrambi i valori** con **attribuzione della fonte e data di pubblicazione**; lascia decidere al destinatario.

### Trappola 22 — Considerare numeri diversi da fonti diverse una contraddizione

**Perché è sbagliato:** spesso la differenza dipende da **date diverse** di pubblicazione o di raccolta dei dati (es. dati 2024 vs 2025).

✅ Richiedi le **date negli output strutturati** dei sottoagenti, così da interpretare correttamente l'ordine temporale.

### Trappola 23 — Lasciare che l'agente di sintesi parafrasi senza conservare il legame affermazione-fonte

**Perché è sbagliato:** la sintesi comprime e riscrive la prosa; i riferimenti incorporati nel testo spariscono.

✅ I sottoagenti producono **mappe strutturate affermazione → fonte** (dati, non prosa); l'agente di sintesi le **conserva e le unisce**. (Collegato a D1, trappola 10.)

### Trappola 24 — Usare un unico formato per tutto (solo prosa, solo tabelle o solo elenchi)

**Perché è sbagliato:** appiattire peggiora leggibilità e comprensione.

✅ Formato adatto al contenuto: **tabelle** per dati finanziari e confronti, **prosa** per notizie e narrazione, **elenchi strutturati** per risultati tecnici.
