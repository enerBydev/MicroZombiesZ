<script setup lang="ts">
// MicroZombiesZ — página única: orquesta el canvas y las pantallas
// (menu → playing → shop → gameover) según el estado del dominio.
import { FLAVOR } from '~/domain/content/flavor'
import MzHud from '~/components/organisms/MzHud.vue'
import MzShopOverlay from '~/components/organisms/MzShopOverlay.vue'
import MzStartScreen from '~/components/organisms/MzStartScreen.vue'
import MzGameOverScreen from '~/components/organisms/MzGameOverScreen.vue'
import MzJoystick from '~/components/molecules/MzJoystick.vue'
import MzWaveBanner from '~/components/molecules/MzWaveBanner.vue'
import { useGameEngine } from '~/composables/useGameEngine'

const {
  canvasEl, ui, screen, isRecord, bannerWave, bannerVisible,
  isTouchDevice, best, leaderboard, start, nextWave, buy, restart,
  joystick, submitScore, submitting, submitted
} = useGameEngine()

const HEALTH_COST = 60

function onSubmit(name: string) {
  void submitScore(name, ui.score, ui.wave)
}
</script>

<template>
  <div class="mz-app">
    <div class="mz-stage" @contextmenu.prevent>
      <canvas ref="canvasEl" class="mz-canvas" />

      <MzWaveBanner :wave="bannerWave" :visible="bannerVisible" />

      <MzHud v-if="screen === 'playing' || screen === 'shop'" :ui="ui" />

      <template v-if="isTouchDevice && screen === 'playing'">
        <MzJoystick side="left" class="mz-joy mz-joy--left" @move="(x, y) => joystick('left', x, y)" />
        <MzJoystick side="right" class="mz-joy mz-joy--right" @move="(x, y) => joystick('right', x, y)" />
      </template>

      <MzStartScreen
        v-if="screen === 'menu'"
        :best="best"
        :leaderboard="leaderboard"
        @start="start"
      />

      <MzShopOverlay
        v-else-if="screen === 'shop'"
        :money="ui.money"
        :inventory="ui.inventory"
        :health-cost="HEALTH_COST"
        @buy="req => buy(req)"
        @next="nextWave"
      />

      <MzGameOverScreen
        v-else-if="screen === 'gameover'"
        :score="ui.score"
        :wave="ui.wave"
        :best="best"
        :is-record="isRecord"
        :leaderboard="leaderboard"
        :submitting="submitting"
        :submitted="submitted"
        @restart="restart"
        @submit="onSubmit"
      />
    </div>
    <p v-if="screen === 'playing' && !isTouchDevice" class="mz-hint">
      {{ FLAVOR.taglines[3] }} · ESC para apuntar tranquilo
    </p>
  </div>
</template>

<style scoped>
.mz-app {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--z-bg);
}
.mz-stage {
  position: relative;
  flex: 1;
  overflow: hidden;
}
.mz-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
}
.mz-joy { position: absolute; bottom: max(var(--z-space-5), env(safe-area-inset-bottom)); z-index: var(--z-hud); }
.mz-joy--left { left: max(var(--z-space-5), env(safe-area-inset-left)); }
.mz-joy--right { right: max(var(--z-space-5), env(safe-area-inset-right)); }
.mz-hint {
  margin: 0;
  padding: var(--z-space-1) 0;
  text-align: center;
  font-size: var(--z-text-xs);
  color: var(--z-text-dim);
  background: var(--z-bg);
}
</style>
