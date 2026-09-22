import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'

const appDir = fileURLToPath(new URL('../app', import.meta.url))

const config: StorybookConfig = {
  framework: '@storybook/vue3-vite',
  stories: ['../app/components/**/*.stories.ts'],
  staticDirs: ['../public'],
  async viteFinal(config) {
    config.plugins = [vue(), ...(config.plugins ?? [])]
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        '~': appDir,
        '@': appDir
      }
    }
    return config
  }
}

export default config
