# Claude Certified Developer — Certificazione Foundations

## Introduzione

La certificazione **Claude Certified Developer — Foundations** (codice **CCDV-F**) verifica che una persona sappia costruire e consegnare applicazioni, agenti e workflow di livello produttivo con Claude.

È pensata per sviluppatori operativi: integrano Claude nelle applicazioni con la Messages API e gli SDK, costruiscono agenti e workflow con il Claude Agent SDK e usano Claude Code per modernizzare ed estendere le basi di codice. Sanno anche progettare prompt e contesto, creare strumenti e server MCP, scegliere i modelli e gestire i token, valutare e fare debug dei guasti e applicare la sicurezza fin dalla progettazione.

> **Guida aggiornata.** Questa pagina segue la versione in vigore dal 7 dicembre 2026. Trovi tutte le differenze rispetto alla precedente in [Cosa è cambiato](./studio.html?doc=novita).

Rispetto alla [CCA-F](../ccaf.html), che si concentra sulle decisioni di architettura, la CCDV-F è più vicina al codice: API, SDK, strumenti, MCP, costi e guardrail.

---

## Cosa attesta la certificazione

Chi la ottiene dimostra di saper:

- scegliere tra architettura a workflow e agentica e costruire agenti con il Claude Agent SDK, harness e hook che impongono le azioni obbligatorie;
- integrare Claude con la Messages API e gli SDK, compresi strumenti, streaming, output strutturato, prompt caching, batch e gestione resiliente degli errori;
- usare ed estendere Claude Code, con precedenza della configurazione, modalità di permessi, Skill, plugin, hook e subagenti;
- costruire valutazioni, con giudici LLM tarati e golden set, e diagnosticare i guasti dalle tracce;
- scegliere il livello di modello e le opzioni di pensiero e ottimizzare costi e latenza con caching, batch e budget di token;
- progettare prompt e contesto per controllare il comportamento, evitare la deriva, rendere robusto il parsing dell'output e ancorare le risposte ai documenti forniti;
- difendersi dalla prompt injection con guardrail deterministici a più livelli, privilegio minimo e gestione corretta delle credenziali;
- creare strumenti e server MCP e scegliere il meccanismo giusto tra strumenti integrati, strumenti personalizzati, Skill e MCP.

---

## A chi è rivolta

L'esame si rivolge a ingegneri del software e AI/ML, sviluppatori full-stack e backend e solution engineer, in settori come sanità, retail, tecnologia, fintech e SaaS aziendale. Chi lo affronta costruisce, integra e rilascia: traduce i requisiti tecnici in applicazioni funzionanti con Claude, lavora con Claude Developer Platform (Messages API, Agent SDK, Managed Agents), con Claude Code su CLI, desktop, IDE, web e mobile e con MCP, in basi di codice di produzione, pipeline CI/CD con Git e GitHub Actions e contesti aziendali con politiche IT restrittive. L'esperienza tipica è:

- da uno a cinque anni di ingegneria del software;
- almeno sei mesi di pratica con Claude o con sistemi simili basati su LLM;
- buona conoscenza di Python e/o TypeScript;
- dimestichezza con le API REST e con la riga di comando;
- comprensione di base di LLM, agenti, gestione del contesto e MCP.

Non ci sono prerequisiti obbligatori: il titolo dipende solo dal risultato dell'esame.

Vedi anche [Prerequisiti tecnici](./studio.html?doc=prerequisiti).

---

## Formato dell'esame

| Parametro | Valore |
| --- | --- |
| Codice | **CCDV-F** |
| Numero di domande | **70**, di cui 60 valutate e 10 non valutate (non identificabili, non influiscono sul punteggio) |
| Tipo di domanda | Domande a scenario a scelta multipla: ogni domanda dice quante risposte selezionare |
| Durata | **120 minuti** |
| Modalità | Con sorveglianza (online o in centro d'esame) |
| Punteggio per superare l'esame | **720** su una scala da 100 a 1000 |
| Costo | 125 USD |
| Validità | 12 mesi dalla data di rilascio |
| Esito | Superato/non superato, punteggio scalare e percentuale di risposte corrette per dominio |

Due cose da tenere a mente: leggi sempre **quante risposte vanno scelte** e ricorda che il ritmo è di circa **1 minuto e 43 secondi a domanda**. Dieci domande su 70 non contano, ma non si riconoscono: affrontale tutte con la stessa cura.

---

## I pesi dei domini

| Dominio | Peso |
| --- | --- |
| 1. Agenti e workflow | 17% |
| 2. Applicazioni e integrazione | **20%** |
| 3. Claude Code | 8% |
| 4. Eval, test e debug | 10% |
| 5. Scelta e ottimizzazione dei modelli | 12% |
| 6. Prompt e context engineering | 15% |
| 7. Sicurezza e protezione | 8% |
| 8. Strumenti e MCP | 10% |

Il dominio 2 resta il più pesante (20%), seguito da agenti (17%) e prompt e context engineering (15%): insieme valgono il 52%. Nessun dominio si può trascurare: Claude Code (8%) ed eval (10%) pesano ora molto più di prima.

Ogni dominio è diviso in competenze, ora senza una percentuale propria. Le differenze rispetto alla versione precedente sono in [Cosa è cambiato](./studio.html?doc=novita).

---

## Come funziona il punteggio

- La valutazione è **a criterio fisso**: contano le tue conoscenze rispetto allo standard, non il confronto con altri candidati.
- Ogni prova comprende alcune domande **non valutate**, mescolate a quelle valutate e non riconoscibili: non contano per il punteggio.
- La soglia di 720 è stata fissata con uno studio formale fatto da esperti, pensando al candidato minimamente qualificato.
- Il punteggio finale decide da solo l'esito. Le percentuali per dominio servono solo a capire dove migliorare.

---

## Come prepararsi

Non esiste un corso obbligatorio, e Anthropic non garantisce che una risorsa porti al superamento. L'indicazione è di combinare pratica e studio:

1. studia il programma e valuta te stesso su ogni competenza;
2. leggi la documentazione ufficiale su Claude Developer Platform (Messages API, Claude Agent SDK, Managed Agents), Claude Code (Skill, plugin, file Rules, hook, subagenti) e MCP, comprese le differenze tra API di Anthropic e piattaforme cloud;
3. costruisci e rilascia almeno un agente o workflow con strumenti, con l'Agent SDK o un harness tuo, che includa strumenti personalizzati o un server MCP, output strutturato, prompt caching, una valutazione su un golden set e guardrail deterministici;
4. esercitati sulle competenze: scegliere tra workflow e agenti, leggere e scrivere interazioni corrette con la Messages API, diagnosticare guasti da tracce ed errori, tarare un giudice LLM su etichette umane, posizionare i punti di cache, rivedere un prompt che fallisce, ancorare le risposte ai documenti e scegliere il meccanismo giusto tra strumenti, Skill e MCP;
5. fai le domande di esempio per prendere confidenza con lo stile.

Su questo sito: se ti mancano le basi tecniche parti dal [pre-corso](./studio.html?doc=precorso), poi studia i [domini](./studio.html?doc=domain-1), poi passa all'[allenamento](./allenamento.html) e infine alla [simulazione](./simulazione.html).

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

Questa pagina riassume la guida ufficiale (versione 1.1, in vigore dal 7 dicembre 2026, soggetta a modifiche senza preavviso). In caso di dubbio, fa fede il [PDF originale](../../assets/ccdvf/Claude-Certified-Developer-Foundations-Exam-Guide.pdf).
