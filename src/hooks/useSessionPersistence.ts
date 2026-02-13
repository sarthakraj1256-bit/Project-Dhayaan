import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dhyaan_active_session';

interface PersistedSession {
  frequency: number;
  frequencyName: string;
  frequencyCategory: string;
  atmosphere: string;
  startedAt: number; // epoch ms
}

/**
 * Persists the active Sonic Lab session to localStorage so it survives reloads.
 */
export function useSessionPersistence() {
  const persist = useCallback(
    (frequency: number, name: string, category: string, atmosphere: string) => {
      const session: PersistedSession = {
        frequency,
        frequencyName: name,
        frequencyCategory: category,
        atmosphere,
        startedAt: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch {}
    },
    []
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const restore = useCallback((): PersistedSession | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session: PersistedSession = JSON.parse(raw);
      // Only restore sessions less than 2 hours old
      if (Date.now() - session.startedAt > 2 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }, []);

  return { persist, clear, restore };
}
