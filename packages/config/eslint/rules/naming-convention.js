export const namingConvention = [
  "error",
  { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" },
  { selector: "variable", format: ["camelCase", "PascalCase", "UPPER_CASE"] },
  { selector: "function", format: ["camelCase", "PascalCase"] },
  { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
  {
    selector: "typeLike",
    format: ["PascalCase"],
    custom: { regex: "^(I|T)[A-Z]", match: false },
  },
  { selector: "typeProperty", format: null },
  { selector: "objectLiteralProperty", format: null },
  { selector: "import", format: ["camelCase", "PascalCase"] },
];
