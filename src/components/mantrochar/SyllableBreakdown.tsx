 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Volume2, Check, RotateCcw } from 'lucide-react';
 import type { MantraSyllable } from '@/data/mantraLibrary';
 
 interface SyllableBreakdownProps {
   syllables: MantraSyllable[];
   currentIndex: number;
   completedIndices: number[];
   onSyllableClick: (index: number) => void;
   onPlaySyllable: (syllable: MantraSyllable) => void;
 }
 
 const SyllableBreakdown = ({
   syllables,
   currentIndex,
   completedIndices,
   onSyllableClick,
   onPlaySyllable,
 }: SyllableBreakdownProps) => {
   const [playingIndex, setPlayingIndex] = useState<number | null>(null);
 
   const handlePlay = (syllable: MantraSyllable, index: number) => {
     setPlayingIndex(index);
     onPlaySyllable(syllable);
     setTimeout(() => setPlayingIndex(null), 1000);
   };
 
   return (
     <div className="space-y-4">
       {/* Full Mantra Preview */}
       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
         <p className="text-xs text-muted-foreground mb-2">Full Mantra</p>
         <p className="text-lg text-foreground/90 font-sanskrit leading-relaxed">
           {syllables.map((s, i) => (
             <span
               key={i}
               className={`
                 transition-colors cursor-pointer hover:text-primary
                 ${completedIndices.includes(i) ? 'text-emerald-400' : ''}
                 ${currentIndex === i ? 'text-primary underline underline-offset-4' : ''}
               `}
               onClick={() => onSyllableClick(i)}
             >
               {s.text}{' '}
             </span>
           ))}
         </p>
       </div>
 
       {/* Syllable Grid */}
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
         {syllables.map((syllable, index) => {
           const isCompleted = completedIndices.includes(index);
           const isCurrent = currentIndex === index;
           const isPlaying = playingIndex === index;
 
           return (
             <motion.button
               key={index}
               onClick={() => handlePlay(syllable, index)}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className={`
                 relative p-4 rounded-xl border text-center transition-all
                 ${isCurrent 
                   ? 'bg-primary/20 border-primary/50 ring-2 ring-primary/30' 
                   : isCompleted
                     ? 'bg-emerald-500/10 border-emerald-500/30'
                     : 'bg-white/5 border-white/10 hover:bg-white/10'
                 }
               `}
             >
               {/* Completed Check */}
               {isCompleted && (
                 <div className="absolute top-2 right-2">
                   <Check className="w-4 h-4 text-emerald-400" />
                 </div>
               )}
 
               {/* Playing Animation */}
               <AnimatePresence>
                 {isPlaying && (
                   <motion.div
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0, opacity: 0 }}
                     className="absolute inset-0 rounded-xl bg-primary/20 flex items-center justify-center"
                   >
                     <Volume2 className="w-6 h-6 text-primary animate-pulse" />
                   </motion.div>
                 )}
               </AnimatePresence>
 
               {/* Sanskrit */}
               <p className="text-2xl font-sanskrit text-foreground mb-1">
                 {syllable.text}
               </p>
 
               {/* Transliteration */}
               <p className="text-sm text-primary/80 font-mono">
                 {syllable.transliteration}
               </p>
 
               {/* Pronunciation Guide */}
               <p className="text-[10px] text-muted-foreground mt-1">
                 {syllable.pronunciation}
               </p>
             </motion.button>
           );
         })}
       </div>
     </div>
   );
 };
 
 export default SyllableBreakdown;