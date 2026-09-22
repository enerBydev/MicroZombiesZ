# RUNBOOK — Cómo correr MicroZombiesZ

> La respuesta corta a "¿el proyecto es funcional y cómo se corre?": **SÍ, es funcional**
> (81 tests verdes, typecheck limpio, build de producción OK) y se corre así:

## 1. Requisitos

- Node.js 20 o 22 (el CI valida ambos).
- npm 10+ (viene con Node).
- Opcional: Nix para un entorno 100% reproducible (`nix develop`).

## 2. Instalar y jugar (desarrollo)

```bash
npm ci          # instala dependencias exactas del lockfile
npm run dev     # abre http://localhost:3000 — jugable al instante
```

Controles: **WASD/flechas o joystick táctil** para moverse, **ratón/touch** para
apuntar y disparar, **1-4** para cambiar de arma, **B** para abrir la tienda
entre oleadas. Mobile-first: en pantallas táctiles aparece el joystick virtual.

## 3. QA completa (lo que corre el CI)

```bash
npm run qa              # 6 etapas: lint, tipos, unitarios+cobertura, build, e2e, smoke
npm run test:unit       # solo unitarios (vitest)
npm run test:coverage   # unitarios + cobertura (umbrales en vitest.config.ts)
npm run typecheck       # nuxt typecheck (0 errores esperados)
npm run lint            # eslint
npm run test:e2e        # Playwright contra build de producción (Chromium)
```

## 4. Build de producción (fullstack con leaderboard)

```bash
npm run build                        # Nitro fullstack en .output/
node .output/server/index.mjs        # sirve el juego + API /api/leaderboard
```

La API del leaderboard persiste en `.data/leaderboard` (driver fs de Nitro).

## 5. Sitio estático (GitHub Pages)

```bash
NUXT_APP_BASE_URL=/MicroZombiesZ/ npx nuxt generate   # SPA estática en .output/public
```

- Workflow: `.github/workflows/deploy-pages.yml` (push a main o manual).
- URL pública: https://enerbydev.github.io/MicroZombiesZ/
- Sin backend Nitro en Pages, la store degrada sola: `LocalLeaderboardRepository`
  guarda el top-10 en `localStorage` (Repository/Strategy, ver `app/infrastructure/`).
  En despliegues fullstack la API de Nitro tiene prioridad automáticamente.

## 6. Storybook (Design System)

```bash
npm run storybook       # átomos Z*, moléculas/organismos Mz* en http://localhost:6006
npm run build-storybook
```

## 7. Nix (entorno reproducible)

```bash
nix develop     # Node 22 + git con versiones fijadas en flake.nix
```

## 8. Estructura (Arquitectura Hexagonal)

```
app/domain/          núcleo DDD puro (Game, Player, Zombie, WeaponStrategy…)
app/application/     casos de uso (startRun, endRun)
app/infrastructure/  adaptadores (Canvas, input, repositorios de scores)
tests/               specs unitarias por capa + e2e/ para Playwright
server/api/          endpoints Nitro del leaderboard (fullstack)
docs/                ADRs, informe de inspección, pendientes
```

## 9. Problemas conocidos

- Warning de typecheck `vue-router/volar/sfc-route-blocks`: no fatal (exit 0),
  documentado en `docs/INFORME-INSPECCION.md`.
- En Pages el leaderboard es local al navegador (no hay backend estático).
