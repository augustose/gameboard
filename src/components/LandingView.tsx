import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingViewProps {
    onStart: () => void;
    onAbout: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onAbout }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in zoom-in duration-500 p-4">

            <div className="relative group cursor-pointer" onClick={onStart}>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                    src="/turix_logo.jpg"
                    alt="El Turix"
                    className="relative w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-white transform transition duration-500 group-hover:scale-105"
                />
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    El Turix
                    <span className="text-blue-600">.</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                    {t.about_intro?.split('.')[0] || "Scoreboard"}
                </p>
            </div>

            <div className="flex flex-col w-full max-w-xs gap-3 pt-6 relative z-10">
                <button
                    onClick={onStart}
                    className="w-full bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:bg-slate-800 hover:scale-[1.02] hover:shadow-xl transition-all flex items-center justify-center gap-2 group clickable"
                >
                    {t.menu_new_game || "Start Game"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={onAbout}
                    className="text-sm text-slate-400 hover:text-slate-600 font-medium py-2 flex items-center justify-center gap-1 transition-colors"
                >
                    <Info size={14} />
                    {t.menu_about || "About"}
                </button>
            </div>

            <div className="absolute bottom-4 text-xs text-slate-300 font-medium uppercase tracking-widest">
                v1.5.0 • Made with ❤️
            </div>
        </div>
    );
};
