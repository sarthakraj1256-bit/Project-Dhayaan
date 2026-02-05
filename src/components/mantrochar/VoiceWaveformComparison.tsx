 import { useRef, useEffect, useState, useCallback } from 'react';
 import { motion } from 'framer-motion';
 import { Volume2 } from 'lucide-react';
 
 interface VoiceWaveformComparisonProps {
   userAnalyser: AnalyserNode | null;
   referenceData: number[] | null;
   isListening: boolean;
   isReferenceReady: boolean;
 }
 
 const VoiceWaveformComparison = ({
   userAnalyser,
   referenceData,
   isListening,
   isReferenceReady,
 }: VoiceWaveformComparisonProps) => {
   const userCanvasRef = useRef<HTMLCanvasElement>(null);
   const referenceCanvasRef = useRef<HTMLCanvasElement>(null);
   const animationRef = useRef<number | null>(null);
   const [userPeakLevel, setUserPeakLevel] = useState(0);
 
   // Draw reference waveform (static)
   useEffect(() => {
     const canvas = referenceCanvasRef.current;
     if (!canvas || !referenceData) return;
 
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
 
     const width = canvas.width;
     const height = canvas.height;
     const centerY = height / 2;
 
     ctx.clearRect(0, 0, width, height);
 
     // Draw center line
     ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     ctx.lineWidth = 1;
     ctx.beginPath();
     ctx.moveTo(0, centerY);
     ctx.lineTo(width, centerY);
     ctx.stroke();
 
     // Draw reference waveform with gradient
     const gradient = ctx.createLinearGradient(0, 0, 0, height);
     gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)'); // Purple top
     gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
     gradient.addColorStop(1, 'rgba(168, 85, 247, 0.8)'); // Purple bottom
 
     ctx.strokeStyle = gradient;
     ctx.lineWidth = 2;
     ctx.beginPath();
 
     const sliceWidth = width / referenceData.length;
     let x = 0;
 
     for (let i = 0; i < referenceData.length; i++) {
       const v = referenceData[i] / 255;
       const y = centerY + (v - 0.5) * height * 0.8;
 
       if (i === 0) {
         ctx.moveTo(x, y);
       } else {
         ctx.lineTo(x, y);
       }
       x += sliceWidth;
     }
 
     ctx.stroke();
 
     // Draw filled area with lower opacity
     ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
     ctx.beginPath();
     x = 0;
     ctx.moveTo(0, centerY);
     for (let i = 0; i < referenceData.length; i++) {
       const v = referenceData[i] / 255;
       const y = centerY + (v - 0.5) * height * 0.8;
       ctx.lineTo(x, y);
       x += sliceWidth;
     }
     ctx.lineTo(width, centerY);
     ctx.closePath();
     ctx.fill();
   }, [referenceData]);
 
   // Animate user waveform
   const drawUserWaveform = useCallback(() => {
     const canvas = userCanvasRef.current;
     if (!canvas || !userAnalyser) return;
 
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
 
     const bufferLength = userAnalyser.frequencyBinCount;
     const dataArray = new Uint8Array(bufferLength);
     userAnalyser.getByteTimeDomainData(dataArray);
 
     const width = canvas.width;
     const height = canvas.height;
     const centerY = height / 2;
 
     ctx.clearRect(0, 0, width, height);
 
     // Calculate peak level
     let max = 0;
     for (let i = 0; i < bufferLength; i++) {
       const v = Math.abs(dataArray[i] - 128);
       if (v > max) max = v;
     }
     const level = max / 128;
     setUserPeakLevel(level);
 
     // Draw user waveform with gradient
     const gradient = ctx.createLinearGradient(0, 0, 0, height);
     gradient.addColorStop(0, 'rgba(52, 211, 153, 0.9)'); // Emerald top
     gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.5)');
     gradient.addColorStop(1, 'rgba(52, 211, 153, 0.9)'); // Emerald bottom
 
     ctx.strokeStyle = gradient;
     ctx.lineWidth = 2.5;
     ctx.beginPath();
 
     const sliceWidth = width / bufferLength;
     let x = 0;
 
     for (let i = 0; i < bufferLength; i++) {
       const v = dataArray[i] / 255;
       const y = centerY + (v - 0.5) * height * 0.8;
 
       if (i === 0) {
         ctx.moveTo(x, y);
       } else {
         ctx.lineTo(x, y);
       }
       x += sliceWidth;
     }
 
     ctx.stroke();
 
     // Draw glow effect based on level
     ctx.shadowColor = 'rgba(52, 211, 153, 0.5)';
     ctx.shadowBlur = 10 * level;
 
     // Draw filled area
     ctx.fillStyle = `rgba(52, 211, 153, ${0.1 + level * 0.2})`;
     ctx.beginPath();
     x = 0;
     ctx.moveTo(0, centerY);
     for (let i = 0; i < bufferLength; i++) {
       const v = dataArray[i] / 255;
       const y = centerY + (v - 0.5) * height * 0.8;
       ctx.lineTo(x, y);
       x += sliceWidth;
     }
     ctx.lineTo(width, centerY);
     ctx.closePath();
     ctx.fill();
 
     animationRef.current = requestAnimationFrame(drawUserWaveform);
   }, [userAnalyser]);
 
   useEffect(() => {
     if (isListening && userAnalyser) {
       drawUserWaveform();
     }
 
     return () => {
       if (animationRef.current) {
         cancelAnimationFrame(animationRef.current);
       }
     };
   }, [isListening, userAnalyser, drawUserWaveform]);
 
   return (
     <div className="space-y-3">
       {/* Reference Waveform */}
       <div className="relative">
         <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-violet-500" />
           <span className="text-[10px] text-violet-400 font-medium uppercase tracking-wide">Reference</span>
         </div>
         <div className="ml-20 p-2 rounded-lg bg-violet-500/5 border border-violet-500/20">
           <canvas
             ref={referenceCanvasRef}
             width={400}
             height={60}
             className="w-full h-[60px]"
           />
           {!isReferenceReady && (
             <div className="absolute inset-0 flex items-center justify-center bg-void/50 rounded-lg">
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <Volume2 className="w-4 h-4" />
                 <span>Play reference to see waveform</span>
               </div>
             </div>
           )}
         </div>
       </div>
 
       {/* User Waveform */}
       <div className="relative">
         <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
           <motion.div
             className="w-2 h-2 rounded-full bg-emerald-500"
             animate={{
               scale: isListening ? [1, 1.3, 1] : 1,
               opacity: isListening ? 1 : 0.5,
             }}
             transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
           />
           <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wide">Your Voice</span>
         </div>
         <div className={`ml-20 p-2 rounded-lg border transition-all ${
           isListening 
             ? 'bg-emerald-500/10 border-emerald-500/30' 
             : 'bg-emerald-500/5 border-emerald-500/20'
         }`}>
           <canvas
             ref={userCanvasRef}
             width={400}
             height={60}
             className="w-full h-[60px]"
           />
           {!isListening && (
             <div className="absolute inset-0 ml-20 flex items-center justify-center bg-void/50 rounded-lg">
               <span className="text-xs text-muted-foreground">
                 Start speaking to see your waveform
               </span>
             </div>
           )}
         </div>
 
         {/* Level meter */}
         {isListening && (
           <div className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-white/10 rounded-full overflow-hidden">
             <motion.div
               className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full"
               style={{ height: `${userPeakLevel * 100}%` }}
               transition={{ duration: 0.05 }}
             />
           </div>
         )}
       </div>
 
       {/* Match Indicator */}
       {isListening && isReferenceReady && (
         <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center"
         >
           <p className="text-xs text-muted-foreground">
             Try to match the reference pattern above
           </p>
         </motion.div>
       )}
     </div>
   );
 };
 
 export default VoiceWaveformComparison;