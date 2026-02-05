import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { SpiritualProgress } from '@/hooks/useSpiritualProgress';

interface KarmaDisplayProps {
  progress: SpiritualProgress;
}

const LEVEL_NAMES: Record<string, { label: string; sanskrit: string }> = {
  novice: { label: 'Novice', sanskrit: 'नवीन' },
  seeker: { label: 'Seeker', sanskrit: 'साधक' },
  yogi: { label: 'Yogi', sanskrit: 'योगी' },
  sage: { label: 'Sage', sanskrit: 'ऋषि' },
  enlightened: { label: 'Enlightened', sanskrit: 'बुद्ध' },
};

const KarmaDisplay = ({ progress }: KarmaDisplayProps) => {
  const levelInfo = LEVEL_NAMES[progress.current_level] || LEVEL_NAMES.novice;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="font-display text-lg tracking-wider text-foreground">Karma Points</h3>
      </div>

      {/* Karma Counter */}
      <motion.div
        key={progress.karma_points}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="relative mb-6"
      >
        <div className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400">
          {progress.karma_points.toLocaleString()}
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 -z-10" />
      </motion.div>

      {/* Level Badge */}
      <div className="inline-flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
        <span className="text-2xl font-sanskrit text-amber-400 mb-1">{levelInfo.sanskrit}</span>
        <span className="text-sm text-foreground tracking-wider">{levelInfo.label}</span>
      </div>

      {/* Streak indicator */}
      {progress.current_streak > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-orange-400">
          <span>🔥</span>
          <span>{progress.current_streak} day streak</span>
        </div>
      )}
    </div>
  );
};

export default KarmaDisplay;
