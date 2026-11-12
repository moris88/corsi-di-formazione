// Lettura della banca quesiti in Markdown (frontmatter, scenari, domande, risposte e spiegazioni)
import { DEFAULT_DURATION_MINUTES } from "./state.js";

export function parseQuestionBank(markdown) {
  const source = String(markdown)
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "");
  const frontmatterMatch = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  let body = source;
  let title = "";
  let durationMinutes = DEFAULT_DURATION_MINUTES;

  if (frontmatterMatch) {
    body = source.slice(frontmatterMatch[0].length);
    const titleMatch = frontmatterMatch[1].match(/^title:\s*(.*?)\s*$/im);
    const durationMatch = frontmatterMatch[1].match(/^duration_minutes:\s*(.*?)\s*$/im);
    if (titleMatch) {
      title = titleMatch[1].replace(/^(["'])(.*)\1$/, "$2").trim();
    }
    if (durationMatch) {
      const value = durationMatch[1].replace(/^(["'])(.*)\1$/, "$2").trim();
      durationMinutes = Number(value);
      if (!Number.isSafeInteger(durationMinutes) || durationMinutes < 1) {
        throw new Error("duration_minutes deve essere un numero intero maggiore di zero.");
      }
    }
  }
  const difficulty = frontmatterMatch?.[1].match(/^difficulty:\s*["']?(\w+)["']?\s*$/im)?.[1].toLowerCase() || "";
  if (!title) title = body.match(/^#\s+(.+)$/m)?.[1].trim() || "Simulazione personalizzata";

  const lines = body.split("\n");
  const parsed = [];
  let scenario = "Scenario generale";
  let current = null;
  let phase = "";

  function finishQuestion() {
    if (!current) return;
    const prompt = current.promptLines.join("\n").trim();
    const explanation = current.explanationLines.join("\n").trim();
    if (!prompt || current.options.length !== 4 || !current.correctLetter) {
      throw new Error(
        `Formato non valido alla domanda ${current.id}: servono testo, quattro opzioni e risposta corretta.`,
      );
    }
    if (!current.options.some((option) => option.letter === current.correctLetter)) {
      throw new Error(`La risposta corretta indicata alla domanda ${current.id} non corrisponde a un’opzione.`);
    }
    const optionLetters = new Set(current.options.map((option) => option.letter));
    if (optionLetters.size !== 4 || !["A", "B", "C", "D"].every((letter) => optionLetters.has(letter))) {
      throw new Error(`La domanda ${current.id} deve avere una sola opzione per ciascuna lettera A, B, C e D.`);
    }
    parsed.push({
      id: Number(current.id),
      scenario,
      prompt,
      options: current.options,
      correctLetter: current.correctLetter,
      explanation,
    });
    current = null;
    phase = "";
  }

  for (const line of lines) {
    const scenarioMatch = line.match(/^##\s+Scenario:\s*(.+)$/i);
    if (scenarioMatch) {
      finishQuestion();
      scenario = scenarioMatch[1].trim();
      continue;
    }
    const questionMatch = line.match(/^###\s+(?:Domanda|Question)\s+(\d+)\s*$/i);
    if (questionMatch) {
      finishQuestion();
      current = {
        id: questionMatch[1],
        promptLines: [],
        options: [],
        correctLetter: "",
        explanationLines: [],
      };
      phase = "prompt";
      continue;
    }
    if (!current) continue;
    const answerMatch = line.match(
      /^####\s+(?:Risposta corretta|Correct answer)(?:\s+(?:alla domanda|to question)\s+(\d+))?:\s*([A-D])\s*$/i,
    );
    if (answerMatch) {
      if (answerMatch[1] && Number(answerMatch[1]) !== Number(current.id)) {
        throw new Error(`La riga della risposta corretta non corrisponde alla domanda ${current.id}.`);
      }
      current.correctLetter = answerMatch[2].toUpperCase();
      phase = "explanation";
      continue;
    }
    if (phase === "prompt" || phase === "options") {
      const optionMatch = line.match(/^\s*-\s+\*\*([A-D])\.\*\*\s*(.*)$/);
      if (optionMatch) {
        phase = "options";
        current.options.push({
          letter: optionMatch[1].toUpperCase(),
          text: optionMatch[2].trim(),
        });
      } else if (phase === "prompt") {
        current.promptLines.push(line);
      } else if (line.trim() && current.options.length) {
        current.options[current.options.length - 1].text += ` ${line.trim()}`;
      }
      continue;
    }
    if (phase === "explanation") current.explanationLines.push(line);
  }
  finishQuestion();
  if (parsed.length === 0) throw new Error("Nel file non è stata trovata alcuna domanda.");
  // Il primo paragrafo ripetuto in più domande dello stesso scenario è la sua descrizione: va mostrato a parte
  const firstParagraph = (question) => question.prompt.split(/\n\s*\n/)[0].trim();
  const intros = new Map();
  for (const question of parsed) {
    const key = `${question.scenario}\n${firstParagraph(question)}`;
    intros.set(key, (intros.get(key) || 0) + 1);
  }
  for (const question of parsed) {
    const intro = firstParagraph(question);
    const rest = question.prompt.slice(question.prompt.indexOf(intro) + intro.length).trim();
    if (rest && intros.get(`${question.scenario}\n${intro}`) > 1) {
      question.context = intro;
      question.prompt = rest;
    }
  }
  const ids = new Set(parsed.map((question) => question.id));
  if (ids.size !== parsed.length) throw new Error("Il file contiene numeri di domanda duplicati.");
  return { questions: parsed, title, durationMinutes, difficulty };
}

export function hashSource(source) {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  }
  return `${source.length}-${(hash >>> 0).toString(16)}`;
}
