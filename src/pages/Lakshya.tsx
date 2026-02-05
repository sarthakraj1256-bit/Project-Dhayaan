import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wind, Gamepad2, Trophy, Star, Zap } from 'lucide-react';
import { useSpiritualProgress, LEVEL_THRESHOLDS, getNextLevelThreshold, CHAKRA_THRESHOLDS } from '@/hooks/useSpiritualProgress';
import BreathFlowGame from '@/components/lakshya/BreathFlowGame';
import KarmaDisplay from '@/components/lakshya/KarmaDisplay';
import LevelProgressBar from '@/components/lakshya/LevelProgressBar';
import ChakraProgress from '@/components/lakshya/ChakraProgress';
import CosmicBackground from '@/components/lakshya/CosmicBackground';

const Lakshya = () => {
  const navigate = useNavigate();
  const { progress, isLoading, userId } = useSpiritualProgress();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showKarmaAnimation, setShowKarmaAnimation] = useState(false);
  const [karmaGained, setKarmaGained] = useState(0);

  const handleKarmaEarned = (points: number) => {
    setKarmaGained(points);
    setShowKarmaAnimation(true);
    setTimeout(() => setShowKarmaAnimation(false), 2000);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-2xl text-foreground mb-4">Begin Your Journey</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to track your spiritual progress and unlock rewards.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
          >
            Enter the Sanctum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CosmicBackground />
      
      {/* Karma Animation Overlay */}
      <AnimatePresence>
        {showKarmaAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl font-display text-primary mb-2"
              >
                +{karmaGained}
              </motion.div>
              <p className="text-xl text-primary/80">Karma Points</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm tracking-wider">Back</span>
          </button>
          
          <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-foreground">
            <span className="text-primary">लक्ष्य</span> Lakshya
          </h1>
          
          <div className="w-16" />
        </div>

        {/* Active Game View */}
        {activeGame === 'breath-flow' ? (
          <BreathFlowGame 
            onClose={() => setActiveGame(null)} 
            onKarmaEarned={handleKarmaEarned}
          />
        ) : (
          <>
            {/* Progress Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Progress Card */}
              <div className="lg:col-span-2 rounded-2xl p-6 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Trophy className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg tracking-wider text-foreground">
                      Dharmic Growth Path
                    </h2>
                    <p className="text-xs text-muted-foreground">Your spiritual journey</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/10 rounded" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                ) : progress && (
                  <>
                    <LevelProgressBar progress={progress} />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-display text-foreground">{progress.total_meditation_minutes}</p>
                        <p className="text-xs text-muted-foreground">Meditation Mins</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-display text-foreground">{progress.total_mantra_lessons}</p>
                        <p className="text-xs text-muted-foreground">Mantras Learned</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-display text-foreground">{progress.total_games_played}</p>
                        <p className="text-xs text-muted-foreground">Games Played</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-display text-foreground">{progress.current_streak}</p>
                        <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Karma Display */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 backdrop-blur-sm">
                {progress && <KarmaDisplay progress={progress} />}
              </div>
            </div>

            {/* Chakra Progress */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/20 backdrop-blur-sm mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">
                    Chakra Awakening
                  </h2>
                  <p className="text-xs text-muted-foreground">Unlock chakras as you progress</p>
                </div>
              </div>
              
              {progress && <ChakraProgress progress={progress} />}
            </div>

            {/* Games Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">
                    Peace Meditation Games
                  </h2>
                  <p className="text-xs text-muted-foreground">Relaxing games for mindful practice</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Breath Flow Game */}
                <motion.button
                  onClick={() => setActiveGame('breath-flow')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                      <Wind className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">Breath Flow Journey</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Control glowing energy with your breathing rhythm
                    </p>
                    <div className="flex items-center gap-2 text-xs text-cyan-400">
                      <Star className="w-3 h-3" />
                      <span>+10-50 Karma per session</span>
                    </div>
                  </div>
                </motion.button>

                {/* Coming Soon Games */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 opacity-60">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">Chakra Alignment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Align glowing chakra symbols into harmony
                  </p>
                  <span className="text-xs text-muted-foreground">Coming Soon</span>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 opacity-60">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">Inner Calm Garden</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Grow a peaceful digital garden through practice
                  </p>
                  <span className="text-xs text-muted-foreground">Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/sonic-lab')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">🎵</span>
                <span className="text-sm text-foreground">Sonic Lab</span>
                <p className="text-xs text-muted-foreground">Earn +10 Karma/min</p>
              </button>
              
              <button
                onClick={() => navigate('/mantrochar')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">🕉️</span>
                <span className="text-sm text-foreground">Mantrochar</span>
                <p className="text-xs text-muted-foreground">Earn +25 Karma/lesson</p>
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">📊</span>
                <span className="text-sm text-foreground">Dashboard</span>
                <p className="text-xs text-muted-foreground">View full stats</p>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">⚙️</span>
                <span className="text-sm text-foreground">Settings</span>
                <p className="text-xs text-muted-foreground">Manage account</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Lakshya;
