#!/usr/bin/env node
// ============================================================================
// quota-wait-build.mjs — Espera la ventana de cuota y dispara el build CC.
//
// Estrategia (presupuesto protegido):
//  - Fase 1 (ahora → 15:50 UTC): 1 sonda cada 25 min (reset diario estimado 16:00 UTC).
//  - Fase 2 (15:50 → 16:45 UTC): sonda cada 80s para CAZAR la ventana en cuanto
//    el bucket key-daily repone (es compartido: se agota rápido).
//  - Fase 3 (tras 16:45 sin ventana): sonda cada 20 min.
//  - NUNCA sondear si user-daily-remaining <= RESERVE (8) en fase 1/3.
//  - Al detectar remaining-daily > 0 → lanza run-cc-ultra.sh y espera su fin.
//  - Tras el build, si exit=75 (cuota agotada a mitad), vuelve a esperar
//    (máx 3 builds por arranque del waiter).
// ============================================================================
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const ROOT = '/home/z/my-project/microzombiesz';
const LOG = `${ROOT}/logs/waiter.log`;
const RESERVE = 8;
const MAX_BUILDS = 3;
const RESET_UTC_H = 16; // hipótesis de reset diario: 16:00 UTC (medianoche UTC+8)

const cfg = JSON.parse(fs.readFileSync('/etc/.z-ai-config', 'utf-8'));
const url = cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${cfg.apiKey}`,
  'X-Z-AI-From': 'Z',
};
if (cfg.chatId) headers['X-Chat-Id'] = cfg.chatId;
if (cfg.userId) headers['X-User-Id'] = cfg.userId;
if (cfg.token) headers['X-Token'] = cfg.token;

const log = (m) => {
  const line = `[waiter ${new Date().toISOString()}] ${m}`;
  console.log(line);
  fs.appendFileSync(LOG, line + '\n');
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const utcMin = () => new Date().getUTCHours() * 60 + new Date().getUTCMinutes();

async function probe() {
  try {
    const r = await fetch(url, {
      method: 'POST', headers,
      body: JSON.stringify({ model: 'glm-5.3-flash', messages: [{ role: 'user', content: 'x' }], max_tokens: 1 }),
    });
    const g = (n) => { const v = Number(r.headers.get(n)); return Number.isFinite(v) ? v : null; };
    return { status: r.status, dailyRem: g('x-ratelimit-remaining-daily'), userRem: g('x-ratelimit-user-daily-remaining') };
  } catch (e) { return { status: 0, dailyRem: null, userRem: null, err: String(e.message || e) }; }
}

function nextDelayMs(p) {
  const m = utcMin();
  const preWindowEnd = RESET_UTC_H * 60 - 10;   // 15:50
  const postWindowEnd = RESET_UTC_H * 60 + 45;  // 16:45
  if (m < preWindowEnd) {
    // fase 1: respetar reserva de presupuesto
    if (p.userRem !== null && p.userRem <= RESERVE) return 30 * 60_000;
    return 25 * 60_000;
  }
  if (m <= postWindowEnd) return 80_000;        // fase 2: caza de ventana
  return 20 * 60_000;                            // fase 3
}

function launchBuild(n) {
  return new Promise((resolve) => {
    log(`VENTANA ABIERTA → lanzando build #${n} (run-cc-ultra.sh)`);
    const p = spawn('bash', [`${ROOT}/run-cc-ultra.sh`], { cwd: ROOT, stdio: 'ignore', detached: false });
    p.on('exit', (code) => { log(`build #${n} terminó con exit=${code}`); resolve(code); });
    p.on('error', (e) => { log(`build #${n} error: ${e.message}`); resolve(-1); });
  });
}

log(`arranca waiter (reset estimado ${RESET_UTC_H}:00 UTC; reserva user=${RESERVE}; máx ${MAX_BUILDS} builds)`);
let builds = 0;
while (builds < MAX_BUILDS) {
  const p = await probe();
  log(`sonda: HTTP ${p.status} dailyRem=${p.dailyRem} userRem=${p.userRem}${p.err ? ' err=' + p.err : ''}`);
  if (p.dailyRem !== null && p.dailyRem > 0) {
    const code = await launchBuild(builds + 1);
    builds++;
    if (code === 0) { log('build exitoso; waiter termina'); break; }
    log('build no completó; se sigue esperando ventana nueva...');
    await sleep(10 * 60_000);
    continue;
  }
  const d = nextDelayMs(p);
  log(`esperando ${Math.round(d / 1000)}s`);
  await sleep(d);
}
log('waiter finaliza');
