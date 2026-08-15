export const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/gu, (character) => {
    const table: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

    return table[character] ?? character;
  });
