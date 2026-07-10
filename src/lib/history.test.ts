import { describe, it, expect } from 'vitest';
import { historicalPlayerNames } from './history';
import type { Game } from '../types';

const g = (type: Game['type'], names: string[]): Game => ({
  id: type + names.join(), createdAt: 0, status: 'completed', type, hostId: 'x',
  players: names.map((n, i) => ({ id: `${n}${i}`, name: n })),
  rounds: [],
});

describe('historicalPlayerNames', () => {
  it('returns sorted unique names from non-truco games', () => {
    expect(historicalPlayerNames([g('rummy', ['Beto', 'Ana']), g('continental', ['Ana', 'Cora'])]))
      .toEqual(['Ana', 'Beto', 'Cora']);
  });
  it('excludes truco team names (Nosotros/Ellos are not people)', () => {
    const res = historicalPlayerNames([g('rummy', ['Ana']), g('truco', ['Nosotros', 'Ellos'])]);
    expect(res).toEqual(['Ana']);
    expect(res).not.toContain('Nosotros');
    expect(res).not.toContain('Ellos');
  });
  it('ignores blank names', () => {
    expect(historicalPlayerNames([g('rummy', ['Ana', '  ', ''])])).toEqual(['Ana']);
  });
});
