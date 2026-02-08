import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { AartiSchedule } from '@/data/templeStreams';
import { Badge } from '@/components/ui/badge';

interface TempleScheduleProps {
  schedule: AartiSchedule[];
  compact?: boolean;
}

const getTimeIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 4 && hour < 7) return <Sunrise className="w-3.5 h-3.5 text-primary" />;
  if (hour >= 7 && hour < 12) return <Sun className="w-3.5 h-3.5 text-primary" />;
  if (hour >= 12 && hour < 17) return <Sun className="w-3.5 h-3.5 text-accent-foreground" />;
  if (hour >= 17 && hour < 20) return <Sunset className="w-3.5 h-3.5 text-primary" />;
  return <Moon className="w-3.5 h-3.5 text-muted-foreground" />;
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const isCurrentlyActive = (time: string, duration: number): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const aartiStart = new Date();
  aartiStart.setHours(hours, minutes, 0, 0);
  const aartiEnd = new Date(aartiStart.getTime() + duration * 60000);
  
  return now >= aartiStart && now <= aartiEnd;
};

const isUpcoming = (time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const aartiTime = new Date();
  aartiTime.setHours(hours, minutes, 0, 0);
  
  const diffMs = aartiTime.getTime() - now.getTime();
  const diffMins = diffMs / 60000;
  
  return diffMins > 0 && diffMins <= 60; // Within next hour
};

const TempleSchedule = forwardRef<HTMLDivElement, TempleScheduleProps>(({ schedule, compact = false }, ref) => {
  if (compact) {
    // Show only next 2 upcoming aartis for cards
    const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));
    const upcomingAartis = sortedSchedule.filter(aarti => {
      const now = new Date();
      const [hours, minutes] = aarti.time.split(':').map(Number);
      const aartiTime = new Date();
      aartiTime.setHours(hours, minutes, 0, 0);
      return aartiTime > now;
    }).slice(0, 2);

    if (upcomingAartis.length === 0) {
      // Show first 2 aartis of next day
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Next: {formatTime(sortedSchedule[0]?.time || '06:00')}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {upcomingAartis.map((aarti, idx) => (
          <Badge 
            key={idx} 
            variant="outline" 
            className={`text-xs gap-1 ${
              isUpcoming(aarti.time) ? 'border-primary/50 bg-primary/10 text-primary' : ''
            }`}
          >
            {getTimeIcon(aarti.time)}
            {formatTime(aarti.time)}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <h4 className="font-medium text-foreground">Daily Aarti Schedule</h4>
      </div>
      
      <div className="grid gap-2">
        {schedule.map((aarti, index) => {
          const isActive = isCurrentlyActive(aarti.time, aarti.duration);
          const upcoming = isUpcoming(aarti.time);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-primary/20 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]' 
                  : upcoming 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card/50 border-border/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getTimeIcon(aarti.time)}
                <div>
                  <p className="font-medium text-foreground text-sm">{aarti.name}</p>
                  {aarti.description && (
                    <p className="text-xs text-muted-foreground">{aarti.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/80">{formatTime(aarti.time)}</span>
                {isActive && (
                  <Badge className="bg-primary text-primary-foreground text-xs animate-pulse">
                    LIVE NOW
                  </Badge>
                )}
                {upcoming && !isActive && (
                  <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                    Soon
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

TempleSchedule.displayName = 'TempleSchedule';

export default TempleSchedule;
