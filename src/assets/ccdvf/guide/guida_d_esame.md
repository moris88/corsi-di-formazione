# Claude Certified Developer — Certificazione Foundations

## Introduzione

La certificazione **Claude Certified Developer — Foundations** (codice **CCDV-F**) verifica che una persona sappia costruire, integrare e mettere in produzione, a livello fondamentale, applicazioni, agenti e workflow basati sulla piattaforma Claude di Anthropic.

È pensata per chi fa da ponte tra le capacità di Claude e le applicazioni pronte per la produzione: traduce i requisiti tecnici in sistemi funzionanti attraverso l'integrazione via API, la costruzione di agenti e strumenti, il prompt e il context engineering, la valutazione, la sicurezza e la scelta dei modelli.

Rispetto alla [CCA-F](../ccaf.html), che si concentra sulle decisioni di architettura, la CCDV-F è più vicina al codice: API, SDK, strumenti, MCP, costi e guardrail.

---

## Cosa attesta la certificazione

Chi la ottiene dimostra di saper:

- costruire agenti e workflow con il Claude Agent SDK, con framework agentici o con cicli personalizzati;
- integrare Claude nel codice applicativo tramite API e SDK, gestendo streaming, errori e input di formati diversi;
- usare Claude Code sulle varie interfacce, scrivere Skill e configurare `CLAUDE.md`, `settings.json` e plugin;
- scrivere prompt efficaci e applicare il context engineering per controllare il comportamento ed evitare la deriva del contesto;
- progettare ed eseguire eval, fare debug analizzando le tracce, validare l'output strutturato e monitorare la qualità in produzione;
- scegliere il livello di modello giusto e gestire token, caching e batch per ottimizzare costi e latenza;
- applicare principi di sicurezza fin dalla progettazione, con guardrail e hook contro prompt injection e azioni distruttive;
- creare strumenti, schemi di funzione e server MCP, valutando quando usare strumenti integrati, strumenti personalizzati, Skill o MCP.

---

## Il candidato minimo

L'esame è tarato sul **candidato minimamente qualificato**: una persona tecnica, operativa, che costruisce e rilascia applicazioni con Claude. L'esperienza consigliata è:

- da uno a cinque anni di ingegneria del software;
- almeno sei mesi di pratica con Claude o con sistemi simili basati su LLM;
- buona conoscenza di Python e/o TypeScript;
- dimestichezza con le API REST e con la riga di comando;
- comprensione di base di LLM, agenti, gestione del contesto e MCP.

Non ci sono prerequisiti obbligatori: il titolo dipende solo dal risultato dell'esame. Non è pensato per chi usa Claude solo come utente finale, né per ruoli limitati alla scrittura di prompt senza sviluppo applicativo.

Vedi anche [Prerequisiti tecnici](./studio.html?doc=prerequisiti).

---

## Formato dell'esame

| Parametro | Valore |
| --- | --- |
| Codice | **CCDV-F** |
| Numero di domande | **53** |
| Tipo di domanda | Scelta multipla e risposta multipla: ogni domanda dice quante risposte selezionare |
| Durata | **120 minuti** |
| Modalità | Con sorveglianza (online o in centro d'esame) |
| Punteggio per superare l'esame | **720** su una scala da 100 a 1000 |
| Costo | 125 USD |
| Validità | 12 mesi dalla data di rilascio |
| Esito | Superato/non superato, punteggio scalare e percentuale di risposte corrette per dominio |

Due differenze da tenere a mente rispetto ad altri esami: esistono domande a **risposta multipla** (leggi sempre quante risposte vanno scelte) e il rapporto è di circa **2 minuti e 15 secondi a domanda**.

---

## I pesi dei domini

| Dominio | Peso |
| --- | --- |
| 1. Agenti e workflow | 14,7% |
| 2. Applicazioni e integrazione | **33,1%** |
| 3. Claude Code | 3,1% |
| 4. Eval, test e debug | 2,6% |
| 5. Scelta e ottimizzazione dei modelli | 16,8% |
| 6. Prompt e context engineering | 11,0% |
| 7. Sicurezza e protezione | 8,1% |
| 8. Strumenti e MCP | 10,6% |

Il dominio 2 da solo vale un terzo dell'esame, e insieme ai domini 5 e 1 supera il 60%. Claude Code (D3) ed eval (D4) pesano poco: servono, ma non vanno studiati a scapito di API, modelli e agenti.

Ogni dominio è diviso in competenze con un peso proprio: le trovi nelle pagine dei singoli domini.

---

## Come funziona il punteggio

- La valutazione è **a criterio fisso**: contano le tue conoscenze rispetto allo standard, non il confronto con altri candidati.
- La soglia di 720 è stata fissata con uno studio formale fatto da esperti, pensando al candidato minimamente qualificato.
- Il punteggio finale decide da solo l'esito. Le percentuali per dominio servono solo a capire dove migliorare.

---

## Come prepararsi

Non esiste un corso obbligatorio, e Anthropic non garantisce che una risorsa porti al superamento. L'indicazione è di combinare pratica e studio:

1. studia il programma e valuta te stesso su ogni competenza;
2. leggi la documentazione ufficiale su API, modelli, prompt engineering, Claude Code, Skill e MCP;
3. costruisci almeno un'applicazione con Claude che usi l'API, uno o più strumenti, un minimo di prompt e context engineering e qualche pratica di sicurezza e valutazione;
4. esercitati sulle competenze da sviluppatore: prompt e istruzioni di sistema, agenti e workflow, Claude Code, gestione di token e costi, guardrail, strumenti e server MCP;
5. fai le domande di esempio per prendere confidenza con lo stile.

Su questo sito: studia i [domini](./studio.html?doc=domain-1), poi passa all'[allenamento](./allenamento.html) e infine alla [simulazione](./simulazione.html).

---

## Iscrizione e regole pratiche

- L'iscrizione e la prenotazione passano dalla **Anthropic Partner Academy** e da **Pearson VUE**, con prova online sorvegliata o in centro d'esame.
- Serve un documento d'identità valido con foto, con il nome **identico** a quello dell'iscrizione.
- Si può annullare o spostare la prova online fino a un'ora prima, quella in centro fino a 48 ore prima: oltre questi termini la quota è persa.
- Chi non supera l'esame può ripeterlo dopo un'attesa che cresce a ogni tentativo: 14 giorni dopo il primo, 30 dopo il secondo, 90 dopo il terzo. Al massimo quattro tentativi in dodici mesi, e la quota si paga ogni volta.
- I contenuti dell'esame sono riservati: prima di iniziare si accetta un accordo di riservatezza, e divulgare le domande può portare all'annullamento del risultato.
- Durante la prova non sono ammessi telefoni, smartwatch, cuffie, appunti e altri materiali, e non si può comunicare con altre persone.
- Sono previste agevolazioni per chi ha esigenze documentate, da chiedere a Pearson VUE **prima** di prenotare.

---

## Validità e rinnovo

La certificazione dura **12 mesi**, perché la tecnologia cambia in fretta. Per rinnovarla in tempo si ripassano le novità e si svolge una valutazione gratuita e senza sorveglianza sulla Partner Academy. Se la certificazione scade, bisogna rifare l'esame completo e pagare di nuovo la quota. Se i contenuti cambiano molto, Anthropic può chiedere di rifare l'intero esame.

---

## Fonti ufficiali

Questa pagina riassume la guida ufficiale (versione 1.1, novembre 2026, soggetta a modifiche senza preavviso). In caso di dubbio, fa fede il [PDF originale](../../assets/ccdvf/Claude-Certified-Developer-Foundations-Exam-Guide.pdf).
