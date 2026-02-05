 import { useState, useMemo } from 'react';
 import { motion } from 'framer-motion';
 import { Calendar } from '@/components/ui/calendar';
 import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
 import { cn } from '@/lib/utils';
 import type { MeditationSession } from '@/hooks/useSessionHistory';
 
 interface MeditationCalendarProps {
   sessions: MeditationSession[];
   isLoading: boolean;
   isAuthenticated: boolean;
 }
 
 interface DayStats {
   count: number;
   totalMinutes: number;
 }
 
 const MeditationCalendar = ({ sessions, isLoading, isAuthenticated }: MeditationCalendarProps) => {
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
   const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
 
   // Group sessions by date
   const sessionsByDate = useMemo(() => {
     const map = new Map<string, DayStats>();
     sessions.forEach((session) => {
       const dateKey = format(new Date(session.started_at), 'yyyy-MM-dd');
       const existing = map.get(dateKey) || { count: 0, totalMinutes: 0 };
       map.set(dateKey, {
         count: existing.count + 1,
         totalMinutes: existing.totalMinutes + Math.round(session.duration_seconds / 60),
       });
     });
     return map;
   }, [sessions]);
 
   // Get sessions for selected date
   const selectedDateSessions = useMemo(() => {
     if (!selectedDate) return [];
     return sessions.filter((s) => isSameDay(new Date(s.started_at), selectedDate));
   }, [sessions, selectedDate]);
 
   // Days with meditation activity
   const activeDays = useMemo(() => {
     return sessions.map((s) => new Date(s.started_at));
   }, [sessions]);
 
   // Get intensity level (1-4) based on minutes meditated
   const getIntensity = (minutes: number): number => {
     if (minutes >= 60) return 4;
     if (minutes >= 30) return 3;
     if (minutes >= 15) return 2;
     return 1;
   };
 
   if (!isAuthenticated) {
     return (
       <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
         <p className="text-muted-foreground">Sign in to view your meditation calendar</p>
       </div>
     );
   }
 
   if (isLoading) {
     return (
       <div className="p-6 rounded-xl bg-white/5 border border-white/10">
         <div className="animate-pulse space-y-4">
           <div className="h-64 bg-white/5 rounded-lg" />
         </div>
       </div>
     );
   }
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
     >
       <div className="p-4 flex flex-col lg:flex-row gap-4">
         {/* Calendar */}
         <div className="flex-1">
           <Calendar
             mode="single"
             selected={selectedDate}
             onSelect={setSelectedDate}
             month={currentMonth}
             onMonthChange={setCurrentMonth}
             className="pointer-events-auto"
             modifiers={{
               meditation: activeDays,
             }}
             modifiersClassNames={{
               meditation: '',
             }}
             components={{
               Day: ({ date, ...props }) => {
                 const dateKey = format(date, 'yyyy-MM-dd');
                 const stats = sessionsByDate.get(dateKey);
                 const intensity = stats ? getIntensity(stats.totalMinutes) : 0;
                 const isSelected = selectedDate && isSameDay(date, selectedDate);
                 const isToday = isSameDay(date, new Date());
 
                 return (
                   <button
                     {...props}
                     onClick={() => setSelectedDate(date)}
                     className={cn(
                       'relative h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md transition-colors',
                       'hover:bg-white/10',
                       isSelected && 'ring-2 ring-primary',
                       isToday && !isSelected && 'border border-primary/50'
                     )}
                   >
                     <span className="relative z-10 text-sm">{date.getDate()}</span>
                     {stats && (
                       <span
                         className={cn(
                           'absolute inset-1 rounded-md -z-0',
                           intensity === 1 && 'bg-primary/20',
                           intensity === 2 && 'bg-primary/40',
                           intensity === 3 && 'bg-primary/60',
                           intensity === 4 && 'bg-primary/80'
                         )}
                       />
                     )}
                   </button>
                 );
               },
             }}
           />
 
           {/* Legend */}
           <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
             <span>Less</span>
             <div className="flex gap-1">
               <div className="w-3 h-3 rounded bg-primary/20" />
               <div className="w-3 h-3 rounded bg-primary/40" />
               <div className="w-3 h-3 rounded bg-primary/60" />
               <div className="w-3 h-3 rounded bg-primary/80" />
             </div>
             <span>More</span>
           </div>
         </div>
 
         {/* Selected Day Details */}
         <div className="lg:w-64 p-4 bg-white/5 rounded-lg">
           {selectedDate ? (
             <div className="space-y-3">
               <h4 className="font-display text-sm tracking-wider text-foreground">
                 {format(selectedDate, 'MMMM d, yyyy')}
               </h4>
 
               {selectedDateSessions.length > 0 ? (
                 <>
                   <div className="flex items-center gap-4 text-sm">
                     <div>
                       <span className="text-muted-foreground">Sessions: </span>
                       <span className="text-primary font-medium">{selectedDateSessions.length}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground">Time: </span>
                       <span className="text-primary font-medium">
                         {Math.round(
                           selectedDateSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
                         )}m
                       </span>
                     </div>
                   </div>
 
                   <div className="space-y-2 max-h-48 overflow-y-auto">
                     {selectedDateSessions.map((session) => (
                       <div
                         key={session.id}
                         className="p-2 bg-white/5 rounded-lg text-xs space-y-1"
                       >
                         <div className="flex justify-between items-center">
                           <span className="text-primary font-medium">{session.frequency_name}</span>
                           <span className="text-muted-foreground">
                             {Math.round(session.duration_seconds / 60)}m
                           </span>
                         </div>
                         <div className="text-muted-foreground">
                           {format(new Date(session.started_at), 'h:mm a')} • {session.frequency_category}
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               ) : (
                 <p className="text-sm text-muted-foreground">No meditation sessions on this day</p>
               )}
             </div>
           ) : (
             <div className="text-center text-sm text-muted-foreground py-8">
               Select a day to view details
             </div>
           )}
         </div>
       </div>
 
       {/* Monthly Summary */}
       <div className="px-4 pb-4">
         <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between text-sm">
           <span className="text-muted-foreground">{format(currentMonth, 'MMMM yyyy')} Summary</span>
           <div className="flex gap-4">
             {(() => {
               const monthStart = startOfMonth(currentMonth);
               const monthEnd = endOfMonth(currentMonth);
               const monthSessions = sessions.filter((s) => {
                 const date = new Date(s.started_at);
                 return date >= monthStart && date <= monthEnd;
               });
               const totalMinutes = Math.round(
                 monthSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
               );
               const uniqueDays = new Set(
                 monthSessions.map((s) => format(new Date(s.started_at), 'yyyy-MM-dd'))
               ).size;
 
               return (
                 <>
                   <span>
                     <span className="text-primary font-medium">{monthSessions.length}</span>{' '}
                     <span className="text-muted-foreground">sessions</span>
                   </span>
                   <span>
                     <span className="text-primary font-medium">{uniqueDays}</span>{' '}
                     <span className="text-muted-foreground">days</span>
                   </span>
                   <span>
                     <span className="text-primary font-medium">
                       {totalMinutes >= 60
                         ? `${Math.round(totalMinutes / 60 * 10) / 10}h`
                         : `${totalMinutes}m`}
                     </span>{' '}
                     <span className="text-muted-foreground">total</span>
                   </span>
                 </>
               );
             })()}
           </div>
         </div>
       </div>
     </motion.div>
   );
 };
 
 export default MeditationCalendar;