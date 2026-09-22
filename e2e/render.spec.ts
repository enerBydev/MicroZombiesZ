import { expect, test } from '@playwright/test'

// Aserción visual del render: el canvas debe redimensionarse al tamaño CSS
// (clientWidth × dpr) y pintar píxeles de las entidades. Caza el bug del
// lienzo atascado en 300x150 con el jugador y los zombies recortados.

test('el canvas se redimensiona al tamaño CSS y pinta las entidades', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /COMENZAR/i }).click()
  await expect(page.getByText(/Oleada 1/i)).toBeVisible({ timeout: 10_000 })
  await page.mouse.move(640, 300)

  const stats = await page.evaluate(() => {
    const c = document.querySelector('canvas.mz-canvas')
    if (!c) return { encontrado: false, attrW: 0, cssW: 0, esperadoW: 0, pixelesIluminados: 0 }
    const ctx = c.getContext('2d')
    if (!ctx) return { encontrado: false, attrW: 0, cssW: 0, esperadoW: 0, pixelesIluminados: 0 }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const img = ctx.getImageData(0, 0, c.width, c.height).data
    let lit = 0
    for (let i = 0; i < img.length; i += 4) {
      if (img[i] > 60 || img[i + 1] > 60 || img[i + 2] > 60)
        lit++
    }
    return {
      encontrado: true,
      attrW: c.width,
      cssW: c.clientWidth,
      esperadoW: Math.round(c.clientWidth * dpr),
      pixelesIluminados: lit,
    }
  })

  expect(stats.encontrado).toBe(true)
  expect(stats.attrW).toBe(stats.esperadoW)
  expect(stats.attrW).toBeGreaterThanOrEqual(stats.cssW)
  // El jugador verde (y/o zombies) debe estar pintado en el lienzo.
  expect(stats.pixelesIluminados).toBeGreaterThan(50)
})
