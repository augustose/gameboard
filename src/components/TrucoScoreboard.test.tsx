import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrucoScoreboard } from './TrucoScoreboard';
import { LanguageProvider } from '../contexts/LanguageContext';
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

const renderBoard = (game: Game, onAddPoint = vi.fn(), onUndo = vi.fn()) => {
  render(
    <LanguageProvider>
      <TrucoScoreboard game={game} onAddPoint={onAddPoint} onUndo={onUndo} />
    </LanguageProvider>
  );
  return { onAddPoint, onUndo };
};

describe('TrucoScoreboard', () => {
  it('shows both team totals', () => {
    renderBoard(trucoGame(23, 18));
    expect(screen.getByTestId('total-nosotros')).toHaveTextContent('23');
    expect(screen.getByTestId('total-ellos')).toHaveTextContent('18');
  });

  it('shows team members when present', () => {
    renderBoard(trucoGame());
    expect(screen.getByText(/Augusto/)).toBeInTheDocument();
    expect(screen.getByText(/Pedro/)).toBeInTheDocument();
  });

  it('calls onAddPoint with the team id when the +1 button is tapped', async () => {
    const { onAddPoint } = renderBoard(trucoGame());
    await userEvent.click(screen.getByTestId('add-nosotros'));
    expect(onAddPoint).toHaveBeenCalledWith('nosotros');
  });

  it('calls onUndo with the team id', async () => {
    const { onUndo } = renderBoard(trucoGame(3));
    await userEvent.click(screen.getByTestId('undo-nosotros'));
    expect(onUndo).toHaveBeenCalledWith('nosotros');
  });
});
