# 🧟 MicroZombiesZ

Shooter top-down 2D de supervivencia por **oleadas** estilo *SAS: Zombie
Assault*. Mobile-first, jugable con teclado+ratón o con **joysticks táctiles**.
Construido con **Nuxt 4** y una arquitectura **Hexagonal / Clean / DDD**
rigurosa, **TDD desde cero** y **Atomic Design** con design system propio.

> Construido con **Claude Code 2.1.278 (modo ultracode)** a través de
> **glm-claude-bridge** (transporte *Chat-Brain Relay v6*): el "modelo" de
> Claude Code es el propio LLM de la sesión chat.z.ai — cero cuota, cero
> servicios externos. El contenido narrativo del juego y parte de la
> documentación fueron escritos por CC por ese camino.

## Cómo jugar

| Escritorio | Móvil |
|---|---|
| `WASD`/flechas mueve · ratón apunta · click/espacio dispara | joystick izquierdo mueve · joystick derecho apunta **y dispara** |

Oleadas progresivas (más zombis y más duros: caminantes → corredores →
escupidores → brutos). Entre oleadas, la **tienda** permite comprar armas
(escopeta, subfusil, rifle), munición y botiquines. El récord persiste en el
navegador y el top 10 global en el servidor.

## Arquitectura (hexágono)

```
        ┌────────────────────────────────────────────┐
        │  presentation · Vue (atoms/molecules/      │
        │  organisms) + composables + Pinia          │
        └───────────────┬────────────────────────────┘
                        │ snapshots/eventos
        ┌───────────────▼────────────────────────────┐
        │  application · GameEngine + use-cases      │
        │  (startRun, endRun, buy…)                  │
        └───────────────┬────────────────────────────┘
                        │ puertos
        ┌───────────────▼────────────────────────────┐
        │  domain · 100% puro (DDD)                  │
        │  Game (aggregate) · Player/Zombie/Bullet   │
        │  Vec2/Health/Money · DomainEvents          │
        │  Strategies: Weapon/Spawn/ZombieBrain      │
        │  Ports: Render·Input·Random·Clock·Repo     │
        └───────────────▲────────────────────────────┘
                        │ implementa puertos
        ┌───────────────┴────────────────────────────┐
        │  infrastructure · CanvasRenderer ·         │
        │  KeyboardMouseInput · TouchInput ·         │
        │  LocalStorageScoreRepository               │
        └────────────────────────────────────────────┘
```

Detalles de cada decisión en [docs/design/adr/](docs/design/adr/):
hexagonal-DDD (ADR-001), canvas nativo (ADR-002), Nuxt 4 + Nitro (ADR-003),
Strategy/Repository (ADR-004). Glosario DDD en
[docs/design/glosario-ddd.md](docs/design/glosario-ddd.md).

## Stack (todo OSS: MIT/Apache/BSD)

Nuxt 4 · Vue 3 · Pinia · TypeScript · Vitest + @vitest/coverage-v8 ·
@vue/test-utils + happy-dom · Playwright · Storybook 9 · ESLint 9
(@nuxt/eslint) · Nix (flake) · GitHub Actions · Nitro `useStorage`.

## Desarrollo

```bash
npm install
npm run dev        # jugable en http://localhost:3000
npm run qa         # QA completa (6 etapas) — o bash qa.sh
```

Con **Nix**: `nix develop` (Node 22 + git reproducibles).

### Scripts

| Script | Qué hace |
|---|---|
| `dev` / `build` / `preview` | Nuxt + Nitro (SPA + API leaderboard) |
| `test:unit` / `test:coverage` | Vitest (76 tests; cobertura dominio+app ≥80%) |
| `typecheck` | `nuxt typecheck` (vue-tsc, 0 errores) |
| `lint` | ESLint (regla de pureza del dominio incluida) |
| `test:e2e` | Playwright (`npx playwright install chromium` antes) |
| `storybook` | Visual testing de átomos/moléculas/organismos |

## Calidad

- **TDD**: el dominio nació rojo (9 ficheros de spec) y pasó a verde (63
  aserciones) antes de existir la UI; hoy son 76+ tests.
- **Pureza garantizada**: ESLint prohíbe Vue/DOM en `app/domain/**`.
- **Determinismo**: `SeededRandom` (mulberry32) para tests y replays.
- **CI**: matrix Node 20/22 — lint, typecheck, tests+cobertura, build, E2E.

## Documentación (Docs as Code)

- Design-Time (DTD): [ADRs](docs/design/adr/) ·
  [design-system](docs/design/design-system.md) ·
  [glosario DDD](docs/design/glosario-ddd.md) ·
  [ciclo DevOps](docs/design/ciclo-devops.md)
- Runtime (RD): [runbook](docs/runtime/runbook.md) ·
  [API leaderboard](docs/runtime/api-leaderboard.md)

## Licencias OSS del proyecto y dependencias

- Código propio: MIT (ver [LICENSE](LICENSE)).
- Dependencias principales: Nuxt/Vue/Pinia/Vitest (MIT), Playwright
  (Apache-2.0), Storybook (MIT), happy-dom (MIT).
