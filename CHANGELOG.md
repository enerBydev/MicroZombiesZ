# CHANGELOG — MicroZombiesZ

Formato Keep a Changelog. Versionado SemVer.

## [1.0.0] — 2026-09-22

Primera release jugable: núcleo completo de la SPEC en verde.

### Added
- **Dominio DDD puro** (TDD rojo→verde, 63 aserciones): `Game` como aggregate
  root con máquina de estados menu→playing→shop→gameover, entidades
  Player/Zombie/Bullet, value objects Vec2/Health/Money con invariantes,
  y DomainEvents para todo el flujo de la simulación.
- **Estrategias intercambiables**: 4 armas (Pistola/Escopeta/Subfusil/Rifle
  vía WeaponStrategy), 4 IAs de zombie (Walker/Runner/Brute/Spitter vía
  ZombieBrain) y composición de oleadas escalable (StandardWaveStrategy).
- **Puertos + adaptadores hexagonales**: RenderPort→CanvasRenderer (canvas
  2D dpr-aware), InputAdapter→KeyboardMouseInput + TouchInput (joysticks
  virtuales con knob magnético), ScoreRepository→LocalStorage (fail-safe).
- **GameEngine**: bucle rAF con dt acotado ≤50 ms, snapshots de UI
  throttled, manejo de eventos, récord vía use-case endRun.
- **UI Atomic Design**: design system con tokens CSS (paleta zombie,
  escala 4px, targets táctiles 44px), átomos (ZButton, ZBadge, ZHealthBar),
  moléculas (MzJoystick, MzWeaponCard, MzWaveBanner) y organismos (MzHud,
  MzShopOverlay, MzStartScreen, MzGameOverScreen). Mobile-first con
  safe-area insets.
- **API Nitro leaderboard** (GET/POST): top 10 persistido en `.data`,
  saneado de entrada y rank de respuesta.
- **Contenido narrativo** (flavor.ts): taglines y lore de armas y zombis,
  escritos por Claude Code (ultracode) a través del glm-claude-bridge relay.
- **Calidad**: 76 tests unitarios/de componentes (cobertura dominio+app
  89.29%), typecheck 0 errores, ESLint 0 errores (regla de pureza del
  dominio), E2E Playwright verde con Chromium y Storybook 9 con 8 stories.
- **DevOps**: `qa.sh` de 6 etapas (TODO VERDE), GitHub Actions matrix
  Node 20/22 (lint·typecheck·tests·build·E2E), flake.nix reproducible.
- **Docs as Code**: ADR-001..004, design-system, glosario DDD, ciclo DevOps
  (DTD) y runbook + API leaderboard (RD).

### Notes
- Construido con Claude Code 2.1.278 (modo ultracode) sobre
  **glm-claude-bridge** transporte **Chat-Brain Relay v6**: el modelo de CC
  es el LLM de la sesión chat.z.ai — cero cuota upstream, cero servicios
  externos.
- Economía: recompensas por baja (walker 10 / runner 14 / spitter 22 /
  brute 40), botiquín +40 HP por $60, vida escalada +15% por oleada.
