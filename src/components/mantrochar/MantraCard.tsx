 import { motion } from 'framer-motion';
 import { Clock, Repeat, ChevronRight, Star, Lock } from 'lucide-react';
 import type { Mantra } from '@/data/mantraLibrary';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { localizeUnit } from '@/i18n/units';
 
 interface MantraCardProps {
   mantra: Mantra;
   progress?: number;
   isLocked?: boolean;
   onClick: () => void;
 }
 
 const difficultyColors = {
   beginner: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
   intermediate: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
   advanced: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
   mastery: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
 };

const MantraCard = ({ mantra, progress = 0, isLocked = false, onClick }: MantraCardProps) => {
  const { t, language } = useLanguage();

  const difficultyLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: t('mantra.beginner'), color: 'text-emerald-400' },
    intermediate: { label: t('mantra.intermediate'), color: 'text-amber-400' },
    advanced: { label: t('mantra.advanced'), color: 'text-rose-400' },
    mastery: { label: t('mantra.mastery'), color: 'text-violet-400' },
  };

  return (
    <motion.button onClick={onClick} disabled={isLocked}
      whileHover={{ scale: isLocked ? 1 : 1.02, boxShadow: isLocked ? undefined : '0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(212, 175, 55, 0.2)' }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`w-full text-left p-4 rounded-xl border bg-gradient-to-br transition-all duration-300 ${isLocked ? 'from-white/5 to-white/0 border-white/10 opacity-60 cursor-not-allowed' : difficultyColors[mantra.difficulty] + ' hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]'}`}>
       <div className="flex items-start gap-4">
         <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isLocked ? 'bg-white/5' : 'bg-white/10'}`}>
           {isLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <span className="font-sanskrit">{mantra.syllables[0]?.text || 'ॐ'}</span>}
         </div>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-1">
             <h3 className="font-display text-base text-foreground truncate">{mantra.name}</h3>
             <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/10 ${difficultyLabels[mantra.difficulty].color}`}>
               {difficultyLabels[mantra.difficulty].label}
             </span>
           </div>
           <p className="text-xs text-primary/80 font-mono mb-2 truncate">{mantra.transliteration}</p>
           <div className="flex items-center gap-4 text-xs text-muted-foreground">
             <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{localizeUnit(mantra.durationMinutes, 'm', language)}</span>
             <span className="flex items-center gap-1"><Repeat className="w-3 h-3" />{localizeUnit(mantra.syllables.length, 'parts', language)}</span>
             <span className="px-2 py-0.5 rounded-full bg-white/5">{mantra.category}</span>
           </div>
           {progress > 0 && !isLocked && (
             <div className="mt-3">
               <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                 <span>{t('mantra.progress')}</span><span>{progress}%</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all" style={{ width: `${progress}%` }} />
               </div>
             </div>
           )}
         </div>
         {!isLocked && <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
       </div>
     </motion.button>
   );
 };
 
 export default MantraCard;
