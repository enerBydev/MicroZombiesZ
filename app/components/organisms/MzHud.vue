<script setup lang="ts">
// Organismo: HUD superior (vida, dinero, oleada, score, arma + munición).
import type { UiSnapshot } from '~/application/game-engine'
import ZBadge from '../atoms/ZBadge.vue'
import ZHealthBar from '../atoms/ZHealthBar.vue'

defineProps<{
  ui: UiSnapshot
}>()
</script>

<template>
  <header class="hud">
    <div class="hud__cell hud__cell--hp">
      <ZHealthBar :value="ui.hp / ui.maxHp" :label="'HP ' + ui.hp" />
    </div>
    <div class="hud__cell">
      <ZBadge :label="'$' + ui.money" tone="amber" />
      <ZBadge :label="'Oleada ' + ui.wave" tone="blood" />
    </div>
    <div class="hud__cell">
      <ZBadge :label="'Pts ' + ui.score" tone="toxic" />
      <ZBadge :label="'Zombis ' + ui.zombiesLeft" tone="steel" />
    </div>
    <div class="hud__cell hud__cell--weapon">
      <span class="hud__dot" :style="{ background: ui.weaponColor }" />
      <span class="hud__weapon">{{ ui.weaponName }}</span>
      <span class="hud__ammo">{{ ui.infiniteAmmo ? '∞' : ui.ammo }}</span>
    </div>
  </header>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--z-hud-h);
  display: flex;
  align-items: center;
  gap: var(--z-space-3);
  padding: 0 var(--z-space-3);
  background: linear-gradient(rgba(11, 15, 12, 0.92), rgba(11, 15, 12, 0.65));
  border-bottom: 1px solid var(--z-border);
  z-index: var(--z-hud);
  flex-wrap: nowrap;
  overflow: hidden;
}
.hud__cell { display: flex; align-items: center; gap: var(--z-space-2); flex-shrink: 0; }
.hud__cell--hp { flex: 1 1 160px; min-width: 120px; }
.hud__cell--weapon { margin-left: auto; }
.hud__dot { width: 10px; height: 10px; border-radius: 50%; }
.hud__weapon { font-size: var(--z-text-s); font-weight: 700; white-space: nowrap; }
.hud__ammo { font-family: var(--z-font-mono); font-size: var(--z-text-s); color: var(--z-amber); min-width: 30px; text-align: right; }
@media (max-width: 540px) {
  .hud__cell--hp { flex-basis: 110px; }
  .hud__weapon { display: none; }
}
</style>
