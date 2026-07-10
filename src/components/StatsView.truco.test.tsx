import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsView } from './StatsView';
import { LanguageProvider } from '../contexts/LanguageContext';
import type { Game } from '../types';

const trucoGame: Game = {
  id: 'g', createdAt: 0, endedAt: 1, status: 'completed', type: 'truco', hostId: 'x',
  players: [{ id: 'n', name: 'Nosotros' }, { id: 'e', name: 'Ellos' }],
  rounds: [{ id: 'r', roundNumber: 1, scores: [{ playerId: 'n', points: 30 }], timestamp: 0 }],
  config: { targetPoints: 30, markerStyle: 'square' },
};

const renderStats = (history: Game[]) =>
  render(<LanguageProvider><StatsView history={history} /></LanguageProvider>);

describe('StatsView (truco)', () => {
  it('shows a truco games count tile', () => {
    renderStats([trucoGame]);
    expect(screen.getByTestId('stat-truco-count')).toHaveTextContent('1');
  });

  it('does not add truco teams (Nosotros/Ellos) to the individual ranking', () => {
    renderStats([trucoGame]);
    expect(screen.queryByText('Nosotros')).toBeNull();
    expect(screen.queryByText('Ellos')).toBeNull();
  });
});
