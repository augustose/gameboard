# Truco Scoreboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Truco (Argentine card game) as a third game type with a visual tally scoreboard (squares/cups of 5 strokes), two fixed teams (Nosotros/Ellos), a configurable target (15/30), and malas/buenas division.

**Architecture:** Reuse the existing `Game`/`Player`/`Round` model. Each team is a `Player` ("Nosotros"/"Ellos"); each +1 tap is a `Round` with a single `Score` of `points: 1`. Pure truco logic (grouping into 5s, malas/buenas split, winner detection) lives in a new `src/lib/truco.ts`. A new `TrucoScoreboard` replaces the rounds table when `game.type === 'truco'`, and a new `TallyMark` SVG component draws each group of 5.

**Tech Stack:** React 19 + TypeScript + Vite + TailwindCSS. New dev tooling: **Vitest + @testing-library/react + jsdom** (the repo has no tests today).

**Key domain facts (from design doc):**
- Winner = **first team to reach the target exactly** (highest). NOTE: existing Rummy/Continental logic is "lowest wins" — truco needs its own winner branch.
- Points always increment by 1 (a truco of 3 = 3 taps), so no overflow past target, no ties.
- Malas = first 15 points; buenas = last 15. Divider drawn only when target = 30.
- Each group of 5 = one figure of 5 strokes: **square** (4 sides + diagonal) or **cup/cáliz**.

**Design doc:** `docs/plans/2026-07-09-truco-scoreboard-design.md`

---

## Task 0: Testing infrastructure (Vitest + Testing Library)

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/smoke.test.ts` (temporary sanity check, deleted at end of task)

**Step 1: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 2: Create `vitest.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

**Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

**Step 4: Add scripts to `package.json`**

Add to the `"scripts"` block:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Write a smoke test `src/lib/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

**Step 6: Run it**

Run: `npm test`
Expected: PASS (1 test).

**Step 7: Delete the smoke test and commit**

```bash
rm src/lib/smoke.test.ts
git add package.json package-lock.json vitest.config.ts src/test/setup.ts
git commit -m "chore: set up vitest + testing-library"
```

---

## Task 1: Types

**Files:**
- Modify: `src/types.ts`

**Step 1: Extend the types**

Change `GameType` and add optional fields:

```ts
export type GameType = 'rummy' | 'continental' | 'truco';

export type TrucoMarkerStyle = 'square' | 'cup';

export interface Player {
    id: string;
    name: string;
    avatar?: string;
    members?: string[];      // truco only: team members (traceability), max 3, not scored individually
}

export interface TrucoConfig {
    targetPoints: 15 | 30;
    markerStyle: TrucoMarkerStyle;
}

export interface Game {
    id: string;
    createdAt: number;
    updatedAt?: number;
    endedAt?: number;
    status: 'active' | 'completed';
    type: GameType;
    players: Player[];
    rounds: Round[];
    hostId: string;
    config?: TrucoConfig;    // truco only
}
```

**Step 2: Typecheck**

Run: `npx tsc -b`
Expected: PASS (no errors — new fields are optional).

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat(types): add truco game type, TrucoConfig, Player.members"
```

---

## Task 2: Pure truco logic (`src/lib/truco.ts`)

**Files:**
- Create: `src/lib/truco.ts`
- Test: `src/lib/truco.test.ts`

**Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import {
  groupStrokes,
  splitMalasBuenas,
  teamTotal,
  trucoWinnerId,
} from './truco';
import type { Game, Player } from '../types';

const player = (id: string, name: string): Player => ({ id, name });

function gameWith(points: Record<string, number>, target: 15 | 30 = 30): Game {
  const players = Object.keys(points).map(id => player(id, id));
  const rounds = [] as Game['rounds'];
  let n = 1;
  for (const id of Object.keys(points)) {
    for (let i = 0; i < points[id]; i++) {
      rounds.push({ id: `r${n}`, roundNumber: n, scores: [{ playerId: id, points: 1 }], timestamp: n });
      n++;
    }
  }
  return {
    id: 'g', createdAt: 0, status: 'active', type: 'truco',
    players, rounds, hostId: 'x',
    config: { targetPoints: target, markerStyle: 'square' },
  };
}

describe('groupStrokes', () => {
  it('returns [] for 0 points', () => {
    expect(groupStrokes(0)).toEqual([]);
  });
  it('returns one partial group under 5', () => {
    expect(groupStrokes(3)).toEqual([3]);
  });
  it('returns a full group at exactly 5', () => {
    expect(groupStrokes(5)).toEqual([5]);
  });
  it('splits 23 into four fives and a three', () => {
    expect(groupStrokes(23)).toEqual([5, 5, 5, 5, 3]);
  });
});

