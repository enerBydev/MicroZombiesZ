// POST /api/leaderboard — registra una puntuación y devuelve rank + top 10.
import type { LeaderRow } from '../../app/stores/game'

const MAX_KEEP = 100

function sanitizeName(v: unknown): string {
  const s = typeof v === 'string' ? v.trim().slice(0, 18) : ''
  return s.length > 0 ? s : 'Anónimo'
}

function sanitizeInt(v: unknown, fallback: number, min: number): number {
  const n = Math.floor(Number(v))
  return Number.isFinite(n) ? Math.max(min, n) : fallback
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<LeaderRow>>(event)

  const name = sanitizeName(body.name)
  const score = sanitizeInt(body.score, 0, 0)
  const wave = sanitizeInt(body.wave, 1, 1)

  const storage = useStorage('leaderboard')
  const raw = await storage.getItem<LeaderRow[]>('scores.json')
  const rows = Array.isArray(raw) ? raw : []

  const entry: LeaderRow = { name, score, wave, at: new Date().toISOString() }
  rows.push(entry)
  rows.sort((a, b) => b.score - a.score)
  const kept = rows.slice(0, MAX_KEEP)
  await storage.setItem('scores.json', kept)

  const rank = kept.findIndex(r => r === entry) + 1
  return {
    rank: rank > 0 ? rank : null,
    entries: kept.slice(0, 10)
  }
})
