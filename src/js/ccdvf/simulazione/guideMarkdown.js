// Rendering Markdown della guida al formato (liste annidate, tabelle, citazioni, blocchi di codice)
import { escapeHtml } from "../../utils.js";
import { inlineMarkdown, slugify } from "./markdown.js";

function listMarker(line) {
  const match = line.match(/^(\s*)([-+*]|\d+[.)])\s+(.*)$/);
  if (!match) return null;
  return {
    indent: match[1].replace(/\t/g, "  ").length,
    ordered: /^\d/.test(match[2]),
    text: match[3],
  };
}

function renderList(lines, start) {
  const first = listMarker(lines[start]);
  const baseIndent = first.indent;
  const ordered = first.ordered;
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let current = null;
  let index = start;

  while (index < lines.length) {
    const marker = listMarker(lines[index]);
    if (marker && marker.indent < baseIndent) break;
    if (marker && marker.indent === baseIndent) {
      if (marker.ordered !== ordered) break;
      current = [inlineMarkdown(marker.text)];
      items.push(current);
      index++;
      continue;
    }
    if (marker && marker.indent > baseIndent && current) {
      const nested = renderList(lines, index);
      current.push(nested.html);
      index = nested.next;
      continue;
    }
    if (!lines[index].trim()) {
      let next = index + 1;
      while (next < lines.length && !lines[next].trim()) next++;
      const nextMarker = lines[next] && listMarker(lines[next]);
      if (nextMarker && nextMarker.indent >= baseIndent) {
        index = next;
        continue;
      }
      break;
    }
    const indent = (lines[index].match(/^\s*/) || [""])[0].replace(/\t/g, "  ").length;
    if (current && indent > baseIndent) {
      current.push(`<span>${inlineMarkdown(lines[index].trim())}</span>`);
      index++;
      continue;
    }
    break;
  }
  return {
    html: `<${tag}>${items.map((parts) => `<li>${parts.join(" ")}</li>`).join("")}</${tag}>`,
    next: index,
  };
}

function parseTableRow(line) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

export function renderGuideMarkdown(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const output = [];
  const _headings = [];
  let index = 0;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const isBlockStart = (line, next = "") => {
    const trimmed = line.trim();
    return (
      !trimmed ||
      trimmed.startsWith("```") ||
      /^#{1,6}\s/.test(trimmed) ||
      /^\s*(---+|\*\*\*+|___+)\s*$/.test(trimmed) ||
      /^>/.test(trimmed) ||
      listMarker(line) ||
      (trimmed.startsWith("|") && isTableDivider(next))
    );
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      index++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      const language = trimmed.replace(/^`+/, "").trim();
      const codeLines = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index++;
      }
      if (index < lines.length) index++;
      output.push(
        `<pre>${language ? `<span class="code-language">${escapeHtml(language)}</span>` : ""}<code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].replace(/\s+#+\s*$/, "");
      const id = slugify(text);
      if (level > 1) {
        output.push(`<h${level} id="${escapeHtml(id)}">${inlineMarkdown(text)}</h${level}>`);
      }
      index++;
      continue;
    }

    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushParagraph();
      output.push("<hr>");
      index++;
      continue;
    }

    if (trimmed.startsWith("|") && isTableDivider(lines[index + 1] || "")) {
      flushParagraph();
      const header = parseTableRow(lines[index]);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index]));
        index++;
      }
      output.push(
        `<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${header.map((_cell, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (/^>/.test(trimmed)) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index++;
      }
      output.push(`<blockquote>${renderGuideMarkdown(quote.join("\n")).html}</blockquote>`);
      continue;
    }

    if (listMarker(line)) {
      flushParagraph();
      const list = renderList(lines, index);
      output.push(list.html);
      index = list.next;
      continue;
    }

    if (!isBlockStart(line, lines[index + 1] || "")) {
      paragraph.push(trimmed);
      index++;
    } else {
      flushParagraph();
    }
  }
  flushParagraph();
  return { html: output.join("\n"), headings: [] };
}
