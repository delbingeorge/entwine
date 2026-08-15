export const htmlToText = (html: string) =>
  new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
