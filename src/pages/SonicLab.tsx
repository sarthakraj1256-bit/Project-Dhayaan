import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio, Star, BarChart3 } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageTransition from '@/components/PageTransition';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { categories, getFrequenciesByCategory } from '@/data/soundLibrary';
import { useFrequencyAudio } from '@/hooks/useFrequencyAudio';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useFavorites, Favorite } from '@/hooks/useFavorites';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useMeditationGoals } from '@/hooks/useMeditationGoals';
import { useAchievements } from '@/hooks/useAchievements';
import CategorySection from '@/components/sonic-lab/CategorySection';
import AudioControls from '@/components/sonic-lab/AudioControls';
import WaveformVisualizer from '@/components/sonic-lab/WaveformVisualizer';
import FavoritesPanel from '@/components/sonic-lab/FavoritesPanel';
import SessionStats from '@/components/sonic-lab/SessionStats';
import GoalsPanel from '@/components/sonic-lab/GoalsPanel';
import AchievementsPanel from '@/components/sonic-lab/AchievementsPanel';
import MeditationCalendar from '@/components/sonic-lab/MeditationCalendar';
import SessionHistoryList from '@/components/sonic-lab/SessionHistoryList';
import BottomNav from '@/components/BottomNav';
 const SonicLab = () => {
   const { t } = useLanguage();
   const [showFavorites, setShowFavorites] = useState(false);
  const [showStats, setShowStats] = useState(false);
   const [currentFrequencyMeta, setCurrentFrequencyMeta] = useState<{
     name: string;
     category: string;
   } | null>(null);
  
  // Track session start time
  const sessionStartRef = useRef<Date | null>(null);
  const { persist, clear: clearPersisted, restore } = useSessionPersistence();
 
   const {
     audioState,
     playFrequency,
     stopFrequency,
     setFrequencyVolume,
     setAtmosphere,
     setAtmosphereVolume,
     getFrequencyData,
   } = useFrequencyAudio();
 
   const { formattedTime } = useSessionTimer(audioState.isPlaying);
 
   const {
     favorites,
     isLoading: favoritesLoading,
     isAuthenticated,
     addFavorite,
     removeFavorite,
     isFavorited,
   } = useFavorites();
 
  const {
    stats: sessionStats,
    isLoading: statsLoading,
    isAuthenticated: statsAuthenticated,
    saveSession,
    sessions,
    deleteSession,
  } = useSessionHistory();

  const {
    weeklyProgress,
    monthlyProgress,
    isLoading: goalsLoading,
    isAuthenticated: goalsAuthenticated,
    setGoal,
    removeGoal,
    refetch: refetchGoals,
  } = useMeditationGoals();

  const {
    achievements,
    unlockedCount,
    totalCount: achievementTotal,
    isLoading: achievementsLoading,
    isAuthenticated: achievementsAuthenticated,
    checkAndUnlockAchievements,
  } = useAchievements();

   // Wrap playFrequency to also track metadata
   const handlePlayFrequency = useCallback((frequency: number, name?: string, category?: string) => {
     playFrequency(frequency);
     if (name && category) {
       setCurrentFrequencyMeta({ name, category });
       persist(frequency, name, category, audioState.currentAtmosphere || 'none');
     }
    // Track session start time
    sessionStartRef.current = new Date();
   }, [playFrequency, persist, audioState.currentAtmosphere]);
 
  // Handle stop and save session
  const handleStop = useCallback(() => {
    // Save session if authenticated and session was meaningful
    if (
      sessionStartRef.current &&
      audioState.currentFrequency &&
      currentFrequencyMeta
    ) {
      const durationSeconds = Math.floor(
        (Date.now() - sessionStartRef.current.getTime()) / 1000
      );
      saveSession(
        audioState.currentFrequency,
        currentFrequencyMeta.name,
        currentFrequencyMeta.category,
        audioState.currentAtmosphere,
        durationSeconds,
        sessionStartRef.current
      ).then(() => {
        // Refresh goals progress after saving a session
        refetchGoals();
        // Check for new achievements
        checkAndUnlockAchievements();
      });
    }
    sessionStartRef.current = null;
    clearPersisted();
    stopFrequency();
  }, [audioState.currentFrequency, audioState.currentAtmosphere, currentFrequencyMeta, saveSession, stopFrequency, refetchGoals, checkAndUnlockAchievements, clearPersisted]);

  // Restore persisted session on mount
  useEffect(() => {
    const session = restore();
    if (session) {
      handlePlayFrequency(session.frequency, session.frequencyName, session.frequencyCategory);
      if (session.atmosphere !== 'none') {
        setAtmosphere(session.atmosphere);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   const handleSaveFavorite = useCallback(() => {
     if (audioState.currentFrequency && currentFrequencyMeta) {
       addFavorite(
         audioState.currentFrequency,
         currentFrequencyMeta.name,
         currentFrequencyMeta.category,
         audioState.currentAtmosphere
       );
     }
   }, [audioState.currentFrequency, audioState.currentAtmosphere, currentFrequencyMeta, addFavorite]);
 
   const handlePlayFavorite = useCallback((favorite: Favorite) => {
     playFrequency(favorite.frequency_value);
     setCurrentFrequencyMeta({
       name: favorite.frequency_name,
       category: favorite.frequency_category,
     });
     if (favorite.atmosphere_id !== 'none') {
       setAtmosphere(favorite.atmosphere_id);
     }
     setShowFavorites(false);
   }, [playFrequency, setAtmosphere]);
 
   const currentIsFavorited = audioState.currentFrequency && currentFrequencyMeta
     ? isFavorited(audioState.currentFrequency, audioState.currentAtmosphere)
     : false;
 
   return (
     <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 z-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
  
          {/* Radial glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        </div>
  
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
         <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/85 backdrop-blur-xl border-b border-border/50">
               <Link
                 to="/"
                 className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
               >
                 <ArrowLeft className="w-5 h-5 text-muted-foreground" />
               </Link>
  
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h1 className="font-display text-lg tracking-[0.2em] text-gold-gradient">
                  {t('page.sonicLab').toUpperCase()}
                </h1>
              </div>
  
              <div className="flex items-center gap-1">
              {/* Favorites Button */}
              <button
                 onClick={() => {
                   setShowFavorites(true);
                   setShowStats(false);
                 }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors"
              >
                <Star className="w-5 h-5 text-primary" />
              </button>

               {/* Stats Toggle */}
               <button
                 onClick={() => setShowStats(!showStats)}
                 className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                   showStats 
                     ? 'bg-primary/20 text-primary' 
                     : 'bg-foreground/5 border border-border/50 hover:bg-foreground/10 text-foreground/80'
                 }`}
                 title="Session Stats"
               >
                 <BarChart3 className="w-5 h-5" />
               </button>
              </div>
          </header>
 
          {/* Session Stats Panel */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4 border-b border-border/30 bg-card/50"
            >
              <div className="max-w-4xl mx-auto">
                <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                  YOUR MEDITATION JOURNEY
                </h3>
                <SessionStats
                  stats={sessionStats}
                  isLoading={statsLoading}
                  isAuthenticated={statsAuthenticated}
                />
              
              {/* Goals Section */}
              <div className="mt-6">
                <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                  MEDITATION GOALS
                </h3>
                <GoalsPanel
                  weeklyProgress={weeklyProgress}
                  monthlyProgress={monthlyProgress}
                  isLoading={goalsLoading}
                  isAuthenticated={goalsAuthenticated}
                  onSetGoal={setGoal}
                  onRemoveGoal={removeGoal}
                />
              </div>

              {/* Achievements Section */}
              <div className="mt-6">
                <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                  ACHIEVEMENTS
                </h3>
                <AchievementsPanel
                  achievements={achievements}
                  unlockedCount={unlockedCount}
                  totalCount={achievementTotal}
                  isLoading={achievementsLoading}
                  isAuthenticated={achievementsAuthenticated}
                />
              </div>

              {/* Meditation Calendar */}
              <div className="mt-6">
                <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                  MEDITATION CALENDAR
                </h3>
                <MeditationCalendar
                  sessions={sessions}
                  isLoading={statsLoading}
                  isAuthenticated={statsAuthenticated}
                />
              </div>

              {/* Session History List */}
              <div className="mt-6">
                <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                  RECENT SESSIONS
                </h3>
                <SessionHistoryList
                  sessions={sessions}
                  isLoading={statsLoading}
                  isAuthenticated={statsAuthenticated}
                  onDeleteSession={deleteSession}
                />
              </div>
              </div>
            </motion.div>
          )}

         {/* Hero Section */}
         <section className="px-6 py-16 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="max-w-3xl mx-auto"
           >
             <h2 className="font-display text-4xl md:text-5xl tracking-wider text-foreground mb-4">
               <span className="text-gold-gradient">Frequency</span> Pharmacy
             </h2>
             <p className="text-muted-foreground font-body text-lg leading-relaxed">
               Select sound frequencies based on what you want to feel, heal, or achieve.
               Each frequency is a purposeful tool for your wellbeing.
             </p>
           </motion.div>
 
           {/* Waveform Visualizer */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="max-w-4xl mx-auto mt-8"
           >
             <WaveformVisualizer
               isPlaying={audioState.isPlaying}
               frequency={audioState.currentFrequency}
               getFrequencyData={getFrequencyData}
             />
           </motion.div>
         </section>
 
        {/* Frequency Categories */}
          <main className="px-6 pb-48 md:pb-36 max-w-7xl mx-auto mb-16 md:mb-0" style={{ pointerEvents: 'auto' }}>
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                frequencies={getFrequenciesByCategory(category.id)}
                activeFrequency={audioState.currentFrequency}
                onPlayFrequency={handlePlayFrequency}
                onStopFrequency={stopFrequency}
              />
            ))}
          </main>
 
         {/* Fixed Audio Controls */}
        <AudioControls
          isPlaying={audioState.isPlaying}
          currentFrequency={audioState.currentFrequency}
          currentFrequencyName={currentFrequencyMeta?.name}
          currentFrequencyCategory={currentFrequencyMeta?.category}
          frequencyVolume={audioState.frequencyVolume}
          atmosphereVolume={audioState.atmosphereVolume}
          currentAtmosphere={audioState.currentAtmosphere}
          atmosphereLoading={audioState.atmosphereLoading}
          atmosphereCached={audioState.atmosphereCached}
          atmosphereError={audioState.atmosphereError}
          sessionTime={formattedTime}
          isFavorited={currentIsFavorited}
          isAuthenticated={isAuthenticated}
          onSaveFavorite={handleSaveFavorite}
          onFrequencyVolumeChange={setFrequencyVolume}
          onAtmosphereVolumeChange={setAtmosphereVolume}
          onAtmosphereChange={setAtmosphere}
            onStop={handleStop}
        />
       </div>
 
       {/* Favorites Panel */}
       <FavoritesPanel
         isOpen={showFavorites}
         favorites={favorites}
         isLoading={favoritesLoading}
         isAuthenticated={isAuthenticated}
         onClose={() => setShowFavorites(false)}
         onPlayFavorite={handlePlayFavorite}
         onRemoveFavorite={removeFavorite}
       />
 
       {/* Footer */}
       <footer className="relative z-10 border-t border-border/30 px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground/50">
          "नाद ब्रह्म" — Sound is the Divine
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
     </div>
     </PageTransition>
   );
 };

export default SonicLab;