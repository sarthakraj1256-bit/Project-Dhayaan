 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Plus, RotateCcw, Check, Sparkles } from 'lucide-react';
 
 interface RepetitionCounterProps {
   targetReps: number;
   currentReps: number;
   onIncrement: () => void;
   onReset: () => void;
   onComplete: () => void;
 }
 
 const RepetitionCounter = ({
   targetReps,
   currentReps,
   onIncrement,
   onReset,
   onComplete,
 }: RepetitionCounterProps) => {
   const [showCelebration, setShowCelebration] = useState(false);
   const progress = Math.min((currentReps / targetReps) * 100, 100);
   const isComplete = currentReps >= targetReps;
 
   useEffect(() => {
     if (isComplete && !showCelebration) {
       setShowCelebration(true);
       onComplete();
     }
   }, [isComplete, showCelebration, onComplete]);
 
   return (
     <div className="relative">
       {/* Celebration Overlay */}
       <AnimatePresence>
         {showCelebration && (
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.8 }}
             className="absolute inset-0 flex items-center justify-center z-10 bg-void/80 rounded-xl"
           >
             <div className="text-center">
               <motion.div
                 initial={{ rotate: 0 }}
                 animate={{ rotate: 360 }}
                 transition={{ duration: 1 }}
               >
                 <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
               </motion.div>
               <p className="font-display text-xl text-foreground mb-2">Complete!</p>
               <p className="text-sm text-muted-foreground">
                 {targetReps} repetitions achieved
               </p>
               <button
                 onClick={() => {
                   setShowCelebration(false);
                   onReset();
                 }}
                 className="mt-4 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition-colors"
               >
                 Practice Again
               </button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
 
       <div className="p-6 rounded-xl bg-white/5 border border-white/10">
         {/* Counter Display */}
         <div className="text-center mb-6">
           <div className="relative inline-block">
             {/* Circular Progress */}
             <svg className="w-32 h-32 -rotate-90">
               <circle
                 cx="64"
                 cy="64"
                 r="56"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="8"
                 className="text-white/10"
               />
               <circle
                 cx="64"
                 cy="64"
                 r="56"
                 fill="none"
                 stroke="url(#progress-gradient)"
                 strokeWidth="8"
                 strokeLinecap="round"
                 strokeDasharray={`${2 * Math.PI * 56}`}
                 strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                 className="transition-all duration-300"
               />
               <defs>
                 <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="hsl(var(--primary))" />
                   <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
                 </linearGradient>
               </defs>
             </svg>
             
             {/* Count Display */}
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="font-display text-3xl text-foreground">{currentReps}</span>
               <span className="text-xs text-muted-foreground">of {targetReps}</span>
             </div>
           </div>
         </div>
 
         {/* Action Buttons */}
         <div className="flex items-center justify-center gap-4">
           <button
             onClick={onReset}
             className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
             title="Reset"
           >
             <RotateCcw className="w-5 h-5 text-muted-foreground" />
           </button>
 
           <motion.button
             onClick={onIncrement}
             disabled={isComplete}
             whileTap={{ scale: 0.95 }}
             className={`
               w-16 h-16 rounded-full flex items-center justify-center transition-all
               ${isComplete 
                 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                 : 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30'
               } border-2
             `}
           >
             {isComplete ? (
               <Check className="w-8 h-8" />
             ) : (
               <Plus className="w-8 h-8" />
             )}
           </motion.button>
 
           <div className="w-11" /> {/* Spacer for symmetry */}
         </div>
 
         {/* Tap instruction */}
         {!isComplete && (
           <p className="text-center text-xs text-muted-foreground mt-4">
             Tap after each repetition
           </p>
         )}
       </div>
     </div>
   );
 };
 
 export default RepetitionCounter;