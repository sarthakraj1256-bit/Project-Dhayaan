import { useState, useCallback, useRef } from 'react';
import { getCachedTTS, setCachedTTS } from '@/lib/audioCache';

interface UseGuruVoiceOptions {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

export const useGuruVoice = (options: UseGuruVoiceOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const playBlob = useCallback(async (blob: Blob, fromCache: boolean) => {
    // Clean up previous URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    
    const audioUrl = URL.createObjectURL(blob);
    audioUrlRef.current = audioUrl;
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsCached(fromCache);

    audio.onplay = () => {
      setIsPlaying(true);
      options.onPlayStart?.();
    };

    audio.onended = () => {
      setIsPlaying(false);
      options.onPlayEnd?.();
    };

    audio.onerror = () => {
      setIsPlaying(false);
      const err = new Error('Audio playback failed');
      setError(err.message);
      options.onError?.(err);
    };

    await audio.play();
  }, [options]);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any currently playing audio
    stop();
    setError(null);

    try {
      // Check cache first
      const cachedBlob = await getCachedTTS(text);
      
      if (cachedBlob) {
        console.log('Playing TTS from cache');
        await playBlob(cachedBlob, true);
        return;
      }

      // Not cached, fetch from API
      setIsLoading(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Cache the audio for future use
      await setCachedTTS(text, audioBlob);
      console.log('TTS cached for future use');
      
      await playBlob(audioBlob, false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('TTS failed');
      console.error('Guru voice error:', error);
      setError(error.message);
      options.onError?.(error);
      
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.7;
        utterance.pitch = 0.9;
        utterance.onstart = () => {
          setIsPlaying(true);
          options.onPlayStart?.();
        };
        utterance.onend = () => {
          setIsPlaying(false);
          options.onPlayEnd?.();
        };
        speechSynthesis.speak(utterance);
      }
    } finally {
      setIsLoading(false);
    }
  }, [options, stop, playBlob]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    isCached,
    error,
  };
};