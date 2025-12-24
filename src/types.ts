export interface Player {
    id: string;
    name: string;
    avatar?: string;
    // Allows persisting player stats across games if needed later
}

export interface Score {
    playerId: string;
    points: number;
}

export interface Round {
    id: string;
    roundNumber: number;
    scores: Score[];
    timestamp: number;
}

export type GameType = 'rummy' | 'continental';

export interface Game {
    id: string;
    createdAt: number;
    endedAt?: number;
    status: 'active' | 'completed';
    type: GameType;
    players: Player[];
    rounds: Round[];
    hostId: string;
}

export interface AppData {
    history: Game[];
    preferences: {
        theme: 'light' | 'dark';
    };
}
