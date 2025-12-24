import React, { useRef } from 'react';
import { Download, Upload, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import type { Game } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryViewProps {
    history: Game[];
    onImport: (json: string) => boolean;
    onExport: () => void;
    onDeleteGame: (id: string) => void;
    onSelectGame: (game: Game) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onImport, onExport, onDeleteGame, onSelectGame }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const success = onImport(content);
                if (success) alert('History imported successfully!');
                else alert('Invalid file format.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">{t.history_title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onExport}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        title={t.history_export_btn}
                    >
                        <Download size={18} /> <span className="hidden sm:inline">{t.history_export_btn}</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        title={t.history_import_btn}
                    >
                        <Upload size={18} /> <span className="hidden sm:inline">{t.history_import_btn}</span>
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

            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400">{t.history_empty}</p>
                    </div>
                ) : (
                    history.map(game => (
                        <div
                            key={game.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => onSelectGame(game)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${game.type === 'continental' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {game.type}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(game.createdAt).toLocaleDateString()}
                                    </span>
                                    {game.endedAt && (
                                        <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono">
                                            ⏱️ {Math.round((game.endedAt - game.createdAt) / 1000 / 60)}m
                                        </span>
                                    )}
                                </div>
                                <div className="font-medium text-slate-700">
                                    {game.players.map(p => p.name).join(', ')}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(t.confirm_delete)) {
                                            onDeleteGame(game.id);
                                        }
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Game"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="text-slate-300">
                                    <ChevronRight />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
