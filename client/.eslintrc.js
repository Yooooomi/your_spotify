module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react-hooks/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  ignorePatterns: ['.eslintrc.js'],
  plugins: ['@typescript-eslint'],
  rules: {
    'no-restricted-globals': 'off',
    'max-classes-per-file': 'off',
    'consistent-return': 'off',
    'no-continue': 'off',
    'no-console': 'off',
    'react/require-default-props': 'off',
    'no-underscore-dangle': 'off',
    'react/destructuring-assignment': 'off',
    'no-restricted-exports': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-cycle': 'off',
    'react/jsx-filename-extension': 'off',
    camelcase: 'off',
    'no-unused-vars': 'off',
    'import/prefer-default-export': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
};
