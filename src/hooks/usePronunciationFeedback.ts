 import { useState, useCallback, useRef, useEffect } from 'react';
 import { supabase } from '@/integrations/backend/client';
 
 interface PronunciationResult {
   expected: string;
   spoken: string;
   isMatch: boolean;
   confidence: number;
 }
 
 interface UsePronunciationFeedbackReturn {
   isListening: boolean;
   isConnecting: boolean;
   partialTranscript: string;
   lastResult: PronunciationResult | null;
   error: string | null;
  analyserNode: AnalyserNode | null;
   startListening: (expectedText: string) => Promise<void>;
   stopListening: () => void;
   resetResult: () => void;
 }
 
 // Normalize text for comparison (remove diacritics, lowercase, trim)
 function normalizeText(text: string): string {
   return text
     .toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
     .replace(/[^a-z0-9\s]/g, '') // Remove special chars
     .replace(/\s+/g, ' ')
     .trim();
 }
 
 // Calculate similarity score between two strings (0-1)
 function calculateSimilarity(a: string, b: string): number {
   const normA = normalizeText(a);
   const normB = normalizeText(b);
   
   if (normA === normB) return 1;
   if (normA.length === 0 || normB.length === 0) return 0;
   
   // Simple Levenshtein-based similarity
   const maxLen = Math.max(normA.length, normB.length);
   const distance = levenshteinDistance(normA, normB);
   return Math.max(0, 1 - distance / maxLen);
 }
 
 function levenshteinDistance(a: string, b: string): number {
   const matrix: number[][] = [];
   
   for (let i = 0; i <= b.length; i++) {
     matrix[i] = [i];
   }
   for (let j = 0; j <= a.length; j++) {
     matrix[0][j] = j;
   }
   
   for (let i = 1; i <= b.length; i++) {
     for (let j = 1; j <= a.length; j++) {
       if (b.charAt(i - 1) === a.charAt(j - 1)) {
         matrix[i][j] = matrix[i - 1][j - 1];
       } else {
         matrix[i][j] = Math.min(
           matrix[i - 1][j - 1] + 1,
           matrix[i][j - 1] + 1,
           matrix[i - 1][j] + 1
         );
       }
     }
   }
   
   return matrix[b.length][a.length];
 }
 
 export function usePronunciationFeedback(): UsePronunciationFeedbackReturn {
   const [isListening, setIsListening] = useState(false);
   const [isConnecting, setIsConnecting] = useState(false);
   const [partialTranscript, setPartialTranscript] = useState('');
   const [lastResult, setLastResult] = useState<PronunciationResult | null>(null);
   const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
   
   const expectedTextRef = useRef<string>('');
   const wsRef = useRef<WebSocket | null>(null);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const audioContextRef = useRef<AudioContext | null>(null);
   const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
   
   const cleanup = useCallback(() => {
     if (wsRef.current) {
       wsRef.current.close();
       wsRef.current = null;
     }
     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
       mediaRecorderRef.current.stop();
     }
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }
     if (audioContextRef.current) {
       audioContextRef.current.close();
       audioContextRef.current = null;
     }
    analyserRef.current = null;
    setAnalyserNode(null);
     setIsListening(false);
     setIsConnecting(false);
   }, []);
 
   const startListening = useCallback(async (expectedText: string) => {
     setError(null);
     setPartialTranscript('');
     setLastResult(null);
     expectedTextRef.current = expectedText;
     setIsConnecting(true);
     
     try {
       // Get scribe token
       const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-scribe-token');
       
       if (fnError || !data?.token) {
         throw new Error(fnError?.message || 'Failed to get transcription token');
       }
       
       // Get microphone access
       const stream = await navigator.mediaDevices.getUserMedia({
         audio: {
           echoCancellation: true,
           noiseSuppression: true,
           sampleRate: 16000,
         }
       });
       streamRef.current = stream;
       
       // Setup WebSocket
       const ws = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&token=${data.token}`);
       wsRef.current = ws;
       
       ws.onopen = () => {
         setIsConnecting(false);
         setIsListening(true);
         
         // Start recording
         startRecording(stream, ws);
       };
       
       ws.onmessage = (event) => {
         try {
           const message = JSON.parse(event.data);
           
           if (message.type === 'partial_transcript') {
             setPartialTranscript(message.text || '');
           } else if (message.type === 'committed_transcript') {
             const spokenText = message.text || '';
             const similarity = calculateSimilarity(expectedTextRef.current, spokenText);
             
             setLastResult({
               expected: expectedTextRef.current,
               spoken: spokenText,
               isMatch: similarity >= 0.6, // 60% threshold for match
               confidence: similarity,
             });
             setPartialTranscript('');
           } else if (message.type === 'error') {
             console.error('STT error:', message);
             setError(message.message || 'Transcription error');
           }
         } catch (e) {
           console.error('Failed to parse STT message:', e);
         }
       };
       
       ws.onerror = (event) => {
         console.error('STT WebSocket error:', event);
         setError('Connection error');
         cleanup();
       };
       
       ws.onclose = () => {
         console.log('STT WebSocket closed');
         cleanup();
       };
       
     } catch (err) {
       console.error('Failed to start listening:', err);
       setError(err instanceof Error ? err.message : 'Failed to start microphone');
       setIsConnecting(false);
       cleanup();
     }
   }, [cleanup]);
   
   const startRecording = (stream: MediaStream, ws: WebSocket) => {
     const audioContext = new AudioContext({ sampleRate: 16000 });
     audioContextRef.current = audioContext;
     
     const source = audioContext.createMediaStreamSource(stream);
    
    // Create analyser for visualization
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyserRef.current = analyser;
    setAnalyserNode(analyser);
    
     const processor = audioContext.createScriptProcessor(4096, 1, 1);
     
     processor.onaudioprocess = (e) => {
       if (ws.readyState !== WebSocket.OPEN) return;
       
       const inputData = e.inputBuffer.getChannelData(0);
       const pcm16 = new Int16Array(inputData.length);
       
       for (let i = 0; i < inputData.length; i++) {
         const s = Math.max(-1, Math.min(1, inputData[i]));
         pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
       }
       
       // Convert to base64
       const bytes = new Uint8Array(pcm16.buffer);
       const base64 = btoa(String.fromCharCode(...bytes));
       
       ws.send(JSON.stringify({
         type: 'audio',
         audio: base64,
       }));
     };
     
     source.connect(processor);
     processor.connect(audioContext.destination);
   };
   
   const stopListening = useCallback(() => {
     // Send commit before closing
     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify({ type: 'commit' }));
       // Give time for final transcript
       setTimeout(cleanup, 500);
     } else {
       cleanup();
     }
   }, [cleanup]);
   
   const resetResult = useCallback(() => {
     setLastResult(null);
     setPartialTranscript('');
     setError(null);
   }, []);
   
   // Cleanup on unmount
   useEffect(() => {
     return cleanup;
   }, [cleanup]);
   
   return {
     isListening,
     isConnecting,
     partialTranscript,
     lastResult,
     error,
    analyserNode,
     startListening,
     stopListening,
     resetResult,
   };
 }