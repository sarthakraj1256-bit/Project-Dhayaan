import { useState, useRef, useCallback, useEffect } from 'react';
import { ImmersiveTemple } from '@/data/immersiveTemples';
import { getCachedAudio, setCachedAudio } from '@/lib/audioCache';

type AmbienceType = 'main_hall' | 'sanctum' | 'corridor' | 'courtyard' | 'entrance';

interface DevotionalAudioState {
  isPlaying: boolean;
  currentTrack: 'aarti' | 'kirtan' | 'ambience' | 'chanting' | null;
  volume: number;
  bellPlaying: boolean;
}

// Generate a cache key from prompt
const generateCacheKey = (type: string, prompt: string): string => {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${type}_${hash}_${prompt.length}`;
};

export const useDevotionalAudio = (temple: ImmersiveTemple | null) => {
  const [state, setState] = useState<DevotionalAudioState>({
    isPlaying: false,
    currentTrack: null,
    volume: 0.7,
    bellPlaying: false
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bellSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = state.volume;
    }
    return audioContextRef.current;
  }, [state.volume]);

  // Generate audio using ElevenLabs SFX API
  const generateAudio = useCallback(async (prompt: string, duration: number = 10): Promise<ArrayBuffer | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables not configured for audio generation');
      return null;
    }

    const cacheKey = generateCacheKey('sfx', prompt);
    
    // Check cache first
    const cached = await getCachedAudio(cacheKey);
    if (cached) {
      return await cached.arrayBuffer();
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-sfx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ prompt, duration })
        }
      );

      if (!response.ok) {
        // Don't log as error for missing edge function - it's expected during development
        if (response.status === 404) {
          console.info('Audio generation edge function not deployed yet');
          return null;
        }
        // Handle quota/payment errors gracefully
        if (response.status === 402 || response.status === 429) {
          console.info('Audio generation credits exhausted or rate limited');
          return null;
        }
        const errorText = await response.text().catch(() => '');
        if (errorText.includes('quota_exceeded') || errorText.includes('credits exhausted')) {
          console.info('Audio generation credits exhausted');
          return null;
        }
        throw new Error(`Audio generation failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Cache the audio
      await setCachedAudio(cacheKey, audioBlob);
      
      return await audioBlob.arrayBuffer();
    } catch (error) {
      // Silently handle network errors to avoid console spam
      console.info('Audio generation unavailable:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }, []);

  // Play audio buffer
  const playAudioBuffer = useCallback(async (buffer: ArrayBuffer, loop: boolean = true): Promise<AudioBufferSourceNode | null> => {
    const ctx = initAudioContext();
    
    try {
      const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = loop;
      source.connect(gainNodeRef.current!);
      source.start(0);
      return source;
    } catch (error) {
      console.error('Error playing audio:', error);
      return null;
    }
  }, [initAudioContext]);

  // Play temple ambience
  const playAmbience = useCallback(async (type: AmbienceType) => {
    if (!temple) return;

    // Stop current track
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }

    setState(prev => ({ ...prev, isPlaying: true, currentTrack: 'ambience' }));

    // Generate ambience based on zone type
    let prompt = temple.audio.ambienceTrack;
    
    switch (type) {
      case 'sanctum':
        prompt = `${temple.audio.ambienceTrack}, sacred inner sanctum with incense and soft prayers`;
        break;
      case 'corridor':
        prompt = `${temple.audio.ambienceTrack}, temple corridor with echoing footsteps and distant bells`;
        break;
      case 'entrance':
        prompt = `${temple.audio.ambienceTrack}, temple entrance with crowd murmur and bells`;
        break;
      case 'courtyard':
        prompt = `${temple.audio.ambienceTrack}, open temple courtyard with birds and breeze`;
        break;
    }

    const buffer = await generateAudio(prompt, 15);
    if (buffer) {
      currentSourceRef.current = await playAudioBuffer(buffer, true);
    }
  }, [temple, generateAudio, playAudioBuffer]);

  // Play Aarti
  const playAarti = useCallback(async () => {
    if (!temple) return;

    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }

    setState(prev => ({ ...prev, isPlaying: true, currentTrack: 'aarti' }));

    const buffer = await generateAudio(temple.audio.aartiTrack, 20);
    if (buffer) {
      currentSourceRef.current = await playAudioBuffer(buffer, true);
    }
  }, [temple, generateAudio, playAudioBuffer]);

  // Play Kirtan
  const playKirtan = useCallback(async () => {
    if (!temple) return;

    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }

    setState(prev => ({ ...prev, isPlaying: true, currentTrack: 'kirtan' }));

    const buffer = await generateAudio(temple.audio.kirtanTrack, 20);
    if (buffer) {
      currentSourceRef.current = await playAudioBuffer(buffer, true);
    }
  }, [temple, generateAudio, playAudioBuffer]);

  // Play chanting
  const playChanting = useCallback(async () => {
    if (!temple) return;

    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }

    setState(prev => ({ ...prev, isPlaying: true, currentTrack: 'chanting' }));

    const prompt = `Devotional chanting: ${temple.audio.chantingTrack}, meditative and peaceful`;
    const buffer = await generateAudio(prompt, 20);
    if (buffer) {
      currentSourceRef.current = await playAudioBuffer(buffer, true);
    }
  }, [temple, generateAudio, playAudioBuffer]);

  // Ring bell
  const ringBell = useCallback(async () => {
    if (!temple) return;

    setState(prev => ({ ...prev, bellPlaying: true }));

    const buffer = await generateAudio(temple.audio.bellSound, 5);
    if (buffer) {
      bellSourceRef.current = await playAudioBuffer(buffer, false);
      bellSourceRef.current?.addEventListener('ended', () => {
        setState(prev => ({ ...prev, bellPlaying: false }));
      });
    }
  }, [temple, generateAudio, playAudioBuffer]);

  // Stop all audio
  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false, currentTrack: null }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }
      if (bellSourceRef.current) {
        bellSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    playAmbience,
    playAarti,
    playKirtan,
    playChanting,
    ringBell,
    stopAudio,
    setVolume
  };
};
