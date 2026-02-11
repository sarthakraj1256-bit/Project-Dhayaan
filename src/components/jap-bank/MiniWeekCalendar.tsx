import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { JapEntry } from '@/hooks/useJapBank';
import type { JapGoal } from '@/hooks/useJapBank';

interface MiniWeekCalendarProps {
  entries: JapEntry[];
  goals: JapGoal[];
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MiniWeekCalendar = ({ entries, goals, onSelectDate, selectedDate }: MiniWeekCalendarProps) => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const weekDays = useMemo(() => {
    // Get this week's Monday
    const dow = today.getDay();
    const mondayOffset = dow === 0 ? 6 : dow - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Build daily counts
    const dailyCounts: Record<string, number> = {};
    entries.forEach(e => {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      dailyCounts[key] = (dailyCounts[key] || 0) + e.chant_count;
    });

    // Check which dates have a completed goal
    const goalCompletedDates = new Set<string>();
    goals.forEach(g => {
      if (g.status === 'completed' && g.updated_at) {
        goalCompletedDates.add(new Date(g.updated_at).toISOString().slice(0, 10));
      }
    });

    const days: { dateStr: string; dayNum: number; label: string; count: number; isToday: boolean; hasGoalComplete: boolean; isFuture: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNum: d.getDate(),
        label: DAY_LABELS[i],
        count: dailyCounts[dateStr] || 0,
        isToday: dateStr === todayStr,
        hasGoalComplete: goalCompletedDates.has(dateStr),
        isFuture: d > today,
      });
    }
    return days;
  }, [entries, goals, todayStr]);

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-1.5">
        {weekDays.map(day => {
          const isSelected = day.dateStr === selectedDate;
          const hasActivity = day.count > 0;

          return (
            <motion.button
              key={day.dateStr}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors relative ${
                isSelected
                  ? 'bg-primary/15'
                  : 'hover:bg-muted/50'
              }`}
            >
              <span className="text-[10px] text-muted-foreground font-medium">{day.label}</span>

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  day.isToday
                    ? 'text-primary-foreground font-bold'
                    : day.isFuture
                    ? 'text-muted-foreground/40'
                    : hasActivity
                    ? 'text-primary'
                    : 'text-foreground/70'
                }`}
                style={
                  day.isToday
                    ? {
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold-light)))',
                        boxShadow: '0 0 12px hsl(var(--gold) / 0.5)',
                      }
                    : undefined
                }
              >
                {day.dayNum}
              </div>

              {/* Activity / Goal indicator */}
              <div className="h-3 flex items-center justify-center">
                {day.hasGoalComplete ? (
                  <span className="text-[8px]">🪷</span>
                ) : hasActivity ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniWeekCalendar;
