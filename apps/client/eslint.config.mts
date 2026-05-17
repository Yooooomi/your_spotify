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
  // @ts-expect-error - missing in types
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    languageOptions: {
      // @ts-expect-error - missing in types
      ...config.languageOptions,
      parserOptions: {
      // @ts-expect-error - missing in types
        ...config.languageOptions?.parserOptions,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),
  // @ts-expect-error - missing in types
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  // { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
  // @ts-expect-error - missing in types
  pluginReact.configs.flat.recommended,
  // @ts-expect-error - missing in types
  pluginReact.configs.flat['jsx-runtime'],
  // @ts-expect-error - missing in types
  reactHooks.configs.flat["recommended-latest"],
  // @ts-expect-error - missing in types
  reactNoManualMemo.configs["flat/recommended"],
  // @ts-expect-error - missing in types
  {
    plugins: {
      "unused-imports": unusedImports
    },
  },
  // @ts-expect-error - missing in types
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
  // @ts-expect-error - missing in types
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/refs": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    }
  },
]);
