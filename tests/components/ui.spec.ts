import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ZButton from '../../app/components/atoms/ZButton.vue'
import ZHealthBar from '../../app/components/atoms/ZHealthBar.vue'
import ZBadge from '../../app/components/atoms/ZBadge.vue'
import MzWaveBanner from '../../app/components/molecules/MzWaveBanner.vue'
import MzHud from '../../app/components/organisms/MzHud.vue'
import type { UiSnapshot } from '../../app/application/game-engine'

function ui(overrides: Partial<UiSnapshot> = {}): UiSnapshot {
  return {
    state: 'playing', hp: 80, maxHp: 100, money: 150, wave: 2, score: 320,
    weaponId: 'shotgun', weaponName: 'Escopeta T-12', weaponColor: '#ff8fa3',
    ammo: 9, infiniteAmmo: false, zombiesLeft: 7, inventory: [],
    ...overrides
  }
}

describe('ZButton (átomo)', () => {
  it('emite click y respeta disabled', async () => {
    const w = mount(ZButton, { slots: { default: 'JUGAR' } })
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
    expect(w.text()).toContain('JUGAR')
    const d = mount(ZButton, { props: { disabled: true } })
    await d.trigger('click')
    expect(d.emitted('click')).toBeUndefined()
  })
})

describe('ZHealthBar (átomo)', () => {
  it('refleja el ratio y cambia de tono', () => {
    const ok = mount(ZHealthBar, { props: { value: 0.9 } })
    expect(ok.find('.z-hp__fill--ok').exists()).toBe(true)
    const crit = mount(ZHealthBar, { props: { value: 0.15 } })
    expect(crit.find('.z-hp__fill--crit').exists()).toBe(true)
    expect(crit.text()).toContain('15%')
  })
})

describe('ZBadge (átomo)', () => {
  it('pinta el tono indicado', () => {
    const w = mount(ZBadge, { props: { label: '$150', tone: 'amber' } })
    expect(w.classes()).toContain('z-badge--amber')
    expect(w.text()).toBe('$150')
  })
})

describe('MzWaveBanner (molécula)', () => {
  it('solo es visible cuando se le pide', () => {
    const on = mount(MzWaveBanner, { props: { wave: 4, visible: true } })
    expect(on.text()).toContain('OLEADA')
    expect(on.text()).toContain('4')
    const off = mount(MzWaveBanner, { props: { wave: 4, visible: false } })
    expect(off.find('.wbanner').exists()).toBe(false)
  })
})

describe('MzHud (organismo)', () => {
  it('muestra vida, dinero, oleada, score y arma con munición', () => {
    const w = mount(MzHud, { props: { ui: ui() } })
    expect(w.text()).toContain('$150')
    expect(w.text()).toContain('Oleada 2')
    expect(w.text()).toContain('Pts 320')
    expect(w.text()).toContain('Escopeta T-12')
    expect(w.text()).toContain('9')
  })
  it('munición infinita se pinta como ∞', () => {
    const w = mount(MzHud, { props: { ui: ui({ infiniteAmmo: true }) } })
    expect(w.text()).toContain('∞')
  })
})
