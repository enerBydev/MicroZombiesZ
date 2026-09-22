// Health — value object con invariantes: nunca <0, nunca >max.

export class Health {
  private constructor(
    public readonly max: number,
    private _current: number
  ) {}

  static full(max: number): Health {
    return new Health(max, max)
  }

  static of(max: number, current: number): Health {
    const clamped = Math.min(Math.max(current, 0), max)
    return new Health(max, clamped)
  }

  get current(): number {
    return this._current
  }

  get ratio(): number {
    return this.max === 0 ? 0 : this._current / this.max
  }

  get isDead(): boolean {
    return this._current <= 0
  }

  damage(amount: number): void {
    if (amount <= 0) return
    this._current = Math.max(0, this._current - amount)
  }

  heal(amount: number): void {
    if (amount <= 0) return
    this._current = Math.min(this.max, this._current + amount)
  }
}
