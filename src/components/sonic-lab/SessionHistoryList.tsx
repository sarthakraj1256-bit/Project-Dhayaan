 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { format } from 'date-fns';
 import { Clock, Radio, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
 import type { MeditationSession } from '@/hooks/useSessionHistory';
 
 interface SessionHistoryListProps {
   sessions: MeditationSession[];
   isLoading: boolean;
   isAuthenticated: boolean;
   onDeleteSession?: (id: string) => Promise<boolean>;
 }
 
 const SessionHistoryList = ({
   sessions,
   isLoading,
   isAuthenticated,
   onDeleteSession,
 }: SessionHistoryListProps) => {
   const [expanded, setExpanded] = useState(false);
   const [deletingId, setDeletingId] = useState<string | null>(null);
 
   const displayCount = expanded ? sessions.length : 5;
   const displayedSessions = sessions.slice(0, displayCount);
 
   const handleDelete = async (id: string) => {
     if (!onDeleteSession) return;
     setDeletingId(id);
     await onDeleteSession(id);
     setDeletingId(null);
   };
 
   const formatDuration = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     if (mins >= 60) {
       const hours = Math.floor(mins / 60);
       const remainingMins = mins % 60;
       return `${hours}h ${remainingMins}m`;
     }
     return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
   };
 
   if (!isAuthenticated) {
     return (
       <div className="text-center py-4 text-muted-foreground text-sm">
         Sign in to view your session history
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
 
   if (sessions.length === 0) {
     return (
       <div className="text-center py-6">
         <Clock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
         <p className="text-muted-foreground text-sm">No sessions recorded yet</p>
         <p className="text-muted-foreground/70 text-xs mt-1">
           Complete a meditation to see it here
         </p>
       </div>
     );
   }
 
   // Group sessions by date
   const groupedSessions: Record<string, MeditationSession[]> = {};
   displayedSessions.forEach((session) => {
     const dateKey = format(new Date(session.started_at), 'yyyy-MM-dd');
     if (!groupedSessions[dateKey]) {
       groupedSessions[dateKey] = [];
     }
     groupedSessions[dateKey].push(session);
   });
 
   const dateGroups = Object.entries(groupedSessions).sort(
     ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
   );
 
   return (
     <div className="space-y-4">
       {dateGroups.map(([dateKey, dateSessions]) => (
         <div key={dateKey}>
           {/* Date Header */}
           <div className="flex items-center gap-2 mb-2">
             <div className="h-px flex-1 bg-white/10" />
             <span className="text-xs text-muted-foreground px-2">
               {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
             </span>
             <div className="h-px flex-1 bg-white/10" />
           </div>
 
           {/* Sessions for this date */}
           <div className="space-y-2">
             <AnimatePresence mode="popLayout">
               {dateSessions.map((session) => (
                 <motion.div
                   key={session.id}
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                 >
                   <div className="flex items-center gap-4">
                     {/* Frequency Icon */}
                     <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                       <Radio className="w-4 h-4 text-primary" />
                     </div>
 
                     {/* Session Info */}
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="font-display text-sm text-foreground">
                           {session.frequency_name}
                         </span>
                         <span className="text-xs text-primary/80">
                           {session.frequency_value}Hz
                         </span>
                         <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                           {session.frequency_category}
                         </span>
                       </div>
                       <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                         <span>{format(new Date(session.started_at), 'h:mm a')}</span>
                         <span>•</span>
                         <span className="text-primary/80 font-medium">
                           {formatDuration(session.duration_seconds)}
                         </span>
                         {session.atmosphere_id !== 'none' && (
                           <>
                             <span>•</span>
                             <span className="capitalize">{session.atmosphere_id}</span>
                           </>
                         )}
                       </div>
                     </div>
 
                     {/* Delete Button */}
                     {onDeleteSession && (
                       <button
                         onClick={() => handleDelete(session.id)}
                         disabled={deletingId === session.id}
                         className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                         title="Delete session"
                       >
                         {deletingId === session.id ? (
                           <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                         ) : (
                           <Trash2 className="w-4 h-4" />
                         )}
                       </button>
                     )}
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
         </div>
       ))}
 
       {/* Show More/Less Button */}
       {sessions.length > 5 && (
         <button
           onClick={() => setExpanded(!expanded)}
           className="w-full py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
         >
           {expanded ? (
             <>
               <ChevronUp className="w-4 h-4" />
               Show less
             </>
           ) : (
             <>
               <ChevronDown className="w-4 h-4" />
               Show all {sessions.length} sessions
             </>
           )}
         </button>
       )}
     </div>
   );
 };
 
 export default SessionHistoryList;