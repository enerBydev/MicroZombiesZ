#!/usr/bin/env bash
# ============================================================================
# run-cc-ultra.sh — Lanza el build de MicroZombiesZ con Claude Code ultracode
# a través del glm-claude-bridge (ventana de cuota). Idempotente y logueado.
# Uso: ./run-cc-ultra.sh          (asume que hay cuota; el waiter la vigila)
# ============================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/logs"; mkdir -p "$LOG_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="$LOG_DIR/cc-ultra-build-$STAMP.log"
export PATH="$HOME/.local/bin:$PATH"

echo "[launcher] $(date -u +%FT%TZ) build MicroZombiesZ (CC ultracode vía bridge)" | tee -a "$LOG"

# 0) bridge vivo
if ! curl -sf -m 2 http://127.0.0.1:8787/health > /dev/null 2>&1; then
  echo "[launcher] bridge caído → glm-bridge start" | tee -a "$LOG"
  glm-bridge start 2>&1 | tee -a "$LOG"; sleep 2
fi

# 1) preflight de cuota (1 sonda mínima; el waiter ya validó, esto es doble-check)
UPSTREAM="$(curl -s -m 2 http://127.0.0.1:8787/health | python3 -c 'import json,sys;print(json.load(sys.stdin)["upstream"])' 2>/dev/null || true)"
PROBE="$(curl -s -m 10 -X POST "$UPSTREAM" \
  -H 'Content-Type: application/json' -H 'X-Z-AI-From: Z' \
  --data '{"model":"glm-5.3-flash","messages":[{"role":"user","content":"x"}],"max_tokens":1}' \
  -D - -o /dev/null 2>/dev/null || true)"
REMAIN="$(echo "$PROBE" | tr -d '\r' | grep -i '^x-ratelimit-remaining-daily' | awk '{print $2}')"
echo "[launcher] preflight remaining-daily=${REMAIN:-desconocido}" | tee -a "$LOG"
if [ "${REMAIN:-0}" = "0" ]; then
  echo "[launcher] ABORTA: bucket daily a 0 (no quemar cuota user)" | tee -a "$LOG"
  exit 75
fi

# 2) entorno CC anti-despilfarro
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export DISABLE_TELEMETRY=1 DISABLE_ERROR_REPORTING=1 DISABLE_AUTOUPDATER=1

# 3) BUILD
cd "$ROOT"
glm-claude --ultra -p "Lee SPEC.md en este directorio y ejecútalo COMPLETO, hito a hito, con commits git por hito (Git Flow). Empieza ya." \
  --dangerously-skip-permissions < /dev/null >> "$LOG" 2>&1
CODE=$?
echo "[launcher] $(date -u +%FT%TZ) CC terminó con exit=$CODE" | tee -a "$LOG"
exit $CODE
