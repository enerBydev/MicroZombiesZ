# Design System — MicroZombiesZ

Sistema de diseño **Atomic Design** con tokens CSS únicos como única fuente de
verdad (`app/design/tokens.css`). Ningún componente define colores, espaciados
ni radios fuera de los tokens.

## Átomos → Moléculas → Organismos

| Nivel | Componentes | Responsabilidad |
|---|---|---|
| Átomo | `ZButton`, `ZBadge`, `ZHealthBar` | unidad mínima con estilo tokenizado |
| Molécula | `MzJoystick`, `MzWeaponCard`, `MzWaveBanner` | combinación de átomos + un comportamiento |
| Organismo | `MzHud`, `MzShopOverlay`, `MzStartScreen`, `MzGameOverScreen` | sección completa de pantalla |

## Tokens principales

- **Superficies:** `--z-bg #0b0f0c`, `--z-surface #131a15`, `--z-surface-2/3`.
- **Acentos zombie:** tóxico `--z-toxic #7cff5a`, sangre `--z-blood #e5484d`,
  ámbar `--z-amber #ffb224`, ácido `--z-acid #7fd6c2`.
- **Espaciado:** escala 4px (`--z-space-1…8`).
- **Radios:** 6/10/16px. **Tipografía:** pila de sistema + mono para números.
- **Mobile-first:** `--z-touch: 44px` (mínimo WCAG para targets táctiles),
  `env(safe-area-inset-*)` respetado en joysticks y HUD.

## Reglas

1. Los números de gameplay (daño, costes, recompensas) viven SOLO en el
   dominio (`types.ts`, `weapons.ts`); la UI los recibe por props/snapshots.
2. El contenido narrativo (taglines/lore) vive en
   `app/domain/content/flavor.ts` — generado por Claude Code vía relay.
3. Los componentes Vue no importan infraestructura (canvas/input/storage);
   el cableado lo hace `useGameEngine`.
4. Cada componente tiene: test de comportamiento (`tests/components`),
   story de Storybook (visual testing) y estilos scoped con tokens.
