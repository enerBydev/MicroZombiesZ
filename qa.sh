#!/usr/bin/env bash
# ============================================================================
# qa.sh — QA automatizado de MicroZombiesZ (mismo espíritu que glm-bridge).
# Etapas: deps → lint → typecheck → unit+coverage → build → e2e (opcional)
# Salida: código 0 solo si TODO pasa. Uso: bash qa.sh
# ============================================================================
set -uo pipefail
cd "$(dirname "$0")"

G='\033[0;32m'; R='\033[0;31m'; Y='\033[0;33m'; B='\033[1;34m'; N='\033[0m'
PASS=0; FAIL=0; SKIPPED=0
STAGE=0
step() { STAGE=$((STAGE+1)); echo -e "\n${B}━━━ Etapa $STAGE/6: $1 ━━━${N}"; }
ok()   { echo -e "${G}✔ $1${N}"; PASS=$((PASS+1)); }
bad()  { echo -e "${R}✘ $1${N}"; FAIL=$((FAIL+1)); }
skip() { echo -e "${Y}⏭ $1${N}"; SKIPPED=$((SKIPPED+1)); }

step "Dependencias"
if [ -d node_modules ]; then ok "node_modules presente"; else
  echo "instalando…"; npm install --no-audit --no-fund > /tmp/mz-install.log 2>&1 && ok "npm install" || bad "npm install"
fi

step "Lint (eslint)"
if npx eslint . > /tmp/mz-lint.log 2>&1; then ok "eslint sin errores"; else bad "eslint ($(grep -c error /tmp/mz-lint.log 2>/dev/null || echo ?) errores)"; fi

step "Typecheck (vue-tsc)"
if npx nuxt typecheck > /tmp/mz-tsc.log 2>&1; then ok "0 errores de tipos"; else bad "typecheck"; grep -m5 "error TS" /tmp/mz-tsc.log; fi

step "Unit tests + cobertura (Vitest)"
if npx vitest run --coverage > /tmp/mz-vitest.log 2>&1; then
  ok "$(grep -oE 'Tests +[0-9]+ passed \([0-9]+\)' /tmp/mz-vitest.log | tail -1)"
  COV=$(grep -oE 'All files +\| +[0-9.]+%?' /tmp/mz-vitest.log | tail -1 | awk -F'|' '{print $2}' | tr -d ' %')
  if [ -n "$COV" ]; then echo -e "   cobertura dominio+app: ${COV}%"; fi
else bad "vitest"; tail -20 /tmp/mz-vitest.log; fi

step "Build de producción (Nuxt + Nitro)"
if npm run build > /tmp/mz-build.log 2>&1; then
  SIZE=$(du -sh .output 2>/dev/null | awk '{print $1}')
  ok "build completo ($SIZE)"
else bad "build"; tail -10 /tmp/mz-build.log; fi

step "E2E (Playwright)"
CHROME_DIR=""
for d in ~/.cache/ms-playwright "$HOME/Library/Caches/ms-playwright"; do
  [ -d "$d" ] && [ -n "$(ls "$d" 2>/dev/null)" ] && CHROME_DIR="$d" && break
done
if [ -n "$(npx playwright --version 2>/dev/null)" ] && [ -n "$CHROME_DIR" ]; then
  if npx playwright test > /tmp/mz-e2e.log 2>&1; then ok "e2e verde"; else bad "e2e"; tail -15 /tmp/mz-e2e.log; fi
else
  skip "navegadores de Playwright no descargados en este entorno (documentado: npx playwright install)"
fi

echo -e "\n${B}═══════ RESUMEN QA ═══════${N}"
echo -e "etapas OK: ${G}${PASS}${N} | fallos: ${R}${FAIL}${N} | omitidas: ${Y}${SKIPPED}${N}"
[ $FAIL -eq 0 ] && echo -e "${G}TODO VERDE${N}" || echo -e "${R}QA ROJA${N}"
exit $FAIL
