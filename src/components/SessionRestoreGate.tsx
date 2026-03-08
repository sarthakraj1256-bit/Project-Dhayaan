import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/backend/client';
import {
  getStoredRouteMemory,
  getStoredScrollPosition,
  RESUMABLE_ROUTES,
} from '@/hooks/useRouteMemory';
import { ResumeSessionPrompt } from './ResumeSessionPrompt';

interface Props {
  splashDone: boolean;
}

/**
 * After splash completes, checks auth and optionally restores the user's
 * last route with scroll position.
 */
export const SessionRestoreGate = ({ splashDone }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showResume, setShowResume] = useState(false);
  const [resumePath, setResumePath] = useState('');
  const [checked, setChecked] = useState(false);

  const restoreScroll = useCallback((path: string) => {
    const y = getStoredScrollPosition(path);
    if (y > 0) {
      // Small delay to let the page render
      requestAnimationFrame(() => {
        setTimeout(() => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), 120);
      });
    }
  }, []);

  useEffect(() => {
    if (!splashDone || checked) return;
    setChecked(true);

    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Not logged in → send to auth
      if (!session) {
        if (location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
        return;
      }

      // Logged in → check route memory
      const memory = getStoredRouteMemory();
      if (!memory) return; // stay on current page (home)

      const target = memory.path;

      // Already on the target route
      if (location.pathname === target) {
        restoreScroll(target);
        return;
      }

      // Resumable routes get a prompt
      if (RESUMABLE_ROUTES.some((r) => target.startsWith(r))) {
        setResumePath(target);
        setShowResume(true);
        return;
      }

      // Otherwise restore silently
      navigate(target, { replace: true });
      restoreScroll(target);
    };

    run();
  }, [splashDone, checked, navigate, location.pathname, restoreScroll]);

  const handleResume = () => {
    setShowResume(false);
    navigate(resumePath, { replace: true });
    restoreScroll(resumePath);
  };

  const handleDecline = () => {
    setShowResume(false);
    // Stay on current page (home)
  };

  if (!showResume) return null;

  return (
    <ResumeSessionPrompt
      open={showResume}
      routePath={resumePath}
      onResume={handleResume}
      onDecline={handleDecline}
    />
  );
};

