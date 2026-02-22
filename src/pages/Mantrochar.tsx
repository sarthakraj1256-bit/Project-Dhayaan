import PageTransition from '@/components/PageTransition';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Radio, Flame, GraduationCap, Loader2, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mantras, getMantrasByDifficulty, type Mantra } from '@/data/mantraLibrary';
import MantraCard from '@/components/mantrochar/MantraCard';
import MantraLesson from '@/components/mantrochar/MantraLesson';
import { toast } from 'sonner';
import { useMantraProgress } from '@/hooks/useMantraProgress';
import BottomNav from '@/components/BottomNav';
import { useInfiniteScroll } from '@/hooks/useLazyLoad';
import { CardSkeleton } from '@/components/LazyCard';

const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'mastery'] as const;
 
 const Mantrochar = () => {
   const { t } = useLanguage();
   const [selectedMantra, setSelectedMantra] = useState<Mantra | null>(null);
   const [activeFilter, setActiveFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
   
   const {
     isLoading,
     isAuthenticated,
     completedMantraIds,
     getCompletionPercent,
     saveSyllableProgress,
     saveRepetitions,
     markMantraComplete,
   } = useMantraProgress();
 
   const handleMantraComplete = (reps: number) => {
     if (selectedMantra) {
       saveRepetitions(selectedMantra.id, reps);
       markMantraComplete(selectedMantra.id);
       toast.success(`${selectedMantra.name} completed! 🙏`);
     }
   };
 
   const handleSyllableProgress = (syllableIndices: number[]) => {
     if (selectedMantra) {
       saveSyllableProgress(selectedMantra.id, syllableIndices);
     }
   };
 
   const filteredMantras = activeFilter === 'all' 
     ? mantras 
     : getMantrasByDifficulty(activeFilter);
 
   // If a mantra is selected, show the lesson view
   if (selectedMantra) {
     return (
       <div className="min-h-screen bg-void relative overflow-hidden">
         {/* Background */}
         <div className="fixed inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/20 to-void" />
           <div 
             className="absolute inset-0 opacity-[0.02]"
             style={{
               backgroundImage: `radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
               backgroundSize: '30px 30px',
             }}
           />
           <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
         </div>
 
         <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
           <MantraLesson
             mantra={selectedMantra}
             onBack={() => setSelectedMantra(null)}
               onComplete={handleMantraComplete}
               onSyllableProgress={handleSyllableProgress}
           />
         </div>
       </div>
     );
   }
 
   return (
     <PageTransition>
     <div className="min-h-screen bg-void relative overflow-hidden">
       {/* Background */}
       <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/20 to-void" />
         <div 
           className="absolute inset-0 opacity-[0.02]"
           style={{
             backgroundImage: `radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
             backgroundSize: '30px 30px',
           }}
         />
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
       </div>
 
       {/* Content */}
       <div className="relative z-10 pb-24 md:pb-0">
         {/* Header */}
        <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-void/80 backdrop-blur-xl border-b border-border/30">
              <Link
                to="/"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
  
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h1 className="font-display text-lg tracking-[0.2em] text-gold-gradient">
                  {t('page.mantrochar').toUpperCase()}
                </h1>
              </div>
  
              <Link
                to="/sonic-lab"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Radio className="w-5 h-5 text-primary" />
              </Link>
          </header>
 
         {/* Hero */}
         <section className="px-6 py-12 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-2xl mx-auto"
           >
              <h2 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-4">
                Learn to <span className="text-gold-gradient">Chant</span> Correctly
              </h2>
            </motion.div>
 
           {/* Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="flex items-center justify-center gap-6 mt-8"
           >
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
               <GraduationCap className="w-4 h-4 text-primary" />
               <span className="text-sm text-foreground">
                   {isLoading ? (
                     <Loader2 className="w-3 h-3 animate-spin inline" />
                   ) : (
                     `${completedMantraIds.length} / ${mantras.length} Learned`
                   )}
               </span>
             </div>
               {completedMantraIds.length > 0 && (
               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                 <Flame className="w-4 h-4 text-amber-400" />
                 <span className="text-sm text-foreground">
                     {completedMantraIds.length} day streak
                 </span>
               </div>
             )}
           </motion.div>

             {/* Auth prompt */}
             {!isAuthenticated && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="mt-4"
               >
                 <Link
                   to="/auth"
                   className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors"
                 >
                   <LogIn className="w-4 h-4" />
                   Sign in to save your progress
                 </Link>
               </motion.div>
             )}
         </section>
 
         {/* Filter Tabs */}
         <div className="px-6 mb-6">
           <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-2">
             {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((filter) => (
               <button
                 key={filter}
                 onClick={() => setActiveFilter(filter)}
                 className={`
                   px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
                   ${activeFilter === filter 
                     ? 'bg-primary/20 border border-primary/50 text-primary' 
                     : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                   }
                 `}
               >
                 {filter === 'all' ? 'All Mantras' : filter.charAt(0).toUpperCase() + filter.slice(1)}
               </button>
             ))}
           </div>
         </div>
 
         {/* Mantra Library */}
         <main className="px-6 pb-16 max-w-5xl mx-auto">
           {/* Group by difficulty */}
           {difficultyOrder.map((difficulty) => {
             const mantrasInDifficulty = filteredMantras.filter(m => m.difficulty === difficulty);
             if (mantrasInDifficulty.length === 0) return null;
 
             return (
               <motion.section
                 key={difficulty}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mb-10"
               >
                 <div className="flex items-center gap-3 mb-4">
                   <h3 className="font-display text-sm tracking-widest text-muted-foreground uppercase">
                     {difficulty}
                   </h3>
                   <div className="h-px flex-1 bg-white/10" />
                   <span className="text-xs text-muted-foreground">
                     {mantrasInDifficulty.length} mantras
                   </span>
                 </div>
 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {mantrasInDifficulty.map((mantra) => (
                     <MantraCard
                       key={mantra.id}
                       mantra={mantra}
                         progress={getCompletionPercent(mantra.id, mantra.syllables.length)}
                       onClick={() => setSelectedMantra(mantra)}
                     />
                   ))}
                 </div>
               </motion.section>
             );
           })}
         </main>
 
         {/* Connection to Sonic Lab */}
         <section className="px-6 pb-16">
           <div className="max-w-5xl mx-auto">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
             >
               <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                   <Radio className="w-8 h-8 text-primary" />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                   <h3 className="font-display text-lg text-foreground mb-2">
                     Enhance with Frequencies
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     Combine your mantra practice with healing frequencies from the Sonic Lab.
                     Try chanting with 432Hz or 528Hz background for deeper resonance.
                   </p>
                 </div>
                 <Link
                   to="/sonic-lab"
                   className="px-6 py-3 rounded-full bg-primary/20 border border-primary/50 text-primary font-display text-sm tracking-wider hover:bg-primary/30 transition-colors"
                 >
                   Open Sonic Lab
                 </Link>
               </div>
             </motion.div>
           </div>
         </section>
 
         {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-8 text-center">
          <p className="text-xs text-muted-foreground/50">
            "मन्त्र साधना" — The Practice of Sacred Sound
          </p>
        </footer>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
    </PageTransition>
  );
};

export default Mantrochar;