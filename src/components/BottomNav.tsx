import React from 'react';
import { Home, Clock, BarChart2, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
    currentView: 'home' | 'history' | 'stats' | 'about';
    onNavigate: (view: 'home' | 'history' | 'stats' | 'about') => void;
    onMenuOpen: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onMenuOpen }) => {
    const { t } = useLanguage();

    const NavItem = ({ view, icon: Icon, label, onClick }: { view?: string, icon: any, label: string, onClick: () => void }) => {
        const isActive = view === currentView;
        return (
            <button
                onClick={onClick}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-40 pb-[env(safe-area-inset-bottom)]">
            <NavItem
                view="home"
                icon={Home}
                label={t.menu_new_game}
                onClick={() => onNavigate('home')}
            />
            <NavItem
                view="history"
                icon={Clock}
                label={t.menu_history}
                onClick={() => onNavigate('history')}
            />
            <NavItem
                view="stats"
                icon={BarChart2}
                label={t.menu_stats}
                onClick={() => onNavigate('stats')}
            />
            <NavItem
                icon={Menu}
                label={t.menu_data} // Or "More"
                onClick={onMenuOpen}
            />
        </div>
    );
};
