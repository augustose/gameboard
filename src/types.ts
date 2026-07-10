export interface Player {
    id: string;
    name: string;
    avatar?: string;
    members?: string[];      // truco only: team members (traceability), max 3, not scored individually
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

export type GameType = 'rummy' | 'continental' | 'truco';

export type TrucoMarkerStyle = 'square' | 'cup';

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

export interface AppData {
    history: Game[];
    activeGame?: Game | null;
    preferences: {
        theme: 'light' | 'dark';
    };
}
