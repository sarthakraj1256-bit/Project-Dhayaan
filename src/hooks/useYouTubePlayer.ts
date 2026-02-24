import { useState, useEffect, useCallback, useRef } from 'react';

// YouTube Player States
export enum YTPlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export type VideoStreamStatus = 'live' | 'recorded' | 'ambience' | 'loading' | 'error';

interface UseYouTubePlayerOptions {
  liveVideoId?: string;
  recordedVideoId?: string;
  backupAmbienceId?: string;
  onLiveAvailable?: () => void;
  onError?: (error: string) => void;
}

interface UseYouTubePlayerResult {
  currentVideoId: string;
  streamStatus: VideoStreamStatus;
  isLiveAvailable: boolean;
  showLiveSwitchPrompt: boolean;
  switchToLive: () => void;
  dismissLivePrompt: () => void;
  retryConnection: () => void;
  handlePlayerError: () => void;
  handlePlayerReady: () => void;
  statusMessage: string;
  badgeColor: string;
  badgeText: string;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

// Default fallback ambience video (Golden Temple 24/7)
const DEFAULT_AMBIENCE_VIDEO_ID = 'LBaF7ypRVXM';

export const useYouTubePlayer = ({
  liveVideoId,
  recordedVideoId,
  backupAmbienceId,
  onLiveAvailable,
  onError,
}: UseYouTubePlayerOptions): UseYouTubePlayerResult => {
  const [streamStatus, setStreamStatus] = useState<VideoStreamStatus>('loading');
  const [isLiveAvailable, setIsLiveAvailable] = useState(false);
  const [showLiveSwitchPrompt, setShowLiveSwitchPrompt] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>(
    liveVideoId || recordedVideoId || backupAmbienceId || DEFAULT_AMBIENCE_VIDEO_ID
  );
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  
  const wasWatchingRecorded = useRef(false);
  const errorCount = useRef(0);
  const maxRetries = 3;
  const liveCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the best available video based on current state
  const selectFallbackVideo = useCallback((): string => {
    if (recordedVideoId) return recordedVideoId;
    if (backupAmbienceId) return backupAmbienceId;
    return DEFAULT_AMBIENCE_VIDEO_ID;
  }, [recordedVideoId, backupAmbienceId]);

  // Determine stream status based on current video
  const updateStreamStatus = useCallback((videoId: string) => {
    if (videoId === liveVideoId) {
      setStreamStatus('live');
      setIsLiveAvailable(true);
      wasWatchingRecorded.current = false;
    } else if (videoId === recordedVideoId) {
      setStreamStatus('recorded');
      wasWatchingRecorded.current = true;
    } else {
      setStreamStatus('ambience');
    }
  }, [liveVideoId, recordedVideoId]);

  // Handle player ready - video loaded successfully
  const handlePlayerReady = useCallback(() => {
    errorCount.current = 0;
    updateStreamStatus(currentVideoId);
  }, [currentVideoId, updateStreamStatus]);

  // Handle player error - switch to fallback
  const handlePlayerError = useCallback(() => {
    errorCount.current += 1;
    console.warn(`YouTube player error (attempt ${errorCount.current}/${maxRetries})`);

    if (errorCount.current >= maxRetries) {
      // All retries exhausted, go to fail-safe
      const fallbackId = backupAmbienceId || DEFAULT_AMBIENCE_VIDEO_ID;
      setCurrentVideoId(fallbackId);
      setStreamStatus('ambience');
      onError?.('All video sources failed. Playing ambient content.');
      errorCount.current = 0;
      return;
    }

    // Try next fallback in sequence
    if (currentVideoId === liveVideoId && recordedVideoId) {
      setCurrentVideoId(recordedVideoId);
      setStreamStatus('recorded');
      wasWatchingRecorded.current = true;
    } else if (currentVideoId === recordedVideoId && backupAmbienceId) {
      setCurrentVideoId(backupAmbienceId);
      setStreamStatus('ambience');
    } else {
      setCurrentVideoId(DEFAULT_AMBIENCE_VIDEO_ID);
      setStreamStatus('ambience');
    }
  }, [currentVideoId, liveVideoId, recordedVideoId, backupAmbienceId, onError]);

  // Check if live stream is available using oEmbed
  const checkLiveStatus = useCallback(async (): Promise<boolean> => {
    if (!liveVideoId) return false;

    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${liveVideoId}&format=json`,
        { method: 'GET' }
      );
      return response.ok;
    } catch {
      // Optimistic fallback - let iframe try to load
      return true;
    }
  }, [liveVideoId]);

  // Switch to live stream
  const switchToLive = useCallback(() => {
    if (liveVideoId) {
      errorCount.current = 0;
      setCurrentVideoId(liveVideoId);
      setStreamStatus('live');
      setShowLiveSwitchPrompt(false);
      wasWatchingRecorded.current = false;
    }
  }, [liveVideoId]);

  // Dismiss live switch prompt
  const dismissLivePrompt = useCallback(() => {
    setShowLiveSwitchPrompt(false);
  }, []);

  // Retry connection from scratch
  const retryConnection = useCallback(async () => {
    errorCount.current = 0;
    setStreamStatus('loading');
    
    if (liveVideoId) {
      const liveAvailable = await checkLiveStatus();
      if (liveAvailable) {
        setCurrentVideoId(liveVideoId);
        setStreamStatus('live');
        setIsLiveAvailable(true);
        return;
      }
    }
    
    // Fallback to recorded or ambience
    const fallbackId = selectFallbackVideo();
    setCurrentVideoId(fallbackId);
    updateStreamStatus(fallbackId);
  }, [liveVideoId, checkLiveStatus, selectFallbackVideo, updateStreamStatus]);

  // Initialize and set up periodic live checking
  useEffect(() => {
    const initializePlayer = async () => {
      setStreamStatus('loading');
      
      if (liveVideoId) {
        // Start with live, let error handler manage fallback
        setCurrentVideoId(liveVideoId);
        setStreamStatus('live');
      } else {
        const fallbackId = selectFallbackVideo();
        setCurrentVideoId(fallbackId);
        updateStreamStatus(fallbackId);
      }
    };

    initializePlayer();

    // Periodic check for live stream availability (every 30 seconds)
    if (liveVideoId) {
      liveCheckIntervalRef.current = setInterval(async () => {
        if (wasWatchingRecorded.current) {
          const liveAvailable = await checkLiveStatus();
          if (liveAvailable && !isLiveAvailable) {
            setIsLiveAvailable(true);
            setShowLiveSwitchPrompt(true);
            onLiveAvailable?.();
          }
        }
      }, 30000);
    }

    return () => {
      if (liveCheckIntervalRef.current) {
        clearInterval(liveCheckIntervalRef.current);
      }
    };
  }, [liveVideoId, selectFallbackVideo, updateStreamStatus, checkLiveStatus, isLiveAvailable, onLiveAvailable]);

  // Status messages
  const getStatusMessage = (): string => {
    switch (streamStatus) {
      case 'loading':
        return 'Connecting to darshan...';
      case 'live':
        return 'Live Aarati';
      case 'recorded':
        return 'Recorded Darshan';
      case 'ambience':
        return 'Darshan will resume shortly 🙏';
      case 'error':
        return 'Connection issue - retrying...';
      default:
        return '';
    }
  };

  const getBadgeColor = (): string => {
    switch (streamStatus) {
      case 'live':
        return 'bg-red-600';
      case 'recorded':
        return 'bg-amber-500';
      case 'ambience':
        return 'bg-blue-500';
      default:
        return 'bg-muted';
    }
  };

  const getBadgeText = (): string => {
    switch (streamStatus) {
      case 'live':
        return '🔴 LIVE';
      case 'recorded':
        return '🟡 Recorded';
      case 'ambience':
        return '🔵 Ambience';
      default:
        return '';
    }
  };

  return {
    currentVideoId,
    streamStatus,
    isLiveAvailable,
    showLiveSwitchPrompt,
    switchToLive,
    dismissLivePrompt,
    retryConnection,
    handlePlayerError,
    handlePlayerReady,
    statusMessage: getStatusMessage(),
    badgeColor: getBadgeColor(),
    badgeText: getBadgeText(),
    isMuted,
    setIsMuted,
  };
};

export default useYouTubePlayer;
