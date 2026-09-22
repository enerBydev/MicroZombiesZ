<script setup lang="ts">
// Organismo: pantalla de game over con récord y envío al leaderboard.
import { computed, ref } from 'vue'
import ZButton from '../atoms/ZButton.vue'
import ZBadge from '../atoms/ZBadge.vue'

defineProps<{
  score: number
  wave: number
  best: { score: number; wave: number } | null
  isRecord: boolean
  leaderboard: Array<{ name: string; score: number; wave: number }>
  submitting: boolean
  submitted: boolean
}>()

const emit = defineEmits<{
  restart: []
  submit: [name: string]
}>()

const name = ref('')
const valid = computed(() => name.value.trim().length >= 2)
</script>

<template>
  <section class="over">
    <div class="over__panel">
      <h1 class="over__title">HAS CAÍDO</h1>
      <p class="over__sub">La horda te alcanzó en la oleada {{ wave }}.</p>

      <div class="over__stats">
        <div class="over__stat">
          <span class="over__stat-num">{{ score }}</span>
          <span class="over__stat-label">puntos</span>
        </div>
        <div class="over__stat">
          <span class="over__stat-num">{{ wave }}</span>
          <span class="over__stat-label">oleada</span>
        </div>
        <div class="over__stat">
          <span class="over__stat-num">{{ best?.score ?? score }}</span>
          <span class="over__stat-label">récord</span>
        </div>
      </div>

      <ZBadge v-if="isRecord" label="¡Nuevo récord personal!" tone="amber" />

      <div v-if="!submitted" class="over__save">
        <input
          v-model="name"
          class="over__input"
          type="text"
          maxlength="18"
          placeholder="Tu nombre de superviviente"
          @keydown.enter="valid && emit('submit', name.trim())"
        >
        <ZButton variant="ghost" :disabled="!valid || submitting" @click="emit('submit', name.trim())">
          {{ submitting ? 'Guardando…' : 'Guardar puntuación' }}
        </ZButton>
      </div>

      <ZButton size="lg" @click="emit('restart')">REINTENTAR</ZButton>
    </div>
  </section>
</template>

<style scoped>
.over {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  background: radial-gradient(900px 420px at 50% 30%, rgba(140, 47, 51, 0.25), transparent), rgba(11, 15, 12, 0.93);
  padding: var(--z-space-4);
  overflow-y: auto;
}
.over__panel { width: min(480px, 100%); display: flex; flex-direction: column; gap: var(--z-space-4); align-items: center; text-align: center; }
.over__title { margin: 0; font-size: clamp(30px, 8vw, 48px); font-weight: 900; color: var(--z-blood); text-shadow: 0 0 30px rgba(229, 72, 77, 0.5); letter-spacing: 0.06em; }
.over__sub { margin: 0; color: var(--z-text-dim); }
.over__stats { display: flex; gap: var(--z-space-5); }
.over__stat { display: flex; flex-direction: column; }
.over__stat-num { font-size: var(--z-text-xl); font-weight: 900; font-family: var(--z-font-mono); color: var(--z-toxic); }
.over__stat-label { font-size: var(--z-text-xs); color: var(--z-steel); text-transform: uppercase; letter-spacing: 0.14em; }
.over__save { display: flex; gap: var(--z-space-2); flex-wrap: wrap; justify-content: center; }
.over__input {
  min-height: var(--z-touch);
  padding: 0 var(--z-space-4);
  border-radius: var(--z-radius-m);
  border: 1px solid var(--z-border-strong);
  background: var(--z-surface-2);
  color: var(--z-text);
  font-family: var(--z-font);
  font-size: var(--z-text-m);
  outline: none;
  width: min(260px, 70vw);
}
.over__input:focus { border-color: var(--z-toxic); }
</style>
