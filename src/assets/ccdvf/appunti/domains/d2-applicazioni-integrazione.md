# Dominio 2: applicazioni e integrazione (33,1%)

È il dominio più pesante: da solo vale un terzo dell'esame. Copre l'uso dell'API, le basi di ingegneria del software, la progettazione delle applicazioni Claude e la gestione della configurazione.

| Competenza | Peso sull'esame |
| --- | --- |
| Comprendere i requisiti | 3,4% |
| Ciclo di vita dei sistemi | 2,8% |
| Funzionamento della Claude API | 6,8% |
| Basi di ingegneria del software | 7,4% |
| Progettazione di applicazioni Claude | 8,6% |
| Gestione della configurazione | 4,1% |

---

## 2.1 Comprendere i requisiti (3,4%)

- Ricavare i requisiti **funzionali e infrastrutturali** a partire dalle esigenze di business e dall'architettura della soluzione.

## 2.2 Ciclo di vita dei sistemi (2,8%)

- Conoscere i concetti e i modelli di gestione del ciclo di vita con cui si sviluppano, rilasciano, gestiscono e mantengono i sistemi informatici.

## 2.3 Funzionamento della Claude API (6,8%)

Che cosa devi saper fare:

- usare i **messaggi**, gli **strumenti**, lo **streaming**, la **visione** e il **ragionamento esteso**;
- applicare il **caching** del prompt;
- invocare Claude tramite **fornitori terzi**;
- conoscere i modelli di accesso ai dati dell'API Messages;
- usare la **Batch API** e saper scegliere tra elaborazione **in tempo reale** e **a lotti**.

Regola pratica: un lavoro grande, non urgente e sensibile al costo va nella Batch API; una risposta che serve subito a un utente va in tempo reale.

## 2.4 Basi di ingegneria del software (7,4%)

- **API REST** e **JSON**, **programmazione asincrona**, **controllo di versione**;
- integrazione nel ciclo di sviluppo, **revisione del codice**, refactoring di piccola e grande scala.

## 2.5 Progettazione di applicazioni Claude (8,6%)

- Come Claude interpreta le istruzioni nelle diverse interfacce: **Claude Code, Desktop, claude.ai, API, SDK**;
- confini dei contenuti, **progettazione degli schemi**, igiene delle sessioni, gestione dei plugin.

## 2.6 Gestione della configurazione (4,1%)

- File **CLAUDE.md** e **settings.json**;
- **versioni fissate dei modelli** (model pinning) e **versioni dei prompt**;
- dipendenze dei plugin.

---

## Ripasso rapido

- Costo basso e nessuna fretta: Batch API. Latenza bassa: chiamate in tempo reale.
- Fissa la versione del modello e versiona i prompt: sono parte della configurazione.
- Una stessa istruzione può comportarsi in modo diverso a seconda dell'interfaccia: verifica dove viene letta.

Vedi anche: [Scelta e ottimizzazione dei modelli](./studio.html?doc=domain-5) per caching e costi.
