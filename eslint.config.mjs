// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...obsidianmd.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    files: ["main.ts", "test/**/*.ts", "src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
          project: "./tsconfig.json",
      },
    },

    rules: {
        "@typescript-eslint/switch-exhaustiveness-check": "error"
    },
  },
  globalIgnores(["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.json"])
]);
