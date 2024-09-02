import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import jestLint from "eslint-plugin-jest";
import eslintConfigPrettier from "eslint-config-prettier";
import babelLintParser from "@babel/eslint-parser";

export default [
  {
    ignores: [
      ".history/**",
      ".husky/**",
      ".vscode/**",
      "coverage/**",
      "lib/**",
      "node_modules/**"
    ]
  },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: babelLintParser
    }
  },
  eslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    languageOptions: {
      parser: tseslint.parser
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "no-sparse-arrays": "off"
    }
  },
  {
    files: ["test/**"],
    ...jestLint.configs["flat/recommended"],
    rules: {
      ...jestLint.configs["flat/recommended"].rules,
      "jest/prefer-expect-assertions": "off"
    }
  },
  eslintConfigPrettier
];
