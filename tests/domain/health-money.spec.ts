import { describe, expect, it } from 'vitest'
import { Health } from '../../app/domain/value-objects/health'
import { Money } from '../../app/domain/value-objects/money'

describe('Health (invariante: nunca <0, nunca >max)', () => {
  it('nace lleno y calcula ratio', () => {
    const h = Health.full(100)
    expect(h.current).toBe(100)
    expect(h.max).toBe(100)
    expect(h.ratio).toBe(1)
    expect(h.isDead).toBe(false)
  })

  it('el daño nunca baja de 0', () => {
    const h = Health.full(50)
    h.damage(30)
    expect(h.current).toBe(20)
    h.damage(999)
    expect(h.current).toBe(0)
    expect(h.isDead).toBe(true)
  })

  it('la curación nunca supera el máximo', () => {
    const h = Health.of(100, 80)
    h.heal(10)
    expect(h.current).toBe(90)
    h.heal(999)
    expect(h.current).toBe(100)
  })

  it('montos negativos son ignorados (defensivo)', () => {
    const h = Health.of(100, 50)
    h.damage(-10)
    h.heal(-10)
    expect(h.current).toBe(50)
  })

  it('Health.of clampea valores fuera de rango', () => {
    expect(Health.of(100, 150).current).toBe(100)
    expect(Health.of(100, -5).current).toBe(0)
  })
})

describe('Money (invariante: nunca negativo; gasto atómico)', () => {
  it('earn y spend respetan invariantes', () => {
    const m = Money.of(100)
    m.earn(50)
    expect(m.amount).toBe(150)
    expect(m.spend(200)).toBe(false)
    expect(m.amount).toBe(150)
    expect(m.spend(150)).toBe(true)
    expect(m.amount).toBe(0)
  })

  it('canAfford no muta', () => {
    const m = Money.of(10)
    expect(m.canAfford(11)).toBe(false)
    expect(m.canAfford(10)).toBe(true)
    expect(m.amount).toBe(10)
  })

  it('no admite construcción con saldo negativo ni gasto negativo', () => {
    expect(() => Money.of(-1)).toThrow()
    const m = Money.of(10)
    expect(m.spend(-5)).toBe(false)
    expect(m.amount).toBe(10)
  })
})
