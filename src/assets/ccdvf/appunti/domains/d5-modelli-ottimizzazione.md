# Dominio 5: scelta e ottimizzazione dei modelli (16,8%)

Dalla comprensione di come funziona un LLM alla scelta del modello giusto, fino al controllo di costi e token.

| Competenza | Peso sull'esame |
| --- | --- |
| Fondamenti degli LLM | 5,2% |
| Fondamenti tecnici | 6,1% |
| Scelta del modello e compromessi | 2,7% |
| Gestione di costi e token | 2,8% |

---

## 5.1 Fondamenti degli LLM (5,2%)

- **Token, finestra di contesto, campionamento, non determinismo, generazione del token successivo**;
- le opzioni del modello: **modalità veloce, extended thinking, adaptive thinking, livelli di effort**;
- le tecniche di prompting di base: **zero-shot, single-shot, multi-shot**.

## 5.2 Fondamenti tecnici (6,1%)

- Le pratiche di ingegneria su cui poggiano le applicazioni: integrare **SDK che incapsulano API REST** e usare **websocket**.

## 5.3 Scelta del modello e compromessi (2,7%)

- Che cosa sanno fare **Opus, Sonnet e Haiku** e per quali casi d'uso si scelgono;
- il supporto dell'**adaptive thinking**;
- i compromessi tra **qualità, latenza e costo**;
- i **cambiamenti di comportamento** tra un rilascio e l'altro, che possono rompere un'applicazione quando si cambia modello.

## 5.4 Gestione di costi e token (2,8%)

- **Budget di token** e **gestione dei costi**;
- **tracciamento dell'uso dei token**, **modello dei costi**;
- **prompt caching** e **cache check-pointing**.

---

## Ripasso rapido

- Il modello migliore non è sempre quello più grande: conta il compromesso tra qualità, latenza e costo.
- Prima di cambiare modello, verifica il comportamento sulla tua applicazione.
- Le parti stabili del prompt vanno all'inizio, così la cache le riusa.

Vedi anche: [Applicazioni e integrazione](./studio.html?doc=domain-2) per la Batch API e la fissazione delle versioni.
