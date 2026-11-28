# Dominio 7 · Esplorare la community di GitHub

**Peso: 5-10%.** Se open source, licenze o InnerSource sono termini nuovi, leggi prima [PC5](./studio.html?doc=pc-sicurezza) e [PC6](./studio.html?doc=pc-team-ia).

**In questa pagina**: open source · contribuire · GitHub Sponsors · seguire, stelle e Watch · Marketplace · InnerSource · fork, template e scoperta · trappole d'esame.

---

## 1. Open source

**Open source** significa che il **codice sorgente è pubblico** e la **licenza** consente di usarlo, studiarlo, modificarlo e redistribuirlo. Non è "senza regole": la licenza dice cosa si può fare e a quali condizioni.

| Famiglia | Idea | Esempi |
| --- | --- | --- |
| **Permissiva** | Riuso quasi libero, con l'avviso di copyright | MIT, Apache 2.0, BSD |
| **Copyleft** | Le opere derivate restano con la stessa licenza | GPL, AGPL |

Un repository pubblico **senza licenza non è open source**: di default nessuno può riusarlo.

### Perché GitHub è il centro dell'open source

- Ospita **repository pubblici gratuiti**, con strumenti di collaborazione, revisione e automazione.
- Offre funzioni di **sicurezza** gratuite per i repository pubblici (Dependabot, scansione dei segreti, avvisi di sicurezza).
- Mette a disposizione **GitHub Sponsors**, **Actions** e **Pages** per i progetti.
- Ha **programmi e risorse** per manutentori e nuovi contributori, come **GitHub Skills** e le *Open Source Guides*.

---

## 2. Contribuire a un progetto

Un flusso tipico per contribuire a un progetto di cui non sei manutentore:

1. **Leggi** README, `CONTRIBUTING` e codice di condotta.
2. **Cerca** un'issue adatta, per esempio con l'etichetta `good first issue` o `help wanted`.
3. **Fai il fork** del repository.
4. **Crea un ramo** nel tuo fork e fai le modifiche.
5. **Apri una pull request** verso il progetto originale, descrivendo cosa e perché.
6. **Rispondi ai commenti** dei manutentori.

Contribuire non significa solo codice: anche **documentazione**, **traduzioni**, **segnalazione di errori**, **risposte** nelle discussioni.

I **manutentori** curano il progetto, decidono cosa entra e gestiscono la community; i **contributori** propongono modifiche.

---

## 3. GitHub Sponsors

**GitHub Sponsors** permette di **sostenere economicamente** chi sviluppa e mantiene progetti open source.

- Si può contribuire con importi **mensili** o **una tantum**.
- Sponsorizzare può farlo una persona o un'organizzazione; riceverlo, uno sviluppatore o un'organizzazione che aderisce al programma.
- Il pulsante **Sponsor** compare nel repository se si configura un file `FUNDING.yml` e nel profilo di chi aderisce.
- Gli sponsor possono ricevere **riconoscimenti** (badge, menzioni) o vantaggi stabiliti dal manutentore.

---

## 4. Seguire, stelle e Watch

Tre azioni diverse, spesso confuse:

| Azione | Riguarda | Effetto |
| --- | --- | --- |
| **Follow** (segui) | Una **persona** o un'**organizzazione** | Vedi le loro attività nel tuo feed (nuovi repository, stelle, rilasci) |
| **Star** (stella) | Un **repository** | Lo salvi tra i preferiti e segnali apprezzamento; aiuta la scoperta |
| **Watch** (osserva) | Un **repository** | Ricevi **notifiche** sulle sue attività, al livello scelto |

> **Trappola frequente.** Follow riguarda *persone e organizzazioni*; Star e Watch riguardano *repository*. Solo Watch genera notifiche sull'attività del repository.

Per scoprire progetti: la pagina **Explore**, i **topic**, i **trending** e la ricerca.

---

## 5. GitHub Marketplace

Il **Marketplace** è il catalogo dove trovare e installare **app** e **Actions** per estendere GitHub: integrazioni di CI/CD, sicurezza, qualità del codice, gestione dei progetti. Ci sono offerte **gratuite** e **a pagamento**. Chi crea un'app o una action può pubblicarla.

- **App** si installano in un account o in un'organizzazione con permessi precisi.
- **Actions** si usano nei workflow ([Dominio 4](./studio.html?doc=domain-4)).
- Alcuni piani passano dal Marketplace e sono fatturati tramite GitHub.

---

## 6. InnerSource

**InnerSource** applica **all'interno di un'azienda** i metodi dell'open source: codice visibile e riusabile tra team, **contributi tramite pull request**, documentazione chiara, discussioni aperte, revisione trasparente.

- Il codice **non è pubblico**: sta in repository **interni** o privati.
- Riduce i silos e la duplicazione tra team.
- Chi gestisce il codice agisce da manutentore e accoglie contributi di colleghi di altri team.
- Richiede `README`, `CONTRIBUTING` e buone pratiche di accoglienza anche dentro l'azienda.

> **Trappola frequente.** InnerSource **non** significa open source: lo spirito è lo stesso, ma il codice resta dentro l'organizzazione.

---

## 7. Fork, template e repository facili da trovare

| Strumento | Quando usarlo |
| --- | --- |
| **Fork** | Per contribuire a un progetto su cui non hai accesso in scrittura, o per partire da una copia che puoi modificare liberamente. Mantiene il legame con l'originale. |
| **Template** | Per partire da una struttura pronta; non porta la cronologia né il legame con l'originale. |
| **Repository facile da trovare** | README chiaro, descrizione, **topic**, licenza e segnali di salute (Community Standards) lo rendono visibile e accogliente. |

Per favorire la collaborazione: etichette `good first issue`, `CONTRIBUTING`, **codice di condotta**, modelli di issue e PR, **Discussions** attive, risposte rapide.

---

## Trappole d'esame

- **Follow** → persone e organizzazioni. **Star** → repository, salvataggio. **Watch** → repository, notifiche.
- **Open source** richiede una **licenza** che consenta il riuso; **InnerSource** resta interno.
- **Fork** mantiene il legame con l'originale; **template** no.
- **Sponsors** sostiene economicamente; non è un servizio di donazione generica a un repository.
- Il **Marketplace** distribuisce app e Actions.

## Punti da ricordare

- Open source = sorgente pubblico + licenza che consente il riuso.
- Per contribuire: fork, ramo, pull request.
- InnerSource porta i metodi dell'open source dentro l'azienda.

## Documentazione ufficiale

- [Informazioni su GitHub Sponsors](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors)
- [Seguire le persone](https://docs.github.com/en/account-and-profile/how-tos/follow-people)
- [Salvare i repository con le stelle](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars)
- [Informazioni su GitHub Marketplace](https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/about-github-marketplace-for-apps)
- [Informazioni sui fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)
- [Guide all'open source](https://opensource.guide/it/)
- [Introduzione a InnerSource](https://resources.github.com/enterprise/innersource/)
