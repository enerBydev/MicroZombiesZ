# ADR-003 — Nuxt 4 con SSR desactivado, Nitro para la API

- **Estado:** aceptada
- **Fecha:** 2026-09-22

## Contexto

MicroZombiesZ es un juego 100% client-side (canvas + rAF + joysticks), dentro
del ecosistema fullstack Nuxt. El SSR solo añadiría hidratación problemática
para un canvas mutable, pero Nitro aporta valor real: API HTTP para el
leaderboard y build/preview unificados.

## Decisión

- `ssr: false` (SPA). `app.vue` → `NuxtPage` única (`pages/index.vue`).
- Leaderboard vía **Nitro server routes** (`server/api/leaderboard.{get,post}.ts`)
  con `useStorage` (driver fs, base `./.data/leaderboard`).
- Componentes con imports explícitos de `vue` (`ref`, `computed`) para que
  también funcionen fuera de Nuxt (tests con `@vue/test-utils`, Storybook).

## Consecuencias

- ✅ Sin mismatches de hidratación; arranque directo del engine en `onMounted`.
- ✅ La API sobrevive sin servidor (el juego funciona offline-first; el
  récord local vive en `LocalStorageScoreRepository`).
- ⚠️ SEO irrelevante para un juego; el `seoMeta` se reduce al head estático.
