module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
    },
  ],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-continue': 'off',
    'comma-dangle': 0,
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'no-restricted-exports': 'off',
    'react/destructuring-assignment': 'off',
    'react/require-default-props': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};
