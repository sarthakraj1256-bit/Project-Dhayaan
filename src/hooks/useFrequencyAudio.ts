import { useState, useRef, useCallback, useEffect } from 'react';
import { atmospheres } from '@/data/soundLibrary';
import {
  getSonicLabAudioEngine,
  hasSonicLabAudioEngine,
  resetSonicLabAudioEngineGains,
  resumeSonicLabAudioContext,
} from '@/lib/sonicLabAudioEngine';
import { useAtmosphereAudio } from './useAtmosphereAudio';

interface AudioState {
  isPlaying: boolean;
  currentFrequency: number | null;
  frequencyVolume: number;
  isAudioUnlocked: boolean;
}

export const useFrequencyAudio = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentFrequency: null,
    frequencyVolume: 0.3,
    isAudioUnlocked: false,
  });

  const {
    atmosphereState,
    setAtmosphere,
    setAtmosphereVolume,
    stopAtmosphere,
    unlockAtmosphereAudio,
    reconnectAtmosphereAudio,
    prefetchAtmospheres,
  } = useAtmosphereAudio();

  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const gainNode2Ref = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const prefetchScheduledRef = useRef(false);

  /* ── Unlock the shared AudioContext ── */
  const ensureAudioUnlocked = useCallback(async () => {
    const ok = await resumeSonicLabAudioContext();
    if (!ok) {
      setAudioState((prev) => ({ ...prev, isAudioUnlocked: false }));
      return false;
    }
    await unlockAtmosphereAudio();
    setAudioState((prev) => ({ ...prev, isAudioUnlocked: true }));
    return true;
  }, [unlockAtmosphereAudio]);

  /*
   * Prefetch atmosphere buffers AFTER the component has fully mounted
   * and React has committed. Using setTimeout(0) pushes this out of
   * React's commit phase so any state updates from async callbacks
   * won't corrupt the fiber queue.
   */
  useEffect(() => {
    if (prefetchScheduledRef.current) return;
    prefetchScheduledRef.current = true;

    const timer = setTimeout(() => {
      void prefetchAtmospheres(atmospheres.map((atm) => atm.id));
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Unlock on first user interaction ── */
  useEffect(() => {
    let hasTriggered = false;

    const unlockOnFirstInteraction = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      // Schedule outside the event handler to avoid React queue issues
      setTimeout(() => void ensureAudioUnlocked(), 0);
    };

    document.addEventListener('pointerdown', unlockOnFirstInteraction, {
      passive: true,
    });
    document.addEventListener('keydown', unlockOnFirstInteraction, {
      passive: true,
    });

    return () => {
      document.removeEventListener('pointerdown', unlockOnFirstInteraction);
      document.removeEventListener('keydown', unlockOnFirstInteraction);
    };
  }, [ensureAudioUnlocked]);

  /* ── Play a frequency ── */
  const playFrequency = useCallback(
    async (frequency: number) => {
      const unlocked = await ensureAudioUnlocked();
      if (!unlocked) return;

      const { context, frequencyGain } = getSonicLabAudioEngine();
      const BINAURAL_THRESHOLD = 100;

      // Cross-fade out old oscillator
      if (oscillatorRef.current && gainNodeRef.current) {
        const oldOsc = oscillatorRef.current;
        const oldOsc2 = oscillator2Ref.current;
        const oldGain = gainNodeRef.current;
        const oldGain2 = gainNode2Ref.current;
        const oldLfo = lfoRef.current;

        oldGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
        oldGain2?.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);

        setTimeout(() => {
          try { oldOsc.stop(); oldOsc.disconnect(); } catch { /* */ }
          try { oldOsc2?.stop(); oldOsc2?.disconnect(); } catch { /* */ }
          try { oldLfo?.stop(); oldLfo?.disconnect(); } catch { /* */ }
        }, 520);
      }

      if (frequency < BINAURAL_THRESHOLD) {
        const baseCarrier = 200;
        const oscLeft = context.createOscillator();
        const oscRight = context.createOscillator();
        const gainLeft = context.createGain();
        const gainRight = context.createGain();
        const panLeft = context.createStereoPanner();
        const panRight = context.createStereoPanner();

        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(baseCarrier, context.currentTime);
        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(baseCarrier + frequency, context.currentTime);

        panLeft.pan.setValueAtTime(-1, context.currentTime);
        panRight.pan.setValueAtTime(1, context.currentTime);

        gainLeft.gain.setValueAtTime(0, context.currentTime);
        gainLeft.gain.linearRampToValueAtTime(audioState.frequencyVolume, context.currentTime + 0.5);
        gainRight.gain.setValueAtTime(0, context.currentTime);
        gainRight.gain.linearRampToValueAtTime(audioState.frequencyVolume, context.currentTime + 0.5);

        oscLeft.connect(gainLeft).connect(panLeft).connect(frequencyGain);
        oscRight.connect(gainRight).connect(panRight).connect(frequencyGain);

        oscLeft.start();
        oscRight.start();

        oscillatorRef.current = oscLeft;
        oscillator2Ref.current = oscRight;
        gainNodeRef.current = gainLeft;
        gainNode2Ref.current = gainRight;
        lfoRef.current = null;
        lfoGainRef.current = null;
      } else {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, context.currentTime);
        lfoGain.gain.setValueAtTime(frequency * 0.01, context.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(audioState.frequencyVolume, context.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(frequencyGain);

        oscillator.start();
        lfo.start();

        oscillatorRef.current = oscillator;
        oscillator2Ref.current = null;
        gainNodeRef.current = gainNode;
        gainNode2Ref.current = null;
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;
      }

      setAudioState((prev) => ({
        ...prev,
        isPlaying: true,
        currentFrequency: frequency,
        isAudioUnlocked: true,
      }));
    },
    [audioState.frequencyVolume, ensureAudioUnlocked],
  );

  /* ── Stop frequency ── */
  const stopFrequency = useCallback(() => {
    if (hasSonicLabAudioEngine() && gainNodeRef.current) {
      const { context } = getSonicLabAudioEngine();
      gainNodeRef.current.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);
      gainNode2Ref.current?.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);

      setTimeout(() => {
        try { oscillatorRef.current?.stop(); oscillatorRef.current?.disconnect(); } catch { /* */ }
        try { oscillator2Ref.current?.stop(); oscillator2Ref.current?.disconnect(); } catch { /* */ }
        try { lfoRef.current?.stop(); lfoRef.current?.disconnect(); } catch { /* */ }
        oscillatorRef.current = null;
        oscillator2Ref.current = null;
        lfoRef.current = null;
      }, 300);
    }

    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      currentFrequency: null,
    }));
    stopAtmosphere();
  }, [stopAtmosphere]);

  /* ── Set frequency volume ── */
  const setFrequencyVolume = useCallback((volume: number) => {
    if (hasSonicLabAudioEngine()) {
      const { context, frequencyGain } = getSonicLabAudioEngine();
      frequencyGain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);

      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);
        gainNode2Ref.current?.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);
      }
    }
    setAudioState((prev) => ({ ...prev, frequencyVolume: volume }));
  }, []);

  /* ── Reconnect everything ── */
  const reconnectAudio = useCallback(async () => {
    stopFrequency();
    resetSonicLabAudioEngineGains();
    await reconnectAtmosphereAudio();
    await ensureAudioUnlocked();
  }, [ensureAudioUnlocked, reconnectAtmosphereAudio, stopFrequency]);

  /* ── Analyser access (lazy — only after engine exists) ── */
  const getAnalyser = useCallback(() => {
    return hasSonicLabAudioEngine()
      ? getSonicLabAudioEngine().analyser
      : null;
  }, []);

  const getFrequencyData = useCallback(() => {
    if (!hasSonicLabAudioEngine()) return new Uint8Array(0);
    const analyser = getSonicLabAudioEngine().analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      try { oscillatorRef.current?.stop(); oscillatorRef.current?.disconnect(); } catch { /* */ }
      try { oscillator2Ref.current?.stop(); oscillator2Ref.current?.disconnect(); } catch { /* */ }
      try { lfoRef.current?.stop(); lfoRef.current?.disconnect(); } catch { /* */ }
    };
  }, []);

  /* ── Combined state ── */
  const combinedState = {
    ...audioState,
    atmosphereVolume: atmosphereState.atmosphereVolume,
    currentAtmosphere: atmosphereState.currentAtmosphere,
    atmosphereLoading: atmosphereState.isLoading,
    atmosphereCached: atmosphereState.isCached,
    atmosphereError: atmosphereState.error,
    atmosphereNeedsInteraction: atmosphereState.requiresInteraction,
  };

  return {
    audioState: combinedState,
    playFrequency,
    stopFrequency,
    setFrequencyVolume,
    setAtmosphere,
    setAtmosphereVolume,
    reconnectAudio,
    getAnalyser,
    getFrequencyData,
  };
};
