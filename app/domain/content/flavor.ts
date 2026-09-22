// Placeholder de contenido narrativo — será reescrito por Claude Code
// (ultracode vía glm-claude-bridge relay) en la tarea de contenido.

import type { GameFlavor } from '../types'

export const FLAVOR: GameFlavor = {
  weapons: {
    pistol: { tagline: 'Fiable. Nunca se atasca.', lore: 'Tu última amiga en el fin del mundo.' },
    shotgun: { tagline: 'A bocajarro.', lore: 'Seis argumentos por disparo.' },
    smg: { tagline: 'Lluvia de plomo.', lore: 'Vacía el cargador y reza.' },
    rifle: { tagline: 'Precisión táctica.', lore: 'Uno, dos, cae.' }
  },
  zombies: {
    walker: { tagline: 'Lento pero constante.', lore: 'El hambre no descansa.' },
    runner: { tagline: '¡Corre!', lore: 'Apareció con la segunda oleada.' },
    brute: { tagline: 'Muro de carne.', lore: 'Escupe balas y sigue andando.' },
    spitter: { tagline: 'Mantén la distancia.', lore: 'Su saliva corroe el acero.' }
  },
  taglines: [
    'La última oleada siempre llega.',
    'Recarga. Respira. Repite.',
    'El horizonte huele a podrido.',
    'Cada bala cuenta.',
    'Sobrevive al amanecer.'
  ]
}
