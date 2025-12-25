import React, { useState } from 'react';
import { Plus, X, Users, PlayCircle, Dna } from 'lucide-react';
import type { Player, GameType } from '../types';
import { generateId } from '../utils/uuid';

interface GameSetupProps {
    onStartGame: (players: Player[], type: GameType) => void;
    initialPlayers?: Player[]; // For "Rematch" functionality
    initialGameType?: GameType;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, initialPlayers, initialGameType }) => {
    const [gameType, setGameType] = useState<GameType>(initialGameType || 'rummy');
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

    const addPlayer = () => {
        setPlayers([...players, { id: generateId(), name: '' }]);
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
        const validPlayers = players.filter(p => p.name.trim() !== '');
        if (validPlayers.length >= 2) {
            onStartGame(validPlayers, gameType);
        }
    };

    const isValid = players.filter(p => p.name.trim() !== '').length >= 2;
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
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setGameType('rummy')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${gameType === 'rummy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Rummy
                        </button>
                        <button
                            type="button"
                            onClick={() => setGameType('continental')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${gameType === 'continental' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Continental
                        </button>
                    </div>
                </div>

                {/* Players List */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Users size={16} /> Players
                    </label>
                    {players.map((player, index) => (
                        <div key={player.id} className="flex gap-2">
                            <input
                                type="text"
                                placeholder={`Player ${index + 1}`}
                                value={player.name}
                                onChange={(e) => updateName(player.id, e.target.value)}
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
            </form>
        </div>
    );
};
