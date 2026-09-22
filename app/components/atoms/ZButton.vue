<script setup lang="ts">
// Átomo: botón del design system (target táctil ≥44px, mobile-first).
withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'md' | 'lg'
  disabled?: boolean
}>(), { variant: 'primary', size: 'md', disabled: false })

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    class="z-btn"
    :class="[`z-btn--${variant}`, `z-btn--${size}`]"
    :disabled="disabled"
    type="button"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.z-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--z-space-2);
  min-height: var(--z-touch);
  padding: 0 var(--z-space-5);
  border: 1px solid transparent;
  border-radius: var(--z-radius-m);
  font-family: var(--z-font);
  font-size: var(--z-text-m);
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease, background 0.15s ease;
  touch-action: manipulation;
}
.z-btn:active:not(:disabled) { transform: translateY(1px) scale(0.99); }
.z-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.z-btn--primary {
  background: var(--z-toxic);
  color: #08130a;
  box-shadow: 0 0 18px rgba(124, 255, 90, 0.25);
}
.z-btn--primary:hover:not(:disabled) { filter: brightness(1.1); }

.z-btn--ghost {
  background: transparent;
  color: var(--z-text);
  border-color: var(--z-border-strong);
}
.z-btn--ghost:hover:not(:disabled) { background: var(--z-surface-2); }

.z-btn--danger {
  background: var(--z-blood);
  color: #fff;
}
.z-btn--danger:hover:not(:disabled) { filter: brightness(1.1); }

.z-btn--lg {
  min-height: 56px;
  font-size: var(--z-text-l);
  padding: 0 var(--z-space-6);
}
</style>
