import { useState, useRef, useCallback } from 'react';
import { getCachedAudio, setCachedAudio } from '@/lib/audioCache';
import { supabase } from '@/integrations/backend/client';
import {
  getSonicLabAudioEngine,
  resumeSonicLabAudioContext,
} from '@/lib/sonicLabAudioEngine';

// Hardcoded fallbacks — env vars can be undefined in preview
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://pgavnutkwiiovdvbrbcl.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYXZudXRrd2lpb3ZkdmJyYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDgyOTcsImV4cCI6MjA4NTYyNDI5N30.bM1DTGq9Fgn0WPcDlS2hjxRr-bdTDIbLq47RZFIvFbo';

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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isUnlockError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    error.name === 'NotAllowedError' ||
    msg.includes('interrupted') ||
    msg.includes('gesture') ||
    msg.includes('user activation')
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

  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());
  const bufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const volumeRef = useRef(0.2);

  /* ── stop ── */
  const stopAtmosphere = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch {
        /* no-op */
      }
      sourceRef.current = null;
    }
  }, []);

  /* ── unlock ── */
  const unlockAtmosphereAudio = useCallback(async () => {
    const ok = await resumeSonicLabAudioContext();
    // No toast here — callers decide what UI feedback to show
    setState((prev) => ({
      ...prev,
      requiresInteraction: !ok,
      error: ok ? null : prev.error,
    }));
    return ok;
  }, []);

  /* ── fetch with retry ── */
  const fetchAtmosphereWithRetry = useCallback(
    async (atmosphereId: string): Promise<Blob> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || SUPABASE_KEY;

      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ atmosphereId }),
            },
          );

          if (!response.ok) {
            const raw = await response.text().catch(() => '');
            throw new Error(raw || `HTTP ${response.status}`);
          }

          return await response.blob();
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error('Network error');
          if (attempt < MAX_RETRIES) {
            await wait(RETRY_DELAY_MS * attempt);
          }
        }
      }

      throw lastError ?? new Error('Network error');
    },
    [],
  );

  /* ── decode blob → AudioBuffer ── */
  const decodeBlobToBuffer = useCallback(async (blob: Blob) => {
    const { context } = getSonicLabAudioEngine();
    const bytes = await blob.arrayBuffer();
    return context.decodeAudioData(bytes.slice(0));
  }, []);

  /* ── get or load buffer (memory → IndexedDB → network) ── */
  const getOrLoadAtmosphereBuffer = useCallback(
    async (
      atmosphereId: string,
    ): Promise<{ buffer: AudioBuffer; fromCache: boolean }> => {
      // 1. In-memory cache
      const memoryBuffer = bufferCacheRef.current.get(atmosphereId);
      if (memoryBuffer) return { buffer: memoryBuffer, fromCache: true };

      // 2. IndexedDB cache
      const cachedBlob = await getCachedAudio(atmosphereId);
      if (cachedBlob) {
        const decoded = await decodeBlobToBuffer(cachedBlob);
        bufferCacheRef.current.set(atmosphereId, decoded);
        return { buffer: decoded, fromCache: true };
      }

      // 3. Network (with retry)
      const generated = await fetchAtmosphereWithRetry(atmosphereId);
      await setCachedAudio(atmosphereId, generated);
      const decoded = await decodeBlobToBuffer(generated);
      bufferCacheRef.current.set(atmosphereId, decoded);
      return { buffer: decoded, fromCache: false };
    },
    [decodeBlobToBuffer, fetchAtmosphereWithRetry],
  );

  /* ── play a decoded buffer ── */
  const playAtmosphereBuffer = useCallback(
    async (buffer: AudioBuffer) => {
      const unlocked = await unlockAtmosphereAudio();
      if (!unlocked) throw new Error('Tap to unlock sound');

      stopAtmosphere();

      const { context, atmosphereGain } = getSonicLabAudioEngine();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(atmosphereGain);
      atmosphereGain.gain.linearRampToValueAtTime(
        volumeRef.current,
        context.currentTime + 0.1,
      );
      source.start();
      sourceRef.current = source;
    },
    [stopAtmosphere, unlockAtmosphereAudio],
  );

  /* ── public: set atmosphere ── */
  const setAtmosphere = useCallback(
    async (atmosphereId: string) => {
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
        const { buffer, fromCache } =
          await getOrLoadAtmosphereBuffer(atmosphereId);
        await playAtmosphereBuffer(buffer);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isCached: fromCache,
          error: null,
          requiresInteraction: false,
        }));
      } catch (error) {
        console.error('Error loading atmosphere:', error);
        const needsUnlock = isUnlockError(error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          requiresInteraction: needsUnlock,
          error: needsUnlock
            ? 'Tap to unlock sound'
            : 'Unable to load atmosphere',
        }));
      }
    },
    [getOrLoadAtmosphereBuffer, playAtmosphereBuffer, stopAtmosphere],
  );

  /* ── public: set volume ── */
  const setAtmosphereVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    try {
      const { context, atmosphereGain } = getSonicLabAudioEngine();
      atmosphereGain.gain.linearRampToValueAtTime(
        volume,
        context.currentTime + 0.1,
      );
    } catch {
      /* engine not yet created — that's fine */
    }
    setState((prev) => ({ ...prev, atmosphereVolume: volume }));
  }, []);

  /* ── public: prefetch (silent, no UI side-effects) ── */
  const prefetchAtmospheres = useCallback(
    async (atmosphereIds: string[]) => {
      const toPrefetch = atmosphereIds.filter(
        (id) => id !== 'none' && !prefetchedRef.current.has(id),
      );

      await Promise.allSettled(
        toPrefetch.map(async (atmosphereId) => {
          prefetchedRef.current.add(atmosphereId);
          try {
            await getOrLoadAtmosphereBuffer(atmosphereId);
          } catch {
            prefetchedRef.current.delete(atmosphereId);
          }
        }),
      );
    },
    [getOrLoadAtmosphereBuffer],
  );

  /* ── public: reconnect ── */
  const reconnectAtmosphereAudio = useCallback(async () => {
    stopAtmosphere();
    const ok = await unlockAtmosphereAudio();
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: ok ? null : 'Tap to unlock sound',
      requiresInteraction: !ok,
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
