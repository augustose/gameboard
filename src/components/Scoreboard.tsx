import React, { useState } from 'react';
import { Trophy, History, Edit2, Check } from 'lucide-react';
import type { Game, Score } from '../types';
import { InlineRoundInput } from './InlineRoundInput';
import { useLanguage } from '../contexts/LanguageContext';

interface ScoreboardProps {
    game: Game;
    onAddRound: (scores: Score[]) => void;
    onUpdatePlayerName: (playerId: string, newName: string) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ game, onAddRound, onUpdatePlayerName }) => {
    const { t } = useLanguage();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Calculate totals
    const playerTotals: Record<string, number> = {};
    game.players.forEach(p => {
        playerTotals[p.id] = game.rounds.reduce((sum, round) => {
            const score = round.scores.find(s => s.playerId === p.id);
            return sum + (score?.points || 0);
        }, 0);
    });

    const leaderId = Object.keys(playerTotals).reduce((a, b) => playerTotals[a] < playerTotals[b] ? a : b, game.players[0]?.id);

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const saveName = (id: string) => {
        if (editName.trim()) {
            onUpdatePlayerName(id, editName.trim());
        }
        setEditingId(null);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Game Info */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-xs ${game.type === 'continental' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {game.type}
                    </span>
                    <span>•</span>
                    <span>{new Date(game.createdAt).toLocaleDateString()} {new Date(game.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Header / Totals */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {game.players.map(player => (
                    <div
                        key={player.id}
                        className={`relative p-4 rounded-xl border-2 transition-all group ${player.id === leaderId
                            ? 'bg-white border-yellow-400 shadow-yellow-100 shadow-lg'
                            : 'bg-white border-transparent shadow-sm hover:border-blue-100'
                            }`}
                    >
                        {player.id === leaderId && (
                            <div className="absolute -top-3 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-sm z-10">
                                <Trophy size={14} fill="currentColor" />
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-1">
                            {editingId === player.id ? (
                                <div className="flex items-center gap-1 w-full">
                                    <input
                                        autoFocus
                                        className="w-full text-sm border-b border-blue-500 outline-none p-0 bg-transparent"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && saveName(player.id)}
                                        onBlur={() => saveName(player.id)}
                                    />
                                    <button onClick={() => saveName(player.id)} className="text-green-600"><Check size={14} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-sm text-slate-500 font-medium truncate cursor-pointer" onClick={() => startEditing(player.id, player.name)} title={player.name}>{player.name}</span>
                                    <button
                                        onClick={() => startEditing(player.id, player.name)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 transition-opacity"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-3xl font-bold text-slate-800">
                            {playerTotals[player.id] || 0}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rounds Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        <h3 className="font-semibold text-slate-700">{t.rounds_title}</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-4 py-3 text-left font-medium text-slate-500 w-12 text-center">#</th>
                                {game.players.map(p => (
                                    <th key={p.id} className="px-4 py-3 text-right font-medium text-slate-500 min-w-[80px]">
                                        {p.name}
                                    </th>
                                ))}
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {game.rounds.map((round) => (
                                <tr key={round.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 font-medium text-center">
                                        {round.roundNumber}
                                    </td>
                                    {game.players.map(p => {
                                        const score = round.scores.find(s => s.playerId === p.id);
                                        return (
                                            <td key={p.id} className="px-4 py-3 text-right font-mono text-slate-700">
                                                {score?.points ?? '-'}
                                            </td>
                                        );
                                    })}
                                    <td></td>
                                </tr>
                            ))}
                            <InlineRoundInput
                                players={game.players}
                                roundNumber={game.rounds.length + 1}
                                onSave={onAddRound}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
