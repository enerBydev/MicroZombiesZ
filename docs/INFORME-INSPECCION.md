# INFORME DE INSPECCIÓN — MicroZombiesZ v1.0.0

Fecha: 2026-09-22 · Inspector: Claude Code 2.1.278 vía glm-claude-bridge (transporte relay, cerebro = LLM de la sesión chat.z.ai) · Orquestador: Super Z

## 1. Veredicto: ¿el proyecto es funcional?

**SÍ — el proyecto es funcional en local**, con evidencia ejecutada (ficheros de evidencia en `/home/z/my-project/run/mz-cc/`):

| Verificación | Resultado | Evidencia |
|---|---|---|
| Unitarios (vitest) | **76/76 PASS**, 11 ficheros, 4.8s (exit 0) | `evidence-vitest.txt` |
| Typecheck (nuxt typecheck) | **exit 0, 0 errores TS** (warning no-fatal de plugin volar) | `evidence-typecheck.txt` |
| Build producción (`npm run build`) | **exit 0**, 2 MB total (500 kB gzip), Nitro OK | `evidence-build.txt` |

La QA del repo (`npm run qa`, 6 etapas) incluye además E2E real con Chromium (3 specs) contra build de producción; quedó verde en el release 1.0.0 (76/76 + cobertura dominio+app 89.29%).

## 2. ¿Cómo se corre?

| Acción | Comando |
|---|---|
| Desarrollo (http://localhost:3000) | `npm run dev` |
| QA completa (6 etapas) | `npm run qa` o `bash qa.sh` |
| Unitarios / cobertura | `npm run test:unit` / `npm run test:coverage` |
| E2E (Playwright, Chromium) | `npm run test:e2e` |
| Typecheck / lint | `npm run typecheck` / `npm run lint` |
| Build producción (Nitro fullstack) | `npm run build` + `node .output/server/index.mjs` |
| Sitio estático (Pages) | `npm run generate` (con `NUXT_APP_BASE_URL` — ver §4) |
| Storybook (Design System) | `npm run storybook` |
| Entorno reproducible (Nix) | `nix develop` |

Requisitos: Node 20/22, `npm ci` previo. El juego es 100% client-side (SSR off, ADR-003); el leaderboard es la única API fullstack (Nitro).

## 3. Problemas hallados (priorizados)

### P0 — rompen integración/despliegue
- **P0-1 · CI de GitHub roto por YAML corrupto**: `.github/workflows/ci.yml` líneas 8 y 10 dicen `branches: ain, develop]` — falta el `[` y la `m` de `main` (dos sitios: `on.push` y `on.pull_request`). GitHub Actions solo tiene 1 run histórico y en **failure** (2026-09-22). Arreglo: restaurar `branches: [main, develop]` en ambos y validar YAML.
- **P0-2 · Sin despliegue a GitHub Pages**: no existe workflow de Pages y el juego no es accesible públicamente. Arreglo: workflow `deploy-pages.yml` con `nuxt generate` estático + actions `configure-pages/upload-pages-artifact/deploy-pages` (ver §4).

### P1 — degradación en Pages
- **P1-1 · Leaderboard no funciona en hosting estático**: `server/api/leaderboard*` usa Nitro con driver `fs` (`.data/leaderboard`), que no existe en GitHub Pages (solo assets estáticos). Arreglo con los patrones del repo (Repository/Strategy): en cliente, si `GET/POST /api/leaderboard` falla (404/HTML en vez de JSON), conmutar a `LocalStorageScoreRepository` (ya existe como adaptador del puerto ScoreRepository). El juego queda 100% jugable en Pages; la API es bonus en despliegue fullstack.
- **P1-2 · Warning en typecheck**: `vue-router/volar/sfc-route-blocks` MODULE_NOT_FOUND (plugin volar de `@vue/language-core`). No rompe el typecheck (exit 0), pero es ruido. Arreglo: alinear versión de `vue-router` en devDeps o quitar el plugin de la config de volar.

### P2 — higiene de repositorio
- **P2-1 · Ramas mergeadas sin limpiar** (local y remoto): `feature/devops-docs`, `feature/domain-core`, `feature/game-engine`, `feature/ui-design-system`, `release/1.0.0` — todas ya mergeadas (verificable con `git branch --merged`); Git Flow exige borrarlas tras el merge (mantener solo `main` y `develop`).
- **P2-2 · `docs/PENDIENTE.md` acumula features sin dueño** (lanza-llamas, jefes, audio, SQLite…): dejar como roadmap con prioridades (no bloquea).

## 4. Plan GitHub Pages (fase siguiente)

1. Workflow `.github/workflows/deploy-pages.yml`: `on: push` a `main` + `workflow_dispatch`; permisos `pages: write`, `id-token: write`; pasos: checkout → setup-node 22 → `npm ci` → `NUXT_APP_BASE_URL=/MicroZombiesZ/ npx nuxt generate` → `configure-pages` → `upload-pages-artifact` (dir `.output/public`) → `deploy-pages`.
2. Base URL: `NUXT_APP_BASE_URL=/MicroZombiesZ/` en build para que assets/rutas funcionen bajo `https://enerbydev.github.io/MicroZombiesZ/` (y sin base en dev).
3. Leaderboard: adaptador frontend con detección de entorno (fetch con `Accept: application/json`; si la respuesta no es JSON → fallback localStorage). Tests unitarios del fallback.
4. Habilitar Pages en el repo con `build_type=workflow` (API) o manual: Settings → Pages → Source: **GitHub Actions**.

## 5. Estado Git Flow

- `main` = `develop` = merge de `release/1.0.0` (5b96ae0), tag `v1.0.0` en remoto.
- Ramas que sobran (ya mergeadas): las 5 del punto P2-1.
- Trabajo nuevo en curso: rama `fix/ci-pages` (desde `develop`) → merge a `develop` y `main` al completar CI+Pages+docs.

===FIN-INFORME===