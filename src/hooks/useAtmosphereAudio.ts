import { useState, useRef, useCallback, useEffect } from 'react';
import { getCachedAudio, setCachedAudio } from '@/lib/audioCache';
import { supabase } from '@/integrations/backend/client';
 
 interface AtmosphereState {
   currentAtmosphere: string;
   atmosphereVolume: number;
   isLoading: boolean;
   isCached: boolean;
   error: string | null;
 }
 
 export const useAtmosphereAudio = () => {
   const [state, setState] = useState<AtmosphereState>({
     currentAtmosphere: 'none',
     atmosphereVolume: 0.2,
     isLoading: false,
     isCached: false,
     error: null,
   });
 
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const objectUrlRef = useRef<string | null>(null);
 
   // Cleanup object URL on unmount
   useEffect(() => {
     return () => {
       if (objectUrlRef.current) {
         URL.revokeObjectURL(objectUrlRef.current);
       }
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current = null;
       }
     };
   }, []);
 
   const stopAtmosphere = useCallback(() => {
     if (audioRef.current) {
       audioRef.current.pause();
       audioRef.current.currentTime = 0;
     }
     if (objectUrlRef.current) {
       URL.revokeObjectURL(objectUrlRef.current);
       objectUrlRef.current = null;
     }
   }, []);
 
   const playAudioBlob = useCallback((blob: Blob, volume: number) => {
     stopAtmosphere();
 
     const url = URL.createObjectURL(blob);
     objectUrlRef.current = url;
 
     const audio = new Audio(url);
     audio.loop = true;
     audio.volume = volume;
     audioRef.current = audio;
 
     audio.play().catch((err) => {
       console.error('Error playing atmosphere audio:', err);
       setState((prev) => ({ ...prev, error: 'Failed to play audio' }));
     });
   }, [stopAtmosphere]);
 
   const setAtmosphere = useCallback(async (atmosphereId: string) => {
     // Handle "none" selection
     if (atmosphereId === 'none') {
       stopAtmosphere();
       setState((prev) => ({
         ...prev,
         currentAtmosphere: 'none',
         isLoading: false,
         isCached: false,
         error: null,
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
       // Check cache first
       const cachedBlob = await getCachedAudio(atmosphereId);
       
       if (cachedBlob) {
         playAudioBlob(cachedBlob, state.atmosphereVolume);
         setState((prev) => ({
           ...prev,
           isLoading: false,
           isCached: true,
         }));
         return;
       }
 
        // Generate new audio via edge function
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ atmosphereId }),
          }
        );
 
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
         throw new Error(errorData.error || `HTTP ${response.status}`);
       }
 
       const audioBlob = await response.blob();
 
       // Cache the generated audio
       await setCachedAudio(atmosphereId, audioBlob);

       // Play the audio
       playAudioBlob(audioBlob, state.atmosphereVolume);
 
       setState((prev) => ({
         ...prev,
         isLoading: false,
         isCached: false, // Just generated
       }));
     } catch (error) {
       console.error('Error loading atmosphere:', error);
       setState((prev) => ({
         ...prev,
         isLoading: false,
         error: error instanceof Error ? error.message : 'Failed to load atmosphere',
       }));
     }
   }, [playAudioBlob, stopAtmosphere, state.atmosphereVolume]);
 
   const setAtmosphereVolume = useCallback((volume: number) => {
     if (audioRef.current) {
       audioRef.current.volume = volume;
     }
     setState((prev) => ({ ...prev, atmosphereVolume: volume }));
   }, []);
 
   return {
     atmosphereState: state,
     setAtmosphere,
     setAtmosphereVolume,
     stopAtmosphere,
   };
 };