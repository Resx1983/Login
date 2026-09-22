import js from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Las mismas reglas que SonarQube aplica a TypeScript/React (SonarJS), para
 * poder verlas aquí antes de que las lance el análisis del servidor.
 *
 *   npm run lint
 */
export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', '.expo/**', 'assets/**', '.scratch/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,

  // La app: React Native corre sobre un runtime propio, no sobre Node.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, __DEV__: 'readonly' },
    },
  },

  // Las herramientas y comprobaciones sí son Node: scripts, checks y la
  // configuración de Metro.
  {
    files: ['**/*.mjs', 'metro.config.js', 'scripts/**'],
    languageOptions: { globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
