import { memo, useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { LEVEL_THRESHOLDS, getNextLevelThreshold, type SpiritualProgress, type SpiritualLevel } from '@/hooks/useSpiritualProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

interface LiquidGoldProgressBarProps {
  progress: SpiritualProgress;
  showShimmer?: boolean;
}

const LEVEL_COLORS: Record<SpiritualLevel, { from: string; to: string; glow: string }> = {
  novice: { from: '#9ca3af', to: '#6b7280', glow: 'rgba(156, 163, 175, 0.5)' },
  seeker: { from: '#22d3ee', to: '#06b6d4', glow: 'rgba(34, 211, 238, 0.5)' },
  yogi: { from: '#4ade80', to: '#22c55e', glow: 'rgba(74, 222, 128, 0.5)' },
  sage: { from: '#fbbf24', to: '#f59e0b', glow: 'rgba(251, 191, 36, 0.6)' },
  enlightened: { from: '#c084fc', to: '#a855f7', glow: 'rgba(192, 132, 252, 0.6)' },
};

const LEVEL_ICONS: Record<SpiritualLevel, string> = {
  novice: '🌱',
  seeker: '🔍',
  yogi: '🧘',
  sage: '📿',
  enlightened: '✨',
};

const LEVEL_KEY_MAP: Record<SpiritualLevel, TranslationKey> = {
  novice: 'karma.level.novice',
  seeker: 'karma.level.seeker',
  yogi: 'karma.level.yogi',
  sage: 'karma.level.sage',
  enlightened: 'karma.level.enlightened',
};

/**
 * Premium liquid gold XP progress bar with shimmer effect
 * Animates like flowing molten gold when karma is earned
 */
const LiquidGoldProgressBar = memo(function LiquidGoldProgressBar({ 
  progress, 
  showShimmer = false 
}: LiquidGoldProgressBarProps) {
  const { t } = useLanguage();
  const [isShimmering, setIsShimmering] = useState(showShimmer);
  const [prevKarma, setPrevKarma] = useState(progress.karma_points);
  const shimmerControls = useAnimation();

  const currentLevel = progress.current_level as SpiritualLevel;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = getNextLevelThreshold(currentLevel);
  
  const pointsInLevel = progress.karma_points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const percentage = Math.min((pointsInLevel / pointsNeeded) * 100, 100);
  
  const isMaxLevel = currentLevel === 'enlightened';
  const levelIcon = LEVEL_ICONS[currentLevel];
  const levelName = t(LEVEL_KEY_MAP[currentLevel]);
  const colors = LEVEL_COLORS[currentLevel];

  // Detect karma gain and trigger shimmer
  useEffect(() => {
    if (progress.karma_points > prevKarma) {
      setIsShimmering(true);
      shimmerControls.start({
        x: ['0%', '200%'],
        transition: { duration: 1.5, ease: 'easeInOut' },
      });
      
      const timeout = setTimeout(() => setIsShimmering(false), 2000);
      return () => clearTimeout(timeout);
    }
    setPrevKarma(progress.karma_points);
  }, [progress.karma_points, prevKarma, shimmerControls]);

  return (
    <div className="space-y-4">
      {/* Level indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-3xl"
            animate={isShimmering ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {levelIcon}
          </motion.span>
          <div>
            <h3 className="font-display text-xl text-foreground">{levelName}</h3>
            <p className="text-xs text-muted-foreground">
              {isMaxLevel ? t('karma.maxLevel') : `${pointsNeeded - pointsInLevel} ${t('karma.pointsToNext')}`}
            </p>
          </div>
        </div>
        
        {!isMaxLevel && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('karma.nextLevel')}</p>
            <p className="font-display text-foreground">
              {t(LEVEL_KEY_MAP[Object.keys(LEVEL_THRESHOLDS)[Object.keys(LEVEL_THRESHOLDS).indexOf(currentLevel) + 1] as SpiritualLevel])}
            </p>
          </div>
        )}
      </div>

      {/* Premium Progress bar with liquid gold effect */}
      <div className="relative h-5 rounded-full bg-black/30 overflow-hidden border border-white/10 shadow-inner">
        {/* Background glow */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
          }}
        />

        {/* Main progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
            boxShadow: `0 0 20px ${colors.glow}, inset 0 2px 4px rgba(255,255,255,0.3)`,
          }}
        >
          {/* Liquid wave effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)`,
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Bubble effect */}
          <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
            <defs>
              <pattern id="bubbles" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                <motion.circle
                  cx="10"
                  cy="15"
                  r="2"
                  fill="rgba(255,255,255,0.4)"
                  animate={{ cy: [15, 5], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
                <motion.circle
                  cx="25"
                  cy="18"
                  r="1.5"
                  fill="rgba(255,255,255,0.3)"
                  animate={{ cy: [18, 8], opacity: [0.3, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8, delay: 0.3 }}
                />
                <motion.circle
                  cx="35"
                  cy="16"
                  r="1"
                  fill="rgba(255,255,255,0.5)"
                  animate={{ cy: [16, 6], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.2, delay: 0.6 }}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bubbles)" />
          </svg>
        </motion.div>

        {/* Shimmer overlay - triggered when karma is gained */}
        <AnimatePresence>
          {isShimmering && (
            <motion.div
              initial={{ x: '-100%', opacity: 0.8 }}
              animate={{ x: '200%', opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/2"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.6), rgba(255,255,255,0.8), rgba(255,215,0,0.6), transparent)',
                filter: 'blur(2px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Glowing edge */}
        <motion.div
          className="absolute top-0 bottom-0 w-2 rounded-full"
          style={{
            right: `${100 - percentage}%`,
            marginRight: '-4px',
            background: `radial-gradient(circle, ${colors.glow}, transparent)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Level milestones */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {Object.entries(LEVEL_INFO).map(([level, info]) => {
          const threshold = LEVEL_THRESHOLDS[level as SpiritualLevel];
          const isUnlocked = progress.karma_points >= threshold;
          const isCurrent = level === currentLevel;
          
          return (
            <motion.div
              key={level}
              className={`flex flex-col items-center ${
                isCurrent ? 'text-primary' : isUnlocked ? 'text-foreground/60' : 'text-muted-foreground/40'
              }`}
              animate={isCurrent && isShimmering ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className={`text-lg ${!isUnlocked && 'grayscale opacity-50'}`}>{info.icon}</span>
              <span className="hidden sm:block">{threshold.toLocaleString()}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

export default LiquidGoldProgressBar;
