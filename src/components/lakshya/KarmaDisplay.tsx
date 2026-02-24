import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { SpiritualProgress } from '@/hooks/useSpiritualProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedUnit } from '@/i18n/units';
import type { TranslationKey } from '@/i18n/translations';

interface KarmaDisplayProps {
  progress: SpiritualProgress;
}

const levelKeyMap: Record<string, TranslationKey> = {
  novice: 'karma.level.novice',
  seeker: 'karma.level.seeker',
  yogi: 'karma.level.yogi',
  sage: 'karma.level.sage',
  enlightened: 'karma.level.enlightened',
};

const LEVEL_SANSKRIT: Record<string, string> = {
  novice: 'नवीन',
  seeker: 'साधक',
  yogi: 'योगी',
  sage: 'ऋषि',
  enlightened: 'बुद्ध',
};

const KarmaDisplay = ({ progress }: KarmaDisplayProps) => {
  const { t, language } = useLanguage();
  const levelLabel = t(levelKeyMap[progress.current_level] || levelKeyMap.novice);
  const levelSanskrit = LEVEL_SANSKRIT[progress.current_level] || LEVEL_SANSKRIT.novice;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="font-display text-lg tracking-wider text-foreground">{t('karma.points')}</h3>
      </div>

      <motion.div
        key={progress.karma_points}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="relative mb-6"
      >
        <div className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400">
          {progress.karma_points.toLocaleString()}
        </div>
        <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 -z-10" />
      </motion.div>

      <div className="inline-flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
        <span className="text-2xl font-sanskrit text-amber-400 mb-1">{levelSanskrit}</span>
        <span className="text-sm text-foreground tracking-wider">{levelLabel}</span>
      </div>

      {progress.current_streak > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-orange-400">
          <span>🔥</span>
          <span>{progress.current_streak} {t('karma.dayStreak')}</span>
        </div>
      )}
    </div>
  );
};

export default KarmaDisplay;
