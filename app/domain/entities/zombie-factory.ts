// Factory de zombies a partir de la tabla ZOMBIE_TYPES (con multiplicador de vida).

import { ZOMBIE_TYPES, type ZombieConfig, type ZombieKind } from '../types'
import type { Vec2 } from '../value-objects/vec2'
import { Zombie } from './zombie'

let nextId = 1

export function resetZombieIds(): void {
  nextId = 1
}

export function createZombie(
  _explicitId: number | undefined,
  kind: ZombieKind,
  position: Vec2,
  hpMultiplier = 1
): Zombie {
  const config: ZombieConfig = ZOMBIE_TYPES[kind]
  const id = _explicitId ?? nextId++
  return new Zombie(id, config, position, hpMultiplier)
}
