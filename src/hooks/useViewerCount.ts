import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ViewerCountData {
  viewerCount: number | null;
  isLive: boolean;
  hasActiveChat: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseViewerCountOptions {
  videoId: string | undefined;
  pollInterval?: number; // in milliseconds
  enabled?: boolean;
}

export const useViewerCount = ({
  videoId,
  pollInterval = 30000, // Default: 30 seconds
  enabled = true,
}: UseViewerCountOptions): ViewerCountData => {
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastVideoIdRef = useRef<string | undefined>(undefined);

  const fetchViewerCount = useCallback(async () => {
    if (!videoId) {
      setViewerCount(null);
      setIsLive(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('youtube-viewer-count', {
        body: { videoId },
      });

      if (fnError) {
        console.warn('[useViewerCount] Function error:', fnError);
        setError(fnError.message);
        return;
      }

      if (data.error) {
        console.warn('[useViewerCount] API error:', data.error);
        setError(data.error);
        return;
      }

      setViewerCount(data.viewerCount);
      setIsLive(data.isLive ?? false);
      setHasActiveChat(data.hasActiveChat ?? false);

    } catch (err) {
      console.error('[useViewerCount] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch viewer count');
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  // Reset and fetch when videoId changes
  useEffect(() => {
    if (videoId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = videoId;
      setViewerCount(null);
      setIsLive(false);
      setHasActiveChat(false);
      setError(null);
      
      if (enabled && videoId) {
        fetchViewerCount();
      }
    }
  }, [videoId, enabled, fetchViewerCount]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !videoId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchViewerCount();

    // Set up interval
    intervalRef.current = setInterval(fetchViewerCount, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoId, pollInterval, fetchViewerCount]);

  return {
    viewerCount,
    isLive,
    hasActiveChat,
    isLoading,
    error,
  };
};

export default useViewerCount;
