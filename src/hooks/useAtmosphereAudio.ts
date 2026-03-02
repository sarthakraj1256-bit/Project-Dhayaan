import { useState, useRef, useCallback, useEffect } from 'react';
import { getCachedAudio, setCachedAudio } from '@/lib/audioCache';
import { supabase } from '@/integrations/backend/client';

interface AtmosphereState {
  currentAtmosphere: string;
  atmosphereVolume: number;
  isLoading: boolean;
  isCached: boolean;
  error: string | null;
  requiresInteraction: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 450;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isAutoplayOrInterruptedError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    error.name === 'NotAllowedError' ||
    error.name === 'AbortError' ||
    msg.includes('user didn\'t interact') ||
    msg.includes('play() failed') ||
    msg.includes('interrupted')
  );
};

export const useAtmosphereAudio = () => {
  const [state, setState] = useState<AtmosphereState>({
    currentAtmosphere: 'none',
    atmosphereVolume: 0.2,
    isLoading: false,
    isCached: false,
    error: null,
    requiresInteraction: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const atmosphereGainRef = useRef<GainNode | null>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());
  const volumeRef = useRef(0.2);

  const initAtmosphereContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    if (!atmosphereGainRef.current && audioContextRef.current) {
      atmosphereGainRef.current = audioContextRef.current.createGain();
      atmosphereGainRef.current.gain.setValueAtTime(volumeRef.current, audioContextRef.current.currentTime);
      atmosphereGainRef.current.connect(audioContextRef.current.destination);
    }

    return audioContextRef.current;
  }, []);

  const unlockAtmosphereAudio = useCallback(async () => {
    try {
      const ctx = initAtmosphereContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setState((prev) => ({ ...prev, requiresInteraction: false, error: null }));
      return true;
    } catch (error) {
      console.error('Error unlocking atmosphere audio:', error);
      setState((prev) => ({
        ...prev,
        requiresInteraction: true,
        error: 'Tap to Enable Sound',
      }));
      return false;
    }
  }, [initAtmosphereContext]);

  // Cleanup object URL and nodes on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (mediaSourceRef.current) {
        try {
          mediaSourceRef.current.disconnect();
        } catch {
          // no-op
        }
        mediaSourceRef.current = null;
      }
      if (atmosphereGainRef.current) {
        try {
          atmosphereGainRef.current.disconnect();
        } catch {
          // no-op
        }
        atmosphereGainRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {
          // no-op
        });
        audioContextRef.current = null;
      }
    };
  }, []);

  const stopAtmosphere = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (mediaSourceRef.current) {
      try {
        mediaSourceRef.current.disconnect();
      } catch {
        // no-op
      }
      mediaSourceRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const playAudioBlob = useCallback(async (blob: Blob, volume: number) => {
    stopAtmosphere();

    const unlocked = await unlockAtmosphereAudio();
    if (!unlocked) {
      throw new Error('Tap to Enable Sound');
    }

    const ctx = initAtmosphereContext();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;

    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    const source = ctx.createMediaElementSource(audio);
    mediaSourceRef.current = source;

    const gain = atmosphereGainRef.current ?? ctx.createGain();
    atmosphereGainRef.current = gain;
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    source.connect(gain);

    try {
      await audio.play();
      setState((prev) => ({ ...prev, requiresInteraction: false, error: null }));
    } catch (error) {
      console.error('Error playing atmosphere audio:', error);
      if (isAutoplayOrInterruptedError(error)) {
        setState((prev) => ({
          ...prev,
          requiresInteraction: true,
          error: 'Tap to Enable Sound',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'Unable to play atmosphere. Please reconnect audio.',
        }));
      }
      throw error;
    }
  }, [initAtmosphereContext, stopAtmosphere, unlockAtmosphereAudio]);

  const fetchAtmosphereWithRetry = useCallback(async (atmosphereId: string): Promise<Blob> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ atmosphereId }),
          },
        );

        if (!response.ok) {
          const raw = await response.text().catch(() => '');
          let parsedError = 'Unknown error';
          try {
            parsedError = raw ? (JSON.parse(raw)?.error ?? raw) : 'Unknown error';
          } catch {
            parsedError = raw || 'Unknown error';
          }
          throw new Error(parsedError || `HTTP ${response.status}`);
        }

        return await response.blob();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < MAX_RETRIES) {
          await wait(RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw lastError ?? new Error('Unknown error');
  }, []);

  const prefetchAtmospheres = useCallback(async (atmosphereIds: string[]) => {
    const unlocked = await unlockAtmosphereAudio();
    if (!unlocked) return;

    await Promise.all(
      atmosphereIds
        .filter((id) => id !== 'none' && !prefetchedRef.current.has(id))
        .map(async (atmosphereId) => {
          prefetchedRef.current.add(atmosphereId);
          try {
            const cachedBlob = await getCachedAudio(atmosphereId);
            if (cachedBlob) return;
            const blob = await fetchAtmosphereWithRetry(atmosphereId);
            await setCachedAudio(atmosphereId, blob);
          } catch {
            prefetchedRef.current.delete(atmosphereId);
          }
        }),
    );
  }, [fetchAtmosphereWithRetry, unlockAtmosphereAudio]);

  const setAtmosphere = useCallback(async (atmosphereId: string) => {
    if (atmosphereId === 'none') {
      stopAtmosphere();
      setState((prev) => ({
        ...prev,
        currentAtmosphere: 'none',
        isLoading: false,
        isCached: false,
        error: null,
        requiresInteraction: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      currentAtmosphere: atmosphereId,
      isLoading: true,
      error: null,
    }));

    try {
      const cachedBlob = await getCachedAudio(atmosphereId);

      if (cachedBlob) {
        await playAudioBlob(cachedBlob, volumeRef.current);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isCached: true,
        }));
        return;
      }

      const audioBlob = await fetchAtmosphereWithRetry(atmosphereId);
      await setCachedAudio(atmosphereId, audioBlob);
      await playAudioBlob(audioBlob, volumeRef.current);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isCached: false,
      }));
    } catch (error) {
      console.error('Error loading atmosphere:', error);
      const interactionError = isAutoplayOrInterruptedError(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        requiresInteraction: interactionError,
        error: interactionError
          ? 'Tap to Enable Sound'
          : 'Unable to load atmosphere. Please reconnect audio.',
      }));
    }
  }, [fetchAtmosphereWithRetry, playAudioBlob, stopAtmosphere]);

  const setAtmosphereVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    if (atmosphereGainRef.current && audioContextRef.current) {
      atmosphereGainRef.current.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.1);
    }
    setState((prev) => ({ ...prev, atmosphereVolume: volume }));
  }, []);

  const reconnectAtmosphereAudio = useCallback(async () => {
    stopAtmosphere();

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {
        // no-op
      });
      audioContextRef.current = null;
    }

    mediaSourceRef.current = null;
    atmosphereGainRef.current = null;

    const unlocked = await unlockAtmosphereAudio();
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: unlocked ? null : 'Tap to Enable Sound',
      requiresInteraction: !unlocked,
    }));
  }, [stopAtmosphere, unlockAtmosphereAudio]);

  return {
    atmosphereState: state,
    setAtmosphere,
    setAtmosphereVolume,
    stopAtmosphere,
    unlockAtmosphereAudio,
    reconnectAtmosphereAudio,
    prefetchAtmospheres,
  };
};