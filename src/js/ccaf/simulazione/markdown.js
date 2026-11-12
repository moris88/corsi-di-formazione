// Parser Markdown minimale della pagina: elementi in linea e testo di domande e spiegazioni
import { escapeHtml } from "../../utils.js";

export function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  html = html.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}

function _safeHref(value) {
  const href = String(value || "")
    .replace(/&amp;/g, "&")
    .trim();
  if (/^(https?:|mailto:|\.\.?\/|\/|#)/i.test(href)) return escapeHtml(href);
  return "#";
}

function plainHeading(source) {
  return source
    .replace(/[`*_~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function slugify(source) {
  return (
    plainHeading(source)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "sezione"
  );
}

export function markdownToHtml(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const output = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";
  let codeLines = null;
  let quoteLines = [];

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length)
      output.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listType}>`);
    listItems = [];
    listType = "";
  };
  const flushQuote = () => {
    if (quoteLines.length) output.push(`<blockquote>${quoteLines.map(inlineMarkdown).join("<br>")}</blockquote>`);
    quoteLines = [];
  };
  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (codeLines !== null) {
      if (trimmed.startsWith("```")) {
        output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushTextBlocks();
      codeLines = [];
      continue;
    }
    if (!trimmed) {
      flushTextBlocks();
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    const quote = trimmed.match(/^>\s?(.*)$/);
    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph();
      flushQuote();
      const nextType = bullet ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || ordered)[1]);
      continue;
    }
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }
    if (heading) {
      flushTextBlocks();
      output.push(`<p><strong>${inlineMarkdown(heading[1])}</strong></p>`);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }
  if (codeLines !== null) output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushTextBlocks();
  return output.join("");
}
