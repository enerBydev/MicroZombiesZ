// TouchInput — adaptador de entrada móvil. Los joysticks virtuales (componentes
// Vue) escriben en este adaptador a través del GameEngine (mobile-first).

import type { InputAdapter, RawInput } from '../domain/ports'
import type { Vec2 } from '../domain/value-objects/vec2'

const DEADZONE = 0.15

export class TouchInput implements InputAdapter {
  readonly mode = 'touch'
  private left: Vec2 = { x: 0, y: 0 }
  private right: Vec2 = { x: 0, y: 0 }

  attach(): void {
    /* los joysticks son componentes Vue; nada que colgar del DOM aquí */
  }

  detach(): void {
    this.left = { x: 0, y: 0 }
    this.right = { x: 0, y: 0 }
  }

  /** Vector normalizado (-1..1) del joystick izquierdo (movimiento). */
  setLeftJoystick(x: number, y: number): void {
    this.left = { x, y }
  }

  /** Vector normalizado (-1..1) del joystick derecho (apuntar + disparar). */
  setRightJoystick(x: number, y: number): void {
    this.right = { x, y }
  }

  getState(): RawInput {
    const rl = Math.hypot(this.right.x, this.right.y)
    const aiming = rl > DEADZONE
    return {
      move: { ...this.left },
      firing: aiming,
      aimDir: aiming ? { ...this.right } : undefined
    }
  }
}
