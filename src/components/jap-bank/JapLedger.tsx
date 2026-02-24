import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizeUnit } from '@/i18n/units';
import type { JapEntry } from '@/hooks/useJapBank';

interface JapLedgerProps {
  entries: JapEntry[];
  lifetimeTotal: number;
  todayTotal: number;
  getTotalForMantra: (name: string) => number;
}

const JapLedger = ({ entries, lifetimeTotal, todayTotal, getTotalForMantra }: JapLedgerProps) => {
  const { t } = useLanguage();
  const mantraNames = useMemo(() => {
    const names = new Set(entries.map(e => e.mantra_name));
    return Array.from(names);
  }, [entries]);

  const streak = useMemo(() => {
    const days = new Set(entries.map(e => new Date(e.created_at).toDateString()));
    let s = 0;
    const d = new Date();
    while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }, [entries]);

  const streakLabel = streak >= 30 ? '🔥🔥🔥' : streak >= 7 ? '🔥🔥' : streak >= 1 ? '🔥' : '';

  return (
    <div className="space-y-4">
      {streak >= 1 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 px-4">
          <span className="text-2xl">{streakLabel}</span>
          <span className="text-sm font-semibold text-primary">
            {localizeUnit(streak, streak === 1 ? 'day' : 'days', 'en')} {t('jap.dayStreak')}{streak >= 7 ? ' — ' + (t('jap.dayStreak')) : ''}
          </span>
          <span className="text-2xl">{streakLabel}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary font-[Cinzel]">{todayTotal}</p>
            <p className="text-xs text-muted-foreground">{t('common.today')}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary font-[Cinzel]">{lifetimeTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('common.lifetime')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">{t('jap.mantraBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mantraNames.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('jap.noChants')}</p>
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
