import React from 'react';
import type { Game } from '../types';
import { BarChart, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    history: Game[];
}

export const StatsView: React.FC<StatsViewProps> = ({ history }) => {
    const { t } = useLanguage();
    const totalGames = history.length;

    // Aggregate stats per player
    interface PlayerStat {
        wins: number;
        gamesPlayed: number;
        rummyWins: number;
        continentalWins: number;
        rummyPlayed: number;
        continentalPlayed: number;
    }

    const playerStats: Record<string, PlayerStat> = {};

    history.forEach(game => {
        // Calculate totals for this game
        const gameTotals = game.players.map(p => {
            const points = game.rounds.reduce((sum, r) => sum + (r.scores.find(s => s.playerId === p.id)?.points || 0), 0);
            return { id: p.id, name: p.name, points };
        }).sort((a, b) => a.points - b.points);

        if (gameTotals.length > 0) {
            const winner = gameTotals[0];

            game.players.forEach(p => {
                if (!playerStats[p.name]) {
                    playerStats[p.name] = {
                        wins: 0,
                        gamesPlayed: 0,
                        rummyWins: 0,
                        continentalWins: 0,
                        rummyPlayed: 0,
                        continentalPlayed: 0
                    };
                }
                playerStats[p.name].gamesPlayed += 1;
                if (game.type === 'rummy') playerStats[p.name].rummyPlayed += 1;
                else playerStats[p.name].continentalPlayed += 1;
            });

            if (playerStats[winner.name]) {
                playerStats[winner.name].wins += 1;
                if (game.type === 'rummy') playerStats[winner.name].rummyWins += 1;
                else playerStats[winner.name].continentalWins += 1;
            }
        }
    });

    const sortedPlayers = Object.entries(playerStats)
        .sort(([, a], [, b]) => b.wins - a.wins)
        .slice(0, 10);

    const maxWins = Math.max(...sortedPlayers.map(([, s]) => s.wins), 1);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart className="text-blue-600" /> {t.stats_title}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t.stats_total_games}</div>
                    <div className="text-3xl font-bold text-slate-800">{totalGames}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-2 sm:col-span-1">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t.stats_top_player}</div>
                    <div className="text-xl font-bold text-blue-600 truncate">{sortedPlayers[0]?.[0] || '-'}</div>
                    <div className="text-xs text-slate-400 mt-1">{sortedPlayers[0]?.[1].wins || 0} wins</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100 hidden lg:block">
                    <div className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">{t.stats_rummy_games}</div>
                    <div className="text-3xl font-bold text-blue-800">{history.filter(g => g.type === 'rummy').length}</div>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 hidden lg:block">
                    <div className="text-indigo-500 text-xs font-bold uppercase tracking-wider mb-1">{t.stats_continental_games}</div>
                    <div className="text-3xl font-bold text-indigo-800">{history.filter(g => g.type === 'continental').length}</div>
                </div>
            </div>

            {/* Visual Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" /> {t.stats_win_distribution}
                </h3>

                <div className="space-y-4">
                    {sortedPlayers.map(([name, stats]) => (
                        <div key={name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">{name}</span>
                                <span className="text-slate-500 font-medium">{stats.wins} wins</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                                {/* Rummy Wins Bar */}
                                {stats.rummyWins > 0 && (
                                    <div
                                        className="h-full bg-blue-500 hover:bg-blue-600 transition-colors"
                                        style={{ width: `${(stats.rummyWins / maxWins) * 100}%` }}
                                        title={`Rummy Wins: ${stats.rummyWins}`}
                                    />
                                )}
                                {/* Continental Wins Bar */}
                                {stats.continentalWins > 0 && (
                                    <div
                                        className="h-full bg-indigo-500 hover:bg-indigo-600 transition-colors"
                                        style={{ width: `${(stats.continentalWins / maxWins) * 100}%` }}
                                        title={`Continental Wins: ${stats.continentalWins}`}
                                    />
                                )}
                            </div>
                            <div className="flex justify-start gap-4 text-[10px] text-slate-400">
                                {stats.rummyWins > 0 && <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{stats.rummyWins} Rummy</span>}
                                {stats.continentalWins > 0 && <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>{stats.continentalWins} Continental</span>}
                            </div>
                        </div>
                    ))}
                    {sortedPlayers.length === 0 && (
                        <p className="text-center text-slate-400 py-8">{t.stats_play_more}</p>
                    )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div> Rummy
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded"></div> Continental
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">{t.th_player}</th>
                            <th className="px-4 py-3 text-center">{t.th_games}</th>
                            <th className="px-4 py-3 text-center font-bold text-slate-700">{t.th_wins}</th>
                            <th className="px-4 py-3 text-center text-blue-600">{t.th_rum_wins}</th>
                            <th className="px-4 py-3 text-center text-indigo-600">{t.th_con_wins}</th>
                            <th className="px-4 py-3 text-right">{t.th_win_rate}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedPlayers.map(([name, stats]) => (
                            <tr key={name} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-700">{name}</td>
                                <td className="px-4 py-3 text-center text-slate-500">{stats.gamesPlayed}</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-800">{stats.wins}</td>
                                <td className="px-4 py-3 text-center text-blue-600 bg-blue-50/50">{stats.rummyWins}</td>
                                <td className="px-4 py-3 text-center text-indigo-600 bg-indigo-50/50">{stats.continentalWins}</td>
                                <td className="px-4 py-3 text-right text-slate-500">
                                    {Math.round((stats.wins / stats.gamesPlayed) * 100)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
