import { motion } from 'framer-motion';
import { LEVEL_THRESHOLDS, getNextLevelThreshold, type SpiritualProgress, type SpiritualLevel } from '@/hooks/useSpiritualProgress';

interface LevelProgressBarProps {
  progress: SpiritualProgress;
}

const LEVEL_COLORS: Record<SpiritualLevel, string> = {
  novice: 'from-gray-400 to-gray-500',
  seeker: 'from-blue-400 to-cyan-400',
  yogi: 'from-emerald-400 to-green-400',
  sage: 'from-amber-400 to-orange-400',
  enlightened: 'from-violet-400 to-purple-400',
};

const LEVEL_INFO: Record<SpiritualLevel, { icon: string; name: string }> = {
  novice: { icon: '🌱', name: 'Novice' },
  seeker: { icon: '🔍', name: 'Seeker' },
  yogi: { icon: '🧘', name: 'Yogi' },
  sage: { icon: '📿', name: 'Sage' },
  enlightened: { icon: '✨', name: 'Enlightened' },
};

const LevelProgressBar = ({ progress }: LevelProgressBarProps) => {
  const currentLevel = progress.current_level as SpiritualLevel;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = getNextLevelThreshold(currentLevel);
  
  const pointsInLevel = progress.karma_points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const percentage = Math.min((pointsInLevel / pointsNeeded) * 100, 100);
  
  const isMaxLevel = currentLevel === 'enlightened';
  const levelInfo = LEVEL_INFO[currentLevel];
  const colorGradient = LEVEL_COLORS[currentLevel];

  return (
    <div className="space-y-4">
      {/* Level indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{levelInfo.icon}</span>
          <div>
            <h3 className="font-display text-xl text-foreground">{levelInfo.name}</h3>
            <p className="text-xs text-muted-foreground">
              {isMaxLevel ? 'Maximum level reached' : `${pointsNeeded - pointsInLevel} points to next level`}
            </p>
          </div>
        </div>
        
        {!isMaxLevel && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next Level</p>
            <p className="font-display text-foreground">
              {LEVEL_INFO[Object.keys(LEVEL_THRESHOLDS)[Object.keys(LEVEL_THRESHOLDS).indexOf(currentLevel) + 1] as SpiritualLevel]?.name}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-4 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorGradient}`}
        />
        
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      {/* Level milestones */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {Object.entries(LEVEL_INFO).map(([level, info], index) => {
          const threshold = LEVEL_THRESHOLDS[level as SpiritualLevel];
          const isUnlocked = progress.karma_points >= threshold;
          const isCurrent = level === currentLevel;
          
          return (
            <div
              key={level}
              className={`flex flex-col items-center ${
                isCurrent ? 'text-primary' : isUnlocked ? 'text-foreground/60' : 'text-muted-foreground/40'
              }`}
            >
              <span className={`text-lg ${!isUnlocked && 'grayscale opacity-50'}`}>{info.icon}</span>
              <span className="hidden sm:block">{threshold.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelProgressBar;
