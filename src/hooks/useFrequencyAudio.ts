import { useState, useRef, useCallback, useEffect } from 'react';
import { atmospheres } from '@/data/soundLibrary';
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

  // Use the dedicated atmosphere audio hook
  const {
    atmosphereState,
    setAtmosphere,
    setAtmosphereVolume,
    stopAtmosphere,
    unlockAtmosphereAudio,
    reconnectAtmosphereAudio,
    prefetchAtmospheres,
  } = useAtmosphereAudio();

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null); // For binaural beats
  const gainNodeRef = useRef<GainNode | null>(null); // Frequency layer gain node
  const gainNode2Ref = useRef<GainNode | null>(null); // Binaural second ear gain node
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pannerLeftRef = useRef<StereoPannerNode | null>(null);
  const pannerRightRef = useRef<StereoPannerNode | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      // Create analyser for visualizations
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  const ensureAudioUnlocked = useCallback(async () => {
    try {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      await unlockAtmosphereAudio();

      setAudioState((prev) => ({ ...prev, isAudioUnlocked: true }));
      return true;
    } catch (error) {
      console.error('Failed to unlock audio context:', error);
      setAudioState((prev) => ({ ...prev, isAudioUnlocked: false }));
      return false;
    }
  }, [initAudioContext, unlockAtmosphereAudio]);

  // Global interaction listener to unlock audio for both layers
  useEffect(() => {
    let hasTriggered = false;

    const unlockOnFirstInteraction = async () => {
      if (hasTriggered) return;
      hasTriggered = true;

      const unlocked = await ensureAudioUnlocked();
      if (unlocked) {
        void prefetchAtmospheres(atmospheres.map((atm) => atm.id));
      }
    };

    document.addEventListener('pointerdown', unlockOnFirstInteraction, { passive: true });
    document.addEventListener('keydown', unlockOnFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', unlockOnFirstInteraction);
      document.removeEventListener('keydown', unlockOnFirstInteraction);
    };
  }, [ensureAudioUnlocked, prefetchAtmospheres]);

  // Play a frequency
  const playFrequency = useCallback(async (frequency: number) => {
    const unlocked = await ensureAudioUnlocked();
    if (!unlocked) {
      return;
    }

    const ctx = initAudioContext();
    const BINAURAL_THRESHOLD = 100; // Use binaural beats for frequencies below 100Hz

    // Cross-fade: fade out old oscillator over 400ms then clean up
    if (oscillatorRef.current && gainNodeRef.current) {
      const oldOsc = oscillatorRef.current;
      const oldOsc2 = oscillator2Ref.current;
      const oldGain = gainNodeRef.current;
      const oldGain2 = gainNode2Ref.current;
      const oldLfo = lfoRef.current;
      oldGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      oldGain2?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        try { oldOsc.stop(); oldOsc.disconnect(); } catch { /* no-op */ }
        try { oldOsc2?.stop(); oldOsc2?.disconnect(); } catch { /* no-op */ }
        try { oldLfo?.stop(); oldLfo?.disconnect(); } catch { /* no-op */ }
      }, 520);
    }

    const isBinaural = frequency < BINAURAL_THRESHOLD;

    if (isBinaural) {
      // Binaural beat: play base carrier in left ear, base + target Hz in right ear
      const baseCarrier = 200; // Audible carrier frequency
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const gainLeft = ctx.createGain();
      const gainRight = ctx.createGain();
      const panLeft = ctx.createStereoPanner();
      const panRight = ctx.createStereoPanner();

      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(baseCarrier, ctx.currentTime);
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(baseCarrier + frequency, ctx.currentTime);

      panLeft.pan.setValueAtTime(-1, ctx.currentTime);
      panRight.pan.setValueAtTime(1, ctx.currentTime);

      gainLeft.gain.setValueAtTime(0, ctx.currentTime);
      gainLeft.gain.linearRampToValueAtTime(audioState.frequencyVolume, ctx.currentTime + 0.5);
      gainRight.gain.setValueAtTime(0, ctx.currentTime);
      gainRight.gain.linearRampToValueAtTime(audioState.frequencyVolume, ctx.currentTime + 0.5);

      oscLeft.connect(gainLeft).connect(panLeft).connect(analyserRef.current!);
      oscRight.connect(gainRight).connect(panRight).connect(analyserRef.current!);

      oscLeft.start();
      oscRight.start();

      oscillatorRef.current = oscLeft;
      oscillator2Ref.current = oscRight;
      gainNodeRef.current = gainLeft;
      gainNode2Ref.current = gainRight;
      pannerLeftRef.current = panLeft;
      pannerRightRef.current = panRight;
      lfoRef.current = null;
      lfoGainRef.current = null;
    } else {
      // Standard single oscillator with LFO vibrato
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(frequency * 0.01, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(audioState.frequencyVolume, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(analyserRef.current!);

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
  }, [initAudioContext, audioState.frequencyVolume, ensureAudioUnlocked]);

  // Stop frequency
  const stopFrequency = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      gainNode2Ref.current?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
        if (oscillator2Ref.current) {
          oscillator2Ref.current.stop();
          oscillator2Ref.current.disconnect();
          oscillator2Ref.current = null;
        }
        if (lfoRef.current) {
          lfoRef.current.stop();
          lfoRef.current.disconnect();
          lfoRef.current = null;
        }
      }, 300);
    }

    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      currentFrequency: null,
    }));
    stopAtmosphere();
  }, [stopAtmosphere]);

  // Update frequency volume
  const setFrequencyVolume = useCallback((volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 0.1,
      );
      gainNode2Ref.current?.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 0.1,
      );
    }
    setAudioState((prev) => ({ ...prev, frequencyVolume: volume }));
  }, []);

  const reconnectAudio = useCallback(async () => {
    stopFrequency();

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {
        // no-op
      });
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    await reconnectAtmosphereAudio();
    await ensureAudioUnlocked();
  }, [ensureAudioUnlocked, reconnectAtmosphereAudio, stopFrequency]);

  // Get analyser for visualizations
  const getAnalyser = useCallback(() => {
    return analyserRef.current;
  }, []);

  // Get frequency data for visualizations
  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return new Uint8Array(0);
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (oscillator2Ref.current) {
        oscillator2Ref.current.stop();
        oscillator2Ref.current.disconnect();
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Combine audio state with atmosphere state for components
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