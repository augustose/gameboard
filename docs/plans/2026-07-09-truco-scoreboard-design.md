# Diseño — Truco como nuevo tipo de juego

**Fecha:** 2026-07-09
**Estado:** Diseño validado, pendiente de implementación
**Autor:** Augusto Sosa (con Claude)

## Origen / Motivación

Mi hermano **Adrián** me contó que él jugaba al truco y que le gustaría tenerlo
como opción en El Turix. Y como lo quiero mucho porque es un grande, decidí
implementarlo. Esta feature va dedicada a él.

> Esta motivación también queda registrada en la ayuda en línea (`AboutView`)
> como nota "Por qué Truco", visible para los usuarios.

## Contexto

El Turix hoy soporta dos juegos (**Rummy** y **Continental**) que comparten la
misma mecánica: sumar puntos numéricos por ronda y ganar por total. El truco es
**fundamentalmente distinto**:

- Se anota por **2 bandos** ("Nosotros" / "Ellos"), sirvan para 2, 4 o 6 jugadores.
- Es una **carrera a un objetivo** (15 o 30 puntos), no una suma abierta.
- El marcador es **visual**: grupos de 5 puntos dibujados como figuras de 5 trazos.
- Los puntos entran **de a poco** (tap = +1).

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Interacción | **Tap = +1** (un truco de 3 = 3 taps) |
| Objetivo | **Configurable**: 15 (solo malas) o 30 (malas + buenas) |
| Estilo de marcador | **Ambos elegibles**: cuadrado (fósforos) o copa (cáliz) |
| Bandos | **Siempre 2 columnas fijas**: "Nosotros" y "Ellos" |
| Integrantes | **Opcionales, máx 3 por equipo**; si se cargan, se muestran bajo cada columna |

## Investigación: el marcador de truco

- Los puntos se anotan en grupos de **5**, cada grupo dibujado con **5 trazos**.
  - **Cuadrado (fósforos):** 4 lados de un cuadrado + 1 diagonal.
  - **Copa / cáliz ("deikiring"):** los mismos 5 trazos con forma de copa
    (base, pie, dos lados del cáliz y una cruz). Puramente estético = 5 puntos.
- **Malas y buenas:** los primeros 15 puntos son "las malas", los últimos 15
  "las buenas". Al completar 15 (3 figuras) se traza una línea divisoria. Partida
  completa = 30 puntos; gana el primero que las completa.

