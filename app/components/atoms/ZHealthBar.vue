<script setup lang="ts">
// Átomo: barra de vida con semáforo verde→ámbar→rojo.
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number // 0..1
  label?: string
  compact?: boolean
}>(), { label: '', compact: false })

const pct = computed(() => Math.round(Math.min(1, Math.max(0, props.value)) * 100))
const tone = computed(() => pct.value > 55 ? 'ok' : pct.value > 25 ? 'warn' : 'crit')
</script>

<template>
  <div class="z-hp" :class="{ 'z-hp--compact': compact }">
    <span v-if="label" class="z-hp__label">{{ label }}</span>
    <div class="z-hp__track" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100">
      <div class="z-hp__fill" :class="`z-hp__fill--${tone}`" :style="{ width: pct + '%' }" />
    </div>
    <span class="z-hp__num">{{ pct }}%</span>
  </div>
</template>

<style scoped>
.z-hp { display: flex; align-items: center; gap: var(--z-space-2); min-width: 140px; }
.z-hp--compact { min-width: 96px; }
.z-hp__label { font-size: var(--z-text-xs); color: var(--z-text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.z-hp__track {
  flex: 1;
  height: 10px;
  background: var(--z-surface-2);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: var(--z-shadow-inset);
}
.z-hp__fill { height: 100%; border-radius: 999px; transition: width 0.15s ease; }
.z-hp__fill--ok { background: var(--z-toxic-dim); }
.z-hp__fill--warn { background: var(--z-amber); }
.z-hp__fill--crit { background: var(--z-blood); }
.z-hp__num { font-family: var(--z-font-mono); font-size: var(--z-text-xs); color: var(--z-text-dim); min-width: 34px; text-align: right; }
</style>
