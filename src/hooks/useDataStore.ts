import { useState, useEffect, useCallback } from 'react';
import type { Game, AppData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'rummy_scorekeeper_data';

export function useDataStore() {
    const { currentUser } = useAuth();
    const [data, setData] = useState<AppData>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                history: parsed.history || [],
                activeGame: parsed.activeGame || null,
                preferences: parsed.preferences || { theme: 'light' }
            };
        }
        return { history: [], activeGame: null, preferences: { theme: 'light' } };
    });

    // 1. Persist to LocalStorage whenever data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    // 2. Sync with Firestore when User logs in
    useEffect(() => {
        if (!currentUser) return;

        const syncWithCloud = async () => {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                let mergedHistory: Game[] = [...data.history];
                let mergedActiveGame: Game | null = data.activeGame || null;

                if (userDoc.exists()) {
                    const cloudData = userDoc.data();
                    const cloudHistory = (cloudData.history || []) as Game[];
                    const cloudActiveGame = cloudData.activeGame as Game | null;

                    // Merge history: Add games from cloud that don't exist locally
                    const localIds = new Set(data.history.map(g => g.id));
                    const newFromCloud = cloudHistory.filter(g => !localIds.has(g.id));

                    if (newFromCloud.length > 0) {
                        mergedHistory = [...mergedHistory, ...newFromCloud];
                        mergedHistory.sort((a, b) => b.createdAt - a.createdAt);
                    }

                    // Merge Active Game: Take the one with the latest updatedAt
                    if (cloudActiveGame) {
                        if (!mergedActiveGame || (cloudActiveGame.updatedAt || 0) > (mergedActiveGame.updatedAt || 0)) {
                            mergedActiveGame = cloudActiveGame;
                        }
                    }

                    // Update local state
                    setData(prev => ({
                        ...prev,
                        history: mergedHistory,
                        activeGame: mergedActiveGame
                    }));
                }

                // Always push back the final state to cloud
                const historyToSave = mergedHistory.slice(0, 200);

                await setDoc(userDocRef, {
                    history: historyToSave,
                    activeGame: mergedActiveGame,
                    preferences: data.preferences,
                    lastUpdated: serverTimestamp(),
                    email: currentUser.email
                }, { merge: true });

            } catch (error) {
                console.error("Cloud Sync Error:", error);
            }
        };

        syncWithCloud();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]); // Sync runs once when user changes (logs in)

    // 3. Sync with Firestore whenever data changes (debounced)
    useEffect(() => {
        if (!currentUser) return;

        const timer = setTimeout(async () => {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                await setDoc(userDocRef, {
                    history: data.history.slice(0, 200),
                    activeGame: data.activeGame || null,
                    preferences: data.preferences,
                    lastUpdated: serverTimestamp()
                }, { merge: true });
            } catch (e) {
                console.error("Failed to sync to cloud", e);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [data, currentUser]);

    const saveGame = useCallback((game: Game) => {
        setData(prev => {
            const exists = prev.history.find(g => g.id === game.id);
            let newHistory;
            if (exists) {
                newHistory = prev.history.map(g => g.id === game.id ? game : g);
            } else {
                newHistory = [game, ...prev.history];
            }
            return { ...prev, history: newHistory };
        });
    }, []);

    const deleteGame = useCallback((gameId: string) => {
        setData(prev => ({
            ...prev,
            history: prev.history.filter(g => g.id !== gameId)
        }));
    }, []);

    const importData = useCallback((jsonData: string): boolean => {
        try {
            const parsed = JSON.parse(jsonData);
            if (Array.isArray(parsed.history)) {
                setData(parsed);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Invalid JSON", e);
            return false;
        }
    }, []);

    const exportData = useCallback(() => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rummy-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [data]);

    const setActiveGame = useCallback((game: Game | null) => {
        setData(prev => ({ ...prev, activeGame: game }));
    }, []);

    return { data, saveGame, deleteGame, importData, exportData, setActiveGame };
}
