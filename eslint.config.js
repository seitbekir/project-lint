import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { flatConfigs as importConfigs } from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';
import security from 'eslint-plugin-security';
import globals from 'globals';
import { configs as typescriptConfigs } from 'typescript-eslint';

export default [
  { ignores: ['lib/**', 'coverage/**', 'node_modules/**', 'junit-reports/**'] },
  js.configs.recommended,
  ...typescriptConfigs.recommended,
  importConfigs.recommended,
  importConfigs.typescript,
  security.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    settings: {
      'import-x/resolver': {
        typescript: { project: './tsconfig.eslint.json' },
      },
    },
    rules: {
      'no-template-curly-in-string': 'off',
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      'import-x/extensions': 'off',
      'import-x/prefer-default-export': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['src/utils/outError.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: { jest },
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
];
