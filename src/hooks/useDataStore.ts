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
        return stored ? JSON.parse(stored) : { history: [], preferences: { theme: 'light' } };
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

                if (userDoc.exists()) {
                    const cloudData = userDoc.data();
                    const cloudHistory = (cloudData.history || []) as Game[];

                    // Merge: Add games from cloud that don't exist locally
                    // Note: This is a simple merge. Complex conflict resolution is skipped for simplicity.
                    const localIds = new Set(data.history.map(g => g.id));
                    const newFromCloud = cloudHistory.filter(g => !localIds.has(g.id));

                    if (newFromCloud.length > 0) {
                        mergedHistory = [...mergedHistory, ...newFromCloud];
                        // Sort by createdAt descending
                        mergedHistory.sort((a, b) => b.createdAt - a.createdAt);

                        // Update local state with merged data
                        setData(prev => ({ ...prev, history: mergedHistory }));
                    }
                }

                // Always push the merged latest state back to cloud to ensure consistency
                // Limit to last 200 games
                const historyToSave = mergedHistory.slice(0, 200);

                await setDoc(userDocRef, {
                    history: historyToSave,
                    preferences: data.preferences,
                    lastUpdated: serverTimestamp(),
                    email: currentUser.email // Helpful for debugging, safe if rules allow
                }, { merge: true });

            } catch (error) {
                console.error("Cloud Sync Error:", error);
            }
        };

        syncWithCloud();
    }, [currentUser]); // Sync runs once when user changes (logs in)

    // Helper to push changes to cloud immediately if logged in
    const pushToCloud = useCallback(async (newData: AppData) => {
        if (!currentUser) return;
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, {
                history: newData.history.slice(0, 200),
                preferences: newData.preferences,
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Failed to push to cloud", e);
        }
    }, [currentUser]);

    const saveGame = (game: Game) => {
        setData(prev => {
            const exists = prev.history.find(g => g.id === game.id);
            let newHistory;
            if (exists) {
                newHistory = prev.history.map(g => g.id === game.id ? game : g);
            } else {
                newHistory = [game, ...prev.history];
            }
            const newData = { ...prev, history: newHistory };

            // Trigger cloud save
            pushToCloud(newData);

            return newData;
        });
    };

    const deleteGame = (gameId: string) => {
        setData(prev => {
            const newData = {
                ...prev,
                history: prev.history.filter(g => g.id !== gameId)
            };
            pushToCloud(newData);
            return newData;
        });
    };

    const importData = (jsonData: string): boolean => {
        try {
            const parsed = JSON.parse(jsonData);
            if (Array.isArray(parsed.history)) {
                setData(parsed);
                pushToCloud(parsed);
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

    return { data, saveGame, deleteGame, importData, exportData };
}
