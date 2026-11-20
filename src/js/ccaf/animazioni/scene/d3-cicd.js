// D3: Claude Code dentro una pipeline CI/CD. Senza -p aspetta una persona, con -p lavora da solo
const SENZA_P = ['claude "Rivedi la pull request"'];
const CON_P = ['claude -p "Rivedi la PR: solo bug e sicurezza"'];
const LIMITI = [...CON_P, { t: "--max-turns 10", s: "accent" }, { t: '--allowedTools "Bash(npm test)"', s: "accent" }];
const COMPLETO = [
  ...CON_P,
  "--max-turns 10",
  '--allowedTools "Bash(npm test)"',
  { t: "--output-format json", s: "accent" },
];

export const d3Cicd = {
  id: "cicd",
  title: "Claude Code nella pipeline CI/CD",
  summary: "Senza nessuno davanti allo schermo: il flag -p",
  actors: [
    { id: "pipeline", kind: "zone", label: "Pipeline CI/CD · automatica", at: [65, 54], w: 58, h: 88 },
    { id: "dev", kind: "node", tone: "person", icon: "☺", label: "Sviluppatore", at: [9, 30] },
    { id: "pr", kind: "node", icon: "‹›", label: "Pull request", at: [24, 62] },
    { id: "cmd", kind: "card", tone: "terminal", label: "Comando nella pipeline", at: [65, 31], w: 50, show: false },
    { id: "claude", kind: "node", tone: "claude", icon: "✳", label: "Claude Code", at: [52, 66] },
    { id: "bot", kind: "node", icon: "⚙", label: "Passo successivo", at: [84, 66] },
    { id: "dp", kind: "link", from: "dev", to: "pr" },
    { id: "pc", kind: "link", from: "pr", to: "claude" },
    { id: "cb", kind: "link", from: "claude", to: "bot" },
    { id: "m", kind: "token", at: "dev" },
  ],
  steps: [
    {
      text: "La CI/CD è il sistema automatico che controlla e pubblica il codice ogni volta che cambia. Uno sviluppatore apre una pull request, cioè una proposta di modifica.",
      set: {
        dev: { state: "active" },
        dp: { state: "active" },
        m: { show: true, text: "nuova pull request", from: "dev", at: "pr" },
      },
    },
    {
      text: "La pipeline parte da sola e lancia Claude Code per rivedere le modifiche. Ma qui non c'è nessuno davanti allo schermo.",
      set: {
        dev: { state: "" },
        dp: { state: "" },
        pc: { state: "active" },
        claude: { state: "active" },
        m: { text: "modifiche da rivedere", from: "pr", at: "claude" },
      },
    },
    {
      text: "Senza il flag -p, Claude Code lavora come al terminale: fa una domanda e aspetta una risposta che non arriverà mai. La pipeline resta bloccata.",
      set: {
        pc: { state: "" },
        cmd: { show: true, state: "error", lines: SENZA_P },
        claude: { state: "warn", note: "in attesa di risposta…" },
        m: { text: "Procedo? (sì / no)", state: "warn" },
      },
    },
    {
      text: "Con -p (print) lavora senza fare domande: è come una lettera invece di una telefonata. Legge, rivede e restituisce il risultato da solo.",
      set: {
        m: { show: false, state: "" },
        cmd: { state: "ok", lines: CON_P },
        claude: { state: "thinking", note: "-p · nessuna domanda" },
      },
    },
    {
      text: "Si aggiungono limiti di sicurezza: un numero massimo di passaggi (--max-turns) e solo i comandi approvati in anticipo (--allowedTools).",
      set: { cmd: { state: "active", lines: LIMITI }, claude: { note: "dentro i limiti" } },
    },
    {
      text: "Il risultato esce in JSON (--output-format json), perché a leggerlo è un programma: il passo successivo, che pubblica i commenti sulla pull request.",
      set: {
        cmd: { lines: COMPLETO },
        claude: { state: "ok", note: "" },
        cb: { state: "active" },
        bot: { state: "active" },
        m: { show: true, text: '{ "problemi": [ … ] }', from: "claude", at: "bot" },
      },
    },
    {
      text: "I commenti arrivano allo sviluppatore. Se lui aspetta la revisione per unire la modifica serve una risposta subito; per un report notturno basta il Batch, che costa la metà.",
      set: {
        cb: { state: "" },
        bot: { state: "ok" },
        dev: { state: "ok" },
        m: { text: "2 commenti sulla PR", state: "ok", from: "bot", at: "dev" },
      },
    },
    {
      text: "Ultimo accorgimento: la revisione va fatta in una sessione separata da quella che ha scritto il codice, che tenderebbe a difendere le proprie scelte.",
      set: { m: { show: false }, claude: { note: "sessione separata" }, cmd: { state: "" } },
    },
  ],
};
