import { useState, useRef, useCallback, useEffect } from 'react';

export const useSessionTimer = (isPlaying: boolean) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
   const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
 
  // Handle timer start/stop based on isPlaying
   useEffect(() => {
    if (isPlaying) {
      // Start timer
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
      
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
       }, 1000);
    } else {
      // Stop timer
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
         intervalRef.current = null;
       }
      startTimeRef.current = null;
     }
 
     return () => {
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
       }
     };
  }, [isPlaying]);
 
   const reset = useCallback(() => {
     if (intervalRef.current) {
       clearInterval(intervalRef.current);
       intervalRef.current = null;
     }
    startTimeRef.current = null;
    setElapsedSeconds(0);
   }, []);
 
   // Format time as MM:SS or HH:MM:SS
   const formatTime = useCallback((seconds: number): string => {
     const hrs = Math.floor(seconds / 3600);
     const mins = Math.floor((seconds % 3600) / 60);
     const secs = seconds % 60;
 
     if (hrs > 0) {
       return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
     }
     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   }, []);
 
   return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning: isPlaying,
     reset,
   };
 };