import { escapeHtml } from "./escape-html";

const inline = (text: string) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/gu, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/gu, "<strong>$1</strong>")
    .replace(/(^|\s)\*([^*\n]+)\*/gu, "$1<em>$2</em>");

export const renderMarkdown = (markdown: string) => {
  const blocks = markdown.trim().split(/\n{2,}/u);

  return blocks
    .map((block) => {
      const lines = block.split("\n");

      if (lines.every((line) => /^\s*[-*]\s+/u.test(line))) {
        const items = lines
          .map((line) => `<li>${inline(line.replace(/^\s*[-*]\s+/u, ""))}</li>`)
          .join("");

        return `<ul>${items}</ul>`;
      }

      if (lines.every((line) => /^\s*\d+\.\s+/u.test(line))) {
        const items = lines
          .map((line) => `<li>${inline(line.replace(/^\s*\d+\.\s+/u, ""))}</li>`)
          .join("");

        return `<ol>${items}</ol>`;
      }

      return `<p>${inline(block.replace(/\n/gu, " "))}</p>`;
    })
    .join("");
};
