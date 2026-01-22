import { useRef, useCallback, useEffect } from 'react';

// Creates an Om-like meditative drone using Web Audio API
export function useOmSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.5); // Default volume 50%

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume));
    if (gainNodeRef.current && isPlayingRef.current) {
      // Scale the max gain (0.15) by volume
      gainNodeRef.current.gain.setTargetAtTime(0.15 * volumeRef.current, audioContextRef.current!.currentTime, 0.1);
    }
  }, []);

  const startOm = useCallback(() => {
    if (isPlayingRef.current) return;
    
    // Create audio context on user interaction
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    
    // Resume if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create master gain for fade in/out
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.15 * volumeRef.current, ctx.currentTime + 2); // Fade in over 2 seconds
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Om frequency is typically around 136.1 Hz (the "Om" frequency)
    const omFrequency = 136.1;
    const oscillators: OscillatorNode[] = [];

    // Create multiple oscillators for rich harmonics
    const harmonics = [
      { freq: omFrequency, gain: 0.4, type: 'sine' as OscillatorType },
      { freq: omFrequency * 2, gain: 0.2, type: 'sine' as OscillatorType },
      { freq: omFrequency * 3, gain: 0.1, type: 'sine' as OscillatorType },
      { freq: omFrequency * 0.5, gain: 0.3, type: 'sine' as OscillatorType },
      { freq: omFrequency * 1.5, gain: 0.15, type: 'triangle' as OscillatorType },
    ];

    harmonics.forEach(({ freq, gain, type }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Add subtle vibrato
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(4 + Math.random() * 2, ctx.currentTime); // 4-6 Hz vibrato
      vibratoGain.gain.setValueAtTime(freq * 0.005, ctx.currentTime); // Subtle pitch variation
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start();
      oscillators.push(vibrato);
      
      oscGain.gain.setValueAtTime(gain, ctx.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscillators.push(osc);
    });

    // Add low-frequency modulation for breathing effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // Very slow modulation
    lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    oscillators.push(lfo);

    oscillatorsRef.current = oscillators;
    isPlayingRef.current = true;
  }, []);

  const stopOm = useCallback(() => {
    if (!isPlayingRef.current || !gainNodeRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current;
    
    // Fade out over 2 seconds
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    
    // Stop all oscillators after fade out
    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors from already stopped oscillators
        }
      });
      oscillatorsRef.current = [];
      isPlayingRef.current = false;
    }, 2100);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore
        }
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { startOm, stopOm, setVolume };
}
