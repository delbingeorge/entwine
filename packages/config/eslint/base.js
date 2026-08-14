import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import globals from "globals";
import tseslint from "typescript-eslint";

import { importOrder } from "./rules/import-order.js";
import { namingConvention } from "./rules/naming-convention.js";

export const baseConfig = tseslint.config(
  {
    ignores: [
      "dist/**",
      ".next/**",
      ".turbo/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "**/*.gen.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importX.flatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver({ alwaysTryTypes: true })],
    },
    rules: {
      "import-x/no-unresolved": ["error", { ignore: ["\\.css$"] }],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Enums are banned (§4). Use a union type instead.",
        },
      ],

      "@typescript-eslint/naming-convention": namingConvention,

      "max-lines": ["error", { max: 250, skipBlankLines: false, skipComments: false }],
      "import-x/no-default-export": "error",

      "import-x/order": importOrder,

      "no-empty": ["error", { allowEmptyCatch: false }],

      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.config.ts", "**/*.config.js", "**/*.config.mjs"],
    rules: { "import-x/no-default-export": "off" },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  prettier,
);

export default baseConfig;
