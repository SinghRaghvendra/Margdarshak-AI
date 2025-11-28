// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["lib/**", "generated/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
      },
    },
    rules: {
        "quotes": ["error", "double"],
        "import/no-unresolved": "off",
        "indent": ["error", 2],
        "@typescript-eslint/no-unused-vars": "warn",
    }
  },
);
