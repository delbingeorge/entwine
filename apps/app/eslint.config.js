import { reactConfig } from "@entwine/config/eslint/react";

export default [
  ...reactConfig,
  { ignores: ["src/route-tree.gen.ts"] },
  {
    // Build-time constants injected by Vite use its __NAME__ convention.
    files: ["src/vite-env.d.ts"],
    rules: { "@typescript-eslint/naming-convention": "off" },
  },
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
