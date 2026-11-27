# Dominio 8: strumenti e MCP (10,6%)

Come si definiscono gli strumenti, come si costruiscono server MCP e come si sceglie tra le diverse forme di estensione.

| Competenza | Peso sull'esame |
| --- | --- |
| Realizzazione degli strumenti | 4,4% |
| Sviluppo di server MCP | 2,1% |
| Personalizzazione degli agenti | 4,1% |

---

## 8.1 Realizzazione degli strumenti (4,4%)

- **Tool use e function calling**, configurazione per interagire con sistemi esterni;
- **scrittura delle descrizioni** degli strumenti e **gestione degli errori**;
- modelli d'uso: **dispatch nell'harness**, strumenti **lato client e lato server**, **approvazioni**;
- buone pratiche per costruire un **insieme di strumenti**.

## 8.2 Sviluppo di server MCP (2,1%)

- **Scrittura e distribuzione** di un server, integrazione con le applicazioni Claude;
- **risorse, strumenti e prompt** MCP;
- modelli di comunicazione: **stdio, socket**, ruoli di client e server.

## 8.3 Personalizzazione degli agenti (4,1%)

- Valutare i compromessi tra **strumenti integrati, strumenti personalizzati, Skill e MCP** e scegliere l'approccio giusto per il caso d'uso.

---

## Ripasso rapido

- La descrizione è il criterio con cui Claude sceglie lo strumento: scrivila con cura.
- Una capacità che deve servire a più applicazioni e vivere in modo indipendente va esposta con un **server MCP**.
- Gli strumenti integrati non raggiungono da soli qualsiasi servizio interno.

Vedi anche: [Agenti e workflow](./studio.html?doc=domain-1) e [Sicurezza e protezione](./studio.html?doc=domain-7).
