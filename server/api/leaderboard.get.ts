// GET /api/leaderboard — top 10 de puntuaciones (persistido en .data).
import type { LeaderRow } from '../../app/stores/game'


export default defineEventHandler(async () => {
  const storage = useStorage('leaderboard')
  const raw = await storage.getItem<LeaderRow[]>('scores.json')
  const rows = Array.isArray(raw) ? raw : []
  return rows
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
})
