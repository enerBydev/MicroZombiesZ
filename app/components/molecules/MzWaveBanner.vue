<script setup lang="ts">
// Molécula: banner animado de inicio de oleada.
defineProps<{
  wave: number
  visible: boolean
}>()
</script>

<template>
  <Transition name="banner">
    <div v-if="visible" class="wbanner" role="status">
      <span class="wbanner__pre">OLEADA</span>
      <span class="wbanner__num">{{ wave }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.wbanner {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: var(--z-banner);
  text-align: center;
}
.wbanner__pre {
  font-size: var(--z-text-m);
  letter-spacing: 0.5em;
  color: var(--z-blood);
  font-weight: 700;
  text-shadow: 0 0 12px rgba(229, 72, 77, 0.6);
}
.wbanner__num {
  font-size: var(--z-text-2xl);
  font-weight: 900;
  color: var(--z-text);
  text-shadow: 0 0 24px rgba(124, 255, 90, 0.4);
  font-variant-numeric: tabular-nums;
}
.banner-enter-active { animation: slam 0.35s ease-out; }
.banner-leave-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.banner-leave-to { opacity: 0; transform: translateX(-50%) translateY(-14px); }
@keyframes slam {
  0% { transform: translateX(-50%) scale(2.2); opacity: 0; }
  60% { transform: translateX(-50%) scale(0.95); opacity: 1; }
  100% { transform: translateX(-50%) scale(1); }
}
</style>
