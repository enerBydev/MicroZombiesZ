// Money — value object con invariante: el saldo nunca es negativo
// y el gasto es atómico (todo o nada).

export class Money {
  private constructor(private _amount: number) {}

  static of(amount: number): Money {
    if (amount < 0) throw new Error('Money: el saldo inicial no puede ser negativo')
    return new Money(amount)
  }

  get amount(): number {
    return this._amount
  }

  canAfford(cost: number): boolean {
    return cost >= 0 && this._amount >= cost
  }

  /** Gasto atómico: si no alcanza, devuelve false y no muta. */
  spend(cost: number): boolean {
    if (!this.canAfford(cost)) return false
    this._amount -= cost
    return true
  }

  earn(amount: number): void {
    if (amount <= 0) return
    this._amount += amount
  }
}