describe('splitMalasBuenas', () => {
  it('keeps everything in malas under 15', () => {
    expect(splitMalasBuenas(12)).toEqual({ malas: 12, buenas: 0 });
  });
  it('caps malas at 15 and overflows to buenas', () => {
    expect(splitMalasBuenas(23)).toEqual({ malas: 15, buenas: 8 });
  });
  it('handles exactly 15', () => {
    expect(splitMalasBuenas(15)).toEqual({ malas: 15, buenas: 0 });
  });
});

describe('teamTotal', () => {
  it('sums a team\'s +1 rounds', () => {
    const g = gameWith({ nosotros: 7, ellos: 4 });
    expect(teamTotal(g, 'nosotros')).toBe(7);
    expect(teamTotal(g, 'ellos')).toBe(4);
  });
});

describe('trucoWinnerId', () => {
  it('returns null when nobody reached the target', () => {
    const g = gameWith({ nosotros: 29, ellos: 12 }, 30);
    expect(trucoWinnerId(g)).toBeNull();
  });
  it('returns the team that reached the target', () => {
    const g = gameWith({ nosotros: 30, ellos: 12 }, 30);
    expect(trucoWinnerId(g)).toBe('nosotros');
  });
  it('respects a target of 15', () => {
    const g = gameWith({ nosotros: 15, ellos: 9 }, 15);
    expect(trucoWinnerId(g)).toBe('nosotros');
  });
});
```

**Step 2: Run to verify it fails**

Run: `npm test -- truco`
Expected: FAIL (module `./truco` has no exports).

**Step 3: Write the implementation**

```ts
import type { Game } from '../types';

/**
 * Split a point count into groups of 5 strokes each.
 * Each returned element is the stroke count of one figure (1..5).
 * Example: 23 -> [5, 5, 5, 5, 3]. Zero -> [].
 */
export function groupStrokes(points: number): number[] {
  const groups: number[] = [];
  let remaining = Math.max(0, Math.floor(points));
  while (remaining > 0) {
    const strokes = Math.min(5, remaining);
    groups.push(strokes);
    remaining -= strokes;
  }
  return groups;
}

/** Split a total into malas (first 15) and buenas (the rest). */
export function splitMalasBuenas(points: number): { malas: number; buenas: number } {
  const p = Math.max(0, Math.floor(points));
  return { malas: Math.min(15, p), buenas: Math.max(0, p - 15) };
}

/** Sum a team's +1 rounds (truco stores one point per round). */
export function teamTotal(game: Game, playerId: string): number {
  return game.rounds.reduce((sum, round) => {
    const score = round.scores.find(s => s.playerId === playerId);
    return sum + (score?.points || 0);
  }, 0);
}

/**
 * The team that reached the target, or null if nobody has yet.
 * Winner = first (and only, since we add 1 at a time) team at/over target.
 */
export function trucoWinnerId(game: Game): string | null {
  const target = game.config?.targetPoints ?? 30;
  for (const p of game.players) {
    if (teamTotal(game, p.id) >= target) return p.id;
  }
  return null;
}
```

**Step 4: Run to verify it passes**

Run: `npm test -- truco`
Expected: PASS (all cases).

**Step 5: Commit**

```bash
git add src/lib/truco.ts src/lib/truco.test.ts
git commit -m "feat(truco): pure logic for stroke grouping, malas/buenas, winner"
```

---

## Task 3: `TallyMark` component (SVG of 5 strokes)

**Files:**
- Create: `src/components/TallyMark.tsx`
- Test: `src/components/TallyMark.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TallyMark } from './TallyMark';

