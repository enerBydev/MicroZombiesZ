# ADR-001 — Arquitectura Hexagonal / Clean / DDD

- **Estado:** aceptada
- **Fecha:** 2026-09-22
- **Contexto:** MicroZombiesZ debe ser testeable, portable (móvil/desktop) y
  extensible (armas, zombies, oleadas) sin que la lógica dependa de Vue, Canvas
  o DOM.

## Decisión

Tres anillos con dependencias solo hacia adentro:

```
┌──────────────────────────────────────────────────────┐
│ presentation (Vue: pages/components/composables)     │
│   usa → application (GameEngine, use-cases)          │
│            usa → domain (puro, sin framework)        │
│ infrastructure implementa los puertos del dominio:   │
│   CanvasRenderer · KeyboardMouseInput · TouchInput · │
│   LocalStorageScoreRepository                        │
└──────────────────────────────────────────────────────┘
```

- **Dominio puro** (`app/domain`): cero imports de Vue/Nuxt/DOM; lo garantiza
  una regla de ESLint (`no-restricted-imports` + `no-restricted-globals`) y la
  configuración de Vitest que ejecuta esos tests en entorno `node`.
- **Puertos** (`app/domain/ports.ts`): `RandomSource`, `GameClock`,
  `ScoreRepository`, `SpawnStrategy`, `RenderPort`, `InputAdapter`.
- **Eventos de dominio:** `tick()` devuelve `DomainEvent[]`; el dominio no
  conoce la UI ni la persistencia.
- **Continuo vs. discreto:** las acciones continuas (mover, disparar,
  colisionar) viven en `Game.tick`; las discretas son comandos/use-cases
  (`startRun`, `endRun`, `buyUpgrade`, `nextWave`, `restart`).

## Consecuencias

- ✅ 76 tests sin navegador; determinismo con `SeededRandom` (mulberry32).
- ✅ Cambiar canvas por WebGL u otro storage no toca el dominio.
- ⚠️ Coste: más ficheros y mapeo a snapshots (`GameSnapshot`, `UiSnapshot`).
