// Use-case EndRun — persiste el récord a través del puerto ScoreRepository
// (Repository pattern) y reporta si la partida estableció récord.

import type { ScoreEntry, ScoreRepository } from '../../domain/ports'

export interface EndRunResult {
  isRecord: boolean
  best: ScoreEntry
}

export function endRun(result: { score: number; wave: number }, repo: ScoreRepository): EndRunResult {
  const previous = repo.getBest()
  const saved = repo.saveBest({
    score: result.score,
    wave: result.wave,
    at: new Date().toISOString()
  })
  return {
    isRecord: previous === null || result.score > previous.score,
    best: saved
  }
}
