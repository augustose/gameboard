import { useState, useEffect } from 'react';
import type { Game, AppData } from '../types';

const STORAGE_KEY = 'rummy_scorekeeper_data';

export function useLocalStorage() {
    const [data, setData] = useState<AppData>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { history: [], preferences: { theme: 'light' } };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const saveGame = (game: Game) => {
        setData(prev => {
            // Update if exists, else add
            const exists = prev.history.find(g => g.id === game.id);
            let newHistory;
            if (exists) {
                newHistory = prev.history.map(g => g.id === game.id ? game : g);
            } else {
                newHistory = [game, ...prev.history];
            }
            return { ...prev, history: newHistory };
        });
    };

    const importData = (jsonData: string): boolean => {
        try {
            const parsed = JSON.parse(jsonData);
            // Basic validation
            if (Array.isArray(parsed.history)) {
                setData(parsed);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Invalid JSON", e);
            return false;
        }
    };

    const exportData = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rummy-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const deleteGame = (gameId: string) => {
        setData(prev => ({
            ...prev,
            history: prev.history.filter(g => g.id !== gameId)
        }));
    };

    return { data, saveGame, deleteGame, importData, exportData };
}
