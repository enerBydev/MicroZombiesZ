// Store Pinia: datos de servidor (leaderboard) y espejo del récord local.
// El estado de juego en vivo vive en el GameEngine (composable), no aquí —
// la store solo guarda lo que cruza la frontera HTTP/persistencia.
//
// Estrategia de leaderboard (Repository/Strategy): primero la API de Nitro
// (despliegue fullstack con backend); si no está disponible —GitHub Pages,
// offline— degrada a LocalLeaderboardRepository (tabla en localStorage).
// El juego nunca pierde la tabla por falta de servidor.

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ScoreEntry } from '~/domain/ports'
import { LocalLeaderboardRepository } from '~/infrastructure/local-leaderboard-repository'

export interface LeaderRow {
  name: string
  score: number
  wave: number
  at: string
}

const localRepo = new LocalLeaderboardRepository()

export const useGameStore = defineStore('game', () => {
  const best = ref<ScoreEntry | null>(null)
  const leaderboard = ref<LeaderRow[]>([])
  const submitting = ref(false)
  const submitted = ref(false)
  const source = ref<'api' | 'local'>('api')

  function setBest(entry: ScoreEntry | null) {
    best.value = entry
  }

  async function fetchLeaderboard() {
    try {
      leaderboard.value = await $fetch<LeaderRow[]>('/api/leaderboard')
      source.value = 'api'
    } catch {
      // Pages / offline: top-10 local (Repository fallback)
      source.value = 'local'
      leaderboard.value = await localRepo.fetchTop()
    }
  }

  async function submitScore(name: string, score: number, wave: number): Promise<number | null> {
    submitting.value = true
    try {
      const res = await $fetch<{ rank: number | null; entries: LeaderRow[] }>('/api/leaderboard', {
        method: 'POST',
        body: { name, score, wave }
      })
      source.value = 'api'
      leaderboard.value = res.entries
      submitted.value = true
      return res.rank
    } catch {
      // Fallback local: registra en localStorage y calcula el rank igual que la API
      source.value = 'local'
      const entry: LeaderRow = { name, score, wave, at: new Date().toISOString() }
      const { rank, entries } = await localRepo.submit(entry)
      leaderboard.value = entries
      submitted.value = true
      return rank
    } finally {
      submitting.value = false
    }
  }

  function resetSubmission() {
    submitted.value = false
  }

  return { best, leaderboard, submitting, submitted, source, setBest, fetchLeaderboard, submitScore, resetSubmission }
})
