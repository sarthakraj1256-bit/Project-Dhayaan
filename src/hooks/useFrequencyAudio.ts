 import { useState, useRef, useCallback, useEffect } from 'react';
 import { useAtmosphereAudio } from './useAtmosphereAudio';
 
 interface AudioState {
   isPlaying: boolean;
   currentFrequency: number | null;
   frequencyVolume: number;
 }
 
 export const useFrequencyAudio = () => {
   const [audioState, setAudioState] = useState<AudioState>({
     isPlaying: false,
     currentFrequency: null,
     frequencyVolume: 0.3,
   });
 
   // Use the dedicated atmosphere audio hook
   const {
     atmosphereState,
     setAtmosphere,
     setAtmosphereVolume,
     stopAtmosphere,
   } = useAtmosphereAudio();
 
   const audioContextRef = useRef<AudioContext | null>(null);
   const oscillatorRef = useRef<OscillatorNode | null>(null);
   const gainNodeRef = useRef<GainNode | null>(null);
   const lfoRef = useRef<OscillatorNode | null>(null);
   const lfoGainRef = useRef<GainNode | null>(null);
   const analyserRef = useRef<AnalyserNode | null>(null);
 
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
 
   // Play a frequency
   const playFrequency = useCallback((frequency: number) => {
     const ctx = initAudioContext();
     
     // Stop existing oscillator
     if (oscillatorRef.current) {
       oscillatorRef.current.stop();
       oscillatorRef.current.disconnect();
     }
     if (lfoRef.current) {
       lfoRef.current.stop();
       lfoRef.current.disconnect();
     }
 
     // Create main oscillator
     const oscillator = ctx.createOscillator();
     const gainNode = ctx.createGain();
     
     // Create LFO for subtle vibrato
     const lfo = ctx.createOscillator();
     const lfoGain = ctx.createGain();
     
     // Configure oscillator
     oscillator.type = 'sine';
     oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
     
     // Configure LFO for subtle pulsing
     lfo.type = 'sine';
     lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // Slow pulse
     lfoGain.gain.setValueAtTime(frequency * 0.01, ctx.currentTime); // Subtle vibrato
     
     // Connect LFO to main oscillator frequency
     lfo.connect(lfoGain);
     lfoGain.connect(oscillator.frequency);
     
     // Set volume with fade in
     gainNode.gain.setValueAtTime(0, ctx.currentTime);
     gainNode.gain.linearRampToValueAtTime(audioState.frequencyVolume, ctx.currentTime + 0.5);
     
     // Connect to analyser and output
     oscillator.connect(gainNode);
     gainNode.connect(analyserRef.current!);
     
     // Start oscillators
     oscillator.start();
     lfo.start();
     
     // Store refs
     oscillatorRef.current = oscillator;
     gainNodeRef.current = gainNode;
     lfoRef.current = lfo;
     lfoGainRef.current = lfoGain;
     
     setAudioState((prev) => ({
       ...prev,
       isPlaying: true,
       currentFrequency: frequency,
     }));
   }, [initAudioContext, audioState.frequencyVolume]);
 
   // Stop frequency
   const stopFrequency = useCallback(() => {
     if (gainNodeRef.current && audioContextRef.current) {
       const ctx = audioContextRef.current;
       gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
       
       setTimeout(() => {
         if (oscillatorRef.current) {
           oscillatorRef.current.stop();
           oscillatorRef.current.disconnect();
           oscillatorRef.current = null;
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
         audioContextRef.current.currentTime + 0.1
       );
     }
     setAudioState((prev) => ({ ...prev, frequencyVolume: volume }));
   }, []);
 
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
   };
 
   return {
     audioState: combinedState,
     playFrequency,
     stopFrequency,
     setFrequencyVolume,
     setAtmosphere,
     setAtmosphereVolume,
     getAnalyser,
     getFrequencyData,
   };
 };