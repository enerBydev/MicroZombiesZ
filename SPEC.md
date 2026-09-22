# MicroZombiesZ — SPEC Maestra de Construcción (para Claude Code ultracode)

Eres Claude Code en modo **ultracode** operando a través del GLM-Bridge de la sesión.
Tu misión: construir **MicroZombiesZ**, un juego top-down 2D de supervivencia por
oleadas estilo *SAS: Zombie Assault*, con calidad profesional de ingeniería.

## REGLA DE ORO — Presupuesto de peticiones
El gateway de esta sesión tiene cuota limitada por llamada. Sé **extremadamente
eficiente**: agrupa trabajo por archivo (escribe módulos completos de una vez),
evita releer archivos, no verifiques cosas triviales, y haz **commit git en cada
hito** (Git Flow: commits en `feature/*`, merge a `develop` al cerrar hito).
Si te quedas sin margen, deja el repo verde (tests pasando) y documenta los
pendientes en `docs/PENDIENTE.md`. Un núcleo jugable impecable vale más que
diez features a medias.

## Producto (criterios de aceptación del núcleo)
1. Canvas 2D top-down: jugador se mueve (WASD + joystick virtual táctil), apunta
   (ratón/touch), dispara (click/botón táctil), zombies aparecen en oleadas.
2. 4+ tipos de zombie (corredor, tanque, escupidor, normal) con stats distintos.
3. Oleadas progresivas: más enemigos y más duros; entre oleadas, **tienda de
   mejoras** (comprar con el dinero ganado: armas nuevas + munición + vida).
4. 3 armas mínimo (pistola/escopeta/rifle) con cadencia, daño, dispersión y
   munición distintas — cada arma es una **estrategia intercambiable**.
5. HUD: vida, arma actual, munición, dinero, oleada, puntuación. Pantallas de
   inicio y game-over con récord persistido.
6. **Mobile-first**: jugable en 390×844 (iPhone) y desktop; touch targets ≥44px;
   funciona en portrait y landscape.

## Arquitectura (obligatoria, en este orden de prioridad)
- **Hexagonal/Clean/DDD-lite**: `app/domain` (entidades Player/Zombie/Wave/Bullet,
  value objects Vec2/Health/Money, puertos `WeaponStrategy`, `SpawnStrategy`,
  `ScoreRepository`, `GameClock`), `app/application` (use-cases StartGame,
  NextWave, FireWeapon, BuyUpgrade...), `app/infrastructure` (CanvasRenderer,
  LocalStorageScoreRepository, RafClock, RngAdapter), `app/presentation`
  (componentes Vue + composables que orquestan). El dominio NO importa nada de
  Vue/canvas (testable puro). Invariantes en entidades (vida nunca <0, dinero
  nunca negativo).
- **Repository**: `ScoreRepository` (puerto) + `LocalStorageScoreRepository`
  (infra) + double de tests.
- **Strategy**: `WeaponStrategy` y `SpawnStrategy` (una clase por arma/tipo de
  oleada, seleccionables en la tienda/config).
- **Atomic Design + Design System**: `design/tokens.css` (paleta zombie: verdes
  tóxicos, rojos sangre, fondo oscuro; espaciado 4px; tipografía sistema),
  componentes en `atoms` (ZButton, ZBadge, HealthBar), `molecules` (Joystick,
  WeaponCard, WaveBanner), `organisms` (HUD, ShopOverlay, StartScreen,
  GameOverScreen). Nada de estilos inline sueltos: todo via tokens.
- **KISS**: sin motor de juegos (canvas nativo, requestAnimationFrame), sin
  dependencias de runtime salvo Nuxt/Vue/Pinia. Cero over-engineering.

## Stack
Nuxt 4 + TypeScript + Pinia. Node 20+. Todo OSS (licencias MIT/Apache/BSD).

## Calidad (en este orden; si el presupuesto aprieta, 1-3 primero)
1. **TDD**: Vitest con tests del dominio ANTES de cada feature (commits
   red→green visibles en historia). Cobertura del dominio ≥80%.
2. **E2E**: Playwright configurado (`playwright.config.ts`, specs: el juego
   arranca, empieza oleada 1, se puede disparar, game-over reinicia). NO
   descargar navegadores en esta sesión (`npx playwright install` prohibido aquí;
   documentado para CI/local).
3. **Storybook**: stories de atoms/molecules/organisms con knobs básicos.
   (Instalar Storybook como devDep SOLO si el núcleo ya está verde.)
4. **Nix**: `flake.nix` con devShell (nodejs_22, git) + instrucciones en README.
5. **DevOps DaC**: `.github/workflows/ci.yml` (Node 20/22: install → lint →
   typecheck → test → build), `docs/design/` (DTD_DaC: ADR-001 arquitectura
   hexagonal, ADR-002 canvas-nativo, decisiones de patrones) y `docs/runtime/`
   (RD_DaC: cómo correr, debuggear, métricas del loop).
6. `npm run dev` debe dejar el juego jugable; `npm run build` debe pasar.

## Prohibido
- Push a remotos (sin credenciales aquí); solo commits locales.
- Descargar navegadores de Playwright o binarios pesados.
- Sustituir el dominio puro por lógica dentro de componentes Vue.

## Entrega final
README.md (español, con capturas-texto de arquitectura, cómo correr, stack,
licencias OSS) y `docs/PENDIENTE.md` con lo que quede para siguientes ventanas.
