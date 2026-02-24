import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Award, History, Flame, Trophy } from 'lucide-react';
import { SessionStats as SessionStatsType } from '@/hooks/useSessionHistory';
import ShareButton from './ShareButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedUnit } from '@/i18n/units';

interface SessionStatsProps {
  stats: SessionStatsType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SessionStats = ({ stats, isLoading, isAuthenticated }: SessionStatsProps) => {
  const { t, language } = useLanguage();

  const getShareText = () => {
    if (!stats) return '';
    const parts = [];
    if (stats.totalHours >= 1) {
      parts.push(`🧘 ${stats.totalHours} ${language === 'hi' ? 'घंटे ध्यान' : 'hours of meditation'}`);
    } else {
      parts.push(`🧘 ${stats.totalMinutes} ${language === 'hi' ? 'मिनट ध्यान' : 'minutes of meditation'}`);
    }
    if (stats.currentStreak > 0) {
      parts.push(`🔥 ${stats.currentStreak} ${getLocalizedUnit(stats.currentStreak === 1 ? 'day' : 'days', language)} ${language === 'hi' ? 'लगातार' : 'streak'}`);
    }
    if (stats.longestStreak > 1) {
      parts.push(`🏆 ${language === 'hi' ? 'सर्वश्रेष्ठ लगातार' : 'Best streak'}: ${stats.longestStreak} ${getLocalizedUnit('days', language)}`);
    }
    parts.push(language === 'hi' ? '\nध्यान के साथ मौन का विज्ञान खोजें' : '\nDiscover the science of silence with Dhyaan');
    return parts.join('\n');
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        {t('sonic.signInToTrack')}
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
        <p className="text-muted-foreground text-sm">{t('sonic.noSessions')}</p>
        <p className="text-muted-foreground/70 text-xs mt-1">
          {t('sonic.noSessionsDesc')}
        </p>
      </div>
    );
  }

  const formatTime = (hours: number) => {
    if (hours >= 1) {
      return `${hours}${getLocalizedUnit('h', language)}`;
    }
    return `${stats.totalMinutes}${getLocalizedUnit('m', language)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-end mb-3">
        <ShareButton
          title={t('sonic.shareJourney')}
          text={getShareText()}
          hashtags={['meditation', 'mindfulness', 'dhyaan', 'wellness']}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Time */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('sonic.totalTime')}</span>
          </div>
          <p className="font-display text-xl text-foreground">{formatTime(stats.totalHours)}</p>
        </div>

        {/* Sessions */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">{t('sonic.sessions')}</span>
          </div>
          <p className="font-display text-xl text-foreground">{stats.totalSessions}</p>
        </div>

        {/* Average */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">{t('sonic.avgSession')}</span>
          </div>
          <p className="font-display text-xl text-foreground">{stats.averageSessionMinutes}{getLocalizedUnit('m', language)}</p>
        </div>

        {/* Most Used */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">{t('sonic.favorite')}</span>
          </div>
          <p className="font-display text-lg text-foreground">
            {stats.mostUsedFrequency ? `${stats.mostUsedFrequency.value}Hz` : '-'}
          </p>
        </div>

        {/* Current Streak */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">{t('sonic.streak')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="font-display text-xl text-foreground">{stats.currentStreak}</p>
            <span className="text-xs text-muted-foreground">
              {getLocalizedUnit(stats.currentStreak === 1 ? 'day' : 'days', language)}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-muted-foreground">{t('sonic.bestStreak')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="font-display text-xl text-foreground">{stats.longestStreak}</p>
            <span className="text-xs text-muted-foreground">
              {getLocalizedUnit(stats.longestStreak === 1 ? 'day' : 'days', language)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionStats;
