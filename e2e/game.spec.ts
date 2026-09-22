import { expect, test } from '@playwright/test'

// Ruta crítica del juego: menú → partida → HUD visible → reinicio.
// Se ejecuta en CI (navegadores instalados) o en local.

test('la portada carga con título y botón de inicio', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('MicroZombiesZ')
  await expect(page.getByRole('button', { name: /COMENZAR/i })).toBeVisible()
  const canvas = page.locator('canvas.mz-canvas')
  await expect(canvas).toBeVisible()
})

test('comenzar partida muestra el HUD y la oleada 1', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /COMENZAR/i }).click()
  await expect(page.getByText(/Oleada 1/i)).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/Pts \d+/i)).toBeVisible()
})

test('el canvas recibe foco de juego y dispara sin errores de consola', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('/')
  await page.getByRole('button', { name: /COMENZAR/i }).click()
  await page.mouse.move(640, 300)
  await page.mouse.down()
  await page.waitForTimeout(1200)
  await page.mouse.up()
  expect(errors).toEqual([])
})
