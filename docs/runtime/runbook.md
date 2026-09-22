# Runbook (RD_DaC) — operar y depurar MicroZombiesZ

## Arranque

```bash
npm install          # o npm ci
npm run dev          # http://localhost:3000 (juego jugable)
npm run build && npm run preview   # build de producción
# con Nix: nix develop  (Node 22 + git reproducibles)
```

## QA local (antes de tocar algo)

```bash
bash qa.sh   # 6 etapas: deps → lint → typecheck → unit+cobertura → build → e2e
```

## Problemas frecuentes

| Síntoma | Causa probable | Acción |
|---|---|---|
| `typecheck` falla con errores imposibles | buildinfo obsoleto de `.nuxt` | borra `.nuxt/*.tsbuildinfo` y repite |
| Canvas negro | engine parado o `ctx` nulo | revisa consola; `NullRenderer` activo solo en tests |
| Joysticks no aparecen | `pointer: coarse` no detectado | prueba en ventana táctil real o devtools mobile |
| Récord no persiste | storage bloqueado (privado) | es fail-safe: el récord vive solo en memoria |
| POST leaderboard 500 | `.data/` sin permisos | `mkdir -p .data/leaderboard` en el cwd del proceso |
| E2E sin navegadores | entorno sin binaries Playwright | `npx playwright install chromium` (no se descargan en sandboxes) |

## Depuración del gameplay

- Determinismo: inyecta `SeededRandom(seed)` en `GameConfig` para reproducir
  una partida exacta en tests (`new Game({ rng: new SeededRandom(123) })`).
- `GameEngine.update(dt)` es público: simula pasos sin rAF en un REPL/test.
- `Game.spawnQueueClearForTest()` vacía la cola de spawn para forzar estados.
- Eventos: suscríbete a `onEvent` del engine y loguea `DomainEvent` para ver
  la traza completa de la simulación.

## Cómo se construyó (reproducible)

Claude Code 2.1.278 (`claude -p --model opus --max-turns 6`) contra el
glm-bridge en `:8788` con `GLM_BRIDGE_TRANSPORT=relay` (spool
`~/.glm-claude-bridge/relay`): CC publica peticiones `pending/`, el cerebro
(LLM de la sesión chat.z.ai) responde en `replies/<hash>.json` dentro del
hold de 55 s, el relay normaliza a la API Anthropic. Cero cuota upstream.
