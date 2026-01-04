module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/community',
    'prettier',
  ],
  env: {
    node: true,
    es2021: true,
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.d.ts',
    'test/',
    'scripts/',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',

    // n8n rules - relaxed for community nodes
    'n8n-nodes-base/node-param-description-missing-final-period': 'off',
    'n8n-nodes-base/node-param-description-weak': 'off',
    'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'off',
    'n8n-nodes-base/node-param-description-wrong-for-simplify': 'off',
    'n8n-nodes-base/node-param-display-name-miscased': 'warn',
    'n8n-nodes-base/node-param-option-name-wrong-for-get-many': 'off',
    'n8n-nodes-base/node-param-option-name-wrong-for-upsert': 'off',
    'n8n-nodes-base/node-param-placeholder-miscased-id': 'warn',

    // General rules
    'no-console': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
