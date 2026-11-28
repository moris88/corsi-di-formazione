# Dominio 6 · Informazioni su privacy, sicurezza e amministrazione

**Peso: 10-15%.** Se chiavi, token, vulnerabilità o licenze sono termini nuovi, leggi prima [PC5](./studio.html?doc=pc-sicurezza).

**In questa pagina**: proteggere l'account · accesso da riga di comando · ruoli dei repository · team e organizzazioni · EMU e SSO · visibilità e protezione dei rami · funzioni di sicurezza · Copilot e amministrazione · trappole d'esame.

---

## 1. Proteggere l'account

### Autenticazione a due fattori (2FA)

Oltre alla password serve un **secondo fattore**. Su GitHub: app di autenticazione (codici **TOTP**), **chiave di sicurezza** (WebAuthn), **GitHub Mobile**, e come ripiego codici **SMS**, supportati ma considerati meno sicuri e sconsigliati come metodo principale.

- Dal 2023 GitHub richiede la 2FA a **chi contribuisce con codice su GitHub.com**.
- Si conservano i **codici di ripristino**: se si perdono tutti i metodi di recupero, l'accesso all'account si perde in modo permanente.
- I proprietari di organizzazioni ed enterprise possono **imporre** la 2FA ai membri.

### Passkey

Credenziale **senza password**, basata su crittografia a chiave pubblica e protetta da biometria o PIN del dispositivo. È **resistente al phishing** e, soddisfacendo sia la password sia la 2FA, permette di accedere **in un solo passaggio**.

---

## 2. Accesso da riga di comando e API

GitHub **non accetta più la password** per le operazioni Git né per l'API. Le alternative:

| Metodo | A cosa serve |
| --- | --- |
| **Token di accesso personale (PAT)** | Sostituisce la password con HTTPS e per la API. Esistono i **fine-grained** (consigliati: limitati a repository e permessi precisi, con scadenza) e i **classic** (più ampi). |
| **Chiave SSH** | Accedere senza digitare utente e token a ogni volta; si usa anche per firmare i commit. Si genera una coppia di chiavi e si carica **quella pubblica** su GitHub. |
| **Chiave di deploy** (*deploy key*) | Chiave SSH legata a **un solo repository**, di solito per un server. |
| **`GITHUB_TOKEN`** | Token temporaneo di Actions, limitato al repository del workflow. |
| **GitHub CLI** | Accede e conserva le credenziali |
| **Commit firmati** | Firma con chiave GPG, SSH o S/MIME; i commit risultano **Verified** |

I token hanno un prefisso che indica il tipo (per esempio `ghp_` per i PAT classic, `github_pat_` per i fine-grained): è ciò che permette alla scansione dei segreti di riconoscerli.

---

## 3. Ruoli per repository e organizzazione

### Ruoli di un repository

Nei repository di un'organizzazione, **dal minore al maggiore accesso**:

| Ruolo | Indicato per | Può, tra le altre cose |
| --- | --- | --- |
| **Read** | Chi vuole consultare o discutere | Vedere, clonare, aprire issue e discussioni |
| **Triage** | Chi gestisce issue e PR senza scrivere codice | + applicare etichette, chiudere e riaprire, assegnare, richiedere revisioni |
| **Write** | Chi contribuisce attivamente | + fare push, unire pull request, creare e gestire release |
| **Maintain** | Chi gestisce il repository senza azioni sensibili | + gestire topic, wiki, impostazioni delle pull request, Pages |
| **Admin** | Chi ha pieno controllo | + cambiare visibilità, gestire accessi, regole del ramo, webhook, eliminare |

Con **Enterprise Cloud** si possono creare **ruoli personalizzati** di repository. Su un repository personale esistono solo il proprietario e i collaboratori.

> **Trappola frequente.** Il ruolo **Triage** non permette di scrivere codice; il ruolo **Maintain** non permette azioni distruttive; solo **Admin** gestisce le regole di protezione dei rami e può cambiare la visibilità.

### Ruoli di un'organizzazione

- **Proprietario (owner)**: controllo completo, compreso l'accesso admin a tutti i repository.
- **Membro**: ruolo di base; ciò che può fare dipende dalle autorizzazioni di base e dai team.
- **Responsabile della fatturazione** (*billing manager*), **responsabile della sicurezza** e altri ruoli specifici.
- **Collaboratore esterno**: persona che **non è membro** ma ha accesso a repository specifici.
- **Ruoli predefiniti a livello organizzazione**, per esempio accesso in lettura o scrittura a *tutti* i repository.

### Team

Un **team** è un gruppo di membri a cui si assegna l'accesso ai repository **in blocco**. Possono essere **annidati** (un team figlio eredita l'accesso del padre) e si menzionano con `@organizzazione/team`, per esempio come revisori.

---

## 4. Impostazioni, enterprise e identità

### Enterprise Managed Users (EMU)

Account **creati e controllati dall'azienda** tramite il suo **provider di identità**: gli utenti accedono solo con l'identità aziendale e sono **confinati** all'enterprise (non possono contribuire a repository pubblici esterni né creare contenuti fuori dall'azienda). Si usano quando l'azienda vuole il controllo completo del ciclo di vita degli account.

| | Account personale | Enterprise Managed User |
| --- | --- | --- |
| Chi lo possiede | La persona | L'azienda |
| Creazione | Dalla persona | Dal provider di identità dell'azienda |
| Contributi fuori dall'azienda | Sì | No |

### SAML SSO

