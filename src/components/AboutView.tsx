import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AboutView: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center space-y-4">
                <img src="/turix_logo.jpg" alt="El Turix" className="w-64 h-64 rounded-full object-cover mx-auto shadow-lg border-4 border-white mb-4" />
                <h1 className="text-3xl font-bold text-slate-900">El Turix Scoreboard</h1>
                <p className="text-slate-500 text-lg">Your companion for Rummy & Continental nights.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Info className="text-blue-500" /> {t.about_title}
                </h3>
                <p className="text-slate-600 mt-2">
                    {t.about_intro}
                </p>

                <h4 className="font-bold text-slate-700 mt-6 mb-2">{t.about_features}</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>{t.about_feature_1}</li>
                    <li>{t.about_feature_2}</li>
                    <li>{t.about_feature_3}</li>
                    <li>{t.about_feature_4}</li>
                    <li>{t.about_feature_5}</li>
                </ul>

                <h4 className="font-bold text-slate-700 mt-6 mb-2">{t.about_meaning_title}</h4>
                <p className="text-slate-600">
                    {t.about_meaning_text}
                </p>
                <h4 className="font-bold text-slate-700 mt-6 mb-2">{t.about_credits}</h4>
                <p className="text-slate-600">
                    <strong>{t.about_dev}:</strong> Augusto Sosa<br />
                    <strong>{t.about_design}:</strong> Turix Classic Style
                </p>
                <h4 className="font-bold text-slate-700 mt-6 mb-2">{t.about_opensource}</h4>
                <p className="text-slate-600">
                    {t.about_opensource_text}
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
                {t.about_footer}
            </div>
        </div>
    );
};
