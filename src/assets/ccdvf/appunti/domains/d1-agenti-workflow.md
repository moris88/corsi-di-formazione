# Dominio 1: agenti e workflow (14,7%)

Questo dominio riguarda come si progettano e si costruiscono agenti e workflow con Claude: quando usare l'uno o l'altro, con quali strumenti, secondo quali schemi.

| Competenza | Peso sull'esame |
| --- | --- |
| Architettura degli agenti | 4,5% |
| Costruzione di agenti con Claude | 5,3% |
| Schemi e framework per agenti | 4,9% |

---

## 1.1 Architettura degli agenti (4,5%)

Che cosa devi saper fare:

- scegliere tra **workflow** e **agente** con criteri chiari: un workflow ha un percorso deciso dal codice, un agente decide i passi da solo;
- descrivere una gerarchia **manager/supervisore** e i compromessi che comporta;
- spiegare a che cosa servono i **sottoagenti** per eseguire meglio un compito.

Domande da farsi:

- Il percorso è noto in anticipo? Allora un workflow è più prevedibile, più economico e più facile da testare.
- Il compito richiede di adattarsi a ciò che si scopre strada facendo? Allora serve un agente.
- Un sottoagente ha un contesto separato: che cosa guadagno (isolamento, parallelismo) e che cosa perdo (informazioni da passare esplicitamente)?

## 1.2 Costruzione di agenti con Claude (5,3%)

Che cosa devi saper fare:

- usare il **Claude Agent SDK** per costruire un agente;
- scrivere un **ciclo e un harness personalizzati** quando l'SDK non basta;
- distinguere i modelli di distribuzione degli agenti **gestiti**: ospitati da te (self-hosted) oppure da Anthropic;
- usare gli **hook** per azioni deterministiche, cioè che non dipendono dal modello.

## 1.3 Schemi e framework per agenti (4,9%)

Che cosa devi saper fare:

- riconoscere gli schemi ricorrenti: **ciclo di uso degli strumenti**, sottoagenti, memoria, gestione della finestra di contesto;
- conoscere a grandi linee i framework di astrazione per agenti (per esempio **Strands, LangGraph, PydanticAI**) e sapere perché si sceglierebbe uno di essi per compiti a più passi.

---

## Ripasso rapido

- Una regola che deve valere **sempre** va imposta dal codice (hook), non chiesta nel prompt.
- Un workflow è la scelta di partenza; si passa a un agente quando serve davvero autonomia.
- Più agenti non significa migliore: ogni passaggio di contesto è un punto in cui si perdono informazioni.

Vedi anche: [Strumenti e MCP](./studio.html?doc=domain-8) e [Prompt e context engineering](./studio.html?doc=domain-6).
