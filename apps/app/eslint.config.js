import { reactConfig } from "@entwine/config/eslint/react";

export default [
  ...reactConfig,
  { ignores: ["src/route-tree.gen.ts"] },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      // TanStack Router signals redirects by throwing a non-Error Redirect.
      "@typescript-eslint/only-throw-error": [
        "error",
        { allow: [{ from: "package", package: "@tanstack/router-core", name: ["Redirect"] }] },
      ],
    },
  },
];
