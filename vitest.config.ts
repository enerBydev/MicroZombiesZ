import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Tests del dominio: puros, sin DOM. Tests de componentes: happy-dom.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['app/domain/**', 'node'],
      ['app/application/**', 'node']
    ],
    include: ['app/**/*.spec.ts', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/domain/**', 'app/application/**'],
      thresholds: { lines: 80, functions: 75, branches: 70, statements: 80 }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url))
    }
  }
})
