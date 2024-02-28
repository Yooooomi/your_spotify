module.exports = {
  extends: [
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-shadow": ["error"],
    "no-shadow": "off",
    "no-undef": "off",
    "import/no-unresolved": "off",
    "import/no-default-export": ["error"],
    "import/no-useless-path-segments": [
      "error",
      {
        noUselessIndex: true,
      },
    ],
    "import/order": ["error"],
    "import/no-named-as-default-member": "off",
    "import/no-named-as-default": "off",
    "import/no-extraneous-dependencies": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "prettier/prettier": [
      "error",
      {
        trailingComma: "all",
        tabWidth: 2,
        semi: true,
        singleQuote: false,
      },
    ],
  },
  ignorePatterns: ["lib"],
  settings: {
    "import/resolver": {
      typescript: true,
      node: {
        extensions: [".ts", ".tsx", ".web.ts", ".native.ts"]
      },
    },
  },
};
