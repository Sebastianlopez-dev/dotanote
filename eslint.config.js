import js from '@eslint/js';
import ts from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

function downgradeToWarn(config) {
  if (!config.rules) return config;
  const rules = {};
  for (const [key, value] of Object.entries(config.rules)) {
    rules[key] = value === 'error' || value === 2 ? 'warn' : value;
  }
  return { ...config, rules };
}

export default [
  { ignores: ['dist/', 'node_modules/', 'coverage/', '*.config.js'] },
  { files: ['src/**/*.{ts,tsx}'] },
  { languageOptions: { parserOptions: { project: true }, globals: globals.browser } },
  downgradeToWarn(js.configs.recommended),
  ...ts.configs.recommendedTypeChecked.map(downgradeToWarn),
  downgradeToWarn(react.configs.flat.recommended),
  downgradeToWarn(react.configs.flat['jsx-runtime']),
  downgradeToWarn(reactHooks.configs.flat['recommended-latest']),
  prettier,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    },
  },
];
