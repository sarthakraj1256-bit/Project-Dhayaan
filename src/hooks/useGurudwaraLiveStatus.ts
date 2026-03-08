import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/backend/client';
import { GURUDWARAS } from '@/data/gurudwaraStreams';

export interface LiveStatus {
  isLive: boolean;
  videoId?: string;
  lastChecked: number;
}

const POLL_INTERVAL = 30_000; // 30 seconds
const CACHE_KEY = 'dhyaan_gurudwara_live_status';

/** Cache results to localStorage so we have instant data on remount */
function getCachedStatus(): Record<string, LiveStatus> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    // Expire cache after 2 minutes
    const now = Date.now();
    const filtered: Record<string, LiveStatus> = {};
    for (const [k, v] of Object.entries(data)) {
      const status = v as LiveStatus;
      if (now - status.lastChecked < 120_000) {
        filtered[k] = status;
      }
    }
    return filtered;
  } catch {
    return {};
  }
}

function setCachedStatus(statuses: Record<string, LiveStatus>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(statuses));
  } catch { }
}

/**
 * Polls the check-live-status edge function every 30s
 * to determine which Gurudwara YouTube channels are currently live.
 */
export function useGurudwaraLiveStatus() {
  const [statuses, setStatuses] = useState<Record<string, LiveStatus>>(getCachedStatus);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const checkStatus = useCallback(async () => {
    const urls = GURUDWARAS.map((g) => g.liveUrl);
    setIsChecking(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-live-status', {
        body: { urls },
      });

      if (error || !data?.results) {
        setIsChecking(false);
        return;
      }

      const now = Date.now();
      const newStatuses: Record<string, LiveStatus> = {};
      for (const [url, result] of Object.entries(data.results)) {
        const r = result as { isLive: boolean; videoId?: string };
        newStatuses[url] = {
          isLive: r.isLive,
          videoId: r.videoId,
          lastChecked: now,
        };
      }

      setStatuses(newStatuses);
      setCachedStatus(newStatuses);
    } catch {
      // Silently fail — keep showing last known status
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Poll every 30 seconds
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkStatus]);

  const getStatus = useCallback(
    (liveUrl: string): LiveStatus => {
      return statuses[liveUrl] ?? { isLive: false, lastChecked: 0 };
    },
    [statuses]
  );

  return { getStatus, isChecking, refresh: checkStatus };
}
