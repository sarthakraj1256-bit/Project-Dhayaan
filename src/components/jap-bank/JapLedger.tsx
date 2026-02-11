import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Trophy } from 'lucide-react';
import type { JapEntry } from '@/hooks/useJapBank';

interface JapLedgerProps {
  entries: JapEntry[];
  lifetimeTotal: number;
  todayTotal: number;
  getTotalForMantra: (name: string) => number;
}

const JapLedger = ({ entries, lifetimeTotal, todayTotal, getTotalForMantra }: JapLedgerProps) => {
  const mantraNames = useMemo(() => {
    const names = new Set(entries.map(e => e.mantra_name));
    return Array.from(names);
  }, [entries]);

  const weeklyTotal = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entries
      .filter(e => new Date(e.created_at) >= weekAgo)
      .reduce((sum, e) => sum + e.chant_count, 0);
  }, [entries]);

  // Streak calculation
  const streak = useMemo(() => {
    const days = new Set(entries.map(e => new Date(e.created_at).toDateString()));
    let s = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [entries]);

  // Heatmap: last 7 weeks (49 days)
  const heatmapData = useMemo(() => {
    const dailyCounts: Record<string, number> = {};
    entries.forEach(e => {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      dailyCounts[key] = (dailyCounts[key] || 0) + e.chant_count;
    });

    const days: { date: Date; dateStr: string; count: number }[] = [];
    const today = new Date();
    for (let i = 48; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date: d, dateStr, count: dailyCounts[dateStr] || 0 });
    }
    const maxCount = Math.max(...days.map(d => d.count), 1);
    return { days, maxCount };
  }, [entries]);

  const getHeatColor = (count: number, max: number) => {
    if (count === 0) return 'bg-muted/50';
    const ratio = count / max;
    if (ratio > 0.75) return 'bg-primary';
    if (ratio > 0.5) return 'bg-primary/70';
    if (ratio > 0.25) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  // Streak fire badges
  const streakLabel = streak >= 30 ? '🔥🔥🔥' : streak >= 7 ? '🔥🔥' : streak >= 1 ? '🔥' : '';

  return (
    <div className="space-y-4">
      {/* Streak Banner */}
      {streak >= 1 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 px-4">
          <span className="text-2xl">{streakLabel}</span>
          <span className="text-sm font-semibold text-primary">
            {streak} Day Streak{streak >= 7 ? ' — Keep it up!' : ''}
          </span>
          <span className="text-2xl">{streakLabel}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary font-[Cinzel]">{todayTotal}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold text-accent font-[Cinzel]">{weeklyTotal}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary font-[Cinzel]">{lifetimeTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Heatmap */}
      <Card className="border-primary/20 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">🗓️ Chanting Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-muted-foreground text-center font-medium">{d}</div>
            ))}
            {heatmapData.days.map(d => (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.count.toLocaleString()} chants`}
                className={`aspect-square rounded-sm ${getHeatColor(d.count, heatmapData.maxCount)} transition-colors`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[10px] text-muted-foreground">Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-Mantra Breakdown */}
      <Card className="border-primary/20 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">📿 Mantra Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mantraNames.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No chants recorded yet. Start chanting! 🙏
            </p>
          )}
          {mantraNames.map(name => {
            const total = getTotalForMantra(name);
            const maxDisplay = Math.max(total, 1000);
            return (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground truncate mr-2">{name}</span>
                  <span className="text-primary font-semibold">{total.toLocaleString()}</span>
                </div>
                <Progress value={(total / maxDisplay) * 100} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default JapLedger;
