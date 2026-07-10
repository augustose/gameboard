import type { Game } from '../types';

/** Unique, sorted player names from non-truco history (truco teams
 *  'Nosotros'/'Ellos' are not real people, so they're excluded). */
export function historicalPlayerNames(history: Game[]): string[] {
  const names = new Set<string>();
  history.forEach(game => {
    if (game.type === 'truco') return;
    game.players.forEach(player => {
      const n = player.name.trim();
      if (n) names.add(n);
    });
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}