Fuentes:
- [Reglas del Truco — trucogame.com](https://trucogame.com/pages/reglamento-de-truco-argentino)
- [Truco (juego de naipes) — Wikipedia](https://es.wikipedia.org/wiki/Truco_(juego_de_naipes))

## Arquitectura

Principio rector: **reutilizar el modelo existente, no reinventarlo.** Cada bando
se modela como un `Player` (uno "Nosotros", otro "Ellos"). Cada tap de +1 genera
un `Round` con un solo `Score` de `points: 1`. La suma de rounds ya existente da
el marcador de cada bando; el ganador es el primero en llegar al objetivo.

### Cambios en `types.ts`

```ts
export type GameType = 'rummy' | 'continental' | 'truco';

export interface Player {
  id: string;
  name: string;            // "Nosotros" | "Ellos"
  avatar?: string;
  members?: string[];      // integrantes — solo trazabilidad, no se marca por jugador
}

export interface Game {
  // ...campos actuales...
  config?: {               // solo presente en truco
    targetPoints: 15 | 30;
    markerStyle: 'square' | 'cup';
  };
}
```

`config` y `members` son **opcionales** → rummy/continental no se ven afectados.

## Componentes

### `GameSetup` (modo truco)

Cuando se elige Truco, el setup cambia:
1. **Objetivo:** toggle 15 / 30 (default 30).
2. **Estilo:** toggle Cuadrado / Copa (default cuadrado).
3. **Bandos:** dos bloques fijos "Nosotros" y "Ellos"; en cada uno, input opcional
   para agregar hasta 3 integrantes (chips con Enter). Sin lista dinámica de
   columnas: siempre exactamente 2 equipos.

### `TrucoScoreboard` (nuevo) — pantalla de juego

Dos columnas grandes lado a lado:

```
┌─────────────┬─────────────┐
│  NOSOTROS   │    ELLOS    │
│     23      │     18      │  ← número grande (rapidez/accesibilidad)
│  ▦ ▦ ▦      │  ▦ ▦ ▦      │  ← MALAS (primeros 15 = 3 figuras)
│ ━━━━━━━━━   │ ━━━━━━━━━   │  ← divisoria malas/buenas (solo si target=30)
│  ▦ ▧        │  ▨          │  ← BUENAS (figura parcial = puntos sueltos)
│ [   +1   ]  │ [   +1   ]  │  ← tap en la columna suma 1
│  ↩ deshacer │  ↩ deshacer │  ← resta el último punto (corrige errores)
│ Augusto,Juan│  Pedro, Ana │  ← integrantes si se cargaron (máx 3)
└─────────────┴─────────────┘
```

- Tap en la columna = +1 con feedback animado del trazo que aparece.
- Botón "deshacer" resta el último punto.
- Al alcanzar el objetivo, la columna se resalta y se dispara el fin de partida.

### `TallyMark` (nuevo) — dibujo de una figura de 5 trazos

Recibe `strokes` (0–5) y `style` ('square' | 'cup'); revela los trazos SVG
progresivamente. Los puntos totales se parten en grupos de 5:
`23 = [5,5,5,5,3]` → 4 figuras completas + 1 con 3 trazos.

### Otros componentes

- **`App.tsx`:** branch por `type === 'truco'` para renderizar `TrucoScoreboard`
  y la detección de fin de partida.
- **`HistoryView`:** badge "truco" (tercer color, ej. verde). Muestra
  `Nosotros 30 – Ellos 24` + integrantes si existen.
- **`PodiumView`:** cartel "¡Nosotros ganó!" reutilizando lo existente.
- **`StatsView`:** tile "Partidas de Truco: N". **No** alimenta el ranking
  individual de jugadores (el ganador es un bando, no una persona). Atribuir
  victorias a integrantes reales queda como mejora futura (fase 2).
- **`AboutView` + `translations.ts`:** nota "Por qué Truco" dedicada a Adrián;
  claves nuevas es/en (`game_truco`, malas/buenas, nosotros/ellos, deshacer, etc.).

## Fin de partida

Tras cada tap se chequea si la columna alcanzó `targetPoints`. El primero que
llega gana; se marca `status = 'completed'` y `endedAt`. Como se suma de a 1, no
hay overflow del objetivo ni empates posibles.

## Fuera de alcance (YAGNI / fase 2)

- Atribución de victorias a integrantes individuales en el ranking.
- Botones de +2/+3 directos (por ahora se resuelve con taps repetidos).
- Cantos de envido/truco/flor como lógica del juego (esto es solo un marcador).

## Alcance de archivos

| Área | Cambio |
|---|---|
| `src/types.ts` | `'truco'` en GameType, `config` en Game, `members` en Player |
| `src/components/GameSetup.tsx` | Modo truco: target, estilo, 2 bandos + integrantes |
| `src/components/TrucoScoreboard.tsx` | **Nuevo** — 2 columnas, tap +1, deshacer, divisoria |
| `src/components/TallyMark.tsx` | **Nuevo** — SVG 5 trazos, estilos cuadrado/copa |
| `src/App.tsx` | Branch por `type === 'truco'` |
| `src/components/HistoryView.tsx` | Badge truco + integrantes |
| `src/components/PodiumView.tsx` | Cartel de bando ganador |
| `src/components/StatsView.tsx` | Tile de conteo de truco |
| `src/components/AboutView.tsx` | Nota "Por qué Truco" (dedicatoria a Adrián) |
| `src/translations.ts` | Claves nuevas es/en |
