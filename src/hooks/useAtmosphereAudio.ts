import { useState, useRef, useCallback } from 'react';
import {
  getSonicLabAudioEngine,
  resumeSonicLabAudioContext,
} from '@/lib/sonicLabAudioEngine';
import { atmosphereFactories, AtmosphereNodes } from '@/lib/proceduralAtmosphere';

interface AtmosphereState {
  currentAtmosphere: string;
  atmosphereVolume: number;
  isLoading: boolean;
  isCached: boolean;
  error: string | null;
  requiresInteraction: boolean;
}

export const useAtmosphereAudio = () => {
  const [state, setState] = useState<AtmosphereState>({
    currentAtmosphere: 'none',
    atmosphereVolume: 0.2,
    isLoading: false,
    isCached: false,
    error: null,
    requiresInteraction: false,
  });

  const activeNodesRef = useRef<AtmosphereNodes | null>(null);
  const volumeRef = useRef(0.2);

  /* ── stop ── */
  const stopAtmosphere = useCallback(() => {
    if (activeNodesRef.current) {
      try {
        activeNodesRef.current.stop();
      } catch { /* no-op */ }
      activeNodesRef.current = null;
    }
  }, []);

  /* ── unlock ── */
  const unlockAtmosphereAudio = useCallback(async () => {
    const ok = await resumeSonicLabAudioContext();
    setState((prev) => ({
      ...prev,
      requiresInteraction: !ok,
      error: ok ? null : prev.error,
    }));
    return ok;
  }, []);

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
        const unlocked = await unlockAtmosphereAudio();
        if (!unlocked) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            requiresInteraction: true,
            error: 'Tap to unlock sound',
          }));
          return;
        }

        // Stop previous
        stopAtmosphere();

        const factory = atmosphereFactories[atmosphereId];
        if (!factory) {
          setState((prev) => ({ ...prev, isLoading: false, error: 'Unknown atmosphere' }));
          return;
        }

        const { context, atmosphereGain } = getSonicLabAudioEngine();

        // Smooth fade in
        atmosphereGain.gain.linearRampToValueAtTime(
          volumeRef.current,
          context.currentTime + 0.15,
        );

        const nodes = factory(context, atmosphereGain);
        activeNodesRef.current = nodes;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isCached: true, // procedural = always "cached"
          error: null,
          requiresInteraction: false,
        }));
      } catch (error) {
        console.error('Error starting atmosphere:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Unable to start atmosphere',
        }));
      }
    },
    [stopAtmosphere, unlockAtmosphereAudio],
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
    } catch { /* engine not yet created */ }
    setState((prev) => ({ ...prev, atmosphereVolume: volume }));
  }, []);

  /* ── public: prefetch (no-op for procedural) ── */
  const prefetchAtmospheres = useCallback(async (_ids: string[]) => {}, []);

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
