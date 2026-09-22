// MicroZombiesZ — configuración Nuxt 4
// Decisiones: ssr:false (juego 100% client-side, ADR-003), Nitro sirve la API
// de leaderboard (fullstack), @nuxt/eslint para DX.
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  css: ['~/design/tokens.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  app: {
    head: {
      title: 'MicroZombiesZ',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'theme-color', content: '#0b0f0c' },
        { name: 'description', content: 'Supervivencia por oleadas estilo SAS: Zombie Assault. Hecho con Nuxt 4 + Arquitectura Hexagonal.' }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  eslint: { config: { stylistic: false } },
  nitro: { storage: { leaderboard: { driver: 'fs', base: './.data/leaderboard' } } }
})
