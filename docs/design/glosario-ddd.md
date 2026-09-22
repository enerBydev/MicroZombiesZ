# Glosario DDD — MicroZombiesZ

**Aggregate Root — `Game`.** Raíz del agregado: posee el estado transaccional
de una partida (jugador, zombies, balas, oleada, score) y garantiza sus
invariantes (vida ∈ [0,max], dinero ≥ 0, compras atómicas).

**Entity — `Player`, `Zombie`, `Bullet`.** Tienen identidad (`id` para
zombies/balas) y ciclo de vida; el jugador cambia de estado pero sigue siendo
el mismo jugador.

**Value Object — `Vec2`, `Health`, `Money`.** Inmutables por convención,
definidos por sus atributos, con invariantes propias (Health nunca <0 ni >max;
Money nunca negativo; gasto atómico todo-o-nada).

**Domain Event.** Factos del dominio: `run-started`, `wave-started`,
`wave-cleared`, `zombie-died`, `player-hit`, `player-died`, `shot`. `tick()`
los devuelve; presentación y aplicación reaccionan sin acoplarse.

**Port.** Interfaz del hexágono que el dominio define y la infraestructura
implementa: `RandomSource`, `GameClock`, `ScoreRepository`, `SpawnStrategy`,
`RenderPort`, `InputAdapter`.

**Adapter.** Implementación concreta de un puerto (CanvasRenderer,
TouchInput, LocalStorageScoreRepository…).

**Ubiquitous language (ES):** *Oleada* (wave), *Horda* (conjunto activo),
*Récord* (best score), *Botiquín* (health pack), *Tienda* (shop, estado entre
oleadas), *Corredor/Bruto/Escupidor/Caminante* (kinds de zombie).
