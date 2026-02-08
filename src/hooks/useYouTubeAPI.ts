import { useState, useEffect, useCallback, useRef } from 'react';

// YouTube IFrame API types - defined inline to avoid ambient declaration issues
interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTOnErrorEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerVars {
  autoplay?: 0 | 1;
  mute?: 0 | 1;
  controls?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
  loop?: 0 | 1;
  playlist?: string;
  playsinline?: 0 | 1;
  enablejsapi?: 0 | 1;
  origin?: string;
  fs?: 0 | 1;
  iv_load_policy?: 1 | 3;
}

interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: YTPlayerVars;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTOnErrorEvent) => void;
  };
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTGlobal {
  Player: new (elementId: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Player state constants
const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

// YouTube IFrame API loader hook
export const useYouTubeAPI = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if API is already loaded
    if (window.YT?.Player) {
      setIsReady(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.YT?.Player) {
          setIsReady(true);
          clearInterval(checkReady);
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    // Load the YouTube IFrame API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    const originalCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true);
      if (originalCallback) {
        originalCallback();
      }
    };

    script.onerror = () => {
      setError('Failed to load YouTube API');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup handled by browser
    };
  }, []);

  return { isReady, error };
};

// YouTube error codes
export enum YouTubeErrorCode {
  INVALID_PARAM = 2,
  HTML5_ERROR = 5,
  VIDEO_NOT_FOUND = 100,
  EMBED_NOT_ALLOWED = 101,
  EMBED_NOT_ALLOWED_2 = 150,
}

// Stream status type
export type StreamStatus = 'loading' | 'live' | 'recorded' | 'ambience' | 'error';

interface UseYouTubePlayerAPIOptions {
  containerId: string;
  liveVideoId?: string;
  recordedVideoId?: string;
  backupAmbienceId?: string;
  onStatusChange?: (status: StreamStatus) => void;
  onError?: (errorMessage: string) => void;
}

const DEFAULT_AMBIENCE_ID = 'LBaF7ypRVXM'; // Golden Temple 24/7 backup

export const useYouTubePlayerAPI = ({
  containerId,
  liveVideoId,
  recordedVideoId,
  backupAmbienceId,
  onStatusChange,
  onError,
}: UseYouTubePlayerAPIOptions) => {
  const { isReady: isAPIReady, error: apiError } = useYouTubeAPI();
  
  const playerRef = useRef<YTPlayer | null>(null);
  const [status, setStatus] = useState<StreamStatus>('loading');
  const [currentVideoId, setCurrentVideoId] = useState<string>(
    liveVideoId || recordedVideoId || backupAmbienceId || DEFAULT_AMBIENCE_ID
  );
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const errorCountRef = useRef(0);
  const maxRetries = 3;
  const currentAttemptRef = useRef<'live' | 'recorded' | 'ambience'>('live');

  // Update external status callback
  const updateStatus = useCallback((newStatus: StreamStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Get fallback video ID based on current attempt
  const getNextFallback = useCallback((): string => {
    if (currentAttemptRef.current === 'live' && recordedVideoId) {
      currentAttemptRef.current = 'recorded';
      return recordedVideoId;
    }
    if (currentAttemptRef.current === 'recorded' && backupAmbienceId) {
      currentAttemptRef.current = 'ambience';
      return backupAmbienceId;
    }
    currentAttemptRef.current = 'ambience';
    return DEFAULT_AMBIENCE_ID;
  }, [recordedVideoId, backupAmbienceId]);

  // Handle player ready event
  const handlePlayerReady = useCallback((event: YTPlayerEvent) => {
    console.log('[YT Player] Ready');
    setIsPlayerReady(true);
    errorCountRef.current = 0;
    
    if (currentVideoId === liveVideoId) {
      updateStatus('live');
    } else if (currentVideoId === recordedVideoId) {
      updateStatus('recorded');
    } else {
      updateStatus('ambience');
    }
    
    event.target.playVideo();
  }, [currentVideoId, liveVideoId, recordedVideoId, updateStatus]);

  // Handle player state change
  const handleStateChange = useCallback((event: YTPlayerEvent) => {
    const state = event.data;
    
    if (state === PlayerState.ENDED) {
      console.log('[YT Player] Video ended, restarting...');
      
      if (currentAttemptRef.current !== 'live' && liveVideoId) {
        console.log('[YT Player] Checking if live stream is back...');
        currentAttemptRef.current = 'live';
        setCurrentVideoId(liveVideoId);
        playerRef.current?.loadVideoById(liveVideoId);
      } else {
        event.target.seekTo(0);
        event.target.playVideo();
      }
    }
  }, [liveVideoId]);

  // Handle player error - THE CRITICAL FALLBACK LOGIC
  const handlePlayerError = useCallback((event: YTOnErrorEvent) => {
    const errorCode = event.data;
    console.warn(`[YT Player] Error ${errorCode} on video ${currentVideoId}`);
    
    errorCountRef.current += 1;

    const criticalErrors = [
      YouTubeErrorCode.VIDEO_NOT_FOUND,
      YouTubeErrorCode.EMBED_NOT_ALLOWED,
      YouTubeErrorCode.EMBED_NOT_ALLOWED_2,
      YouTubeErrorCode.HTML5_ERROR,
    ];

    if (criticalErrors.includes(errorCode) || errorCountRef.current >= maxRetries) {
      const fallbackId = getNextFallback();
      console.log(`[YT Player] Switching to fallback: ${fallbackId}`);
      
      setCurrentVideoId(fallbackId);
      
      if (fallbackId === recordedVideoId) {
        updateStatus('recorded');
      } else {
        updateStatus('ambience');
      }
      
      if (playerRef.current) {
        playerRef.current.loadVideoById(fallbackId);
      }
      
      errorCountRef.current = 0;
    }
    
    onError?.(`YouTube Error ${errorCode}`);
  }, [currentVideoId, getNextFallback, recordedVideoId, updateStatus, onError]);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isAPIReady || playerRef.current) return;
    if (!window.YT?.Player) return;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[YT Player] Container not found:', containerId);
      return;
    }

    console.log('[YT Player] Initializing with video:', currentVideoId);
    
    playerRef.current = new window.YT.Player(containerId, {
      width: '100%',
      height: '100%',
      videoId: currentVideoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        loop: 1,
        playlist: currentVideoId,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        fs: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handleStateChange,
        onError: handlePlayerError,
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isAPIReady, containerId, currentVideoId, handlePlayerReady, handleStateChange, handlePlayerError]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted, isPlayerReady]);

  // Force retry connection
  const retryConnection = useCallback(() => {
    if (playerRef.current && liveVideoId) {
      console.log('[YT Player] Manual retry - checking live stream');
      errorCountRef.current = 0;
      currentAttemptRef.current = 'live';
      setCurrentVideoId(liveVideoId);
      playerRef.current.loadVideoById(liveVideoId);
      updateStatus('loading');
    }
  }, [liveVideoId, updateStatus]);

  // Switch to specific video
  const switchToVideo = useCallback((videoId: string, newStatus: StreamStatus) => {
    if (playerRef.current) {
      setCurrentVideoId(videoId);
      playerRef.current.loadVideoById(videoId);
      updateStatus(newStatus);
    }
  }, [updateStatus]);

  return {
    player: playerRef.current,
    status,
    currentVideoId,
    isMuted,
    isPlayerReady,
    isAPIReady,
    apiError,
    toggleMute,
    retryConnection,
    switchToVideo,
  };
};

export default useYouTubePlayerAPI;
