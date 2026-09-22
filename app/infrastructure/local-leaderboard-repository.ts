/// <reference lib="dom" />

// LocalLeaderboardRepository — adaptador de leaderboard en localStorage.
// Repository pattern: expone la misma forma que la API de Nitro
// (GET/POST /api/leaderboard) para que la store conmute de estrategia
// (HTTP → local) sin cambiar su interfaz. GitHub Pages no tiene backend,
// así que este adaptador mantiene la tabla de puntuaciones en el navegador.
// A prueba de entornos sin storage (modo privado): degrada a memoria.

import type { LeaderRow } from '../stores/game'

const KEY = 'mzz:leaderboard-local'
const MAX_KEEP = 100

export class LocalLeaderboardRepository {
  private memory: LeaderRow[] = []

  private read(): LeaderRow[] {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return this.memory
      const parsed = JSON.parse(raw) as LeaderRow[]
      return Array.isArray(parsed) ? parsed : this.memory
    } catch {
      return this.memory
    }
  }

  private write(rows: LeaderRow[]): void {
    this.memory = rows
    try {
      localStorage.setItem(KEY, JSON.stringify(rows))
    } catch {
      /* storage lleno o ausente: la tabla vive solo en memoria esta sesión */
    }
  }

  async fetchTop(): Promise<LeaderRow[]> {
    return this.read().slice().sort((a, b) => b.score - a.score).slice(0, 10)
  }

  async submit(entry: LeaderRow): Promise<{ rank: number | null; entries: LeaderRow[] }> {
    const rows = this.read().slice()
    rows.push(entry)
    rows.sort((a, b) => b.score - a.score)
    const kept = rows.slice(0, MAX_KEEP)
    this.write(kept)
    const idx = kept.findIndex(r => r === entry || (r.at === entry.at && r.score === entry.score && r.name === entry.name))
    return { rank: idx >= 0 ? idx + 1 : null, entries: kept.slice(0, 10) }
  }
}
