# Pre-corso · Mappa e percorso di studio

## Perché un pre-corso

La CCDV-F è un esame per chi **scrive codice**. Le domande sono scenari: una traccia, un errore, un frammento di codice, un dato d'uso. Chi non padroneggia le basi perde il filo non per Claude, ma per quello che c'è intorno: un evento di streaming letto male, un `429` trattato come errore permanente, una chiave API finita in un commit, una `Promise` non attesa.

Questo pre-corso raccoglie quelle basi e le **collega ai domini**: per ogni argomento vedi dove l'esame lo usa davvero e quale errore tipico mette alla prova. Non serve diventare esperti: serve riconoscere i concetti e sapere che cosa succede quando vanno storti.

> **Come usarlo.** Fai prima il test di ingresso qui sotto. Studia solo i moduli in cui hai dubbi, poi passa ai [domini](./studio.html?doc=domain-1). Torna al modulo giusto ogni volta che in un dominio un termine non ti è chiaro.

Per un controllo rapido del profilo di partenza c'è anche la pagina [Prerequisiti tecnici](./studio.html?doc=prerequisiti).

---

## I moduli

| Modulo | Argomento | Tempo stimato |
| --- | --- | --- |
| [PC1](./studio.html?doc=pc-typescript) | TypeScript essenziale | 3–4 ore |
| [PC2](./studio.html?doc=pc-node) | Node.js, npm e variabili d'ambiente | 2–3 ore |
| [PC3](./studio.html?doc=pc-git) | Git e flusso di lavoro | 2–3 ore |
| [PC4](./studio.html?doc=pc-http-api) | HTTP, JSON e API REST | 2–3 ore |
| [PC5](./studio.html?doc=pc-sdk) | SDK e Messages API | 3–4 ore |
| [PC6](./studio.html?doc=pc-risorse) | Dove studiare: link ufficiali | consultazione |

I tempi sono una **stima** per chi parte da zero su quell'argomento, mini-laboratorio compreso: se hai già esperienza, bastano i test di ingresso e un ripasso.

Il linguaggio degli esempi è TypeScript, come nei [domini](./studio.html?doc=domain-1). L'esame accetta anche Python: i concetti sono gli stessi e gli SDK ufficiali esistono in entrambi i linguaggi.

---

## Dove l'esame usa cosa

La tabella collega ogni modulo ai domini e alle competenze della guida in vigore dal 7 dicembre 2026 (vedi [Cosa è cambiato](./studio.html?doc=novita)).

| Dominio | Competenza | Moduli utili |
| --- | --- | --- |
| [D1 Agenti e workflow](./studio.html?doc=domain-1) | Costruzione con Agent SDK, harness e hook | PC1, PC2, PC5 |
| [D1 Agenti e workflow](./studio.html?doc=domain-1) | Diagnosi degli schemi su una traccia | PC1, PC5 |
| [D2 Applicazioni e integrazione](./studio.html?doc=domain-2) | Meccanica della Messages API, streaming, stop reason | PC4, PC5 |
| [D2 Applicazioni e integrazione](./studio.html?doc=domain-2) | Resilienza dell'integrazione (errori, retry, Files API) | PC1, PC4, PC5 |
| [D2 Applicazioni e integrazione](./studio.html?doc=domain-2) | Configurazione e integrazione nel ciclo di sviluppo | PC2, PC3 |
| [D3 Claude Code](./studio.html?doc=domain-3) | Uso, configurazione, modalità headless, estensioni | PC2, PC3 |
| [D4 Eval, test e debug](./studio.html?doc=domain-4) | Eval, golden set e diagnosi dei guasti | PC1, PC4, PC5 |
| [D5 Modelli e ottimizzazione](./studio.html?doc=domain-5) | Token, caching, costi, SDK e streaming | PC4, PC5 |
| [D6 Prompt e contesto](./studio.html?doc=domain-6) | Output strutturato e parsing difensivo | PC1, PC4 |
| [D7 Sicurezza](./studio.html?doc=domain-7) | Chiavi e credenziali, hook, privilegio minimo | PC2, PC3, PC4 |
| [D8 Strumenti e MCP](./studio.html?doc=domain-8) | Schemi degli strumenti, server MCP | PC1, PC2, PC4, PC5 |

---

## Test di ingresso

Rispondi a voce, senza cercare. Ogni "no" indica il modulo da studiare.

1. Sai spiegare la differenza tra `unknown` e `any` e perché `JSON.parse` restituisce un valore da controllare? → **PC1**
2. Sai dire che cosa fa `await` e che cosa succede se lo dimentichi? → **PC1**
3. Sai impostare una variabile d'ambiente e leggerla con `process.env`, senza scriverla nel codice? → **PC2**
4. Sai perché un server MCP che usa stdio non può scrivere con `console.log`? → **PC2**
5. Sai creare un ramo, fare un commit e annullare un commit già condiviso senza riscrivere la storia? → **PC3**
6. Sai che cosa fare se una chiave API è finita in un commit? → **PC3**
7. Sai riconoscere da un codice di stato se conviene ritentare una richiesta? → **PC4**
8. Sai che cosa sono gli header `x-api-key` e `anthropic-version`? → **PC4**
9. Sai leggere un JSON Schema con `properties`, `required` ed `enum`? → **PC4**
10. Sai scrivere una chiamata `client.messages.create` e dire perché non basta leggere `content[0]`? → **PC5**
11. Sai spiegare la differenza tra SDK client, Agent SDK e Managed Agents? → **PC5**

Se rispondi "sì" a nove domande su undici, puoi passare ai domini e usare i moduli come riferimento.

---

## Ordine consigliato

1. Test di ingresso e [vocabolario](./studio.html?doc=vocabolario).
2. I moduli in cui hai dubbi, nell'ordine PC1 → PC2 → PC4 → PC5. Il PC3 si può studiare in qualsiasi momento.
3. Il mini-laboratorio di ogni modulo: si impara scrivendo, non solo leggendo.
4. I [domini](./studio.html?doc=domain-1), con i moduli come riferimento rapido.
5. L'[allenamento](./allenamento.html) e la [simulazione](./simulazione.html).

---

## Errori tipici dei candidati, per modulo

| Errore | Modulo | Dominio dove ti punisce |
| --- | --- | --- |
| Fidarsi del tipo TypeScript anche se il dato arriva da un modello | PC1 | D6, D8 |
| Dimenticare `await` o non gestire il rifiuto di una `Promise` | PC1 | D2 |
| Scrivere la chiave API nel codice o in un file versionato | PC2, PC3 | D7 |
| Scrivere log su stdout in un server MCP stdio | PC2 | D8 |
| Ritentare un errore `400` o ignorare `retry-after` su un `429` | PC4 | D2, D4 |
| Considerare riuscita ogni risposta HTTP `200` | PC4 | D2, D4 |
| Leggere `content[0]` senza controllare il tipo del blocco | PC5 | D2 |
| Non rimandare un `tool_result` per ogni `tool_use` | PC5 | D1, D8 |
| Confondere SDK client e Agent SDK | PC5 | D1, D2 |
