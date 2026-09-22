import type { StoryObj } from '@storybook/vue3'
import MzHud from './MzHud.vue'
import MzStartScreen from './MzStartScreen.vue'

export default { title: 'Organisms' }

const ui = {
  state: 'playing', hp: 68, maxHp: 100, money: 340, wave: 5, score: 2210,
  weaponId: 'rifle', weaponName: 'Rifle de asalto VK', weaponColor: '#c3f584',
  ammo: 47, infiniteAmmo: false, zombiesLeft: 9, inventory: []
}

export const Hud: StoryObj = {
  render: () => ({
    components: { MzHud },
    setup: () => ({ ui }),
    template: '<div style="position:relative;width:640px;height:64px;border-radius:8px;overflow:hidden"><MzHud :ui="ui" /></div>'
  })
}

export const PantallaDeInicio: StoryObj = {
  render: () => ({
    components: { MzStartScreen },
    setup: () => ({
      best: { score: 3820, wave: 11 },
      leaderboard: [
        { name: 'Valkiria', score: 3820, wave: 11 },
        { name: 'ElFaro', score: 2950, wave: 9 },
        { name: 'Chapulín', score: 1440, wave: 5 }
      ]
    }),
    template: '<div style="position:relative;width:640px;height:520px;border-radius:8px;overflow:hidden"><MzStartScreen :best="best" :leaderboard="leaderboard" @start="() => {}" /></div>'
  })
}
