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
                <h4 className="font-bold text-slate-700 mt-6 mb-2">Open Source</h4>
                <p className="text-slate-600">
                    This project is open source. You can view the code, report issues, or contribute on GitHub:
                </p>
                <a
                    href="https://github.com/augustose/gameboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                    <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    github.com/augustose/gameboard
                </a>
            </div>

            <div className="text-center text-slate-400 text-sm">
                Made with ❤️ for Game Night
            </div>
        </div>
    );
};
