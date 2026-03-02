import { useState, useRef, useCallback, useEffect } from 'react';
import { atmospheres } from '@/data/soundLibrary';
import {
  getSonicLabAudioEngine,
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

  const ensureAudioUnlocked = useCallback(async () => {
    const unlocked = await resumeSonicLabAudioContext(true);
    if (!unlocked) {
      setAudioState((prev) => ({ ...prev, isAudioUnlocked: false }));
      return false;
    }

    await unlockAtmosphereAudio();
    setAudioState((prev) => ({ ...prev, isAudioUnlocked: true }));
    return true;
  }, [unlockAtmosphereAudio]);

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

  const playFrequency = useCallback(
    async (frequency: number) => {
      const unlocked = await ensureAudioUnlocked();
      if (!unlocked) return;

      const { context, frequencyGain } = getSonicLabAudioEngine();
      const BINAURAL_THRESHOLD = 100;

      if (oscillatorRef.current && gainNodeRef.current) {
        const oldOsc = oscillatorRef.current;
        const oldOsc2 = oscillator2Ref.current;
        const oldGain = gainNodeRef.current;
        const oldGain2 = gainNode2Ref.current;
        const oldLfo = lfoRef.current;

        oldGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
        oldGain2?.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);

        setTimeout(() => {
          try {
            oldOsc.stop();
            oldOsc.disconnect();
          } catch {
            // no-op
          }
          try {
            oldOsc2?.stop();
            oldOsc2?.disconnect();
          } catch {
            // no-op
          }
          try {
            oldLfo?.stop();
            oldLfo?.disconnect();
          } catch {
            // no-op
          }
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

  const stopFrequency = useCallback(() => {
    const { context } = getSonicLabAudioEngine();

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);
      gainNode2Ref.current?.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);

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

  const setFrequencyVolume = useCallback((volume: number) => {
    const { context, frequencyGain } = getSonicLabAudioEngine();
    frequencyGain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);
      gainNode2Ref.current?.gain.linearRampToValueAtTime(volume, context.currentTime + 0.1);
    }

    setAudioState((prev) => ({ ...prev, frequencyVolume: volume }));
  }, []);

  const reconnectAudio = useCallback(async () => {
    stopFrequency();
    resetSonicLabAudioEngineGains();
    await reconnectAtmosphereAudio();
    await ensureAudioUnlocked();
  }, [ensureAudioUnlocked, reconnectAtmosphereAudio, stopFrequency]);

  const getAnalyser = useCallback(() => {
    return getSonicLabAudioEngine().analyser;
  }, []);

  const getFrequencyData = useCallback(() => {
    const analyser = getSonicLabAudioEngine().analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

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
    };
  }, []);

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