describe('TallyMark', () => {
  it('renders no strokes for 0', () => {
    const { container } = render(<TallyMark strokes={0} style="square" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(0);
  });
  it('renders 3 strokes for 3 (square)', () => {
    const { container } = render(<TallyMark strokes={3} style="square" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(3);
  });
  it('renders 5 strokes for a full square', () => {
    const { container } = render(<TallyMark strokes={5} style="square" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(5);
  });
  it('renders 5 strokes for a full cup', () => {
    const { container } = render(<TallyMark strokes={5} style="cup" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(5);
  });
});
```

**Step 2: Run to verify it fails**

Run: `npm test -- TallyMark`
Expected: FAIL (no such module).

**Step 3: Write the implementation**

Each style is an ordered list of 5 SVG segments; we render the first `strokes` of them. A segment marked `data-stroke="true"` is a drawn stroke (for tests and styling). Coordinates are in a 0..40 viewBox.

```tsx
import React from 'react';
import type { TrucoMarkerStyle } from '../types';

interface TallyMarkProps {
  strokes: number;              // 0..5 (values are clamped)
  style: TrucoMarkerStyle;
  className?: string;
}

// Ordered strokes. Each is an SVG path 'd'. Order matters: strokes appear 1..5.
const SQUARE_STROKES: string[] = [
  'M8 6 L8 34',    // 1: left side
  'M8 6 L32 6',    // 2: top
  'M32 6 L32 34',  // 3: right side
  'M8 34 L32 34',  // 4: bottom
  'M8 6 L32 34',   // 5: diagonal (the "cross")
];

// A stylised cup/cáliz drawn with 5 strokes.
const CUP_STROKES: string[] = [
  'M12 6 Q20 20 12 20',   // 1: left side of the bowl
  'M28 6 Q20 20 28 20',   // 2: right side of the bowl
  'M20 20 L20 30',        // 3: stem
  'M12 34 L28 34',        // 4: base
  'M12 6 L28 6',          // 5: rim (the "cross")
];

export const TallyMark: React.FC<TallyMarkProps> = ({ strokes, style, className }) => {
  const clamped = Math.max(0, Math.min(5, Math.floor(strokes)));
  const paths = style === 'cup' ? CUP_STROKES : SQUARE_STROKES;
  return (
    <svg viewBox="0 0 40 40" className={className} width="40" height="40" aria-hidden="true">
      {paths.slice(0, clamped).map((d, i) => (
        <path
          key={i}
          d={d}
          data-stroke="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
```

**Step 4: Run to verify it passes**

Run: `npm test -- TallyMark`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/TallyMark.tsx src/components/TallyMark.test.tsx
git commit -m "feat(truco): TallyMark SVG (square + cup styles)"
```

---

## Task 4: `TrucoScoreboard` component

**Files:**
- Create: `src/components/TrucoScoreboard.tsx`
- Test: `src/components/TrucoScoreboard.test.tsx`

The component is presentational: it receives the game plus `onAddPoint(playerId)` and `onUndo(playerId)` callbacks. App owns state and win detection (Task 6).

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrucoScoreboard } from './TrucoScoreboard';
import type { Game } from '../types';

function trucoGame(nosotros = 0, ellos = 0): Game {
  const rounds: Game['rounds'] = [];
  let n = 1;
  const add = (id: string, count: number) => {
    for (let i = 0; i < count; i++) {
      rounds.push({ id: `r${n}`, roundNumber: n, scores: [{ playerId: id, points: 1 }], timestamp: n });
      n++;
    }
  };
  add('nosotros', nosotros);
  add('ellos', ellos);
  return {
    id: 'g', createdAt: 0, status: 'active', type: 'truco', hostId: 'x',
    players: [
      { id: 'nosotros', name: 'Nosotros', members: ['Augusto', 'Juan'] },
      { id: 'ellos', name: 'Ellos', members: ['Pedro'] },
    ],
    rounds,
    config: { targetPoints: 30, markerStyle: 'square' },
  };
}

describe('TrucoScoreboard', () => {
  it('shows both team totals', () => {
    render(<TrucoScoreboard game={trucoGame(23, 18)} onAddPoint={() => {}} onUndo={() => {}} />);
    expect(screen.getByTestId('total-nosotros')).toHaveTextContent('23');
    expect(screen.getByTestId('total-ellos')).toHaveTextContent('18');
  });

  it('shows team members when present', () => {
    render(<TrucoScoreboard game={trucoGame()} onAddPoint={() => {}} onUndo={() => {}} />);
    expect(screen.getByText(/Augusto/)).toBeInTheDocument();
    expect(screen.getByText(/Pedro/)).toBeInTheDocument();
  });

  it('calls onAddPoint with the team id when the column is tapped', async () => {
    const onAddPoint = vi.fn();
    render(<TrucoScoreboard game={trucoGame()} onAddPoint={onAddPoint} onUndo={() => {}} />);
    await userEvent.click(screen.getByTestId('add-nosotros'));
    expect(onAddPoint).toHaveBeenCalledWith('nosotros');
  });

  it('calls onUndo with the team id', async () => {
    const onUndo = vi.fn();
    render(<TrucoScoreboard game={trucoGame(3)} onAddPoint={() => {}} onUndo={onUndo} />);
    await userEvent.click(screen.getByTestId('undo-nosotros'));
    expect(onUndo).toHaveBeenCalledWith('nosotros');
  });
});
```

**Step 2: Run to verify it fails**

Run: `npm test -- TrucoScoreboard`
Expected: FAIL (no such module).

**Step 3: Write the implementation**

```tsx
import React from 'react';
import { Undo2 } from 'lucide-react';
import type { Game, Player } from '../types';
import { TallyMark } from './TallyMark';
import { groupStrokes, splitMalasBuenas, teamTotal } from '../lib/truco';
import { useLanguage } from '../contexts/LanguageContext';

interface TrucoScoreboardProps {
  game: Game;
  onAddPoint: (playerId: string) => void;
  onUndo: (playerId: string) => void;
}

const TeamColumn: React.FC<{
  player: Player;
  total: number;
  target: number;
  style: Game['config'] extends infer C ? 'square' | 'cup' : never;
  onAddPoint: () => void;
  onUndo: () => void;
  malasLabel: string;
  buenasLabel: string;
  undoLabel: string;
}> = ({ player, total, target, style, onAddPoint, onUndo, malasLabel, buenasLabel, undoLabel }) => {
  const { malas, buenas } = splitMalasBuenas(total);
  const showDivider = target === 30;
  const won = total >= target;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-4 min-h-[60vh] transition-colors ${
        won ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-center">
        <div className="text-sm font-bold uppercase tracking-wider text-slate-500">{player.name}</div>
        <div data-testid={`total-${player.id}`} className="text-5xl font-black text-slate-800">{total}</div>
      </div>

      {/* Malas */}
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{malasLabel}</div>
        <div className="flex flex-wrap gap-1 text-slate-700 min-h-[44px]">
          {groupStrokes(malas).map((s, i) => (
            <TallyMark key={`m${i}`} strokes={s} style={style} />
          ))}
        </div>
      </div>

      {showDivider && <div className="my-3 border-t-2 border-dashed border-slate-300" />}

      {/* Buenas */}
      {showDivider && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{buenasLabel}</div>
          <div className="flex flex-wrap gap-1 text-slate-700 min-h-[44px]">
            {groupStrokes(buenas).map((s, i) => (
              <TallyMark key={`b${i}`} strokes={s} style={style} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Members */}
      {player.members && player.members.length > 0 && (
        <div className="text-center text-xs text-slate-400 mb-3 truncate">
          {player.members.slice(0, 3).join(', ')}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          data-testid={`add-${player.id}`}
          onClick={onAddPoint}
          disabled={won}
          className="flex-1 py-4 rounded-xl bg-blue-600 text-white text-2xl font-bold active:scale-95 transition-transform disabled:bg-slate-300"
        >
          +1
        </button>
        <button
          data-testid={`undo-${player.id}`}
          onClick={onUndo}
          disabled={total === 0}
          aria-label={undoLabel}
          className="p-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          <Undo2 size={20} />
        </button>
      </div>
    </div>
  );
};

export const TrucoScoreboard: React.FC<TrucoScoreboardProps> = ({ game, onAddPoint, onUndo }) => {
  const { t } = useLanguage();
  const target = game.config?.targetPoints ?? 30;
  const style = game.config?.markerStyle ?? 'square';

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 animate-in fade-in duration-300">
      {game.players.map(p => (
        <TeamColumn
          key={p.id}
          player={p}
          total={teamTotal(game, p.id)}
          target={target}
          style={style as 'square' | 'cup'}
          onAddPoint={() => onAddPoint(p.id)}
          onUndo={() => onUndo(p.id)}
          malasLabel={t.truco_malas}
          buenasLabel={t.truco_buenas}
          undoLabel={t.truco_undo}
        />
      ))}
    </div>
  );
};
```

> Note: `t.truco_malas`, `t.truco_buenas`, `t.truco_undo` are added in Task 9. To keep this task green in isolation, either do Task 9 first or temporarily inline the Spanish strings; the plan runs Task 9 before this is wired into the app, and the component test above does not assert on those labels.

**Step 4: Run to verify it passes**

Run: `npm test -- TrucoScoreboard`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/TrucoScoreboard.tsx src/components/TrucoScoreboard.test.tsx
git commit -m "feat(truco): TrucoScoreboard with tap-to-add, undo, malas/buenas"
```

---

## Task 9: Translations (do before wiring so labels exist)

**Files:**
- Modify: `src/translations.ts`

**Step 1: Add keys to BOTH the `en` and `es` objects**

English (`en`):

```ts
game_truco: "Truco",
truco_malas: "Malas",
truco_buenas: "Buenas",
truco_undo: "Undo",
truco_target: "Target",
truco_style: "Marker style",
truco_style_square: "Square",
truco_style_cup: "Cup",
truco_team_us: "Us",
truco_team_them: "Them",
truco_members: "Members (optional, max 3)",
truco_winner: "won!",
stats_truco_games: "Truco Games",
about_truco_note_title: "Why Truco?",
about_truco_note_text: "My brother Adrián told me he plays truco and would love to have it as an option. And since I love him dearly because he is a great man, I decided to implement it. This one is for you, Adrián.",
```

Spanish (`es`):

```ts
game_truco: "Truco",
truco_malas: "Malas",
truco_buenas: "Buenas",
truco_undo: "Deshacer",
truco_target: "Objetivo",
truco_style: "Estilo de marcador",
truco_style_square: "Cuadrado",
truco_style_cup: "Copa",
truco_team_us: "Nosotros",
truco_team_them: "Ellos",
truco_members: "Integrantes (opcional, máx 3)",
truco_winner: "¡ganó!",
stats_truco_games: "Juegos Truco",
about_truco_note_title: "¿Por qué Truco?",
about_truco_note_text: "Mi hermano Adrián me dijo que él juega al truco y que le gustaría tenerlo como opción. Y como lo quiero mucho porque es un grande, decidí implementarlo. Esta va para vos, Adrián.",
```

**Step 2: Typecheck**

Run: `npx tsc -b`
Expected: PASS. (If the translations use a shared type/interface, add the keys there too so both languages stay in sync.)

**Step 3: Commit**

```bash
git add src/translations.ts
git commit -m "feat(truco): add es/en translation keys"
```

---

## Task 5: `GameSetup` truco mode

**Files:**
- Modify: `src/components/GameSetup.tsx`
- Modify: `src/components/Sidebar.tsx` (add a truco entry point)
- Test: `src/components/GameSetup.truco.test.tsx`

**Step 1: Extend `onStartGame` signature**

In `GameSetup.tsx`, change the prop type to pass config:

```ts
interface GameSetupProps {
    onStartGame: (players: Player[], type: GameType, config?: TrucoConfig) => void;
    initialPlayers?: Player[];
    initialGameType?: GameType;
    historicalPlayers?: string[];
}
```

Import `TrucoConfig`, `TrucoMarkerStyle` from `../types`.

**Step 2: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameSetup } from './GameSetup';
import { LanguageProvider } from '../contexts/LanguageContext';

const renderSetup = (onStartGame = vi.fn()) => {
  render(
    <LanguageProvider>
      <GameSetup onStartGame={onStartGame} initialGameType="truco" />
    </LanguageProvider>
  );
  return onStartGame;
};

describe('GameSetup (truco)', () => {
  it('starts a truco game with two fixed teams and default config', async () => {
    const onStartGame = renderSetup();
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onStartGame).toHaveBeenCalledTimes(1);
    const [players, type, config] = onStartGame.mock.calls[0];
    expect(type).toBe('truco');
    expect(players).toHaveLength(2);
    expect(players.map((p: any) => p.name)).toEqual(['Nosotros', 'Ellos']);
    expect(config).toEqual({ targetPoints: 30, markerStyle: 'square' });
  });

  it('lets the user pick target 15 and cup style', async () => {
    const onStartGame = renderSetup();
    await userEvent.click(screen.getByTestId('truco-target-15'));
    await userEvent.click(screen.getByTestId('truco-style-cup'));
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    const config = onStartGame.mock.calls[0][2];
    expect(config).toEqual({ targetPoints: 15, markerStyle: 'cup' });
  });
});
```

> If `LanguageProvider` is not the exact export name, check `src/contexts/LanguageContext.tsx` and adjust the import/wrapper.

**Step 3: Run to verify it fails**

Run: `npm test -- GameSetup.truco`
Expected: FAIL.

**Step 4: Implement the truco branch in `GameSetup`**

Add local state and a conditional UI. Key points:
- Add `'truco'` as a third button in the Game Variant selector (make the grid `grid-cols-3`).
- Add truco state: `const [target, setTarget] = useState<15 | 30>(30);` and `const [markerStyle, setMarkerStyle] = useState<TrucoMarkerStyle>('square');`
- Add team-members state: `const [us, setUs] = useState<string[]>([]); const [them, setThem] = useState<string[]>([]);` each editable via a chip input capped at 3 (Enter to add).
- When `gameType === 'truco'`, render the truco setup (target toggle with `data-testid="truco-target-15"` / `truco-target-30`, style toggle with `data-testid="truco-style-square"` / `truco-style-cup`, and the two member inputs) INSTEAD of the players list.
- Truco is always valid (2 fixed teams), so the Start button is enabled.
- On submit for truco:

```ts
if (gameType === 'truco') {
    const players: Player[] = [
        { id: generateId(), name: t.truco_team_us, members: us.slice(0, 3) },
        { id: generateId(), name: t.truco_team_them, members: them.slice(0, 3) },
    ];
    onStartGame(players, 'truco', { targetPoints: target, markerStyle });
    return;
}
```

> IMPORTANT: the test asserts team names `['Nosotros', 'Ellos']`, which come from `t.truco_team_us` / `t.truco_team_them` in Spanish. Ensure the test renders under a Spanish `LanguageProvider` (default) or adjust the expectation to the provider's default language.

Members chip input (reused for both teams), max 3:

```tsx
const MemberInput: React.FC<{ label: string; members: string[]; setMembers: (m: string[]) => void; testid: string; }> = ({ label, members, setMembers, testid }) => {
    const [value, setValue] = useState('');
    const add = () => {
        const v = value.trim();
        if (v && members.length < 3) { setMembers([...members, v]); setValue(''); }
    };
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <div className="flex flex-wrap gap-1">
                {members.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 rounded-full text-xs flex items-center gap-1">
                        {m}
                        <button type="button" onClick={() => setMembers(members.filter((_, j) => j !== i))}>×</button>
                    </span>
                ))}
            </div>
            {members.length < 3 && (
                <input
                    data-testid={testid}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    placeholder="+ nombre"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
            )}
        </div>
    );
};
```

**Step 5: Add a truco entry point in `Sidebar.tsx`**

Next to the existing Rummy/Continental buttons (around `Sidebar.tsx:78-84`), add:

```tsx
<button
    onClick={() => { onNavigate('home'); onStartGame && onStartGame('truco'); }}
    className="/* copy sibling classes */"
>
    Truco
</button>
```

**Step 6: Run tests + typecheck**

Run: `npm test -- GameSetup.truco` → PASS
Run: `npx tsc -b` → PASS

**Step 7: Commit**

```bash
git add src/components/GameSetup.tsx src/components/Sidebar.tsx src/components/GameSetup.truco.test.tsx
git commit -m "feat(truco): GameSetup truco mode (target, style, teams, members)"
```

---

## Task 6: Wire into `App.tsx` (render + point handlers + win detection)

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.truco.test.tsx` (optional integration test — see Step 5)

**Step 1: Update `startGame` to accept config**

```ts
const startGame = (players: Player[], type: GameType, config?: TrucoConfig) => {
    const now = Date.now();
    const newGame: Game = {
        id: generateId(), createdAt: now, updatedAt: now,
        status: 'active', type, players, rounds: [], hostId: 'local-user',
        ...(config ? { config } : {}),
    };
    setActiveGame(newGame);
    setView('home');
};
```

Update `handleRematch` to pass `activeGame.config`.

**Step 2: Add truco point handlers with auto-finish**

Import `trucoWinnerId` from `./lib/truco`.

```ts
const handleAddTrucoPoint = (playerId: string) => {
    if (!activeGame) return;
    const now = Date.now();
    const newRound: Round = {
        id: generateId(),
        roundNumber: activeGame.rounds.length + 1,
        scores: [{ playerId, points: 1 }],
        timestamp: now,
    };
    const updated: Game = { ...activeGame, rounds: [...activeGame.rounds, newRound], updatedAt: now };
    const winner = trucoWinnerId(updated);
    if (winner) {
        const completed: Game = { ...updated, status: 'completed', endedAt: now };
        saveGame(completed);
        setActiveGame(completed);
    } else {
        setActiveGame(updated);
    }
};

const handleUndoTrucoPoint = (playerId: string) => {
    if (!activeGame) return;
    // Remove this team's most recent +1 round.
    let removed = false;
    const rounds = [...activeGame.rounds];
    for (let i = rounds.length - 1; i >= 0; i--) {
        if (rounds[i].scores.some(s => s.playerId === playerId)) {
            rounds.splice(i, 1);
            removed = true;
            break;
        }
    }
    if (removed) setActiveGame({ ...activeGame, rounds, updatedAt: Date.now() });
};
```

**Step 3: Branch the render**

In `renderContent`, before the generic `Scoreboard` return:

```tsx
if (activeGame.type === 'truco') {
    return (
        <TrucoScoreboard
            game={activeGame}
            onAddPoint={handleAddTrucoPoint}
            onUndo={handleUndoTrucoPoint}
        />
    );
}
```

Import `TrucoScoreboard` and `TrucoConfig`.

**Step 4: Typecheck + full test run**

Run: `npx tsc -b` → PASS
Run: `npm test` → PASS

**Step 5: (Optional) Integration test `src/App.truco.test.tsx`**

Render the Dashboard, start a truco game (target 15), tap `add-nosotros` 15 times, assert the PodiumView appears. Skip if the AuthProvider/data store make rendering App heavy; the unit tests already cover the logic.

**Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat(truco): wire TrucoScoreboard, point handlers, auto-finish at target"
```

---

## Task 7: `PodiumView` truco branch (highest wins)

**Files:**
- Modify: `src/components/PodiumView.tsx`
- Test: `src/components/PodiumView.truco.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PodiumView } from './PodiumView';
import type { Game } from '../types';

function completedTruco(): Game {
  const rounds: Game['rounds'] = [];
  for (let i = 0; i < 30; i++) rounds.push({ id: `n${i}`, roundNumber: i + 1, scores: [{ playerId: 'nosotros', points: 1 }], timestamp: i });
  for (let i = 0; i < 18; i++) rounds.push({ id: `e${i}`, roundNumber: 31 + i, scores: [{ playerId: 'ellos', points: 1 }], timestamp: 100 + i });
  return {
    id: 'g', createdAt: 0, endedAt: 1000, status: 'completed', type: 'truco', hostId: 'x',
    players: [{ id: 'nosotros', name: 'Nosotros' }, { id: 'ellos', name: 'Ellos' }],
    rounds, config: { targetPoints: 30, markerStyle: 'square' },
  };
}

describe('PodiumView (truco)', () => {
  it('crowns the team that reached the target (highest, not lowest)', () => {
    render(<PodiumView game={completedTruco()} onRematch={() => {}} onHome={() => {}} />);
    // Winner block shows 30 pts for Nosotros.
    expect(screen.getByTestId('podium-winner')).toHaveTextContent('Nosotros');
    expect(screen.getByTestId('podium-winner')).toHaveTextContent('30');
  });
});
```

**Step 2: Run to verify it fails**

Run: `npm test -- PodiumView.truco`
Expected: FAIL (no `podium-winner` testid, and sort is currently lowest-first).

**Step 3: Implement**

In `PodiumView.tsx`, make the sort direction depend on game type:

```ts
const isTruco = game.type === 'truco';
const playerTotals = game.players.map(p => ({
    ...p,
    total: game.rounds.reduce((sum, r) => sum + (r.scores.find(s => s.playerId === p.id)?.points || 0), 0),
})).sort((a, b) => isTruco ? b.total - a.total : a.total - b.total);
```

Add `data-testid="podium-winner"` to the winner block wrapper (around `PodiumView.tsx:77`).

**Step 4: Run to verify it passes**

Run: `npm test -- PodiumView.truco`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/PodiumView.tsx src/components/PodiumView.truco.test.tsx
git commit -m "feat(truco): PodiumView crowns the team that reached the target"
```

---

## Task 8: Badges, history, stats

**Files:**
- Modify: `src/components/HistoryView.tsx`
- Modify: `src/components/Scoreboard.tsx` (badge color only — Scoreboard is never used for truco, but the badge switch should not mislabel)
- Modify: `src/components/StatsView.tsx`
- Test: `src/components/StatsView.truco.test.tsx`

**Step 1: Truco badge color**

In `HistoryView.tsx` (around line 78) and `Scoreboard.tsx` (line 46), the badge currently switches only between continental/blue. Replace with a helper that also handles truco (green). Example for HistoryView:

```tsx
const badgeClass = game.type === 'truco'
    ? 'bg-green-100 text-green-700'
    : game.type === 'continental'
    ? 'bg-indigo-100 text-indigo-700'
    : 'bg-blue-100 text-blue-700';
```

In HistoryView, also render team members under the result when present (truco), e.g. `game.players.map(p => p.members?.join(', ')).filter(Boolean)`.

**Step 2: Stats — count truco games without polluting the individual ranking**

Write the failing test `src/components/StatsView.truco.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsView } from './StatsView';
import type { Game } from '../types';

const truco: Game = {
  id: 'g', createdAt: 0, endedAt: 1, status: 'completed', type: 'truco', hostId: 'x',
  players: [{ id: 'n', name: 'Nosotros' }, { id: 'e', name: 'Ellos' }],
  rounds: [{ id: 'r', roundNumber: 1, scores: [{ playerId: 'n', points: 30 }], timestamp: 0 }],
  config: { targetPoints: 30, markerStyle: 'square' },
};

describe('StatsView (truco)', () => {
  it('shows a truco games count tile', () => {
    render(<StatsView history={[truco]} />);
    expect(screen.getByText(/Truco/i)).toBeInTheDocument();
    expect(screen.getByTestId('stat-truco-count')).toHaveTextContent('1');
  });
});
```

Run: `npm test -- StatsView.truco` → FAIL.

Then in `StatsView.tsx`:
- Guard the per-player ranking loop so truco games are skipped (`if (game.type === 'truco') return;` inside the per-game aggregation that attributes wins to players), because "Nosotros"/"Ellos" are not real people.
- Add a tile: `<div ...><div>{t.stats_truco_games}</div><div data-testid="stat-truco-count">{history.filter(g => g.type === 'truco').length}</div></div>`.

Run: `npm test -- StatsView.truco` → PASS.

**Step 3: Typecheck + full test run**

Run: `npx tsc -b` → PASS
Run: `npm test` → PASS

**Step 4: Commit**

```bash
git add src/components/HistoryView.tsx src/components/Scoreboard.tsx src/components/StatsView.tsx src/components/StatsView.truco.test.tsx
git commit -m "feat(truco): history/scoreboard badge, members display, stats count"
```

---

## Task 10: AboutView — "Why Truco?" note (dedication to Adrián)

**Files:**
- Modify: `src/components/AboutView.tsx`

**Step 1: Add the note block**

After the existing Tribute block (do NOT touch the Don Rafael tribute), add a new block that reuses `t.about_truco_note_title` / `t.about_truco_note_text` (added in Task 9):

```tsx
<div className="bg-green-50 p-4 rounded-lg my-6 border-l-4 border-green-500">
    <h4 className="font-bold text-slate-800 mb-2 text-lg">{t.about_truco_note_title}</h4>
    <p className="text-slate-700 italic">"{t.about_truco_note_text}"</p>
</div>
```

Optionally update the subtitle on line 12 to mention Truco.

**Step 2: Typecheck**

Run: `npx tsc -b`
Expected: PASS.

**Step 3: Commit**

```bash
git add src/components/AboutView.tsx
git commit -m "feat(truco): add 'Why Truco?' note dedicated to Adrián"
```

---

## Task 11: Manual verification in the browser

**Step 1: Build check**

Run: `npm run build`
Expected: PASS (tsc + vite build).

**Step 2: Full test suite**

Run: `npm test`
Expected: all PASS.

**Step 3: Drive the app (use the run/preview flow)**

1. Start dev server, open the app.
2. New Game → select **Truco**. Verify: target toggle (15/30), style toggle (square/cup), two team blocks (Nosotros/Ellos) with member inputs capped at 3.
3. Add a couple of members to each team. Start.
4. Verify the two-column board: tap +1 several times on each side — strokes appear grouped in 5s; at 16 the 4th figure starts the "buenas" section (target 30).
5. Switch a fresh game to **cup** style and confirm the cup figure draws.
6. Reach the target on one side → PodiumView crowns that team (highest wins), confetti fires.
7. History shows the game with a green **truco** badge and member names.
8. Stats shows the "Truco Games" tile; individual ranking is unaffected.
9. About shows the "Why Truco?" note.

**Step 4: Final commit / branch wrap-up**

Use superpowers:finishing-a-development-branch to decide merge/PR.

---

## Notes / gotchas for the implementer

- **Winner direction is inverted vs. the other games.** Rummy/Continental = lowest total wins; truco = first to reach target (highest). Only `PodiumView` and the truco auto-finish care; do not change the generic `Scoreboard` win logic.
- **`Scoreboard` is never rendered for truco** (App branches to `TrucoScoreboard`), but its badge `switch` should still name truco correctly if ever shown.
- **Members are cosmetic**: never scored per person; max 3 enforced at input.
- **No overflow past target**: we add 1 at a time, so `>= target` is always `=== target` at the moment of winning — no ties possible.
- **Undo** removes the team's most recent +1 round; it cannot un-win a game because the game auto-completes and leaves the active-game render path.
- Keep commits small (one per task/step group) as written.
```
