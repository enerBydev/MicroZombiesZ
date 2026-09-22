import type { Preview } from '@storybook/vue3'
import '../app/design/tokens.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'zombie-dark',
      values: [{ name: 'zombie-dark', value: '#0b0f0c' }]
    },
    layout: 'centered'
  }
}

export default preview
