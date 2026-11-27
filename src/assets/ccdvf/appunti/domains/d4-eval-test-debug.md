# Dominio 4: eval, test e debug (2,6%)

Il dominio con il peso più basso. Riguarda come si capisce che cosa non funziona in un'applicazione Claude.

| Competenza | Peso sull'esame |
| --- | --- |
| Debug e gestione degli errori | 2,6% |

---

## 4.1 Debug e gestione degli errori (2,6%)

Che cosa devi saper fare:

- **riconoscere il tipo di errore** che hai davanti;
- scegliere la **strategia di recupero** adatta;
- **analizzare le tracce** per capire in che modo fallisce l'applicazione;
- **isolare l'origine del problema**: il livello di integrazione (il tuo codice) oppure l'output del modello.

Domande da farsi:

- L'errore arriva dall'API (limiti, richieste non valide, sovraccarico) o dalla risposta del modello (formato sbagliato, contenuto errato)?
- Un nuovo tentativo ha senso, o si ripeterebbe lo stesso errore?
- La traccia mostra in quale passo la risposta ha preso la direzione sbagliata?

---

## Ripasso rapido

- Prima isola l'origine (integrazione o modello), poi scegli la correzione.
- Non tutti gli errori si risolvono riprovando.
- Anche se il dominio pesa poco, eval e validazione dell'output ricompaiono nelle competenze di altri domini, in particolare il [dominio 6](./studio.html?doc=domain-6).
