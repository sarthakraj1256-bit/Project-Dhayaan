import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/** Maps each route to its logical parent. */
const PARENT_MAP: Record<string, string> = {
  '/dashboard': '/',
  '/profile': '/',
  '/sonic-lab': '/',
  '/mantrochar': '/',
  '/lakshya': '/',
  '/live-darshan': '/',
  '/aarti-schedule': '/live-darshan',
  '/immersive-darshan': '/live-darshan',
  '/jap-bank': '/',
  '/children-cartoons': '/',
  '/bhakti-shorts': '/',
  '/help': '/profile',
  '/install': '/',
  '/admin': '/',
};

/** Routes that should never show a back button. */
const NO_BACK_ROUTES = ['/', '/auth', '/auth/callback'];

function getParent(pathname: string): string {
  // Exact match first
  if (PARENT_MAP[pathname]) return PARENT_MAP[pathname];

  // Dynamic segments: /garden/:id → /lakshya
  if (pathname.startsWith('/garden/')) return '/lakshya';

  // Fallback: go up one segment
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    return '/' + segments.slice(0, -1).join('/');
  }

  return '/';
}

export function useSmartBack() {
  const navigate = useNavigate();
  const location = useLocation();

  const showBack = !NO_BACK_ROUTES.includes(location.pathname);

  const goBack = useCallback(() => {
    // If there's real browser history (more than the current entry), go back
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // No history — go to logical parent
      navigate(getParent(location.pathname), { replace: true });
    }
  }, [navigate, location.pathname]);

  return { goBack, showBack };
}
