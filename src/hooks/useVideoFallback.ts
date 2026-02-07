import { useState, useEffect, useCallback, useRef } from 'react';

export type VideoStreamStatus = 'live' | 'recorded' | 'ambience' | 'loading' | 'error';

interface UseVideoFallbackOptions {
  liveVideoId?: string;
  recordedVideoId?: string;
  backupAmbienceId?: string;
  checkInterval?: number; // How often to check live status (ms)
  onLiveAvailable?: () => void; // Callback when live becomes available
}

interface UseVideoFallbackResult {
  currentVideoId: string | null;
  streamStatus: VideoStreamStatus;
  isLiveAvailable: boolean;
  showLiveSwitchPrompt: boolean;
  switchToLive: () => void;
  dismissLivePrompt: () => void;
  retryConnection: () => void;
  statusMessage: string;
  badgeColor: string;
  badgeText: string;
}

// Default fallback ambience video (soothing temple bells/bhajan loop)
const DEFAULT_AMBIENCE_VIDEO_ID = 'LBaF7ypRVXM'; // Golden Temple 24/7 as ultimate fallback

export const useVideoFallback = ({
  liveVideoId,
  recordedVideoId,
  backupAmbienceId,
  checkInterval = 30000, // Check every 30 seconds
  onLiveAvailable,
}: UseVideoFallbackOptions): UseVideoFallbackResult => {
  const [streamStatus, setStreamStatus] = useState<VideoStreamStatus>('loading');
  const [isLiveAvailable, setIsLiveAvailable] = useState(false);
  const [showLiveSwitchPrompt, setShowLiveSwitchPrompt] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const wasWatchingRecorded = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeLoadAttempts = useRef(0);
  const maxLoadAttempts = 3;

  // Determine the best available video
  const selectVideo = useCallback((liveAvailable: boolean): string => {
    if (liveAvailable && liveVideoId) {
      return liveVideoId;
    }
    if (recordedVideoId) {
      return recordedVideoId;
    }
    if (backupAmbienceId) {
      return backupAmbienceId;
    }
    return DEFAULT_AMBIENCE_VIDEO_ID;
  }, [liveVideoId, recordedVideoId, backupAmbienceId]);

  // Check if live stream is available using YouTube oEmbed API
  const checkLiveStatus = useCallback(async (): Promise<boolean> => {
    if (!liveVideoId) return false;

    try {
      // Use YouTube oEmbed to check if video is available
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${liveVideoId}&format=json`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        // Check if the video title contains "live" indicators
        const isLive = data.title?.toLowerCase().includes('live') || 
                       data.title?.toLowerCase().includes('24/7') ||
                       data.title?.toLowerCase().includes('darshan');
        return response.ok; // If oEmbed returns data, video exists
      }
      return false;
    } catch {
      // If oEmbed fails, assume video might still work (YouTube blocks some requests)
      return true; // Optimistic fallback - let iframe try to load
    }
  }, [liveVideoId]);

  // Initialize and set up periodic checking
  useEffect(() => {
    let mounted = true;

    const initializeVideo = async () => {
      setStreamStatus('loading');
      
      const liveAvailable = await checkLiveStatus();
      
      if (!mounted) return;

      setIsLiveAvailable(liveAvailable);
      
      const videoId = selectVideo(liveAvailable);
      setCurrentVideoId(videoId);
      
      if (liveAvailable && liveVideoId) {
        setStreamStatus('live');
      } else if (videoId === recordedVideoId) {
        setStreamStatus('recorded');
        wasWatchingRecorded.current = true;
      } else {
        setStreamStatus('ambience');
      }
    };

    initializeVideo();

    // Set up periodic checking for live availability
    checkIntervalRef.current = setInterval(async () => {
      if (!mounted) return;
      
      const liveAvailable = await checkLiveStatus();
      
      if (liveAvailable && !isLiveAvailable && wasWatchingRecorded.current) {
        // Live just became available while watching recorded
        setIsLiveAvailable(true);
        setShowLiveSwitchPrompt(true);
        onLiveAvailable?.();
      }
    }, checkInterval);

    return () => {
      mounted = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [liveVideoId, recordedVideoId, checkLiveStatus, selectVideo, checkInterval, isLiveAvailable, onLiveAvailable]);

  // Handle iframe load errors
  const handleVideoError = useCallback(() => {
    iframeLoadAttempts.current += 1;

    if (iframeLoadAttempts.current >= maxLoadAttempts) {
      // All attempts failed, go to fail-safe
      if (streamStatus === 'live' && recordedVideoId) {
        setCurrentVideoId(recordedVideoId);
        setStreamStatus('recorded');
        wasWatchingRecorded.current = true;
      } else if (backupAmbienceId) {
        setCurrentVideoId(backupAmbienceId);
        setStreamStatus('ambience');
      } else {
        setCurrentVideoId(DEFAULT_AMBIENCE_VIDEO_ID);
        setStreamStatus('ambience');
      }
      iframeLoadAttempts.current = 0;
    }
  }, [streamStatus, recordedVideoId, backupAmbienceId]);

  // Switch to live stream
  const switchToLive = useCallback(() => {
    if (liveVideoId) {
      setCurrentVideoId(liveVideoId);
      setStreamStatus('live');
      setShowLiveSwitchPrompt(false);
      wasWatchingRecorded.current = false;
      iframeLoadAttempts.current = 0;
    }
  }, [liveVideoId]);

  // Dismiss the live switch prompt
  const dismissLivePrompt = useCallback(() => {
    setShowLiveSwitchPrompt(false);
  }, []);

  // Retry connection
  const retryConnection = useCallback(async () => {
    iframeLoadAttempts.current = 0;
    setStreamStatus('loading');
    
    const liveAvailable = await checkLiveStatus();
    setIsLiveAvailable(liveAvailable);
    
    const videoId = selectVideo(liveAvailable);
    setCurrentVideoId(videoId);
    
    if (liveAvailable && liveVideoId) {
      setStreamStatus('live');
      wasWatchingRecorded.current = false;
    } else if (videoId === recordedVideoId) {
      setStreamStatus('recorded');
      wasWatchingRecorded.current = true;
    } else {
      setStreamStatus('ambience');
    }
  }, [checkLiveStatus, selectVideo, liveVideoId, recordedVideoId]);

  // Generate status message
  const getStatusMessage = (): string => {
    switch (streamStatus) {
      case 'loading':
        return 'Connecting to darshan...';
      case 'live':
        return 'Live Aarti';
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

  // Badge styling
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
    statusMessage: getStatusMessage(),
    badgeColor: getBadgeColor(),
    badgeText: getBadgeText(),
  };
};

export default useVideoFallback;
