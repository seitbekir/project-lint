module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['@typescript-eslint', 'import', 'security', 'security-node', 'prettier'],
  rules: {
    'no-template-curly-in-string': 'off',
    'no-throw-literal': 'off',
    'no-return-assign': 'off',
    'no-new': 'off',
    'no-restricted-syntax': 'off',
    'no-plusplus': 'off',
    'no-use-before-define': 'off',
    'consistent-return': 'off',
    'security/detect-non-literal-regexp': 'off',
    'security/detect-non-literal-fs-filename': 'off',
    'security/detect-unsafe-regex': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',

    // TypeScript
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      plugins: ['jest'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
