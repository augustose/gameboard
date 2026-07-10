import type { Game, Round } from '../types';

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

/** Split a total into malas (first 15) and buenas (the rest).
 *  The 15 boundary is the fixed truco half — independent of targetPoints
 *  (a 15-point game simply never fills the buenas section). */
export function splitMalasBuenas(points: number): { malas: number; buenas: number } {
  const p = Math.max(0, Math.floor(points));
  return { malas: Math.min(15, p), buenas: Math.max(0, p - 15) };
}

/** Sum a team's +1 rounds (truco stores one point per round). */
export function teamTotal(game: Game, playerId: string): number {
  return game.rounds.reduce((sum, round) => {
    const score = round.scores.find(s => s.playerId === playerId);
    return sum + (score?.points ?? 0);
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

/** Append a +1 round for a team (pure — caller supplies id/now for determinism). */
export function addTrucoPoint(game: Game, playerId: string, roundId: string, now: number): Game {
  const newRound: Round = {
    id: roundId,
    roundNumber: game.rounds.length + 1,
    scores: [{ playerId, points: 1 }],
    timestamp: now,
  };
  return { ...game, rounds: [...game.rounds, newRound], updatedAt: now };
}

/** Remove a team's most recent +1 round. No-op (returns game unchanged) if the team has none. */
export function undoLastTrucoPoint(game: Game, playerId: string, now: number): Game {
  const rounds = [...game.rounds];
  for (let i = rounds.length - 1; i >= 0; i--) {
    if (rounds[i].scores.some(s => s.playerId === playerId)) {
      rounds.splice(i, 1);
      return { ...game, rounds, updatedAt: now };
    }
  }
  return game; // nothing removed
}
