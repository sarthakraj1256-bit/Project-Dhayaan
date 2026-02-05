import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Gift, Check, Sparkles, Trophy } from 'lucide-react';
import { DailyChallenge } from '@/hooks/useGardenChallenges';
import { Progress } from '@/components/ui/progress';

interface GardenChallengesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: DailyChallenge[];
  timeUntilRefresh: string;
  completedCount: number;
  onClaimReward: (challengeId: string) => void;
}

const DIFFICULTY_COLORS = {
  0: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  1: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  2: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
};

const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard'];

const GardenChallengesPanel = ({
  isOpen,
  onClose,
  challenges,
  timeUntilRefresh,
  completedCount,
  onClaimReward,
}: GardenChallengesPanelProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg text-foreground">Daily Challenges</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Timer & Progress */}
          <div className="px-4 py-3 bg-black/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Resets in {timeUntilRefresh}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">{completedCount}/3</span>
                <span className="text-xs text-muted-foreground">completed</span>
              </div>
            </div>
            <Progress 
              value={(completedCount / 3) * 100} 
              className="h-2 bg-white/10"
            />
            {completedCount === 3 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-amber-400 mt-2 text-center"
              >
                🎉 All challenges complete! Amazing work!
              </motion.p>
            )}
          </div>

          {/* Challenges List */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {challenges.map((challenge, index) => {
              const colors = DIFFICULTY_COLORS[index as keyof typeof DIFFICULTY_COLORS];
              const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative p-4 rounded-xl border transition-all
                    ${challenge.claimed 
                      ? 'bg-white/5 border-white/10 opacity-60'
                      : challenge.completed 
                        ? `${colors.bg} ${colors.border} ring-2 ring-amber-400/30` 
                        : `${colors.bg} ${colors.border}`
                    }
                  `}
                >
                  {/* Difficulty badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                      {DIFFICULTY_LABELS[index]}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-xl
                      ${challenge.completed ? 'bg-amber-500/20' : colors.bg}
                    `}>
                      {challenge.claimed ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        challenge.emoji
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm ${challenge.claimed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {challenge.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {challenge.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">
                            {challenge.progress} / {challenge.target}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`h-full ${challenge.completed ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'}`}
                          />
                        </div>
                      </div>

                      {/* Reward */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Gift className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] text-amber-400">{challenge.reward.label}</span>
                        </div>

                        {/* Claim button */}
                        {challenge.completed && !challenge.claimed && (
                          <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onClaimReward(challenge.id)}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Claim
                          </motion.button>
                        )}

                        {challenge.claimed && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-center text-muted-foreground">
              Complete challenges to earn bonus rewards! 🌱
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GardenChallengesPanel;
