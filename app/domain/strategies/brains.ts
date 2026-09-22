// ZombieBrain — patrón Strategy de IA: un cerebro por tipo de zombie.

import type { RandomSource } from '../ports'
import type { Zombie } from '../entities/zombie'
import type { Vec2 } from '../value-objects/vec2'
import { vnormalize, vscale, vsub, vdist } from '../value-objects/vec2'

export interface BrainContext {
  playerPos: Vec2
  dt: number
  rng: RandomSource
  time: number
}

export interface BrainResult {
  /** Desplazamiento este tick (velocidad * dt). */
  move: Vec2
  spit?: { toward: Vec2; damage: number; speed: number }
}

export interface ZombieBrain {
  step(z: Zombie, ctx: BrainContext): BrainResult
}

function seek(z: Zombie, target: Vec2, dt: number): Vec2 {
  return vscale(vnormalize(vsub(target, z.position)), z.config.speed * dt)
}

/** Caminante: persecución directa. */
export class WalkerBrain implements ZombieBrain {
  step(z: Zombie, ctx: BrainContext): BrainResult {
    return { move: seek(z, ctx.playerPos, ctx.dt) }
  }
}

/** Corredor: persecución rápida con zigzag lateral. */
export class RunnerBrain implements ZombieBrain {
  step(z: Zombie, ctx: BrainContext): BrainResult {
    const toPlayer = vnormalize(vsub(ctx.playerPos, z.position))
    const perp = { x: -toPlayer.y, y: toPlayer.x }
    const wob = Math.sin(ctx.time * 8) * 0.35
    const mixed = vnormalize({
      x: toPlayer.x + perp.x * wob,
      y: toPlayer.y + perp.y * wob
    })
    return { move: vscale(mixed, z.config.speed * ctx.dt) }
  }
}

/** Bruto: persecución lenta e imparable. */
export class BruteBrain implements ZombieBrain {
  step(z: Zombie, ctx: BrainContext): BrainResult {
    return { move: seek(z, ctx.playerPos, ctx.dt) }
  }
}

/** Escupidor: mantiene la distancia y ataca a rango. */
export class SpitterBrain implements ZombieBrain {
  private static readonly FLEE_BELOW = 90
  private static readonly STRAFE_BAND = 280

  step(z: Zombie, ctx: BrainContext): BrainResult {
    const toPlayer = vsub(ctx.playerPos, z.position)
    const d = vdist(z.position, ctx.playerPos)
    const dirTo = vnormalize(toPlayer)
    let move: Vec2

    if (d < SpitterBrain.FLEE_BELOW) {
      move = vscale({ x: -dirTo.x, y: -dirTo.y }, z.config.speed * ctx.dt)
    } else if (d <= SpitterBrain.STRAFE_BAND) {
      const perp = { x: -dirTo.y, y: dirTo.x }
      const side = ctx.rng.next() < 0.5 ? 1 : -1
      move = vscale(perp, z.config.speed * ctx.dt * side)
    } else {
      move = vscale(dirTo, z.config.speed * ctx.dt)
    }

    const ranged = z.config.ranged
    if (ranged && z.spitReady() && d <= ranged.range && d >= SpitterBrain.FLEE_BELOW) {
      return {
        move,
        spit: { toward: { ...ctx.playerPos }, damage: ranged.damage, speed: ranged.projectileSpeed }
      }
    }
    return { move }
  }
}

export const BRAINS: Record<string, ZombieBrain> = {
  walker: new WalkerBrain(),
  runner: new RunnerBrain(),
  brute: new BruteBrain(),
  spitter: new SpitterBrain()
}
