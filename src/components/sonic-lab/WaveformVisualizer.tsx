 import { useRef, useEffect } from 'react';
 import { motion } from 'framer-motion';
 
 interface WaveformVisualizerProps {
   isPlaying: boolean;
   frequency: number | null;
   getFrequencyData: () => Uint8Array;
 }
 
 const WaveformVisualizer = ({ isPlaying, frequency, getFrequencyData }: WaveformVisualizerProps) => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const animationRef = useRef<number>();
 
   useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
 
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
 
     const draw = () => {
       const { width, height } = canvas;
       
       // Clear canvas
       ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
       ctx.fillRect(0, 0, width, height);
 
       if (isPlaying) {
         const frequencyData = getFrequencyData();
         const barCount = 64;
         const barWidth = width / barCount;
         const step = Math.floor(frequencyData.length / barCount);
 
         // Create gradient
         const gradient = ctx.createLinearGradient(0, height, 0, 0);
         gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
         gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.4)');
         gradient.addColorStop(1, 'rgba(212, 175, 55, 0.8)');
 
         ctx.fillStyle = gradient;
 
         for (let i = 0; i < barCount; i++) {
           const value = frequencyData[i * step] || 0;
           const barHeight = (value / 255) * height * 0.8;
           const x = i * barWidth;
           const y = height - barHeight;
 
           // Draw bar with rounded corners
           ctx.beginPath();
           ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
           ctx.fill();
         }
 
         // Draw center wave
         ctx.beginPath();
         ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
         ctx.lineWidth = 2;
 
         for (let i = 0; i < barCount; i++) {
           const value = frequencyData[i * step] || 0;
           const x = i * barWidth + barWidth / 2;
           const y = height / 2 + (value / 255 - 0.5) * height * 0.4;
 
           if (i === 0) {
             ctx.moveTo(x, y);
           } else {
             ctx.lineTo(x, y);
           }
         }
         ctx.stroke();
       } else {
         // Idle animation - gentle sine wave
         const time = Date.now() * 0.001;
         ctx.beginPath();
         ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
         ctx.lineWidth = 1;
 
         for (let x = 0; x < width; x++) {
           const y = height / 2 + Math.sin((x * 0.02) + time) * 20;
           if (x === 0) ctx.moveTo(x, y);
           else ctx.lineTo(x, y);
         }
         ctx.stroke();
       }
 
       animationRef.current = requestAnimationFrame(draw);
     };
 
     draw();
 
     return () => {
       if (animationRef.current) {
         cancelAnimationFrame(animationRef.current);
       }
     };
   }, [isPlaying, getFrequencyData]);
 
   // Resize canvas
   useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
 
     const resizeCanvas = () => {
       const parent = canvas.parentElement;
       if (parent) {
         canvas.width = parent.offsetWidth;
         canvas.height = parent.offsetHeight;
       }
     };
 
     resizeCanvas();
     window.addEventListener('resize', resizeCanvas);
     return () => window.removeEventListener('resize', resizeCanvas);
   }, []);
 
   return (
     <div className="relative w-full h-32 overflow-hidden rounded-xl">
       {/* Background glow */}
       <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
       
       <canvas
         ref={canvasRef}
         className="w-full h-full"
       />
 
       {/* Frequency Display */}
       {isPlaying && frequency && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute inset-0 flex items-center justify-center pointer-events-none"
         >
           <motion.span
             animate={{ scale: [1, 1.05, 1] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="font-display text-5xl md:text-7xl tracking-wider text-primary/20"
           >
             {frequency}Hz
           </motion.span>
         </motion.div>
       )}
     </div>
   );
 };
 
 export default WaveformVisualizer;