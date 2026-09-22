<script setup lang="ts">
// Átomo: insignia/píldora informativa.
withDefaults(defineProps<{
  label: string
  tone?: 'toxic' | 'blood' | 'amber' | 'steel'
}>(), { tone: 'steel' })
</script>

<template>
  <span class="z-badge" :class="`z-badge--${tone}`">{{ label }}</span>
</template>

<style scoped>
.z-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--z-space-2);
  border-radius: 999px;
  font-size: var(--z-text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.4;
}
.z-badge--toxic { background: rgba(124, 255, 90, 0.14); color: var(--z-toxic); }
.z-badge--blood { background: rgba(229, 72, 77, 0.16); color: var(--z-blood); }
.z-badge--amber { background: rgba(255, 178, 36, 0.14); color: var(--z-amber); }
.z-badge--steel { background: rgba(139, 152, 165, 0.14); color: var(--z-steel); }
</style>
