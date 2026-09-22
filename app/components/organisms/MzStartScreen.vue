<script setup lang="ts">
// Organismo: pantalla de inicio (menú principal).
import { FLAVOR } from '~/domain/content/flavor'
import ZBadge from '../atoms/ZBadge.vue'
import ZButton from '../atoms/ZButton.vue'

defineProps<{
  best: { score: number; wave: number } | null
  leaderboard: Array<{ name: string; score: number; wave: number }>
}>()

defineEmits<{ start: [] }>()
</script>

<template>
  <section class="start">
    <div class="start__panel">
      <h1 class="start__title">
        <span class="start__micro">MICRO</span><span class="start__z">ZOMBIES</span><span class="start__zz">Z</span>
      </h1>
      <p class="start__tagline">{{ FLAVOR.taglines[1] }}</p>

      <div class="start__badges">
        <ZBadge v-if="best" :label="'Récord: ' + best.score + ' pts · Oleada ' + best.wave" tone="amber" />
        <ZBadge v-else label="Aún sin récord — estrena la carnicería" tone="steel" />
      </div>

      <ZButton size="lg" @click="$emit('start')">COMENZAR PARTIDA</ZButton>

      <div class="start__controls">
        <p><strong>Escritorio:</strong> WASD para moverte · ratón para apuntar · click para disparar</p>
        <p><strong>Móvil:</strong> joystick izquierdo mueve · joystick derecho apunta y dispara</p>
      </div>

      <div v-if="leaderboard.length" class="start__board">
        <h2 class="start__board-title">TOP SUPERVIVIENTES</h2>
        <ol>
          <li v-for="(row, i) in leaderboard.slice(0, 5)" :key="i">
            <span class="start__rank">{{ i + 1 }}</span>
            <span class="start__name">{{ row.name }}</span>
            <span class="start__pts">{{ row.score }} pts</span>
            <span class="start__wave">Ol. {{ row.wave }}</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.start {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  background:
    radial-gradient(1200px 500px at 50% -10%, rgba(63, 174, 42, 0.14), transparent),
    rgba(11, 15, 12, 0.94);
  padding: var(--z-space-4);
  overflow-y: auto;
}
.start__panel { width: min(560px, 100%); text-align: center; display: flex; flex-direction: column; gap: var(--z-space-4); align-items: center; }
.start__title { margin: 0; font-size: clamp(34px, 9vw, 58px); font-weight: 900; line-height: 1; letter-spacing: 0.02em; }
.start__micro { color: var(--z-text); }
.start__z { color: var(--z-toxic); text-shadow: 0 0 30px rgba(124, 255, 90, 0.45); }
.start__zz {
  color: var(--z-blood);
  margin-left: 0.15em;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
.start__tagline { margin: 0; color: var(--z-text-dim); font-style: italic; }
.start__badges { display: flex; gap: var(--z-space-2); flex-wrap: wrap; justify-content: center; }
.start__controls { color: var(--z-text-dim); font-size: var(--z-text-s); line-height: 1.6; }
.start__controls p { margin: var(--z-space-1) 0; }
.start__controls strong { color: var(--z-toxic-dim); }
.start__board { width: 100%; text-align: left; }
.start__board-title { font-size: var(--z-text-xs); letter-spacing: 0.24em; color: var(--z-steel); margin: 0 0 var(--z-space-2); }
.start__board ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--z-space-1); }
.start__board li {
  display: flex;
  align-items: center;
  gap: var(--z-space-3);
  background: var(--z-surface);
  border: 1px solid var(--z-border);
  border-radius: var(--z-radius-s);
  padding: var(--z-space-2) var(--z-space-3);
  font-size: var(--z-text-s);
}
.start__rank { color: var(--z-amber); font-weight: 800; width: 18px; }
.start__name { flex: 1; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.start__pts { font-family: var(--z-font-mono); color: var(--z-toxic); }
.start__wave { color: var(--z-steel); font-size: var(--z-text-xs); }
</style>
