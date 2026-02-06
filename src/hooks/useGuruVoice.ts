import { useState, useCallback, useRef } from 'react';
import { getCachedTTS, setCachedTTS } from '@/lib/audioCache';

// Fallback values to prevent undefined URL issues
const FALLBACK_SUPABASE_URL = "https://pgavnutkwiiovdvbrbcl.supabase.co";
const FALLBACK_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYXZudXRrd2lpb3ZkdmJyYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDgyOTcsImV4cCI6MjA4NTYyNDI5N30.bM1DTGq9Fgn0WPcDlS2hjxRr-bdTDIbLq47RZFIvFbo";

const getSupabaseUrl = () => import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const getSupabaseKey = () => import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_KEY;

// Pre-generated audio URLs in storage
const getPreGeneratedAudioUrl = (mantraId: string) => {
  const baseUrl = getSupabaseUrl();
  return `${baseUrl}/storage/v1/object/public/mantra-audio/full/${mantraId}.mp3`;
};

interface UseGuruVoiceOptions {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
  mantraId?: string; // Optional mantra ID for pre-cached audio
}

export const useGuruVoice = (options: UseGuruVoiceOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isPreGenerated, setIsPreGenerated] = useState(false);
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

  // Try to play pre-generated audio from storage
  const tryPreGeneratedAudio = useCallback(async (mantraId: string): Promise<boolean> => {
    const audioUrl = getPreGeneratedAudioUrl(mantraId);
    
    try {
      // Check if the pre-generated audio exists with a HEAD request
      const checkResponse = await fetch(audioUrl, { method: 'HEAD' });
      
      if (!checkResponse.ok) {
        return false;
      }

      // Pre-generated audio exists, play it directly
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPreGenerated(true);
      setIsCached(true);

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
        const err = new Error('Pre-generated audio playback failed');
        setError(err.message);
        options.onError?.(err);
      };

      await audio.play();
      return true;
    } catch {
      return false;
    }
  }, [options]);

  const speak = useCallback(async (text: string, mantraId?: string) => {
    if (!text.trim()) return;

    // Stop any currently playing audio
    stop();
    setError(null);
    setIsPreGenerated(false);

    // Use mantraId from options if not provided directly
    const effectiveMantraId = mantraId || options.mantraId;

    try {
      // Priority 1: Try pre-generated audio from storage (fastest)
      if (effectiveMantraId) {
        setIsLoading(true);
        const playedPreGenerated = await tryPreGeneratedAudio(effectiveMantraId);
        if (playedPreGenerated) {
          console.log('Playing pre-generated audio from storage');
          setIsLoading(false);
          return;
        }
      }

      // Priority 2: Check IndexedDB cache
      const cachedBlob = await getCachedTTS(text);
      
      if (cachedBlob) {
        console.log('Playing TTS from local cache');
        await playBlob(cachedBlob, true);
        return;
      }

      // Priority 3: Generate via TTS API
      setIsLoading(true);
      
      const supabaseUrl = getSupabaseUrl();
      const supabaseKey = getSupabaseKey();
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
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
  }, [options, stop, playBlob, tryPreGeneratedAudio]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    isCached,
    isPreGenerated,
    error,
  };
};