Con il **single sign-on SAML** i membri si autenticano con l'identità aziendale per accedere alle risorse dell'organizzazione, mantenendo il proprio account personale.

### Politiche e impostazioni

- **Politiche Copilot**: chi può usarlo, quali funzioni e modelli sono attivi, se il coding agent è consentito, esclusione di contenuti.
- **Autorizzazioni di base** dei membri sui repository dell'organizzazione.
- **Creazione di repository**, **visibilità consentita**, **fork privati**.
- **Registro di controllo** (*audit log*): chi ha fatto cosa nell'organizzazione o enterprise.
- **Fatturazione** e **piani**.

---

## 5. Privacy del repository e protezione dei rami

### Visibilità

| Tipo | Chi lo vede |
| --- | --- |
| **Pubblico** | Chiunque |
| **Privato** | Solo chi ha l'accesso |
| **Interno** | I membri dell'enterprise |

Solo l'**admin** cambia la visibilità.

### Regole di protezione dei rami e ruleset

Impongono condizioni sui rami importanti (di solito `main`):

- richiedere una **pull request** prima del merge, con un numero minimo di **approvazioni**;
- **ignorare le approvazioni obsolete** quando arrivano nuovi commit;
- richiedere **controlli di stato** superati;
- richiedere la **risoluzione delle conversazioni**;
- richiedere **commit firmati** o una **cronologia lineare**;
- **impedire il push forzato** e l'**eliminazione** del ramo;
- limitare **chi può fare push**;
- richiedere una **coda di merge** (*merge queue*).

I **ruleset** sono l'evoluzione delle regole di protezione: si applicano a più rami, tag e repository, e si possono gestire a livello di organizzazione. Vedi la pagina [D3](./studio.html?doc=domain-3) per i metodi di merge.

---

## 6. Funzioni di sicurezza

### Disponibili con tutti i piani

| Funzione | Cosa fa |
| --- | --- |
| **Criterio di sicurezza** (`SECURITY.md`) | Dice come segnalare le vulnerabilità |
| **Avvisi di sicurezza privati** (*security advisories*) | Discutere e correggere una vulnerabilità in privato e poi pubblicarla |
| **GitHub Advisory Database** | Catalogo pubblico delle vulnerabilità note |
| **Grafo delle dipendenze** | Da cosa dipende il progetto |
| **Dependabot alerts** | Avvisa quando una dipendenza ha una vulnerabilità nota |
| **Dependabot security updates** | Apre automaticamente una PR che aggiorna la dipendenza vulnerabile |
| **Dependabot version updates** | Mantiene le dipendenze aggiornate, anche senza vulnerabilità, secondo `dependabot.yml` |
| **Push protection per gli utenti** | Impedisce di inviare per errore segreti a repository pubblici |
| **Revisione delle dipendenze** (*dependency review*) | Mostra nella PR le dipendenze che si aggiungono o cambiano |

### Funzioni avanzate

- **Secret scanning**: cerca nel repository segreti (chiavi, token) già presenti e crea avvisi. Per i repository pubblici GitHub avvisa anche i fornitori del servizio coinvolto.
- **Push protection** (repository): **blocca** il push se contiene un segreto; se qualcuno la aggira, si crea un avviso.
- **Code scanning** con **CodeQL**: cerca vulnerabilità nel codice sorgente; i risultati compaiono come avvisi, anche sulle PR.
- **GitHub Secret Protection** e **GitHub Code Security**: i prodotti a pagamento che raccolgono queste funzioni per i repository privati; alcune sono gratuite sui repository pubblici.

> **Trappola frequente.** *Dependabot alerts* **avvisano**; *security updates* **propongono la correzione** con una PR; *version updates* **mantengono aggiornato** tutto, vulnerabile o no.

> **Trappola frequente.** *Secret scanning* **rileva** i segreti; *push protection* li **blocca prima** che entrino.

---

## 7. Copilot e amministrazione

Gli amministratori decidono **chi** usa Copilot e **come**: assegnano le licenze a utenti e team, attivano o disattivano funzioni e modelli, abilitano il coding agent, definiscono l'**esclusione di contenuti** e controllano l'uso (metriche e richieste premium). Un'impresa può assegnare Business o Enterprise a singole organizzazioni. Vedi [Dominio 4](./studio.html?doc=domain-4).

---

## Trappole d'esame

- **Ruoli**: Read < Triage < Write < Maintain < Admin. Triage non scrive; Maintain non distrugge; solo Admin cambia visibilità e regole.
- **Collaboratore esterno ≠ membro**.
- **EMU** = account dell'azienda, confinato all'enterprise.
- **Password**: non più accettata per Git e API; si usano PAT o SSH.
- **Passkey**: sostituiscono password *e* 2FA.
- **Alerts / security updates / version updates**: avvisa / corregge / aggiorna.
- **Secret scanning ≠ push protection**: rileva ≠ blocca.

## Punti da ricordare

- 2FA e passkey proteggono l'account; PAT e SSH proteggono gli accessi da riga di comando.
- I ruoli vanno dal minimo (Read) al massimo (Admin): dai a ciascuno solo ciò che serve.
- Le regole di protezione del ramo garantiscono revisione e controlli prima del merge.

## Documentazione ufficiale

- [Informazioni sull'autenticazione a GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [Informazioni sulle passkey](https://docs.github.com/en/authentication/authenticating-with-a-passkey/about-passkeys)
- [Ruoli dei repository per un'organizzazione](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
- [Informazioni sui ruoli](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
- [Informazioni sui rami protetti](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Funzioni di sicurezza di GitHub](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [Informazioni su Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users)
