export const importOrder = [
  "error",
  {
    groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
    pathGroups: [
      {
        pattern: "{react,react-dom,react-dom/**,next,next/**}",
        group: "builtin",
        position: "before",
      },
      { pattern: "@/shared/**", group: "internal", position: "before" },
      { pattern: "@/features/**", group: "internal", position: "after" },
      { pattern: "**/*.css", group: "index", position: "after" },
    ],
    pathGroupsExcludedImportTypes: [],
    "newlines-between": "always",
    alphabetize: { order: "asc", caseInsensitive: true },
  },
];
