import React from 'react';
import { Info } from 'lucide-react';

export const AboutView: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center space-y-4">
                <img src="/turix_logo.jpg" alt="El Turix" className="w-64 h-64 rounded-full object-cover mx-auto shadow-lg border-4 border-white mb-4" />
                <h1 className="text-3xl font-bold text-slate-900">El Turix Scoreboard</h1>
                <p className="text-slate-500 text-lg">Your companion for Rummy & Continental nights.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Info className="text-blue-500" /> About the App
                </h3>
                <p className="text-slate-600 mt-2">
                    This application was created by <strong>Augusto Sosa</strong> with passion and dedication. Designed to turn chaotic game nights into organized fun, "El Turix Scoreboard" offers a modern way to keep score for Classic Rummy and Continental games.
                </p>

                <h4 className="font-bold text-slate-700 mt-6 mb-2">Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Support for Standard Rummy and Continental variants.</li>
                    <li>Automatic score calculation and leader highlighting.</li>
                    <li>Persistent history of your past games.</li>
                    <li>Detailed statistics to settle who is truly the best.</li>
                    <li>Works offline and on mobile.</li>
                </ul>

                <h4 className="font-bold text-slate-700 mt-6 mb-2">Meaning of "Turix"</h4>
                <p className="text-slate-600">
                    "Turix" is the Mayan word for Dragonfly. In many cultures, dragonflies symbolize change, transformation, and adaptability—skills every good card player needs!
                </p>
                <h4 className="font-bold text-slate-700 mt-6 mb-2">Credits</h4>
                <p className="text-slate-600">
                    <strong>Developer:</strong> Augusto Sosa<br />
                    <strong>Design:</strong> Turix Classic Style
                </p>
            </div>

            <div className="text-center text-slate-400 text-sm">
                Made with ❤️ for Game Night
            </div>
        </div>
    );
};
