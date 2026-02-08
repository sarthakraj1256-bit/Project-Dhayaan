import { useState, useEffect, useCallback, useRef } from 'react';

// YouTube IFrame API types
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

const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

// YouTube error codes
export enum YouTubeErrorCode {
  INVALID_PARAM = 2,
  HTML5_ERROR = 5,
  VIDEO_NOT_FOUND = 100,
  EMBED_NOT_ALLOWED = 101,
  EMBED_NOT_ALLOWED_2 = 150,
}

export type StreamStatus = 'loading' | 'live' | 'recorded' | 'ambience' | 'error';

interface UseYouTubePlayerAPIOptions {
  containerId: string;
  liveVideoId?: string;
  recordedVideoId?: string;
  backupAmbienceId?: string;
  onStatusChange?: (status: StreamStatus) => void;
  onError?: (errorMessage: string) => void;
}

const DEFAULT_AMBIENCE_ID = 'LBaF7ypRVXM';

export const useYouTubePlayerAPI = ({
  containerId,
  liveVideoId,
  recordedVideoId,
  backupAmbienceId,
  onStatusChange,
  onError,
}: UseYouTubePlayerAPIOptions) => {
  // ALL HOOKS MUST BE AT THE TOP - unconditionally
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [status, setStatus] = useState<StreamStatus>('loading');
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playerRef = useRef<YTPlayer | null>(null);
  const errorCountRef = useRef(0);
  const isHandlingErrorRef = useRef(false);
  const currentAttemptRef = useRef<'live' | 'recorded' | 'ambience'>('live');
  const currentVideoIdRef = useRef<string>(
    liveVideoId || recordedVideoId || backupAmbienceId || DEFAULT_AMBIENCE_ID
  );

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT?.Player) {
      setIsAPIReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.YT?.Player) {
          setIsAPIReady(true);
          clearInterval(checkReady);
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true);
      originalCallback?.();
    };

    script.onerror = () => setApiError('Failed to load YouTube API');
    document.body.appendChild(script);
  }, []);

  // Set initial attempt based on available videos
  useEffect(() => {
    currentAttemptRef.current = liveVideoId ? 'live' : (recordedVideoId ? 'recorded' : 'ambience');
    currentVideoIdRef.current = liveVideoId || recordedVideoId || backupAmbienceId || DEFAULT_AMBIENCE_ID;
  }, [liveVideoId, recordedVideoId, backupAmbienceId]);

  // Get next fallback video
  const getNextFallback = useCallback((): string | null => {
    if (currentAttemptRef.current === 'ambience') return null;
    
    if (currentAttemptRef.current === 'live' && recordedVideoId) {
      currentAttemptRef.current = 'recorded';
      return recordedVideoId;
    }
    
    currentAttemptRef.current = 'ambience';
    return backupAmbienceId || DEFAULT_AMBIENCE_ID;
  }, [recordedVideoId, backupAmbienceId]);

  // Initialize player
  useEffect(() => {
    if (!isAPIReady || !window.YT?.Player || playerRef.current) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const videoId = currentVideoIdRef.current;
    console.log('[YT Player] Initializing with video:', videoId);

    const handleReady = (event: YTPlayerEvent) => {
      console.log('[YT Player] Ready');
      setIsPlayerReady(true);
      errorCountRef.current = 0;
      
      const vid = currentVideoIdRef.current;
      if (vid === liveVideoId) {
        setStatus('live');
        onStatusChange?.('live');
      } else if (vid === recordedVideoId) {
        setStatus('recorded');
        onStatusChange?.('recorded');
      } else {
        setStatus('ambience');
        onStatusChange?.('ambience');
      }
      
      event.target.playVideo();
    };

    const handleStateChange = (event: YTPlayerEvent) => {
      if (event.data === PlayerState.ENDED) {
        console.log('[YT Player] Video ended, restarting...');
        event.target.seekTo(0);
        event.target.playVideo();
      }
    };

    const handleError = (event: YTOnErrorEvent) => {
      if (isHandlingErrorRef.current) return;
      
      const errorCode = event.data;
      console.warn(`[YT Player] Error ${errorCode}`);
      errorCountRef.current += 1;

      const criticalErrors = [100, 101, 150, 5];
      if (criticalErrors.includes(errorCode) || errorCountRef.current >= 3) {
        isHandlingErrorRef.current = true;
        
        const fallbackId = getNextFallback();
        if (!fallbackId) {
          console.log('[YT Player] No more fallbacks');
          setStatus('ambience');
          onStatusChange?.('ambience');
          isHandlingErrorRef.current = false;
          return;
        }
        
        console.log(`[YT Player] Switching to: ${fallbackId}`);
        currentVideoIdRef.current = fallbackId;
        
        const newStatus = fallbackId === recordedVideoId ? 'recorded' : 'ambience';
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        
        playerRef.current?.loadVideoById(fallbackId);
        errorCountRef.current = 0;
        
        setTimeout(() => { isHandlingErrorRef.current = false; }, 1000);
      }
      
      onError?.(`YouTube Error ${errorCode}`);
    };

    playerRef.current = new window.YT.Player(containerId, {
      width: '100%',
      height: '100%',
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        loop: 1,
        playlist: videoId,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        fs: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: handleReady,
        onStateChange: handleStateChange,
        onError: handleError,
      },
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [isAPIReady, containerId, liveVideoId, recordedVideoId, backupAmbienceId, getNextFallback, onStatusChange, onError]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current || !isPlayerReady) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  }, [isMuted, isPlayerReady]);

  const retryConnection = useCallback(() => {
    if (!playerRef.current || !liveVideoId) return;
    console.log('[YT Player] Retrying live stream');
    errorCountRef.current = 0;
    currentAttemptRef.current = 'live';
    currentVideoIdRef.current = liveVideoId;
    playerRef.current.loadVideoById(liveVideoId);
    setStatus('loading');
    onStatusChange?.('loading');
  }, [liveVideoId, onStatusChange]);

  return {
    status,
    currentVideoId: currentVideoIdRef.current,
    isMuted,
    isPlayerReady,
    isAPIReady,
    apiError,
    toggleMute,
    retryConnection,
  };
};

export default useYouTubePlayerAPI;
