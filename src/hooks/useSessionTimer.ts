 import { useState, useRef, useCallback, useEffect } from 'react';
 
 interface SessionTimerState {
   elapsedSeconds: number;
   isRunning: boolean;
   startTime: number | null;
 }
 
 export const useSessionTimer = (isPlaying: boolean) => {
   const [state, setState] = useState<SessionTimerState>({
     elapsedSeconds: 0,
     isRunning: false,
     startTime: null,
   });
 
   const intervalRef = useRef<number | null>(null);
 
   // Start timer when playing starts
   useEffect(() => {
     if (isPlaying && !state.isRunning) {
       const startTime = Date.now();
       setState({
         elapsedSeconds: 0,
         isRunning: true,
         startTime,
       });
 
       intervalRef.current = window.setInterval(() => {
         setState((prev) => ({
           ...prev,
           elapsedSeconds: Math.floor((Date.now() - startTime) / 1000),
         }));
       }, 1000);
     }
 
     // Stop timer when playing stops
     if (!isPlaying && state.isRunning) {
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
         intervalRef.current = null;
       }
       setState((prev) => ({
         ...prev,
         isRunning: false,
       }));
     }
 
     return () => {
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
       }
     };
   }, [isPlaying, state.isRunning]);
 
   const reset = useCallback(() => {
     if (intervalRef.current) {
       clearInterval(intervalRef.current);
       intervalRef.current = null;
     }
     setState({
       elapsedSeconds: 0,
       isRunning: false,
       startTime: null,
     });
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
     elapsedSeconds: state.elapsedSeconds,
     formattedTime: formatTime(state.elapsedSeconds),
     isRunning: state.isRunning,
     reset,
   };
 };