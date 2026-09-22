<script setup lang="ts">
// Molécula: tarjeta de arma de la tienda (Atomic Design sobre datos del dominio).
import { computed } from 'vue'
import type { InventoryEntry } from '~/application/game-engine'
import { FLAVOR } from '~/domain/content/flavor'

const props = defineProps<{
  weapon: InventoryEntry
  money: number
}>()

const emit = defineEmits<{
  buyWeapon: [id: string]
  buyAmmo: [id: string]
}>()

const flavor = computed(() => FLAVOR.weapons[props.weapon.id] ?? { tagline: '', lore: '' })
const canBuyWeapon = computed(() => !props.weapon.owned && props.money >= props.weapon.cost)
const canBuyAmmo = computed(() =>
  props.weapon.owned && !props.weapon.infinite
  && props.money >= props.weapon.ammoCost
  && props.weapon.ammo < props.weapon.maxAmmo
)
</script>

<template>
  <article class="wcard" :class="{ 'wcard--owned': weapon.owned }">
    <header class="wcard__head">
      <span class="wcard__dot" :style="{ background: weapon.color }" />
      <h3 class="wcard__name">{{ weapon.name }}</h3>
      <span v-if="weapon.owned" class="wcard__owned">EN PROPIEDAD</span>
    </header>
    <p class="wcard__tagline">{{ flavor.tagline }}</p>
    <p class="wcard__lore">{{ flavor.lore }}</p>
    <footer class="wcard__foot">
      <span v-if="weapon.infinite" class="wcard__ammo">munición ∞</span>
      <span v-else class="wcard__ammo">{{ weapon.ammo }} / {{ weapon.maxAmmo }}</span>
      <div class="wcard__actions">
        <button
          v-if="!weapon.owned"
          class="wcard__btn"
          :disabled="!canBuyWeapon"
          type="button"
          @click="emit('buyWeapon', weapon.id)"
        >
          Comprar · ${{ weapon.cost }}
        </button>
        <button
          v-else-if="!weapon.infinite"
          class="wcard__btn wcard__btn--ammo"
          :disabled="!canBuyAmmo"
          type="button"
          @click="emit('buyAmmo', weapon.id)"
        >
          +{{ weapon.cost ? '' : '' }}Munición · ${{ weapon.ammoCost }}
        </button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.wcard {
  background: var(--z-surface);
  border: 1px solid var(--z-border);
  border-radius: var(--z-radius-l);
  padding: var(--z-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--z-space-2);
}
.wcard--owned { border-color: var(--z-border-strong); }
.wcard__head { display: flex; align-items: center; gap: var(--z-space-2); }
.wcard__dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.wcard__name { margin: 0; font-size: var(--z-text-m); font-weight: 700; }
.wcard__owned {
  margin-left: auto;
  font-size: var(--z-text-xs);
  color: var(--z-toxic);
  letter-spacing: 0.08em;
}
.wcard__tagline { margin: 0; font-size: var(--z-text-s); color: var(--z-amber); font-weight: 600; }
.wcard__lore { margin: 0; font-size: var(--z-text-s); color: var(--z-text-dim); }
.wcard__foot {
  margin-top: var(--z-space-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--z-space-2);
}
.wcard__ammo { font-family: var(--z-font-mono); font-size: var(--z-text-s); color: var(--z-steel); }
.wcard__btn {
  min-height: var(--z-touch);
  padding: 0 var(--z-space-4);
  border-radius: var(--z-radius-m);
  border: 1px solid var(--z-border-strong);
  background: var(--z-toxic);
  color: #08130a;
  font-weight: 700;
  font-family: var(--z-font);
  cursor: pointer;
  transition: filter 0.15s ease;
}
.wcard__btn--ammo { background: transparent; color: var(--z-text); }
.wcard__btn:hover:not(:disabled) { filter: brightness(1.12); }
.wcard__btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
