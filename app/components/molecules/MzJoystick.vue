<script setup lang="ts">
// Molécula: joystick virtual táctil (mobile-first). Emite vectores
// normalizados (-1..1). Área ≥44px con knob magnético.
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  side: 'left' | 'right'
  size?: number
}>(), { size: 118 })

const emit = defineEmits<{ move: [x: number, y: number] }>()

const origin = ref<{ x: number; y: number } | null>(null)
const knob = ref({ x: 0, y: 0 })
const active = ref(false)
const maxRadius = computed(() => props.size / 2 - 16)

function down(e: PointerEvent) {
  active.value = true
  origin.value = { x: e.clientX, y: e.clientY }
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  update(e)
}

function update(e: PointerEvent) {
  if (!origin.value) return
  let dx = e.clientX - origin.value.x
  let dy = e.clientY - origin.value.y
  const len = Math.hypot(dx, dy)
  const max = maxRadius.value
  if (len > max) {
    // origen magnético: el pad sigue al dedo sin salirse
    origin.value = { x: e.clientX - (dx / len) * max, y: e.clientY - (dy / len) * max }
    dx = (dx / len) * max
    dy = (dy / len) * max
  }
  knob.value = { x: dx, y: dy }
  emit('move', dx / max, dy / max)
}

function release() {
  active.value = false
  origin.value = null
  knob.value = { x: 0, y: 0 }
  emit('move', 0, 0)
}
</script>

<template>
  <div
    class="joy"
    :class="[`joy--${side}`, { 'joy--active': active }]"
    :style="{ width: size + 'px', height: size + 'px' }"
    @pointerdown.prevent="down"
    @pointermove.prevent="update"
    @pointerup.prevent="release"
    @pointercancel.prevent="release"
  >
    <div class="joy__ring" />
    <div class="joy__knob" :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" />
  </div>
</template>

<style scoped>
.joy {
  position: relative;
  display: grid;
  place-items: center;
  touch-action: none;
  opacity: 0.85;
}
.joy--active { opacity: 1; }
.joy__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--z-border-strong);
  background: radial-gradient(circle, rgba(124, 255, 90, 0.06), rgba(11, 15, 12, 0.5));
}
.joy--left .joy__ring { border-color: rgba(124, 255, 90, 0.42); }
.joy--right .joy__ring { border-color: rgba(229, 72, 77, 0.45); }
.joy__knob {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--z-surface-3);
  border: 2px solid var(--z-toxic-dim);
  box-shadow: var(--z-shadow);
  transition: background 0.12s ease;
}
.joy--right .joy__knob { border-color: var(--z-blood-dim); }
.joy--active .joy__knob { background: var(--z-surface-2); }
</style>
