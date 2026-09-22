<script setup lang="ts">
// Organismo: tienda entre oleadas (comprar armas, munición y vida).
import { computed } from 'vue'
import type { BuyRequest } from '~/domain/types'
import type { InventoryEntry } from '~/application/game-engine'
import { FLAVOR } from '~/domain/content/flavor'
import ZButton from '../atoms/ZButton.vue'
import MzWeaponCard from '../molecules/MzWeaponCard.vue'

const props = defineProps<{
  money: number
  inventory: InventoryEntry[]
  healthCost: number
}>()

const emit = defineEmits<{
  buy: [req: BuyRequest]
  next: []
}>()

const weapons = computed(() => props.inventory.filter(w => w.id !== 'pistol'))
const canBuyHealth = computed(() => props.money >= props.healthCost)
</script>

<template>
  <section class="shop" aria-label="Tienda entre oleadas">
    <div class="shop__panel">
      <header class="shop__head">
        <h2 class="shop__title">TIENDA</h2>
        <span class="shop__money">${{ money }}</span>
      </header>

      <div class="shop__supplies">
        <button class="shop__heal" :disabled="!canBuyHealth" type="button" @click="emit('buy', { kind: 'health' })">
          <span class="shop__heal-icon">✚</span>
          <span>Botiquín +40 HP</span>
          <span class="shop__heal-cost">${{ healthCost }}</span>
        </button>
      </div>

      <div class="shop__grid">
        <MzWeaponCard
          v-for="w in weapons"
          :key="w.id"
          :weapon="w"
          :money="money"
          @buy-weapon="id => emit('buy', { kind: 'weapon', id })"
          @buy-ammo="id => emit('buy', { kind: 'ammo', id })"
        />
      </div>

      <p class="shop__hint">{{ FLAVOR.taglines[0] }}</p>

      <footer class="shop__foot">
        <ZButton size="lg" @click="emit('next')">Siguiente oleada ▶</ZButton>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.shop {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  background: rgba(11, 15, 12, 0.86);
  backdrop-filter: blur(3px);
  padding: var(--z-space-4);
  overflow-y: auto;
}
.shop__panel {
  width: min(680px, 100%);
  background: var(--z-surface);
  border: 1px solid var(--z-border-strong);
  border-radius: var(--z-radius-l);
  box-shadow: var(--z-shadow);
  padding: var(--z-space-5);
}
.shop__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--z-space-3); }
.shop__title { margin: 0; letter-spacing: 0.3em; color: var(--z-toxic); font-size: var(--z-text-l); }
.shop__money { font-family: var(--z-font-mono); font-size: var(--z-text-xl); color: var(--z-amber); }
.shop__supplies { margin: var(--z-space-4) 0; }
.shop__heal {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--z-space-3);
  min-height: var(--z-touch);
  padding: var(--z-space-2) var(--z-space-4);
  border-radius: var(--z-radius-m);
  border: 1px solid var(--z-border);
  background: var(--z-surface-2);
  color: var(--z-text);
  font-family: var(--z-font);
  font-size: var(--z-text-m);
  cursor: pointer;
}
.shop__heal:hover:not(:disabled) { border-color: var(--z-border-strong); }
.shop__heal:disabled { opacity: 0.45; cursor: not-allowed; }
.shop__heal-icon { color: var(--z-blood); font-weight: 900; font-size: var(--z-text-l); }
.shop__heal-cost { margin-left: auto; font-family: var(--z-font-mono); color: var(--z-amber); }
.shop__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--z-space-3);
}
.shop__hint { text-align: center; color: var(--z-text-dim); font-size: var(--z-text-s); font-style: italic; }
.shop__foot { display: flex; justify-content: center; margin-top: var(--z-space-4); }
</style>
