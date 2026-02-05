 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Target, Calendar, Flame, ChevronRight, Check, X, Edit2 } from 'lucide-react';
 import { GoalProgress, GoalType } from '@/hooks/useMeditationGoals';
 import { Slider } from '@/components/ui/slider';
 
 interface GoalsPanelProps {
   weeklyProgress: GoalProgress | null;
   monthlyProgress: GoalProgress | null;
   isLoading: boolean;
   isAuthenticated: boolean;
   onSetGoal: (type: GoalType, minutes: number) => Promise<boolean>;
   onRemoveGoal: (type: GoalType) => Promise<boolean>;
 }
 
 const PRESET_GOALS = {
   weekly: [30, 60, 90, 120, 180],
   monthly: [120, 240, 360, 480, 600],
 };
 
 const GoalCard = ({
   type,
   progress,
   onSetGoal,
   onRemoveGoal,
 }: {
   type: GoalType;
   progress: GoalProgress | null;
   onSetGoal: (minutes: number) => Promise<boolean>;
   onRemoveGoal: () => Promise<boolean>;
 }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [customMinutes, setCustomMinutes] = useState(
     progress?.goal?.target_minutes || (type === 'weekly' ? 60 : 240)
   );
   const [isSaving, setIsSaving] = useState(false);
 
   const handleSave = async () => {
     setIsSaving(true);
     const success = await onSetGoal(customMinutes);
     if (success) {
       setIsEditing(false);
     }
     setIsSaving(false);
   };
 
   const handleRemove = async () => {
     setIsSaving(true);
     await onRemoveGoal();
     setIsSaving(false);
   };
 
   const formatMinutes = (mins: number) => {
     if (mins >= 60) {
       const hours = Math.floor(mins / 60);
       const remaining = mins % 60;
       return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
     }
     return `${mins}m`;
   };
 
   const isWeekly = type === 'weekly';
   const Icon = isWeekly ? Target : Calendar;
   const color = isWeekly ? 'cyan' : 'violet';
   const label = isWeekly ? 'Weekly Goal' : 'Monthly Goal';
 
   return (
     <div
       className={`relative p-4 rounded-xl border transition-all duration-300 ${
         progress?.isComplete
           ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30'
           : `bg-gradient-to-br from-${color}-500/10 to-${color}-500/5 border-${color}-500/20`
       }`}
     >
       {/* Header */}
       <div className="flex items-center justify-between mb-3">
         <div className="flex items-center gap-2">
           {progress?.isComplete ? (
             <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
               <Check className="w-4 h-4 text-emerald-500" />
             </div>
           ) : (
             <Icon className={`w-5 h-5 text-${color}-500`} />
           )}
           <span className="text-sm font-medium text-foreground">{label}</span>
         </div>
         
         {progress?.goal && !isEditing && (
           <button
             onClick={() => setIsEditing(true)}
             className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
           >
             <Edit2 className="w-3.5 h-3.5" />
           </button>
         )}
       </div>
 
       <AnimatePresence mode="wait">
         {isEditing ? (
           <motion.div
             key="editing"
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="space-y-4"
           >
             {/* Presets */}
             <div className="flex flex-wrap gap-2">
               {PRESET_GOALS[type].map((mins) => (
                 <button
                   key={mins}
                   onClick={() => setCustomMinutes(mins)}
                   className={`px-3 py-1 rounded-full text-xs transition-colors ${
                     customMinutes === mins
                       ? 'bg-primary/20 text-primary border border-primary/50'
                       : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                   }`}
                 >
                   {formatMinutes(mins)}
                 </button>
               ))}
             </div>
 
             {/* Custom Slider */}
             <div className="space-y-2">
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                 <span>Custom</span>
                 <span className="font-display text-foreground">{formatMinutes(customMinutes)}</span>
               </div>
               <Slider
                 value={[customMinutes]}
                 onValueChange={([v]) => setCustomMinutes(v)}
                 min={isWeekly ? 15 : 60}
                 max={isWeekly ? 300 : 1200}
                 step={isWeekly ? 15 : 30}
                 className="w-full"
               />
             </div>
 
             {/* Actions */}
             <div className="flex items-center gap-2">
               <button
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex-1 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium disabled:opacity-50"
               >
                 {isSaving ? 'Saving...' : 'Set Goal'}
               </button>
               <button
                 onClick={() => setIsEditing(false)}
                 className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
               {progress?.goal && (
                 <button
                   onClick={handleRemove}
                   disabled={isSaving}
                   className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                 >
                   <X className="w-4 h-4" />
                 </button>
               )}
             </div>
           </motion.div>
         ) : progress?.goal ? (
           <motion.div
             key="progress"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
           >
             {/* Progress Display */}
             <div className="mb-2">
               <div className="flex items-baseline gap-1">
                 <span className="font-display text-2xl text-foreground">
                   {formatMinutes(progress.currentMinutes)}
                 </span>
                 <span className="text-muted-foreground text-sm">
                   / {formatMinutes(progress.goal.target_minutes)}
                 </span>
               </div>
             </div>
 
             {/* Progress Bar */}
             <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${progress.percentage}%` }}
                 transition={{ duration: 0.8, ease: 'easeOut' }}
                 className={`h-full rounded-full ${
                   progress.isComplete
                     ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                     : `bg-gradient-to-r from-${color}-500 to-${color}-400`
                 }`}
               />
             </div>
 
             {/* Footer */}
             <div className="flex items-center justify-between text-xs text-muted-foreground">
               <span>{progress.percentage}% complete</span>
               <span className="flex items-center gap-1">
                 <Flame className="w-3 h-3" />
                 {progress.daysRemaining} days left
               </span>
             </div>
           </motion.div>
         ) : (
           <motion.button
             key="create"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setIsEditing(true)}
             className="w-full py-3 rounded-lg border border-dashed border-white/20 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
           >
             <span>Set {label}</span>
             <ChevronRight className="w-4 h-4" />
           </motion.button>
         )}
       </AnimatePresence>
     </div>
   );
 };
 
 const GoalsPanel = ({
   weeklyProgress,
   monthlyProgress,
   isLoading,
   isAuthenticated,
   onSetGoal,
   onRemoveGoal,
 }: GoalsPanelProps) => {
   if (!isAuthenticated) {
     return (
       <div className="text-center py-4 text-muted-foreground text-sm">
         Sign in to set meditation goals
       </div>
     );
   }
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-6">
         <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
       </div>
     );
   }
 
   return (
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <GoalCard
         type="weekly"
         progress={weeklyProgress}
         onSetGoal={(mins) => onSetGoal('weekly', mins)}
         onRemoveGoal={() => onRemoveGoal('weekly')}
       />
       <GoalCard
         type="monthly"
         progress={monthlyProgress}
         onSetGoal={(mins) => onSetGoal('monthly', mins)}
         onRemoveGoal={() => onRemoveGoal('monthly')}
       />
     </div>
   );
 };
 
 export default GoalsPanel;