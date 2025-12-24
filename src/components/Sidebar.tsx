import React, { useRef } from 'react';
import { Home, Clock, Download, Upload, BarChart2, Info } from 'lucide-react';
import type { GameType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
    onNavigate: (view: 'home' | 'history' | 'stats' | 'about') => void;
    onStartGame?: (type: GameType) => void;
    onImport: (json: string) => boolean;
    onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onStartGame, onImport, onExport }) => {
    const { t, setLanguage, language } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const success = onImport(content);
                if (success) alert('Data imported successfully!');
                else alert('Invalid file format.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="w-full h-full flex flex-col bg-white border-l border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <img src="/turix_logo.jpg" alt="El Turix" className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
                <div>
                    <h1 className="font-bold text-lg text-slate-800 leading-tight">El Turix</h1>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scoreboard</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {/* Menu Section */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Menu</h3>

                    <div className="space-y-1">
                        <button
                            onClick={() => onNavigate('home')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium text-left"
                        >
                            <Home size={18} /> {t.menu_new_game}
                        </button>
                        {/* Submenu for New Game types (just shortcuts) */}
                        <div className="pl-9 space-y-1">
                            <button
                                onClick={() => { onNavigate('home'); onStartGame && onStartGame('rummy'); }}
                                className="w-full text-left text-sm text-slate-500 hover:text-blue-600 transition-colors py-1 flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Rummy
                            </button>
                            <button
                                onClick={() => { onNavigate('home'); onStartGame && onStartGame('continental'); }}
                                className="w-full text-left text-sm text-slate-500 hover:text-indigo-600 transition-colors py-1 flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Continental
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate('history')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium text-left"
                    >
                        <Clock size={18} /> {t.menu_history}
                    </button>
                    <button
                        onClick={() => onNavigate('stats')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium text-left"
                    >
                        <BarChart2 size={18} /> {t.menu_stats}
                    </button>
                    <button
                        onClick={() => onNavigate('about')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium text-left"
                    >
                        <Info size={18} /> {t.menu_about}
                    </button>
                </div>

                {/* Data Section */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">{t.menu_data}</h3>
                    <button
                        onClick={onExport}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium text-left text-sm"
                    >
                        <Download size={18} /> {t.menu_export}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium text-left text-sm"
                    >
                        <Upload size={18} /> {t.menu_import}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex flex-col items-center gap-3">
                <div className="flex gap-4">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`text-2xl hover:scale-110 transition-transform ${language === 'en' ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'}`}
                        title="English"
                    >
                        🇺🇸
                    </button>
                    <button
                        onClick={() => setLanguage('es')}
                        className={`text-2xl hover:scale-110 transition-transform ${language === 'es' ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'}`}
                        title="Español"
                    >
                        🇪🇸
                    </button>
                </div>
                <p className="text-xs text-slate-400">El Turix v1.4.0</p>
            </div>
        </div>
    );
};
