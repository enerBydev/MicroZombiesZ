# ADR-004 — Strategy (armas/IA/oleadas) y Repository (récords)

- **Estado:** aceptada
- **Fecha:** 2026-09-22

## Contexto

La SPEC exige armas intercambiables, zombies con comportamientos distintos y
oleadas que escalan; además persistencia de récords sin acoplar el dominio a
localStorage.

## Decisión

**Strategy** en tres puntos de extensión del dominio:

| Puerto | Implementaciones | Selector |
|---|---|---|
| `WeaponStrategy` | Pistol, Shotgun, SMG, Rifle | tienda (`buyUpgrade`) / índice de inventario |
| `ZombieBrain` | Walker, Runner, Brute, Spitter | `kind` del zombie (`BRAINS`) |
| `SpawnStrategy` | StandardWaveStrategy | config del `Game` |

Cada arma es una subclase con su tabla de stats (`WeaponStats`) y comparte el
algoritmo de generación de proyectiles (`spawnBullets` con dispersión y RNG
inyectado). La IA devuelve desplazamiento + ataque opcional por tick.

**Repository**: puerto `ScoreRepository` (`getBest/saveBest` atómico) con dos
adaptadores: `InMemoryScoreRepository` (tests/dev) y
`LocalStorageScoreRepository` (producción, a prueba de storage ausente).
El use-case `endRun` decide si hubo récord — la regla vive en la aplicación,
no en el adaptador.

## Consecuencias

- ✅ Añadir un arma = 1 clase + 1 entrada de catálogo + flavor; añadir un
  zombie = 1 brain + 1 fila de `ZOMBIE_TYPES`.
- ✅ Tests de estrategias deterministas con seed.
- ⚠️ Los datos (`ZOMBIE_TYPES`, stats) viven en el dominio como tabla única
  de verdad; la UI no duplica números.
