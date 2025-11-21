import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";
import reactHooks from 'eslint-plugin-react-hooks';
import reactNoManualMemo from 'eslint-plugin-react-no-manual-memo';
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  // { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  reactHooks.configs.flat["recommended-latest"],
  reactNoManualMemo.configs["flat/recommended"],
  {
    plugins: {
      "unused-imports": unusedImports
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      '@typescript-eslint/no-unused-vars': "off",
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'unused-imports/no-unused-imports': 'error'
    }
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/refs": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    }
  },
]);
