import React, { useState } from 'react';
import { Plus, X, Users, PlayCircle, Dna } from 'lucide-react';
import type { Player, GameType, TrucoConfig, TrucoMarkerStyle } from '../types';
import { generateId } from '../utils/uuid';
import { useLanguage } from '../contexts/LanguageContext';

interface GameSetupProps {
    onStartGame: (players: Player[], type: GameType, config?: TrucoConfig) => void;
    initialPlayers?: Player[]; // For "Rematch" functionality
    initialGameType?: GameType;
    historicalPlayers?: string[];
}

// Truco member input: up to 3 optional members per team, added via Enter, removable as chips.
// The input is always rendered; once at 3 members, add is a silent no-op.
const MemberInput: React.FC<{ teamLabel: string; members: string[]; setMembers: (m: string[]) => void; testid: string; }> = ({ teamLabel, members, setMembers, testid }) => {
    const { t } = useLanguage();
    const [value, setValue] = useState('');
    const add = () => {
        const v = value.trim();
        if (v && members.length < 3) { setMembers([...members, v]); setValue(''); }
    };
    return (
        <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-600">{teamLabel}</div>
            <div className="flex flex-wrap gap-1">
                {members.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 rounded-full text-xs flex items-center gap-1">
                        {m}
                        <button type="button" aria-label={`${t.truco_member_remove} ${m}`} onClick={() => setMembers(members.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">×</button>
                    </span>
                ))}
            </div>
            <input
                data-testid={testid}
                aria-label={teamLabel}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                placeholder={t.truco_member_placeholder}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>
    );
};

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, initialPlayers, initialGameType, historicalPlayers = [] }) => {
    const { t } = useLanguage();
    const [gameType, setGameType] = useState<GameType>(initialGameType || 'rummy');

    // Truco setup state
    const [target, setTarget] = useState<15 | 30>(30);
    const [markerStyle, setMarkerStyle] = useState<TrucoMarkerStyle>('square');
    const [usMembers, setUsMembers] = useState<string[]>([]);
    const [themMembers, setThemMembers] = useState<string[]>([]);
    const [players, setPlayers] = useState<Player[]>(
        initialPlayers || [
            { id: '1', name: '' },
            { id: '2', name: '' }
        ]);

    // Update gameType when prop changes
    React.useEffect(() => {
        if (initialGameType) {
            setGameType(initialGameType);
        }
    }, [initialGameType]);

    // When set, an effect focuses the matching player input after the next
    // render (used when Enter adds a brand-new player row).
    const [focusPlayerId, setFocusPlayerId] = useState<string | null>(null);

    React.useEffect(() => {
        if (focusPlayerId) {
            document.getElementById(`player-input-${focusPlayerId}`)?.focus();
            setFocusPlayerId(null);
        }
    }, [players, focusPlayerId]);

    const addPlayer = () => {
        setPlayers([...players, { id: generateId(), name: '' }]);
    };

    // Enter moves to the next player's name input; on the last row it creates a
    // new player and focuses it so names can be entered one after another.
    const handleNameKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key !== 'Enter') return;
        e.preventDefault(); // don't submit the form while chaining through names
        const nextPlayer = players[index + 1];
        if (nextPlayer) {
            document.getElementById(`player-input-${nextPlayer.id}`)?.focus();
        } else {
            const newPlayer = { id: generateId(), name: '' };
            setPlayers([...players, newPlayer]);
            setFocusPlayerId(newPlayer.id);
        }
    };

    const removePlayer = (id: string) => {
        if (players.length > 2) {
            setPlayers(players.filter(p => p.id !== id));
        }
    };

    const updateName = (id: string, name: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameType === 'truco') {
            const players: Player[] = [
                { id: generateId(), name: 'Nosotros', members: usMembers.slice(0, 3) },
                { id: generateId(), name: 'Ellos', members: themMembers.slice(0, 3) },
            ];
            onStartGame(players, 'truco', { targetPoints: target, markerStyle });
            return;
        }
        const validPlayers = players.filter(p => p.name.trim() !== '');
        if (validPlayers.length >= 2) {
            onStartGame(validPlayers, gameType);
        }
    };

    const isValid = gameType === 'truco' ? true : players.filter(p => p.name.trim() !== '').length >= 2;
    // console.log("Form isValid:", isValid);

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <PlayCircle size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">New Game</h2>
                    <p className="text-sm text-slate-500">Setup your match</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Game Type Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Dna size={16} /> Game Variant
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            aria-pressed={gameType === 'rummy'}
                            onClick={() => setGameType('rummy')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${gameType === 'rummy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Rummy
                        </button>
                        <button
                            type="button"
                            aria-pressed={gameType === 'continental'}
                            onClick={() => setGameType('continental')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${gameType === 'continental' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Continental
                        </button>
                        <button
                            type="button"
                            aria-pressed={gameType === 'truco'}
                            onClick={() => setGameType('truco')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${gameType === 'truco' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t.game_truco}
                        </button>
                    </div>
                </div>

                {gameType === 'truco' ? (
                    /* Truco Setup */
                    <div className="space-y-4">
                        {/* Target */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t.truco_target}</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                                <button
                                    type="button"
                                    data-testid="truco-target-15"
                                    aria-pressed={target === 15}
                                    onClick={() => setTarget(15)}
                                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${target === 15 ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    15
                                </button>
                                <button
                                    type="button"
                                    data-testid="truco-target-30"
                                    aria-pressed={target === 30}
                                    onClick={() => setTarget(30)}
                                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${target === 30 ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    30
                                </button>
                            </div>
                        </div>

                        {/* Marker style */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t.truco_style}</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                                <button
                                    type="button"
                                    data-testid="truco-style-square"
                                    aria-pressed={markerStyle === 'square'}
                                    onClick={() => setMarkerStyle('square')}
                                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${markerStyle === 'square' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {t.truco_style_square}
                                </button>
                                <button
                                    type="button"
                                    data-testid="truco-style-cup"
                                    aria-pressed={markerStyle === 'cup'}
                                    onClick={() => setMarkerStyle('cup')}
                                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${markerStyle === 'cup' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {t.truco_style_cup}
                                </button>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Users size={16} /> {t.truco_members}
                            </label>
                            <MemberInput teamLabel="Nosotros" members={usMembers} setMembers={setUsMembers} testid="truco-members-us" />
                            <MemberInput teamLabel="Ellos" members={themMembers} setMembers={setThemMembers} testid="truco-members-them" />
                        </div>
                    </div>
                ) : (
                <>
                {/* Players List */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Users size={16} /> Players
                    </label>
                    {players.map((player, index) => (
                        <div key={player.id} className="flex gap-2">
                            <input
                                id={`player-input-${player.id}`}
                                type="text"
                                list="historical-players"
                                placeholder={`Player ${index + 1}`}
                                value={player.name}
                                onChange={(e) => updateName(player.id, e.target.value)}
                                onKeyDown={(e) => handleNameKeyDown(e, index)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                autoFocus={index === 0 && !initialPlayers}
                            />
                            {players.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removePlayer(player.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addPlayer}
                    className="w-full py-2 flex items-center justify-center gap-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 transition-colors"
                >
                    <Plus size={18} />
                    Add Player
                </button>
                </>
                )}

                <datalist id="historical-players">
                    {historicalPlayers.map(name => (
                        <option key={name} value={name} />
                    ))}
                </datalist>

                <button
                    type="submit"
                    disabled={!isValid}
                    className={`w-full py-3 mt-6 font-bold text-white rounded-lg shadow-lg transition-all transform active:scale-95 ${isValid
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200'
                        : 'bg-slate-300 cursor-not-allowed shadow-none'
                        }`}
                >
                    Start Game
                </button>
                {/* Spacer to allow scrolling past button on mobile */}
                <div className="h-24 sm:h-0"></div>
            </form>
        </div>
    );
};
