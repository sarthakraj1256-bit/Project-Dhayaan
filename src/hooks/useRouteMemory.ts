import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_MEMORY_KEY = 'dhyaan_route_memory';
const SCROLL_MEMORY_KEY = 'dhyaan_scroll_memory';
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

// Routes we should NOT remember (auth, callbacks, etc.)
const EXCLUDED_ROUTES = ['/auth', '/auth/callback', '/admin'];

// Routes that need a "resume session?" prompt
export const RESUMABLE_ROUTES = ['/sonic-lab', '/lakshya'];

interface RouteMemory {
  path: string;
  timestamp: number;
}

/** Persists the current route + scroll position to localStorage on every nav change. */
export function useRouteMemory() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (EXCLUDED_ROUTES.some((r) => path.startsWith(r))) return;
    if (path === '/') return; // don't overwrite with home

    const memory: RouteMemory = { path, timestamp: Date.now() };
    try {
      localStorage.setItem(ROUTE_MEMORY_KEY, JSON.stringify(memory));
    } catch {}
  }, [location.pathname]);

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(
            SCROLL_MEMORY_KEY,
            JSON.stringify({ y: window.scrollY, path: location.pathname })
          );
        } catch {}
      }, 300);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handler);
    };
  }, [location.pathname]);
}

/** Read the stored route memory. Returns null if expired or missing. */
export function getStoredRouteMemory(): RouteMemory | null {
  try {
    const raw = localStorage.getItem(ROUTE_MEMORY_KEY);
    if (!raw) return null;
    const memory: RouteMemory = JSON.parse(raw);
    if (Date.now() - memory.timestamp > MAX_AGE_MS) {
      localStorage.removeItem(ROUTE_MEMORY_KEY);
      localStorage.removeItem(SCROLL_MEMORY_KEY);
      return null;
    }
    return memory;
  } catch {
    return null;
  }
}

/** Read stored scroll position for a given path. */
export function getStoredScrollPosition(path: string): number {
  try {
    const raw = localStorage.getItem(SCROLL_MEMORY_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data.path === path ? (data.y ?? 0) : 0;
  } catch {
    return 0;
  }
}

/** Clear route memory (e.g. on logout). */
export function clearRouteMemory() {
  try {
    localStorage.removeItem(ROUTE_MEMORY_KEY);
    localStorage.removeItem(SCROLL_MEMORY_KEY);
  } catch {}
}
