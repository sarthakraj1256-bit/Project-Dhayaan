import PageTransition from '@/components/PageTransition';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wind, Gamepad2, Trophy, Star, Zap, Puzzle, Flower2, Grid3X3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpiritualProgress, LEVEL_THRESHOLDS, getNextLevelThreshold, CHAKRA_THRESHOLDS, type SpiritualLevel } from '@/hooks/useSpiritualProgress';
import { useKarmaMultiplier } from '@/hooks/useKarmaMultiplier';
import BreathFlowGame from '@/components/lakshya/BreathFlowGame';
import ChakraAlignmentGame from '@/components/lakshya/ChakraAlignmentGame';
import InnerCalmGarden from '@/components/lakshya/InnerCalmGarden';
import DivineMatchGame from '@/components/lakshya/DivineMatchGame';
import KarmaDisplay from '@/components/lakshya/KarmaDisplay';
import LiquidGoldProgressBar from '@/components/lakshya/LiquidGoldProgressBar';
import ChakraProgress from '@/components/lakshya/ChakraProgress';
import CosmicBackground from '@/components/lakshya/CosmicBackground';
import MultiplierDisplay from '@/components/lakshya/MultiplierDisplay';
import KarmaGainAnimation from '@/components/lakshya/KarmaGainAnimation';
import LevelUpCelebration from '@/components/lakshya/LevelUpCelebration';
import HiddenRewards from '@/components/lakshya/HiddenRewards';
import SadhanaFlame from '@/components/lakshya/SadhanaFlame';
import BottomNav from '@/components/BottomNav';

