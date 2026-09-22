# API Leaderboard (Nitro) — RD_DaC

Persistencia: driver `fs` de Nitro sobre `./.data/leaderboard/scores.json`
(ruta relativa al cwd del proceso servidor). Se conservan las 100 mejores;
la API devuelve el top 10.

## GET /api/leaderboard

```bash
curl -s http://127.0.0.1:4173/api/leaderboard
# [
#   { "name": "Sobreviviente01", "score": 1250, "wave": 6,
#     "at": "2026-09-22T02:21:10.798Z" }
# ]
```

`200` con array (posiblemente vacío). Ordenado por score descendente.

## POST /api/leaderboard

```bash
curl -s -X POST http://127.0.0.1:4173/api/leaderboard \
  -H 'Content-Type: application/json' \
  -d '{"name":"Valkiria","score":3820,"wave":11}'
# { "rank": 1, "entries": [ ...top10... ] }
```

Validación y saneado:
- `name`: string recortado a 18 chars; vacío → `Anónimo`.
- `score`: entero ≥ 0; inválido → 0.
- `wave`: entero ≥ 1; inválido → 1.

Respuestas: `200` `{rank, entries}` (rank null si no entró al top 100).

## Observabilidad

- El fichero `scores.json` es inspeccionable en caliente (`jq .length`).
- Verificar up del servicio: `GET /` debe devolver el HTML con título
  `MicroZombiesZ`.
