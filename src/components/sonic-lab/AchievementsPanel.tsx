 import { motion } from 'framer-motion';
 import { Trophy, Lock } from 'lucide-react';
 import { AchievementWithStatus } from '@/hooks/useAchievements';
 import ShareButton from './ShareButton';
 
 interface AchievementsPanelProps {
   achievements: AchievementWithStatus[];
   unlockedCount: number;
   totalCount: number;
   isLoading: boolean;
   isAuthenticated: boolean;
 }
 
 const rarityColors = {
   common: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
   rare: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
   epic: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
   legendary: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
 };
 
 const rarityGlow = {
   common: '',
   rare: 'shadow-blue-500/20',
   epic: 'shadow-purple-500/20',
   legendary: 'shadow-amber-500/30 shadow-lg',
 };
 
 const AchievementBadge = ({ achievement }: { achievement: AchievementWithStatus }) => {
   const isLocked = !achievement.unlocked;
   
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       whileHover={{ scale: 1.02 }}
       className={`
         relative p-3 rounded-xl border bg-gradient-to-br transition-all duration-300
         ${isLocked 
           ? 'from-white/5 to-white/0 border-white/10 opacity-60' 
           : `${rarityColors[achievement.rarity]} ${rarityGlow[achievement.rarity]}`
         }
       `}
     >
       <div className="flex items-start gap-3">
         {/* Icon */}
         <div 
           className={`
             w-10 h-10 rounded-lg flex items-center justify-center text-xl
             ${isLocked ? 'bg-white/5' : 'bg-white/10'}
           `}
         >
           {isLocked ? (
             <Lock className="w-4 h-4 text-muted-foreground" />
           ) : (
             <span>{achievement.icon}</span>
           )}
         </div>
 
         {/* Content */}
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
             <p className={`font-display text-sm tracking-wide ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
               {achievement.name}
             </p>
             {!isLocked && (
               <span className={`
                 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider
                 ${achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
                   achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                   achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                   'bg-slate-500/20 text-slate-400'
                 }
               `}>
                 {achievement.rarity}
               </span>
             )}
           </div>
           <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
             {achievement.description}
           </p>
 
           {/* Progress Bar (for locked achievements with progress) */}
           {isLocked && achievement.progress !== undefined && achievement.progress > 0 && (
             <div className="mt-2">
               <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                 <span>{achievement.progressText}</span>
                 <span>{Math.round(achievement.progress)}%</span>
               </div>
               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary/50 rounded-full transition-all duration-500"
                   style={{ width: `${achievement.progress}%` }}
                 />
               </div>
             </div>
           )}
 
           {/* Unlocked date */}
           {!isLocked && achievement.unlockedAt && (
             <p className="text-[10px] text-muted-foreground/70 mt-1">
               Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
             </p>
           )}
         </div>
       </div>
     </motion.div>
   );
 };
 
 const AchievementsPanel = ({
   achievements,
   unlockedCount,
   totalCount,
   isLoading,
   isAuthenticated,
 }: AchievementsPanelProps) => {
  const getShareText = () => {
    const unlocked = achievements.filter(a => a.unlocked);
    if (unlocked.length === 0) return 'Starting my meditation journey with Dhyaan!';
    
    const recentUnlock = unlocked.sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    })[0];
    
    return `🏅 Just unlocked "${recentUnlock.name}" achievement!\n\n${recentUnlock.description}\n\n${unlockedCount}/${totalCount} achievements unlocked on my meditation journey`;
  };

   if (!isAuthenticated) {
     return (
       <div className="text-center py-4 text-muted-foreground text-sm">
         Sign in to earn achievements
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
 
   // Sort: unlocked first, then by rarity
   const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
   const sortedAchievements = [...achievements].sort((a, b) => {
     if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
     return rarityOrder[a.rarity] - rarityOrder[b.rarity];
   });
 
   return (
     <div>
       {/* Header Stats */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
           <Trophy className="w-4 h-4 text-primary" />
           <span className="text-sm font-display text-foreground">
             {unlockedCount} / {totalCount}
           </span>
         </div>
         <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
           <div 
             className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
             style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
           />
         </div>
        {unlockedCount > 0 && (
          <ShareButton
            title="Share achievements"
            text={getShareText()}
            hashtags={['meditation', 'achievement', 'dhyaan', 'mindfulness']}
          />
        )}
       </div>
 
       {/* Achievements Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
         {sortedAchievements.map((achievement) => (
           <AchievementBadge key={achievement.id} achievement={achievement} />
         ))}
       </div>
     </div>
   );
 };
 
 export default AchievementsPanel;