// CanvasRenderer — adaptador de salida (RenderPort). Dibuja el snapshot del
// dominio en un canvas 2D. Sin lógica de juego: solo presentación.

import type { GameSnapshot, RenderPort } from '../domain/ports'

const COLORS = {
  bg: '#0b0f0c',
  grid: 'rgba(89, 166, 90, 0.08)',
  player: '#9fe870',
  playerStroke: '#0b0f0c',
  aim: 'rgba(159, 232, 112, 0.35)'
}

export class CanvasRenderer implements RenderPort {
  private ctx: CanvasRenderingContext2D | null

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')
  }

  render(s: GameSnapshot): void {
    const ctx = this.ctx
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    // Tamaño CSS real del lienzo (fallback a atributos si aún no hay layout).
    const cssW = this.canvas.clientWidth || this.canvas.width
    const cssH = this.canvas.clientHeight || this.canvas.height
    // El objetivo SIEMPRE se deriva del tamaño CSS ×dpr. Antes se comparaba
    // canvas.width consigo mismo ×dpr: con dpr=1 la condición era siempre
    // falsa, el lienzo nunca crecía y las entidades quedaban recortadas
    // fuera de un canvas 300x150 (bug de render invisible).
    const targetW = Math.round(cssW * dpr)
    const targetH = Math.round(cssH * dpr)
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW
      this.canvas.height = targetH
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Fondo + rejilla (coordenadas CSS: la arena mide clientWidth×clientHeight)
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, cssW, cssH)
    ctx.strokeStyle = COLORS.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= cssW; x += 40) {
      ctx.moveTo(x, 0); ctx.lineTo(x, cssH)
    }
    for (let y = 0; y <= cssH; y += 40) {
      ctx.moveTo(0, y); ctx.lineTo(cssW, y)
    }
    ctx.stroke()

    // Zombies
    for (const z of s.zombies) {
      ctx.fillStyle = this.kindColor(z.kind)
      ctx.beginPath()
      ctx.arc(z.position.x, z.position.y, z.radius, 0, Math.PI * 2)
      ctx.fill()
      if (z.hpRatio < 1) {
        const w = z.radius * 2
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(z.position.x - z.radius, z.position.y - z.radius - 7, w, 4)
        ctx.fillStyle = z.kind === 'brute' ? '#e5484d' : '#ffb224'
        ctx.fillRect(z.position.x - z.radius, z.position.y - z.radius - 7, w * z.hpRatio, 4)
      }
    }

    // Balas
    for (const b of s.bullets) {
      ctx.fillStyle = b.color
      ctx.beginPath()
      ctx.arc(b.position.x, b.position.y, b.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Jugador
    const p = s.player
    ctx.strokeStyle = COLORS.aim
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p.position.x, p.position.y)
    ctx.lineTo(p.position.x + p.aim.x * 26, p.position.y + p.aim.y * 26)
    ctx.stroke()

    ctx.fillStyle = p.hpRatio < 0.3 ? '#e5484d' : COLORS.player
    ctx.beginPath()
    ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = COLORS.playerStroke
    ctx.lineWidth = 2
    ctx.stroke()
  }

  private kindColor(kind: string): string {
    switch (kind) {
      case 'walker': return '#59a65a'
      case 'runner': return '#a3d977'
      case 'brute': return '#8c4a3c'
      case 'spitter': return '#57b8a2'
      default: return '#888888'
    }
  }
}

/** Render nulo (tests / SSR). */
export class NullRenderer implements RenderPort {
  readonly snapshots: GameSnapshot[] = []
  render(snapshot: GameSnapshot): void {
    this.snapshots.push(snapshot)
  }
}
