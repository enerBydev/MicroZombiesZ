# Ciclo de vida DevOps — MicroZombiesZ

Mapeo completo Plan → Monitor con artefactos reales de este repo (Docs as
Code: este documento vive y versiona con el código).

| Fase | Herramienta / artefacto | Dónde |
|---|---|---|
| **Plan** | SPEC maestra + este ciclo + issues de GitHub | `SPEC.md`, `docs/` |
| **Code** | Claude Code 2.1.278 vía `glm-claude-bridge` (transporte relay v6, cerebro = LLM de la sesión chat.z.ai) + Git Flow | `feature/* → develop → release/* → main` |
| **Build** | Nuxt 4 (Vite) + Nitro; devShell reproducible Nix | `npm run build`, `flake.nix` |
| **Test** | TDD Vitest (domino puro, cobertura ≥80%), @vue/test-utils, Playwright E2E, Storybook build --test (visual) | `tests/`, `e2e/`, `*.stories.ts` |
| **Release** | Git Flow: rama `release/x.y.z`, CHANGELOG (CC vía relay), tag `vx.y.z` en main | `CHANGELOG.md`, tags |
| **Deploy** | `node .output/server/index.mjs` (Nitro) en cualquier host Node; CI verde = candidata | `npm run preview` |
| **Operate** | Runbook operativo + qa.sh como control previo | `docs/runtime/runbook.md` |
| **Monitor** | `GET /api/healthz` (up), logs del proceso, reportes Playwright/vitest en CI, métricas de juego en `docs/runtime/observabilidad.md` | `.github/workflows/ci.yml` |

## Roles (RACI exprés)

- **Dev:** dominio, engine, UI (TDD rojo→verde por hito).
- **QA:** qa.sh 6 etapas, cobertura del dominio, E2E de ruta crítica.
- **DevOps/GitOps:** Git Flow, CI matrix Node 20/22, flake.nix, releases.
- **Producto:** SPEC (criterios de aceptación), economía de la tienda,
  curva de oleadas, contenido narrativo.
