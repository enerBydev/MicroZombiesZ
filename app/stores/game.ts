// Store Pinia: datos de servidor (leaderboard) y espejo del récord local.
// El estado de juego en vivo vive en el GameEngine (composable), no aquí —
// la store solo guarda lo que cruza la frontera HTTP/persistencia.

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ScoreEntry } from '~/domain/ports'

export interface LeaderRow {
  name: string
  score: number
  wave: number
  at: string
}

export const useGameStore = defineStore('game', () => {
  const best = ref<ScoreEntry | null>(null)
  const leaderboard = ref<LeaderRow[]>([])
  const submitting = ref(false)
  const submitted = ref(false)

  function setBest(entry: ScoreEntry | null) {
    best.value = entry
  }

  async function fetchLeaderboard() {
    try {
      leaderboard.value = await $fetch<LeaderRow[]>('/api/leaderboard')
    } catch {
      /* offline-first: la partida funciona sin servidor */
    }
  }

  async function submitScore(name: string, score: number, wave: number): Promise<number | null> {
    submitting.value = true
    try {
      const res = await $fetch<{ rank: number | null; entries: LeaderRow[] }>('/api/leaderboard', {
        method: 'POST',
        body: { name, score, wave }
      })
      leaderboard.value = res.entries
      submitted.value = true
      return res.rank
    } catch {
      return null
    } finally {
      submitting.value = false
    }
  }

  function resetSubmission() {
    submitted.value = false
  }

  return { best, leaderboard, submitting, submitted, setBest, fetchLeaderboard, submitScore, resetSubmission }
})
