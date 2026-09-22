// Contenido narrativo de MicroZombiesZ.
// Escrito por Claude Code (ultracode) a través del glm-claude-bridge relay:
// el cerebro es el LLM de la sesión de chat.z.ai (transporte Chat-Brain v6).

import type { GameFlavor } from '../types'

export const FLAVOR: GameFlavor = {
  weapons: {
    pistol: {
      tagline: 'Cuando todo lo demás falla, queda el 9mm.',
      lore: 'La robaste de la cajonera de un sargento que ya no necesita nada. Cuenta cada bala como si fuera la última, porque en este barrio lo es.'
    },
    shotgun: {
      tagline: 'A bocajarro no hay preguntas.',
      lore: 'Doce cartuchos del taller y un cañón que escupe seis respuestas por gatillo. Los corredores aprenden a temer el clac-clac de la bomba.'
    },
    smg: {
      tagline: 'No apuntes: riega.',
      lore: 'El Rata salió de una imprenta convertida en armería. Se sobrecalienta, vibra como un animal asustado... y vacía hordas enteras antes de pedir recambio.'
    },
    rifle: {
      tagline: 'Un toque de precisión en el fin del mundo.',
      lore: 'Cámara pulida a mano y culata forrada de cinta aislante. Su dueño anotaba bajas en la madera: se quedó sin espacio el día que no volvió.'
    }
  },
  zombies: {
    walker: {
      tagline: 'Lento, torpe... e infinito.',
      lore: 'Caminó su última calle hace semanas y aún no se ha detenido. No corre: no lo necesita. Tú tampoco podrás correr para siempre.'
    },
    runner: {
      tagline: 'Lo oirás antes de verlo.',
      lore: 'El virus le quemó todo salvo la prisa. Llegó con la segunda oleada y desde entonces el silencio siempre es sospechoso.'
    },
    brute: {
      tagline: 'Un muro que camina hacia ti.',
      lore: 'Fue portero de club, quizá granjero. Ahora es un torso del tamaño de un frigorífico que traga tus balas y sonríe con dientes ajenos.'
    },
    spitter: {
      tagline: 'Mantén la distancia o arde conmigo.',
      lore: 'Su saliva corroe el kevlar a borbotones verdes. Escupe desde el rango que tú envidiarás y se desliza de lado justo cuando aprietas el gatillo.'
    }
  },
  taglines: [
    'La última oleada siempre llega de madrugada.',
    'Recarga. Respira. Cuenta tus balas. Repite.',
    'El horizonte no arde: hierve.',
    'Cada casquillo es una promesa que debes cumplir.',
    'Sobrevive hasta el amanecer. Luego, sobrevive al siguiente.'
  ]
}
