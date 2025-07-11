import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-extra-semi': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'object-curly-spacing': ['error', 'always'],
      'comma-spacing': ['error', { before: false, after: true }],
      "@typescript-eslint/no-unused-vars": ["warn"],
      '@typescript-eslint/no-explicit-any': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'camelcase': 'error',
      'no-unreachable': 'error',
    },
  },
  tseslint.configs.recommended,
]);
