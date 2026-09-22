import type { StoryObj } from '@storybook/vue3'
import ZHealthBar from './ZHealthBar.vue'
import ZBadge from './ZBadge.vue'

export default { title: 'Atoms/Indicadores' }

export const BarrasDeVida: StoryObj = {
  render: () => ({
    components: { ZHealthBar },
    template: `<div style="display:flex;flex-direction:column;gap:12px;width:260px">
      <ZHealthBar :value="0.92" label="HP 92" />
      <ZHealthBar :value="0.55" label="HP 55" />
      <ZHealthBar :value="0.3" label="HP 30" />
      <ZHealthBar :value="0.12" label="HP 12" />
    </div>`
  })
}

export const Insignias: StoryObj = {
  render: () => ({
    components: { ZBadge },
    template: `<div style="display:flex;gap:8px;flex-wrap:wrap">
      <ZBadge label="$240" tone="amber" />
      <ZBadge label="Oleada 7" tone="blood" />
      <ZBadge label="Pts 1830" tone="toxic" />
      <ZBadge label="Zombis 12" tone="steel" />
    </div>`
  })
}
