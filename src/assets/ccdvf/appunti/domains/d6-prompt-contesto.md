# Dominio 6: prompt e context engineering (11,0%)

Come si scrivono le istruzioni, come si governa il contesto e come si usa l'output del modello.

| Competenza | Peso sull'esame |
| --- | --- |
| Context engineering | 3,8% |
| Prompt engineering | 4,6% |
| Gestione dell'output | 2,6% |

---

## 6.1 Context engineering (3,8%)

- Gestire il contesto e la memoria: **finestra di contesto**, prevenzione di **deriva e gonfiamento** (potatura dell'output degli strumenti, compaction);
- **isolare il contesto** con sottoagenti o con workflow a più passi.

## 6.2 Prompt engineering (4,6%)

- **Chiarezza delle istruzioni**, **esempi few-shot**, differenza tra prompt di **sistema** e dell'**utente**;
- **vincoli sull'output**, dove mettere le istruzioni tra i vari componenti;
- **raffinamento iterativo**, adattamento del prompt, **sanificazione dell'input**.

## 6.3 Gestione dell'output (2,6%)

- Schemi per produrre, validare e usare l'output: **output strutturato**, **validazione della risposta**, **parsing difensivo**;
- **scetticismo verso gli output troppo sicuri**: una risposta sicura di sé non è per questo corretta.

---

## Ripasso rapido

- Più contesto non è sempre meglio: ciò che non serve più va tolto o riassunto.
- Valida sempre l'output prima di usarlo a valle.
- Gli esempi sono spesso il modo più efficace per chiarire il formato atteso.

Vedi anche: [Sicurezza e protezione](./studio.html?doc=domain-7) per la sanificazione dell'input non fidato.
