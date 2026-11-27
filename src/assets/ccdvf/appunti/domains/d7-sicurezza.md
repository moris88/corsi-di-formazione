# Dominio 7: sicurezza e protezione (8,1%)

Come si proteggono le applicazioni Claude da abusi, perdite di dati e azioni distruttive.

| Competenza | Peso sull'esame |
| --- | --- |
| Sicurezza delle applicazioni di IA | 3,2% |
| Guardrail e distribuzione sicura | 2,3% |
| Hook di Claude | 1,0% |
| Identità, segreti e chiavi | 1,6% |

---

## 7.1 Sicurezza delle applicazioni di IA (3,2%)

- Privacy e sicurezza dei dati, **consapevolezza e mitigazione della prompt injection**, difesa dai **jailbreak**;
- **trattamento dell'input non fidato**, prevenzione della **fuga di dati**, gestione dei **dati personali (PII)**;
- autenticazione, autorizzazione, riservatezza, privacy e integrità.

## 7.2 Guardrail e distribuzione sicura (2,3%)

- Pratiche di distribuzione sicura e responsabile: **politiche sui contenuti**, **guardrail a più livelli**;
- principi di **sicurezza fin dalla progettazione**: privacy, gestione di identità e accessi, **privilegio minimo**.

## 7.3 Hook di Claude (1,0%)

- Usare gli **hook** come guardrail e controlli di sicurezza per impedire azioni distruttive.

## 7.4 Identità, segreti e chiavi (1,6%)

- Gestire **segreti, credenziali e chiavi API** in sviluppo e in produzione;
- **verifica dell'identità** e autenticazione, **approvazione e verifica del livello di accesso**, **monitoraggio degli accessi** autorizzati.

---

## Ripasso rapido

- Il contenuto recuperato da fonti esterne è **non fidato**: va tenuto separato dalle istruzioni fidate.
- Un controllo applicato dal codice (hook, permessi) vale più di una richiesta scritta nel prompt.
- Le chiavi non vanno mai nel codice né nel prompt.
- Con il privilegio minimo, anche un'istruzione iniettata riesce a fare poco.

Vedi anche: [Strumenti e MCP](./studio.html?doc=domain-8) per i permessi degli strumenti e le approvazioni.
