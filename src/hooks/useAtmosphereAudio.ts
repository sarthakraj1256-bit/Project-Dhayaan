import { useState, useRef, useCallback } from 'react';
import { getCachedAudio, setCachedAudio } from '@/lib/audioCache';
import { supabase } from '@/integrations/backend/client';
import { toast } from '@/hooks/use-toast';
import { getSonicLabAudioEngine, resumeSonicLabAudioContext } from '@/lib/sonicLabAudioEngine';

// Hardcoded fallbacks matching backend/client.ts — env vars can be undefined in preview
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isUnlockError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return error.name === 'NotAllowedError' || msg.includes('interrupted') || msg.includes('gesture');
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

  const stopAtmosphere = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch {
        // no-op
      }
      sourceRef.current = null;
    }
  }, []);

  const unlockAtmosphereAudio = useCallback(async () => {
    const unlocked = await resumeSonicLabAudioContext(true);
    if (!unlocked) {
      setState((prev) => ({
        ...prev,
        requiresInteraction: true,
        error: 'Tap to unlock sound',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, requiresInteraction: false, error: null }));
    return true;
  }, []);

  const fetchAtmosphereWithRetry = useCallback(async (atmosphereId: string): Promise<Blob> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-sfx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ atmosphereId }),
        });

        if (!response.ok) {
          const raw = await response.text().catch(() => '');
          const errorMessage = raw || `HTTP ${response.status}`;
          throw new Error(errorMessage);
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

  const decodeBlobToBuffer = useCallback(async (blob: Blob) => {
    const { context } = getSonicLabAudioEngine();
    const bytes = await blob.arrayBuffer();
    // decodeAudioData may detach the buffer in some browsers; pass a clone for safety
    return context.decodeAudioData(bytes.slice(0));
  }, []);

  const getOrLoadAtmosphereBuffer = useCallback(
    async (atmosphereId: string): Promise<{ buffer: AudioBuffer; fromCache: boolean }> => {
      const memoryBuffer = bufferCacheRef.current.get(atmosphereId);
      if (memoryBuffer) {
        return { buffer: memoryBuffer, fromCache: true };
      }

      const cachedBlob = await getCachedAudio(atmosphereId);
      if (cachedBlob) {
        const decoded = await decodeBlobToBuffer(cachedBlob);
        bufferCacheRef.current.set(atmosphereId, decoded);
        return { buffer: decoded, fromCache: true };
      }

      const generated = await fetchAtmosphereWithRetry(atmosphereId);
      await setCachedAudio(atmosphereId, generated);
      const decoded = await decodeBlobToBuffer(generated);
      bufferCacheRef.current.set(atmosphereId, decoded);
      return { buffer: decoded, fromCache: false };
    },
    [decodeBlobToBuffer, fetchAtmosphereWithRetry],
  );

  const playAtmosphereBuffer = useCallback(
    async (buffer: AudioBuffer) => {
      const unlocked = await unlockAtmosphereAudio();
      if (!unlocked) {
        throw new Error('Tap to unlock sound');
      }

      stopAtmosphere();

      const { context, atmosphereGain } = getSonicLabAudioEngine();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(atmosphereGain);
      atmosphereGain.gain.linearRampToValueAtTime(volumeRef.current, context.currentTime + 0.1);
      source.start();
      sourceRef.current = source;
    },
    [stopAtmosphere, unlockAtmosphereAudio],
  );

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
        const { buffer, fromCache } = await getOrLoadAtmosphereBuffer(atmosphereId);
        await playAtmosphereBuffer(buffer);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isCached: fromCache,
          error: null,
          requiresInteraction: false,
        }));
      } catch (error) {
        const shouldShowUnlockToast = isUnlockError(error);
        if (shouldShowUnlockToast) {
          toast({
            title: 'Tap to unlock sound',
            description: 'Tap the atmosphere again to continue playback.',
          });
        }

        console.error('Error loading atmosphere:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          requiresInteraction: shouldShowUnlockToast,
          error: shouldShowUnlockToast ? 'Tap to unlock sound' : 'Unable to load atmosphere',
        }));
      }
    },
    [getOrLoadAtmosphereBuffer, playAtmosphereBuffer, stopAtmosphere],
  );

  const setAtmosphereVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    const { context, atmosphereGain } = getSonicLabAudioEngine();
    atmosphereGain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);
    setState((prev) => ({ ...prev, atmosphereVolume: volume }));
  }, []);

  const prefetchAtmospheres = useCallback(
    async (atmosphereIds: string[]) => {
      await Promise.all(
        atmosphereIds
          .filter((id) => id !== 'none' && !prefetchedRef.current.has(id))
          .map(async (atmosphereId) => {
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

  const reconnectAtmosphereAudio = useCallback(async () => {
    stopAtmosphere();
    const unlocked = await unlockAtmosphereAudio();
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: unlocked ? null : 'Tap to unlock sound',
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
