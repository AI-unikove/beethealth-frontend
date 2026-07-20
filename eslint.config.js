import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Base JavaScript recommended rules
  js.configs.recommended,

  // Vue 3 strongly recommended rules (stricter than essential)
  ...pluginVue.configs['flat/strongly-recommended'],

  // Custom rules configuration
  {
    name: 'app/custom-rules',
    rules: {
      // Vue-specific rules
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-vars': 'error',
      'vue/no-unused-components': 'warn',
      'vue/require-default-prop': 'warn',
      'vue/require-prop-types': 'warn',
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/no-v-html': 'warn',
      'vue/this-in-template': ['error', 'never'],
      'vue/no-multiple-template-root': 'off', // Vue 3 allows multiple roots
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 3 },
          multiline: { max: 1 },
        },
      ],
      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['error', 2, { baseIndent: 0 }],

      // JavaScript best practices
      'no-console': 'off', // Allow console for development/debugging
      'no-debugger': 'warn',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'warn',
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-shadow': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      'no-return-await': 'error',
      'require-await': 'warn',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',

      // Code quality
      complexity: ['warn', 15],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 5],

      // Error prevention
      'no-unsafe-optional-chaining': 'error',
      'no-loss-of-precision': 'error',
      'no-promise-executor-return': 'error',
      'no-template-curly-in-string': 'warn',
      'no-unreachable-loop': 'error',
      'require-atomic-updates': 'error',

      // Accessibility
      'vue/require-explicit-emits': 'warn',
      'vue/no-static-inline-styles': 'off', // Allow inline styles for dynamic Vuetify components
      'vue/no-template-shadow': 'error',
    },
  },

  // Relaxed rules for store files (Pinia stores can be large)
  {
    name: 'app/store-files',
    files: ['**/stores/**/*.js'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  skipFormatting,
])
