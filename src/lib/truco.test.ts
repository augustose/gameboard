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
  it('resolves a tie by players array order (both at/over target)', () => {
    const g = gameWith({ nosotros: 30, ellos: 30 }, 30);
    expect(trucoWinnerId(g)).toBe('nosotros');
  });
});
