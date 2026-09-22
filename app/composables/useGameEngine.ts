// useGameEngine — composable que instancía el GameEngine sobre el canvas,
// expone snapshots reactivos para la UI y traduce gestos (joysticks) y
// comandos (comprar, siguiente oleada) hacia el dominio.

import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'
import { GameEngine, type UiSnapshot } from '~/application/game-engine'
import { LocalStorageScoreRepository } from '~/infrastructure/local-storage-score-repository'
import type { BuyRequest, GameState } from '~/domain/types'
import { useGameStore } from '~/stores/game'

const DEFAULT_UI: UiSnapshot = {
  state: 'menu',
  hp: 100,
  maxHp: 100,
  money: 0,
  wave: 0,
  score: 0,
  weaponId: 'pistol',
  weaponName: 'Pistola 9mm',
  weaponColor: '#ffd166',
  ammo: Number.POSITIVE_INFINITY,
  infiniteAmmo: true,
  zombiesLeft: 0,
  inventory: []
}

export function useGameEngine() {
  const store = useGameStore()
  const canvasEl = ref<HTMLCanvasElement | null>(null)
  const engine = shallowRef<GameEngine | null>(null)
  const ui = reactive<UiSnapshot>({ ...DEFAULT_UI })
  const screen = ref<GameState>('menu')
  const isRecord = ref(false)
  const bannerWave = ref(0)
  const bannerVisible = ref(false)
  const isTouchDevice = ref(false)
  let bannerTimer: ReturnType<typeof setTimeout> | undefined

  function onResize() {
    engine.value?.resizeToCanvas()
  }

  onMounted(() => {
    if (!canvasEl.value || engine.value) return
    const repo = new LocalStorageScoreRepository()
    const e = new GameEngine({
      canvas: canvasEl.value,
      scoreRepo: repo,
      onSnapshot: s => Object.assign(ui, s),
      onState: s => {
        screen.value = s
        if (s === 'gameover') store.resetSubmission()
        if (s !== 'shop') bannerVisible.value = false
      },
      onEvent: ev => {
        if (ev.type === 'wave-started') {
          bannerWave.value = ev.wave
          bannerVisible.value = true
          clearTimeout(bannerTimer)
          bannerTimer = setTimeout(() => { bannerVisible.value = false }, 1800)
        }
      },
      onRecord: () => store.setBest(repo.getBest())
    })
    engine.value = e
    isTouchDevice.value = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice.value) e.useTouchControls()
    e.start()
    e.resizeToCanvas()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    store.setBest(repo.getBest())
    void store.fetchLeaderboard()
  })

  onBeforeUnmount(() => {
    engine.value?.stop()
    engine.value = null
    clearTimeout(bannerTimer)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
  })

  function start() {
    isRecord.value = false
    engine.value?.beginRun()
  }

  function nextWave() {
    engine.value?.nextWave()
  }

  function buy(req: BuyRequest) {
    return engine.value?.buy(req)
  }

  function restart() {
    isRecord.value = false
    engine.value?.restart()
    screen.value = 'menu'
  }

  function joystick(side: 'left' | 'right', x: number, y: number) {
    engine.value?.setJoystick(side, x, y)
  }

  const best = computed(() => store.best)
  const leaderboard = computed(() => store.leaderboard)

  return {
    canvasEl,
    ui,
    screen,
    isRecord,
    bannerWave,
    bannerVisible,
    isTouchDevice,
    best,
    leaderboard,
    start,
    nextWave,
    buy,
    restart,
    joystick,
    submitScore: store.submitScore,
    submitting: computed(() => store.submitting),
    submitted: computed(() => store.submitted)
  }
}
