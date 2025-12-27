import React, { useState } from 'react';
import type { Player, Score } from '../types';
import { Save } from 'lucide-react'; // Import icons

interface InlineRoundInputProps {
    players: Player[];
    roundNumber: number;
    onSave: (scores: Score[]) => void;
}

export const InlineRoundInput: React.FC<InlineRoundInputProps> = ({ players, roundNumber, onSave }) => {
    const [scores, setScores] = useState<Record<string, string>>({});

    const handleScoreChange = (playerId: string, value: string) => {
        // Allow empty or numbers only (and minus sign)
        if (value === '' || /^-?\d*$/.test(value)) {
            setScores(prev => ({ ...prev, [playerId]: value }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, playerId: string) => {
        if (e.key === 'Enter') {
            const currentIndex = players.findIndex(p => p.id === playerId);
            const nextPlayer = players[currentIndex + 1];
            if (nextPlayer) {
                const nextInput = document.getElementById(`inline-score-${nextPlayer.id}`);
                nextInput?.focus();
            } else {
                // If last player, maybe submit? Or focus button?
                // Let's keep it manual submit for safety
            }
        }
    };

    const handleSubmit = () => {
        // Ensure all fields have a value (using 0 as default if empty is fine, or validation)
        // Let's assume empty = 0
        const formattedScores: Score[] = players.map(p => {
            const val = scores[p.id];
            const parsed = parseInt(val || '0', 10);
            return {
                playerId: p.id,
                points: isNaN(parsed) ? 0 : parsed
            };
        });
        onSave(formattedScores);
        setScores({}); // Reset for next round if this component persists, though usually it will unmount/remount
    };

    const isFilled = players.some(p => scores[p.id] && scores[p.id] !== '');

    return (
        <tr className="bg-blue-50 border-t-2 border-blue-100 transition-colors sticky bottom-0 z-20 shadow-[-2px_-2px_10px_rgba(0,0,0,0.05)]">
            <td className="px-4 py-3 font-bold text-blue-600 align-middle">
                {roundNumber}
            </td>
            {players.map(p => (
                <td key={p.id} className="px-2 py-2">
                    <input
                        id={`inline-score-${p.id}`}
                        type="text"
                        inputMode="text"
                        pattern="^-?[0-9]*$"
                        placeholder="0"
                        value={scores[p.id] || ''}
                        onChange={(e) => handleScoreChange(p.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, p.id)}
                        className="w-full text-right bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 font-mono text-slate-800 shadow-sm placeholder:text-slate-300"
                    />
                </td>
            ))}
            <td className="px-2 py-2 w-10">
                <button
                    onClick={handleSubmit}
                    disabled={!isFilled}
                    className={`p-2 rounded-lg transition-all flex items-center justify-center shadow-sm ${isFilled
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    title="Save Round"
                >
                    <Save size={20} />
                </button>
            </td>
        </tr>
    );
};
