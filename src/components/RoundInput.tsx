import React, { useState } from 'react';
import type { Player, Score } from '../types';

interface RoundInputProps {
    players: Player[];
    roundNumber: number;
    onSave: (scores: Score[]) => void;
    onCancel: () => void;
}

export const RoundInput: React.FC<RoundInputProps> = ({ players, roundNumber, onSave, onCancel }) => {
    const [scores, setScores] = useState<Record<string, string>>({});

    const handleScoreChange = (playerId: string, value: string) => {
        // Allow empty or numbers only (and minus sign)
        if (value === '' || /^-?\d*$/.test(value)) {
            setScores(prev => ({ ...prev, [playerId]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedScores: Score[] = players.map(p => ({
            playerId: p.id,
            points: parseInt(scores[p.id] || '0', 10)
        }));
        onSave(formattedScores);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Round {roundNumber}</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {players.map(player => (
                        <div key={player.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                            <label htmlFor={`score-${player.id}`} className="font-medium text-slate-700">
                                {player.name}
                            </label>
                            <input
                                id={`score-${player.id}`}
                                type="tel" // 'tel' brings up numeric keypad on mobile
                                inputMode="numeric"
                                pattern="[0-9-]*"
                                placeholder="0"
                                value={scores[player.id] || ''}
                                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                                className="w-24 text-right bg-transparent outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300"
                                autoComplete="off"
                            />
                        </div>
                    ))}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            Save Round
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
