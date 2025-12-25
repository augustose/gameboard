import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to request and release a screen Wake Lock.
 * Useful for keeping the screen on during active gameplay.
 */
export function useWakeLock() {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                const lock = await navigator.wakeLock.request('screen');
                wakeLockRef.current = lock;
                console.log('Wake Lock acquired');

                lock.addEventListener('release', () => {
                    console.log('Wake Lock released');
                    wakeLockRef.current = null;
                });
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
            }
        } else {
            console.warn('Wake Lock API not supported in this browser.');
        }
    }, []);

    const releaseLock = useCallback(async () => {
        if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    }, []);

    // Re-acquire lock if page visibility changes (e.g. tab switch)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                await requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseLock(); // Cleanup on unmount
        };
    }, [requestLock, releaseLock]);

    return { requestLock, releaseLock };
}
