// KeyboardMouseInput — adaptador de entrada para desktop (WASD + ratón).

import type { InputAdapter, RawInput } from '../domain/ports'
import type { Vec2 } from '../domain/value-objects/vec2'

export class KeyboardMouseInput implements InputAdapter {
  readonly mode = 'desktop'
  private keys = new Set<string>()
  private mouse: Vec2 | null = null
  private firing = false
  private canvas: HTMLCanvasElement | null = null

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase())
  }
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }
  private onMouseMove = (e: MouseEvent) => {
    if (!this.canvas) return
    const r = this.canvas.getBoundingClientRect()
    this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.firing = true
  }
  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.firing = false
  }

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('mouseup', this.onMouseUp)
  }

  /** Registra el canvas para coordenadas de puntero (llamado por el engine). */
  bindCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  getState(): RawInput {
    const move: Vec2 = { x: 0, y: 0 }
    if (this.keys.has('a') || this.keys.has('arrowleft')) move.x -= 1
    if (this.keys.has('d') || this.keys.has('arrowright')) move.x += 1
    if (this.keys.has('w') || this.keys.has('arrowup')) move.y -= 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) move.y += 1
    return {
      move,
      firing: this.firing || this.keys.has(' '),
      aimPoint: this.mouse ?? undefined
    }
  }
}
