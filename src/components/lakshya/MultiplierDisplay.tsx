import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, TrendingUp } from 'lucide-react';

interface MultiplierDisplayProps {
  sessionGamesCompleted: number;
  currentStreak: number;
  totalMultiplier: number;
  sessionMultiplier: number;
  streakMultiplier: number;
}

const MultiplierDisplay = ({
  sessionGamesCompleted,
  currentStreak,
  totalMultiplier,
  sessionMultiplier,
  streakMultiplier,
}: MultiplierDisplayProps) => {
  const hasBonus = totalMultiplier > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-medium text-foreground">Karma Multiplier</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={totalMultiplier}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`text-xl font-display ${hasBonus ? 'text-amber-400' : 'text-muted-foreground'}`}
          >
            {totalMultiplier.toFixed(2)}x
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Session Bonus */}
        <div className="p-2 rounded-lg bg-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className={`w-3 h-3 ${sessionMultiplier > 1 ? 'text-cyan-400' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">Session</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-medium ${sessionMultiplier > 1 ? 'text-cyan-400' : 'text-foreground'}`}>
              {sessionMultiplier.toFixed(2)}x
            </span>
            <span className="text-xs text-muted-foreground">
              ({sessionGamesCompleted} {sessionGamesCompleted === 1 ? 'game' : 'games'})
            </span>
          </div>
          {sessionGamesCompleted < 5 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              +0.15x next game
            </p>
          )}
        </div>

        {/* Streak Bonus */}
        <div className="p-2 rounded-lg bg-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className={`w-3 h-3 ${streakMultiplier > 1 ? 'text-orange-400' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-medium ${streakMultiplier > 1 ? 'text-orange-400' : 'text-foreground'}`}>
              {streakMultiplier.toFixed(2)}x
            </span>
            <span className="text-xs text-muted-foreground">
              ({currentStreak} {currentStreak === 1 ? 'day' : 'days'})
            </span>
          </div>
          {currentStreak > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {getNextStreakMilestone(currentStreak)}
            </p>
          )}
        </div>
      </div>

      {/* Bonus Tiers Info */}
      {hasBonus && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/10"
        >
          <p className="text-xs text-amber-400/80 text-center">
            🎯 All karma earned is multiplied by {totalMultiplier.toFixed(2)}x!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

function getNextStreakMilestone(currentStreak: number): string {
  if (currentStreak < 3) return `${3 - currentStreak} days to 1.1x`;
  if (currentStreak < 7) return `${7 - currentStreak} days to 1.25x`;
  if (currentStreak < 14) return `${14 - currentStreak} days to 1.5x`;
  if (currentStreak < 30) return `${30 - currentStreak} days to 2x`;
  return 'Max streak bonus!';
}

export default MultiplierDisplay;
