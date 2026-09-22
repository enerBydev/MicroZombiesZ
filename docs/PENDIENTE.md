# PENDIENTE — siguientes ventanas de desarrollo

Mantenido por el protocolo de la SPEC (núcleo verde > features a medias).

## Gameplay
- [ ] Arma adicional: lanzallamas (Strategy nueva + flavor).
- [ ] Pickups en el suelo (munición/botiquín que sueltan los brutos).
- [ ] Jefes cada 10 oleadas (barra de vida dedicada en el HUD).
- [ ] Modo "furia" con combo de bajas consecutivas.

## Producto
- [ ] Sprites/pixel-art en vez de formas (mismo puerto RenderPort).
- [ ] Audio (nuevo puerto AudioPort + adaptador WebAudio).
- [ ] Ajuste fino de economía de la tienda con telemetría de partidas.

## Plataforma
- [ ] Persistencia del leaderboard en SQLite (driver Nitro) para multi-usuario.
- [ ] Test de carga del leaderboard (k6) y métricas Prometheus en Nitro.
- [ ] Storybook interacción tests (play functions) + Chromatic en CI.
- [ ] Instalar Nix en entornos de dev reales y congelar `flake.lock`.
