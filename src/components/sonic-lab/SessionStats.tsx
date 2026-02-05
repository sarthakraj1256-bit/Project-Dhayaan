 import { motion } from 'framer-motion';
 import { Clock, Target, TrendingUp, Award, History } from 'lucide-react';
 import { SessionStats as SessionStatsType } from '@/hooks/useSessionHistory';
 
 interface SessionStatsProps {
   stats: SessionStatsType | null;
   isLoading: boolean;
   isAuthenticated: boolean;
 }
 
 const SessionStats = ({ stats, isLoading, isAuthenticated }: SessionStatsProps) => {
   if (!isAuthenticated) {
     return (
       <div className="text-center py-4 text-muted-foreground text-sm">
         Sign in to track your meditation journey
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
 
   if (!stats || stats.totalSessions === 0) {
     return (
       <div className="text-center py-4">
         <History className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
         <p className="text-muted-foreground text-sm">No sessions yet</p>
         <p className="text-muted-foreground/70 text-xs mt-1">
           Complete a 30+ second session to start tracking
         </p>
       </div>
     );
   }
 
   const formatTime = (hours: number) => {
     if (hours >= 1) {
       return `${hours}h`;
     }
     return `${stats.totalMinutes}m`;
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="grid grid-cols-2 sm:grid-cols-4 gap-3"
     >
       {/* Total Time */}
       <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
         <div className="flex items-center gap-2 mb-1">
           <Clock className="w-4 h-4 text-primary" />
           <span className="text-xs text-muted-foreground">Total Time</span>
         </div>
         <p className="font-display text-xl text-foreground">{formatTime(stats.totalHours)}</p>
       </div>
 
       {/* Sessions */}
       <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
         <div className="flex items-center gap-2 mb-1">
           <Target className="w-4 h-4 text-emerald-500" />
           <span className="text-xs text-muted-foreground">Sessions</span>
         </div>
         <p className="font-display text-xl text-foreground">{stats.totalSessions}</p>
       </div>
 
       {/* Average */}
       <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
         <div className="flex items-center gap-2 mb-1">
           <TrendingUp className="w-4 h-4 text-amber-500" />
           <span className="text-xs text-muted-foreground">Avg Session</span>
         </div>
         <p className="font-display text-xl text-foreground">{stats.averageSessionMinutes}m</p>
       </div>
 
       {/* Most Used */}
       <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
         <div className="flex items-center gap-2 mb-1">
           <Award className="w-4 h-4 text-violet-500" />
           <span className="text-xs text-muted-foreground">Favorite</span>
         </div>
         <p className="font-display text-lg text-foreground">
           {stats.mostUsedFrequency ? `${stats.mostUsedFrequency.value}Hz` : '-'}
         </p>
       </div>
     </motion.div>
   );
 };
 
 export default SessionStats;