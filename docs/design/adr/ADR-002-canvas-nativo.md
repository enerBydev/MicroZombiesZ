# ADR-002 — Canvas 2D nativo en vez de motor de juegos

- **Estado:** aceptada
- **Fecha:** 2026-09-22

## Contexto

Un shooter top-down 2D por oleadas puede implementarse con PixiJS/Phaser o con
Canvas 2D nativo. El requisito de KISS (SPEC) pide cero dependencias de
runtime innecesarias y la arquitectura hexagonal ya aísla el render tras el
puerto `RenderPort`.

## Decisión

Canvas 2D nativo + `requestAnimationFrame`, con un adaptador único
(`CanvasRenderer`) que dibuja `GameSnapshot` (formas simples, dpr-aware).
`NullRenderer` cubre tests/SSR.

## Consecuencias

- ✅ 0 dependencias de runtime del motor; bundle de 2 MB total.
- ✅ El render es una función pura del snapshot → snapshots congelables en
  tests y debugging.
- ⚠️ Sin sprites/tweens nativos del motor: la capa visual es estética de
  formas y tokens; si el producto exige arte rich, se añade un adaptador
  `PixiRenderer` sin tocar el dominio.
