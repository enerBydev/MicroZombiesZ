import type { StoryObj } from '@storybook/vue3'
import ZButton from './ZButton.vue'

export default { component: ZButton, tags: ['autodocs'] }

export const Primario: StoryObj = {
  render: () => ({ components: { ZButton }, template: '<ZButton>COMENZAR PARTIDA</ZButton>' })
}

export const Fantasma: StoryObj = {
  render: () => ({ components: { ZButton }, template: '<ZButton variant="ghost">Guardar puntuación</ZButton>' })
}

export const Peligro: StoryObj = {
  render: () => ({ components: { ZButton }, template: '<ZButton variant="danger">REINTENTAR</ZButton>' })
}

export const Grande: StoryObj = {
  render: () => ({ components: { ZButton }, template: '<ZButton size="lg">SIGUIENTE OLEADA ▶</ZButton>' })
}

export const Deshabilitado: StoryObj = {
  render: () => ({ components: { ZButton }, template: '<ZButton disabled>Sin fondos</ZButton>' })
}
