# PC5 · Identità e sicurezza

Serve a: [D6](./studio.html?doc=domain-6), [D7](./studio.html?doc=domain-7).

## Identità e accesso

- **Autenticazione**: dimostrare *chi sei*.
- **Autorizzazione**: stabilire *cosa puoi fare*. Su GitHub dipende dal ruolo.
- **Fattori di autenticazione**: qualcosa che **sai** (password), che **hai** (telefono, chiave fisica), che **sei** (impronta, volto). L'autenticazione a due fattori ne combina due.
- **Phishing**: inganno per carpire credenziali con pagine o messaggi falsi. Le passkey resistono perché sono legate al sito vero.
- **Single sign-on (SSO)**: un solo accesso, gestito dall'azienda, per più servizi.
- **Provider di identità (IdP)**: il sistema aziendale che sa chi sei.

## Crittografia a chiave pubblica

È l'idea dietro le chiavi SSH, le passkey e la firma dei commit.

- Si genera una **coppia di chiavi**: una **privata**, che resta con te e non si condivide mai, e una **pubblica**, che si può dare a chiunque.
- Ciò che la chiave pubblica cifra, solo la privata può aprire; ciò che la privata *firma*, la pubblica può *verificare*.
- Per questo su GitHub carichi la chiave pubblica e tieni la privata sul tuo computer.

Un'immagine utile: la chiave pubblica è un lucchetto che puoi distribuire; la privata è l'unica chiave che lo apre.

## Segreti e token

- **Segreto**: qualunque dato che dà accesso (password, chiave di API, token, certificato). Non va **mai** scritto nel codice o in un commit: la cronologia di Git lo conserva per sempre.
- **Token di accesso**: stringa che sostituisce la password per programmi e riga di comando. Ha ambito e scadenza limitati. GitHub non accetta più la password per le operazioni Git e per le API.
- **Principio del privilegio minimo**: dare a ogni persona o programma solo i permessi necessari.

## Vulnerabilità e avvisi

- **Vulnerabilità**: difetto che può essere sfruttato per violare un sistema.
- **CVE**: numero di catalogo pubblico di una vulnerabilità nota (`CVE-2024-12345`), per parlarne senza ambiguità.
- **Advisory (bollettino di sicurezza)**: descrizione di una vulnerabilità con le versioni colpite e la correzione.
- **Patch**: aggiornamento che la corregge.
- **Divulgazione responsabile**: segnalare il problema in privato ai manutentori prima di renderlo pubblico. È lo scopo del file `SECURITY` di un repository.
- **Catena di fornitura del software (supply chain)**: l'insieme di dipendenze, strumenti e processi da cui dipende ciò che pubblichi. Attaccarne un anello compromette tutti a valle.

## Analisi del codice

- **Analisi statica**: leggere il codice senza eseguirlo per trovare difetti noti.
- **Scansione dei segreti**: cercare chiavi e token finiti per errore nel codice.

GitHub le offre come *code scanning* e *secret scanning* (vedi [D6](./studio.html?doc=domain-6)).

## Licenze

Il codice è protetto dal diritto d'autore: **senza una licenza, nessuno ha il permesso di riusarlo**. Una licenza dice cosa è permesso.

| Famiglia | Idea | Esempi |
| --- | --- | --- |
| **Permissiva** | Riusa quasi liberamente, mantenendo l'avviso di copyright | MIT, Apache 2.0, BSD |
| **Copyleft** | Le opere derivate devono restare con la stessa licenza | GPL, AGPL |
| **Proprietaria** | Uso regolato dal titolare, di solito senza accesso al sorgente | Software commerciale |

**Open source** significa che il sorgente è pubblico *e* che la licenza consente di usarlo, modificarlo e redistribuirlo. Non vuol dire "senza regole" né "senza autore".

## Per esercitarti

- Attiva la 2FA sul tuo account GitHub e prova ad aggiungere una passkey.
- Apri un repository open source e individua il file `LICENSE`: di che tipo è?
