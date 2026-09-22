import type { StoryObj } from '@storybook/vue3'
import MzWeaponCard from './MzWeaponCard.vue'

export default { component: MzWeaponCard, tags: ['autodocs'] }

function frame(props: string, money: number): string {
  return `<div style="width:260px"><MzWeaponCard :money="${money}" ${props} /></div>`
}

export const EnVenta: StoryObj = {
  render: () => ({
    components: { MzWeaponCard },
    setup() {
      const weapon = {
        id: 'shotgun', name: 'Escopeta T-12', color: '#ff8fa3', owned: false,
        ammo: 0, infinite: false, cost: 250, ammoCost: 30, maxAmmo: 48
      }
      return { weapon, frame }
    },
    template: frame(':weapon="weapon"', 400)
  })
}

export const SinFondos: StoryObj = {
  render: () => ({
    components: { MzWeaponCard },
    setup() {
      const weapon = {
        id: 'rifle', name: 'Rifle de asalto VK', color: '#c3f584', owned: false,
        ammo: 0, infinite: false, cost: 650, ammoCost: 50, maxAmmo: 180
      }
      return { weapon, frame }
    },
    template: frame(':weapon="weapon"', 100)
  })
}

export const ConMunicionBaja: StoryObj = {
  render: () => ({
    components: { MzWeaponCard },
    setup() {
      const weapon = {
        id: 'smg', name: 'Subfusil Rata', color: '#9bd1ff', owned: true,
        ammo: 4, infinite: false, cost: 420, ammoCost: 40, maxAmmo: 270
      }
      return { weapon, frame }
    },
    template: frame(':weapon="weapon"', 500)
  })
}
