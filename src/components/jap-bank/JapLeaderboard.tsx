import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedUnit } from '@/i18n/units';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string;
  total_chants: number;
  mantra_name: string;
}

interface JapLeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

const rankIcons = [
  <Trophy className="w-5 h-5 text-accent" />,
  <Medal className="w-5 h-5 text-muted-foreground" />,
  <Award className="w-5 h-5 text-primary" />,
];

const JapLeaderboard = ({ leaderboard }: JapLeaderboardProps) => {
  const { t, language } = useLanguage();

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-primary">{t('jap.leaderboard')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t('jap.noEntries')}
          </p>
        )}
        {leaderboard.map((entry, i) => {
          return (
            <div
              key={`${entry.id}-${entry.mantra_name}`}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-muted/40"
            >
              <div className="w-8 flex-shrink-0 text-center">
                {i < 3 ? rankIcons[i] : (
                  <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {(entry.display_name || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {entry.display_name || t('common.devotee')}
                </p>
                <p className="text-xs text-muted-foreground truncate">{entry.mantra_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">{entry.total_chants.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{t('jap.chants')}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default JapLeaderboard;
