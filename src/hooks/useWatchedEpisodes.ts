import { useState, useCallback } from 'react';

const STORAGE_KEY = 'watched-cartoons';

function getWatched(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persist(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function useWatchedEpisodes() {
  const [watched, setWatched] = useState<Set<string>>(getWatched);

  const toggleWatched = useCallback((id: string) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const markWatched = useCallback((id: string) => {
    setWatched((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const isWatched = useCallback((id: string) => watched.has(id), [watched]);

  const watchedCount = watched.size;

  return { isWatched, toggleWatched, markWatched, watchedCount };
}
