 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Mic, MicOff, Check, X, Loader2, Volume2, AlertCircle } from 'lucide-react';
 import { usePronunciationFeedback } from '@/hooks/usePronunciationFeedback';
 import { Progress } from '@/components/ui/progress';
 
 interface PronunciationFeedbackProps {
   expectedText: string;
   expectedTransliteration: string;
   onSuccess?: () => void;
   onPlayReference?: () => void;
 }
 
 const PronunciationFeedback = ({
   expectedText,
   expectedTransliteration,
   onSuccess,
   onPlayReference,
 }: PronunciationFeedbackProps) => {
   const {
     isListening,
     isConnecting,
     partialTranscript,
     lastResult,
     error,
     startListening,
     stopListening,
     resetResult,
   } = usePronunciationFeedback();
   
   const [showSuccess, setShowSuccess] = useState(false);
   
   // Handle successful pronunciation
   useEffect(() => {
     if (lastResult?.isMatch) {
       setShowSuccess(true);
       const timer = setTimeout(() => {
         setShowSuccess(false);
         onSuccess?.();
       }, 1500);
       return () => clearTimeout(timer);
     }
   }, [lastResult, onSuccess]);
   
   const handleMicClick = () => {
     if (isListening) {
       stopListening();
     } else {
       resetResult();
       // Use transliteration for comparison since STT outputs romanized text
       startListening(expectedTransliteration);
     }
   };
   
   const confidencePercent = lastResult ? Math.round(lastResult.confidence * 100) : 0;
   
   return (
     <div className="space-y-4">
       {/* Expected Text Display */}
       <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
         <p className="text-xs text-muted-foreground mb-2">Say this:</p>
         <p className="text-3xl font-sanskrit text-foreground mb-1">{expectedText}</p>
         <p className="text-lg text-primary/80 font-mono">{expectedTransliteration}</p>
       </div>
       
       {/* Mic Button */}
       <div className="flex items-center justify-center gap-4">
         <button
           onClick={onPlayReference}
           className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
           title="Hear reference"
         >
           <Volume2 className="w-5 h-5 text-muted-foreground" />
         </button>
         
         <motion.button
           onClick={handleMicClick}
           disabled={isConnecting}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           className={`
             relative p-6 rounded-full transition-all
             ${isListening 
               ? 'bg-red-500/20 border-2 border-red-500 text-red-400' 
               : isConnecting
                 ? 'bg-white/10 border-2 border-white/20 text-muted-foreground'
                 : 'bg-primary/20 border-2 border-primary/50 text-primary hover:bg-primary/30'
             }
           `}
         >
           {isConnecting ? (
             <Loader2 className="w-8 h-8 animate-spin" />
           ) : isListening ? (
             <>
               <MicOff className="w-8 h-8" />
               {/* Pulsing ring animation */}
               <motion.div
                 className="absolute inset-0 rounded-full border-2 border-red-500"
                 animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               />
             </>
           ) : (
             <Mic className="w-8 h-8" />
           )}
         </motion.button>
         
         <div className="w-14" /> {/* Spacer for symmetry */}
       </div>
       
       <p className="text-center text-xs text-muted-foreground">
         {isConnecting 
           ? 'Connecting microphone...' 
           : isListening 
             ? 'Listening... Tap to stop' 
             : 'Tap to start speaking'
         }
       </p>
       
       {/* Live Transcript */}
       <AnimatePresence>
         {(partialTranscript || isListening) && (
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="p-4 rounded-xl bg-white/5 border border-white/10"
           >
             <p className="text-xs text-muted-foreground mb-2">You're saying:</p>
             <p className="text-lg text-foreground font-mono min-h-[1.5em]">
               {partialTranscript || (
                 <span className="text-muted-foreground/50 italic">Waiting for speech...</span>
               )}
             </p>
           </motion.div>
         )}
       </AnimatePresence>
       
       {/* Result Feedback */}
       <AnimatePresence>
         {lastResult && (
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className={`
               p-4 rounded-xl border
               ${lastResult.isMatch 
                 ? 'bg-emerald-500/10 border-emerald-500/30' 
                 : 'bg-red-500/10 border-red-500/30'
               }
             `}
           >
             <div className="flex items-center gap-3 mb-3">
               <div className={`
                 p-2 rounded-full
                 ${lastResult.isMatch ? 'bg-emerald-500/20' : 'bg-red-500/20'}
               `}>
                 {lastResult.isMatch ? (
                   <Check className="w-5 h-5 text-emerald-400" />
                 ) : (
                   <X className="w-5 h-5 text-red-400" />
                 )}
               </div>
               <div className="flex-1">
                 <p className={`font-medium ${lastResult.isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                   {lastResult.isMatch ? 'Great pronunciation!' : 'Try again'}
                 </p>
                 <p className="text-xs text-muted-foreground">
                   We heard: "{lastResult.spoken || '(nothing)'}"
                 </p>
               </div>
             </div>
             
             {/* Confidence Bar */}
             <div className="space-y-1">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-muted-foreground">Match confidence</span>
                 <span className={lastResult.isMatch ? 'text-emerald-400' : 'text-red-400'}>
                   {confidencePercent}%
                 </span>
               </div>
               <Progress 
                 value={confidencePercent} 
                 className={`h-2 ${lastResult.isMatch ? '[&>div]:bg-emerald-500' : '[&>div]:bg-red-500'}`}
               />
             </div>
             
             {!lastResult.isMatch && (
               <p className="text-xs text-muted-foreground mt-3">
                 💡 Tip: Listen to the reference again and focus on each syllable.
               </p>
             )}
           </motion.div>
         )}
       </AnimatePresence>
       
       {/* Error Display */}
       <AnimatePresence>
         {error && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
           >
             <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
             <p className="text-xs text-amber-400">{error}</p>
           </motion.div>
         )}
       </AnimatePresence>
       
       {/* Success Overlay */}
       <AnimatePresence>
         {showSuccess && (
           <motion.div
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.5 }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
           >
             <div className="text-center">
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: 'spring', stiffness: 200 }}
                 className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4"
               >
                 <Check className="w-12 h-12 text-emerald-400" />
               </motion.div>
               <p className="text-xl font-display text-emerald-400">Perfect!</p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 };
 
 export default PronunciationFeedback;