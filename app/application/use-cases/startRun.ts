// Use-case StartRun — comando discreto de aplicación (ADR-001).
// Crea un Game fresco y lo pone en playing.

import { Game, type GameConfig } from '../../domain/game'

export function startRun(config: GameConfig): Game {
  const game = new Game(config)
  game.startRun()
  return game
}
