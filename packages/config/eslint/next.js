import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

import { baseConfig } from "./base.js";

export const nextConfig = tseslint.config(
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/error.tsx",
      "src/app/**/not-found.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/route.ts",
      "next.config.ts",
    ],
    rules: { "import-x/no-default-export": "off" },
  },
);

export default nextConfig;
