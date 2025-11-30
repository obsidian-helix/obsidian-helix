// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from 'typescript-eslint';

let typescriptOnly = (config) => ({
    ...config,
    files: ["main.ts", "test/**/*.ts", "src/**/*.ts"],
  });

export default defineConfig([
  ...typescriptOnly(obsidianmd.configs.recommended),
  tseslint.configs.recommendedTypeChecked.map(typescriptOnly),
  {
    files: ["main.ts", "test/**/*.ts", "src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
          project: "./tsconfig.json",
      },
    },

    ignores: ["node_modules/", "main.js"],

    // You can add your own configuration to override or add rules
    rules: {
      // example: turn off a rule from the recommended set
      // "obsidianmd/sample-names": "off",
      // example: add a rule not in the recommended set and set its severity
      // "obsidianmd/prefer-file-manager-trash": "error",
    },
  },
]);
