import { DIFFICULTIES, TEST_DIFFICULTY } from "./constants.js";

// Stesso formato accettato da simulazione.html
export function parseQuestionBank(markdown, testNumber) {
  const source = String(markdown).replace(/^﻿/, "").replace(/\r/g, "");
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  const body = frontmatter ? source.slice(frontmatter[0].length) : source;
  const declared = frontmatter?.[1].match(/^difficulty:\s*["']?(\w+)["']?\s*$/im)?.[1].toLowerCase();
  const difficulty = DIFFICULTIES.includes(declared) ? declared : TEST_DIFFICULTY[testNumber] || "";
  const parsed = [];
  let scenario = "Scenario generale";
  let current = null;
  let phase = "";
  const finish = () => {
    if (current && current.options.length === 4 && current.correctLetter) {
      parsed.push({
        key: `${testNumber}-${current.id}`,
        test: testNumber,
        difficulty,
        id: Number(current.id),
        scenario,
        prompt: current.promptLines.join("\n").trim(),
        options: current.options,
        correctLetter: current.correctLetter,
        explanation: current.explanationLines.join("\n").trim(),
      });
    }
    current = null;
    phase = "";
  };
  for (const line of body.split("\n")) {
    const scenarioMatch = line.match(/^##\s+Scenario:\s*(.+)$/i);
    if (scenarioMatch) {
      finish();
      scenario = scenarioMatch[1].trim();
      continue;
    }
    const questionMatch = line.match(/^###\s+(?:Domanda|Question)\s+(\d+)\s*$/i);
    if (questionMatch) {
      finish();
      current = { id: questionMatch[1], promptLines: [], options: [], correctLetter: "", explanationLines: [] };
      phase = "prompt";
      continue;
    }
    if (!current) continue;
    const answerMatch = line.match(
      /^####\s+(?:Risposta corretta|Correct answer)(?:\s+(?:alla domanda|to question)\s+\d+)?:\s*([A-D])\s*$/i,
    );
    if (answerMatch) {
      current.correctLetter = answerMatch[1].toUpperCase();
      phase = "explanation";
      continue;
    }
    if (phase === "prompt" || phase === "options") {
      const optionMatch = line.match(/^\s*-\s+\*\*([A-D])\.\*\*\s*(.*)$/);
      if (optionMatch) {
        phase = "options";
        current.options.push({ letter: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
      } else if (phase === "prompt") current.promptLines.push(line);
      else if (line.trim() && current.options.length)
        current.options[current.options.length - 1].text += ` ${line.trim()}`;
      continue;
    }
    if (phase === "explanation") current.explanationLines.push(line);
  }
  finish();
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
  return parsed;
}
