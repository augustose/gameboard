import React, { } from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import type { Game } from '../types';
import confetti from 'canvas-confetti';

interface PodiumViewProps {
    game: Game;
    onRematch: () => void;
    onHome: () => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({ game, onRematch, onHome }) => {
    // Trigger confetti on mount
    React.useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const playerTotals = game.players.map(p => ({
        ...p,
        total: game.rounds.reduce((sum, r) => sum + (r.scores.find(s => s.playerId === p.id)?.points || 0), 0)
    })).sort((a, b) => a.total - b.total); // Ascending for Rummy (lowest wins)

    const [winner, second, third] = playerTotals;

    return (
        <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-50 duration-500">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">Game Completed!</h2>
                <div className="text-slate-500 flex items-center justify-center gap-2 mt-2 text-sm">
                    <span className="capitalize font-medium text-slate-700">{game.type} Match</span>
                    <span>•</span>
                    <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                    {game.endedAt && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                ⏱️ {Math.round((game.endedAt - game.createdAt) / 1000 / 60)}m
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-end justify-center gap-4 mb-12 w-full max-w-lg px-4">
                {/* Second Place */}
                {second && (
                    <div className="flex flex-col items-center w-1/3">
                        <div className="mb-2 text-center">
                            <span className="block font-bold text-slate-700 truncate w-24 mx-auto">{second.name}</span>
                            <span className="text-sm font-mono text-slate-500">{second.total} pts</span>
                        </div>
                        <div className="w-full h-24 bg-slate-200 rounded-t-lg flex items-center justify-center text-2xl font-bold text-slate-400 shadow-inner">
                            2
                        </div>
                    </div>
                )}

                {/* Winner */}
                <div className="flex flex-col items-center w-1/3 z-10 -mx-2">
                    <div className="mb-2 text-center">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" fill="currentColor" />
                        <span className="block font-bold text-slate-800 text-lg truncate w-28 mx-auto">{winner.name}</span>
                        <span className="text-sm font-mono text-yellow-600 font-bold">{winner.total} pts</span>
                    </div>
                    <div className="w-full h-32 bg-yellow-400 rounded-t-xl flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-yellow-200">
                        1
                    </div>
                </div>

                {/* Third Place */}
                {third && (
                    <div className="flex flex-col items-center w-1/3">
                        <div className="mb-2 text-center">
                            <span className="block font-bold text-slate-700 truncate w-24 mx-auto">{third.name}</span>
                            <span className="text-sm font-mono text-slate-500">{third.total} pts</span>
                        </div>
                        <div className="w-full h-16 bg-orange-100 rounded-t-lg flex items-center justify-center text-xl font-bold text-orange-300 shadow-inner">
                            3
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col w-full max-w-xs gap-3">
                <button onClick={onRematch} className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors">
                    <RotateCcw /> Rematch
                </button>
                <button onClick={onHome} className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                    <Home /> Back to Home
                </button>
            </div>
        </div>
    );
};
