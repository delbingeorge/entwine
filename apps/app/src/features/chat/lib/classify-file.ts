import type { Attachment, AttachmentKind } from "../types";

const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"];
const codeExtensions = [
  "json",
  "js",
  "ts",
  "tsx",
  "jsx",
  "css",
  "go",
  "py",
  "rb",
  "rs",
  "yml",
  "yaml",
  "toml",
];

export const classifyFile = (file: File): AttachmentKind => {
  const extension = (file.name.split(".").pop() ?? "").toLowerCase();

  if (imageExtensions.includes(extension)) {
    return "image";
  }

  if (codeExtensions.includes(extension)) {
    return "code";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  return "text";
};

export const humanSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${String(bytes)}B`;
  }

  if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(0)}KB`;
  }

  return `${(bytes / 1048576).toFixed(1)}MB`;
};

export const kindIcon = {
  pdf: "file-text",
  text: "file-text",
  code: "file-braces",
  image: "image",
} as const;

export const attachmentFromFile = (file: File): Attachment => {
  const kind = classifyFile(file);

  return {
    id: Date.now(),
    name: file.name,
    kind,
    size: humanSize(file.size),
    url: kind === "image" ? URL.createObjectURL(file) : undefined,
  };
};
