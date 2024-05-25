import prettier from 'eslint-plugin-prettier';
import _import from 'eslint-plugin-import';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends('eslint:recommended', 'prettier'),
  {
    plugins: {
      prettier,
      import: _import
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 2022,
      sourceType: 'module'
    },

    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          printWidth: 120
        }
      ],

      'import/no-unresolved': 2
    }
  }
];
