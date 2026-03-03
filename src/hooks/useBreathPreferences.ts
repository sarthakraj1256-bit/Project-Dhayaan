import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/backend/client';
import type { BreathTimings } from '@/components/lakshya/BreathSettings';

const DEFAULTS: BreathTimings = { inhaleSeconds: 4, exhaleSeconds: 6, holdSeconds: 2 };

export function useBreathPreferences(userId: string | null) {
  const [timings, setTimings] = useState<BreathTimings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) { setLoaded(true); return; }

    supabase
      .from('breathing_preferences')
      .select('inhale_seconds, exhale_seconds, hold_seconds')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTimings({
            inhaleSeconds: data.inhale_seconds,
            exhaleSeconds: data.exhale_seconds,
            holdSeconds: data.hold_seconds,
          });
        }
        setLoaded(true);
      });
  }, [userId]);

  const save = useCallback(async (t: BreathTimings) => {
    setTimings(t);
    if (!userId) return;

    await supabase.from('breathing_preferences').upsert({
      user_id: userId,
      inhale_seconds: t.inhaleSeconds,
      exhale_seconds: t.exhaleSeconds,
      hold_seconds: t.holdSeconds,
    }, { onConflict: 'user_id' });
  }, [userId]);

  return { timings, loaded, save };
}
