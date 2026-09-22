// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Pureza del dominio (ADR-001): app/domain NO puede importar Vue/Nuxt/DOM.
  {
    files: ['app/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['vue', 'nuxt', '#app', '#imports', '@vue/*', '@vitejs/*'], message: 'El dominio es puro (Hexagonal/DDD): cero Vue, cero Nuxt, cero DOM.' }
        ]
      }],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'navigator', 'requestAnimationFrame']
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
)
