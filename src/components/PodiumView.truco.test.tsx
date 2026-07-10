import { describe, it, expect, vi } from 'vitest';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
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
    const winner = screen.getByTestId('podium-winner');
    expect(winner).toHaveTextContent('Nosotros');
    expect(winner).toHaveTextContent('30');
  });

  it('shows each team\'s members below its podium bar (when provided)', () => {
    const g = completedTruco();
    g.players[0].members = ['Augusto', 'Juan']; // nosotros (winner)
    g.players[1].members = ['Pedro'];           // ellos (second)
    render(<PodiumView game={g} onRematch={() => {}} onHome={() => {}} />);
    expect(screen.getByTestId('podium-winner-members')).toHaveTextContent('Augusto, Juan');
    expect(screen.getByText('Pedro')).toBeInTheDocument();
  });

  it('renders no member line for teams without members', () => {
    render(<PodiumView game={completedTruco()} onRematch={() => {}} onHome={() => {}} />);
    expect(screen.queryByTestId('podium-winner-members')).toBeNull();
  });
});

describe('PodiumView (rummy, regression)', () => {
  it('crowns the lowest total for non-truco games', () => {
    const g: Game = {
      id: 'g2', createdAt: 0, endedAt: 1, status: 'completed', type: 'rummy', hostId: 'x',
      players: [{ id: 'a', name: 'Ana' }, { id: 'b', name: 'Beto' }],
      rounds: [
        { id: 'r1', roundNumber: 1, scores: [{ playerId: 'a', points: 5 }, { playerId: 'b', points: 20 }], timestamp: 0 },
      ],
    };
    render(<PodiumView game={g} onRematch={() => {}} onHome={() => {}} />);
    const winner = screen.getByTestId('podium-winner');
    expect(winner).toHaveTextContent('Ana');   // 5 < 20, lowest wins
  });
});