const Lakshya = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { progress, isLoading, userId } = useSpiritualProgress();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showKarmaAnimation, setShowKarmaAnimation] = useState(false);
  const [karmaGained, setKarmaGained] = useState(0);
  const [multiplierApplied, setMultiplierApplied] = useState(1);
  const [bonusMessage, setBonusMessage] = useState<string | undefined>();
  
  // Level up celebration state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<SpiritualLevel>('novice');
  const previousLevelRef = useRef<SpiritualLevel | null>(null);

  const {
    sessionGamesCompleted,
    sessionMultiplier,
    streakMultiplier,
    totalMultiplier,
    incrementSessionGames,
    applyMultiplier,
  } = useKarmaMultiplier(progress?.current_streak || 0);

  // Detect level up
  useEffect(() => {
    if (!progress) return;
    
    const currentLevel = progress.current_level as SpiritualLevel;
    
    if (previousLevelRef.current && previousLevelRef.current !== currentLevel) {
      setNewLevel(currentLevel);
      setShowLevelUp(true);
    }
    
    previousLevelRef.current = currentLevel;
  }, [progress?.current_level]);

  const handleKarmaEarned = useCallback((basePoints: number) => {
    const multipliedPoints = applyMultiplier(basePoints);
    setKarmaGained(multipliedPoints);
    setMultiplierApplied(totalMultiplier);
    
    if (sessionGamesCompleted >= 3) {
      setBonusMessage(t('lakshya.sessionStreakBonus'));
    } else if (totalMultiplier >= 2) {
      setBonusMessage(t('lakshya.maxMultiplier'));
    } else {
      setBonusMessage(undefined);
    }
    
    setShowKarmaAnimation(true);
    incrementSessionGames();
    setTimeout(() => setShowKarmaAnimation(false), 2500);
  }, [applyMultiplier, totalMultiplier, incrementSessionGames, sessionGamesCompleted, t]);

  if (isLoading && !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Sparkles className="w-full h-full text-primary" />
          </motion.div>
          <p className="text-muted-foreground text-sm tracking-widest animate-pulse">
            {t('lakshya.loading')}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-2xl text-foreground mb-4">{t('auth.beginJourney')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('auth.signInToTrack')}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
          >
            {t('auth.enterSanctum')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CosmicBackground />
      
      <KarmaGainAnimation
        isVisible={showKarmaAnimation}
        karmaGained={karmaGained}
        multiplier={multiplierApplied}
        bonusMessage={bonusMessage}
      />

      <LevelUpCelebration
        isVisible={showLevelUp}
        newLevel={newLevel}
        onComplete={() => setShowLevelUp(false)}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/30">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <h1 className="font-display text-lg tracking-wider text-foreground">
            <span className="text-primary">लक्ष्य</span> {t('page.lakshya')}
          </h1>
          
          <div className="w-9" />
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">

        {/* Active Game View */}
        {activeGame === 'breath-flow' ? (
          <BreathFlowGame 
            onClose={() => setActiveGame(null)} 
            onKarmaEarned={handleKarmaEarned}
          />
        ) : activeGame === 'chakra-alignment' ? (
          <ChakraAlignmentGame 
            onClose={() => setActiveGame(null)} 
            onKarmaEarned={handleKarmaEarned}
          />
        ) : activeGame === 'inner-garden' ? (
          <InnerCalmGarden 
            onClose={() => setActiveGame(null)} 
            onKarmaEarned={handleKarmaEarned}
          />
        ) : activeGame === 'divine-match' ? (
          <DivineMatchGame 
            onClose={() => setActiveGame(null)} 
            onKarmaEarned={handleKarmaEarned}
          />
        ) : (
          <>
            {/* Progress Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Trophy className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg tracking-wider text-foreground">
                      {t('lakshya.dharmicGrowth')}
                    </h2>
                    <p className="text-xs text-muted-foreground">{t('lakshya.yourJourney')}</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-foreground/10 rounded" />
                    <div className="h-4 bg-foreground/10 rounded w-2/3" />
                  </div>
                ) : progress && (
                  <>
                    <LiquidGoldProgressBar progress={progress} showShimmer={showKarmaAnimation} />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-3 rounded-lg bg-foreground/5">
                        <p className="text-2xl font-display text-foreground">{progress.total_meditation_minutes}</p>
                        <p className="text-xs text-muted-foreground">{t('lakshya.meditationMins')}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-foreground/5">
                        <p className="text-2xl font-display text-foreground">{progress.total_mantra_lessons}</p>
                        <p className="text-xs text-muted-foreground">{t('lakshya.mantrasLearned')}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-foreground/5">
                        <p className="text-2xl font-display text-foreground">{progress.total_games_played}</p>
                        <p className="text-xs text-muted-foreground">{t('lakshya.gamesPlayed')}</p>
                      </div>
                      <div className="flex items-center justify-center p-3 rounded-lg bg-foreground/5">
                        <SadhanaFlame streak={progress.current_streak} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 backdrop-blur-sm">
                  {progress && <KarmaDisplay progress={progress} />}
                </div>
                
                <MultiplierDisplay
                  sessionGamesCompleted={sessionGamesCompleted}
                  currentStreak={progress?.current_streak || 0}
                  totalMultiplier={totalMultiplier}
                  sessionMultiplier={sessionMultiplier}
                  streakMultiplier={streakMultiplier}
                />
              </div>
            </div>

            {/* Chakra Progress */}
            <div className="rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/20 backdrop-blur-sm mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">
                    {t('lakshya.chakraAwakening')}
                  </h2>
                  <p className="text-xs text-muted-foreground">{t('lakshya.unlockChakras')}</p>
                </div>
              </div>
              
              {progress && <ChakraProgress progress={progress} />}
            </div>

            {/* Games Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">
                    {t('lakshya.peaceGames')}
                  </h2>
                  <p className="text-xs text-muted-foreground">{t('lakshya.peaceGamesDesc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Breath Flow Game */}
                <motion.button
                  onClick={() => setActiveGame('breath-flow')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-4 sm:p-5 md:p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                      <Wind className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{t('lakshya.breathFlow')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('lakshya.breathFlowDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-cyan-400">
                      <Star className="w-3 h-3" />
                      <span>{t('lakshya.karmaPerSession')}</span>
                    </div>
                  </div>
                </motion.button>

                {/* Chakra Alignment Game */}
                <motion.button
                  onClick={() => setActiveGame('chakra-alignment')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-4 sm:p-5 md:p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                      <Puzzle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{t('lakshya.chakraAlignment')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('lakshya.chakraAlignmentDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Star className="w-3 h-3" />
                      <span>{t('lakshya.karmaPerPuzzle')}</span>
                    </div>
                  </div>
                </motion.button>

                {/* Divine Match Game */}
                <motion.button
                  onClick={() => setActiveGame('divine-match')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-4 sm:p-5 md:p-6 rounded-xl bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold">
                    {t('common.new')}
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                      <Grid3X3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{t('lakshya.divineMatch')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('lakshya.divineMatchDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-400">
                      <Star className="w-3 h-3" />
                      <span>{t('lakshya.karmaPerLevel')}</span>
                    </div>
                  </div>
                </motion.button>

                {/* Inner Calm Garden */}
                <motion.button
                  onClick={() => setActiveGame('inner-garden')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-4 sm:p-5 md:p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <Flower2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{t('lakshya.innerGarden')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('lakshya.gardenGrow')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <Star className="w-3 h-3" />
                      <span>{t('lakshya.karmaPerGrowth')}</span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Hidden Rewards Section */}
            <div className="mb-8">
              {progress && (
                <HiddenRewards 
                  currentKarma={progress.karma_points} 
                  unlockedRewards={progress.unlocked_environments || []}
                />
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/sonic-lab')}
                className="p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">🎵</span>
                <span className="text-sm text-foreground">{t('feature.sonicLab')}</span>
                <p className="text-xs text-muted-foreground">{t('lakshya.earnKarmaMin')}</p>
              </button>
              
              <button
                onClick={() => navigate('/mantrochar')}
                className="p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">🕉️</span>
                <span className="text-sm text-foreground">{t('feature.mantrochar')}</span>
                <p className="text-xs text-muted-foreground">{t('lakshya.earnKarmaLesson')}</p>
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">📊</span>
                <span className="text-sm text-foreground">{t('menu.dashboard')}</span>
                <p className="text-xs text-muted-foreground">{t('lakshya.viewFullStats')}</p>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-center"
              >
                <span className="text-2xl mb-2 block">⚙️</span>
                <span className="text-sm text-foreground">{t('lakshya.settings')}</span>
                <p className="text-xs text-muted-foreground">{t('lakshya.manageAccount')}</p>
              </button>
            </div>
          </>
        )}

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
    </PageTransition>
  );
};

export default Lakshya;
