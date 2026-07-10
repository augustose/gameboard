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
  it('starts a truco game with two fixed teams (Nosotros/Ellos) and default config', async () => {
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

  it('captures up to 3 members per team (4th is rejected) and passes them through', async () => {
    const onStartGame = renderSetup();
    const usInput = screen.getByTestId('truco-members-us');
    await userEvent.type(usInput, 'Augusto{Enter}Juan{Enter}Pedro{Enter}Cuarto{Enter}');
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    const players = onStartGame.mock.calls[0][0];
    expect(players[0].members).toEqual(['Augusto', 'Juan', 'Pedro']);
  });
});
