 import { motion } from 'framer-motion';
 import { Play, Pause } from 'lucide-react';
 import { FrequencyItem } from '@/data/soundLibrary';
 
 interface FrequencyCardProps {
   frequency: FrequencyItem;
   isActive: boolean;
   categoryColor: string;
   onPlay: () => void;
   onStop: () => void;
 }
 
 const colorMap: Record<string, { glow: string; bg: string; border: string; text: string }> = {
   cyan: {
     glow: 'shadow-[0_0_30px_rgba(6,182,212,0.5)]',
     bg: 'from-cyan-500/20 to-cyan-600/5',
     border: 'border-cyan-500/60',
     text: 'text-cyan-400',
   },
   emerald: {
     glow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]',
     bg: 'from-emerald-500/20 to-emerald-600/5',
     border: 'border-emerald-500/60',
     text: 'text-emerald-400',
   },
   amber: {
     glow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]',
     bg: 'from-amber-500/20 to-amber-600/5',
     border: 'border-amber-500/60',
     text: 'text-amber-400',
   },
   blue: {
     glow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
     bg: 'from-blue-500/20 to-blue-600/5',
     border: 'border-blue-500/60',
     text: 'text-blue-400',
   },
   violet: {
     glow: 'shadow-[0_0_30px_rgba(139,92,246,0.5)]',
     bg: 'from-violet-500/20 to-violet-600/5',
     border: 'border-violet-500/60',
     text: 'text-violet-400',
   },
   indigo: {
     glow: 'shadow-[0_0_30px_rgba(99,102,241,0.5)]',
     bg: 'from-indigo-500/20 to-indigo-600/5',
     border: 'border-indigo-500/60',
     text: 'text-indigo-400',
   },
 };
 
 const FrequencyCard = ({ frequency, isActive, categoryColor, onPlay, onStop }: FrequencyCardProps) => {
   const colors = colorMap[categoryColor] || colorMap.cyan;
 
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`
          relative min-w-[200px] p-5 rounded-xl cursor-pointer transition-all duration-500
          bg-gradient-to-br ${colors.bg}
          border-2 ${isActive ? 'border-gold shadow-[0_0_24px_4px_hsl(var(--gold)/0.45)]' : 'border-white/10 hover:border-white/20'}
          backdrop-blur-sm
        `}
       onClick={isActive ? onStop : onPlay}
     >
       {/* Waveform Animation - Only visible when active */}
       {isActive && (
         <div className="absolute inset-0 overflow-hidden rounded-xl">
           <div className="absolute inset-0 flex items-center justify-center gap-1">
             {[...Array(12)].map((_, i) => (
               <motion.div
                 key={i}
                 className={`w-1 rounded-full ${colors.text} opacity-60`}
                 animate={{
                   height: ['8px', '32px', '16px', '40px', '8px'],
                 }}
                 transition={{
                   duration: 1.5,
                   repeat: Infinity,
                   delay: i * 0.1,
                   ease: 'easeInOut',
                 }}
                 style={{ backgroundColor: 'currentColor' }}
               />
             ))}
           </div>
         </div>
       )}
 
       {/* Content */}
       <div className={`relative z-10 ${isActive ? 'opacity-90' : ''}`}>
         {/* Frequency Value */}
         <div className={`font-display text-2xl tracking-wider ${isActive ? colors.text : 'text-foreground'}`}>
           {frequency.freq}
         </div>
 
         {/* Name */}
         <div className="font-display text-sm tracking-widest text-foreground/80 mt-1">
           {frequency.name}
         </div>
 
         {/* Purpose */}
         <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
           {frequency.purpose}
         </p>
 
         {/* Play/Pause Button */}
         <div className="mt-4 flex justify-end">
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.95 }}
             className={`
               p-2 rounded-full transition-all duration-300
               ${isActive
                 ? `bg-gradient-to-r ${colors.bg} ${colors.border} border`
                 : 'bg-white/5 border border-white/10 hover:bg-white/10'
               }
             `}
           >
             {isActive ? (
               <Pause className={`w-4 h-4 ${colors.text}`} />
             ) : (
               <Play className="w-4 h-4 text-foreground/70" />
             )}
           </motion.button>
         </div>
       </div>
 
       {/* Active Pulse Ring */}
       {isActive && (
         <motion.div
           className={`absolute inset-0 rounded-xl ${colors.border} border-2`}
           animate={{ opacity: [0.5, 0.2, 0.5] }}
           transition={{ duration: 2, repeat: Infinity }}
         />
       )}
     </motion.div>
   );
 };
 
 export default FrequencyCard;