import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';
import UserMenu from '@/components/UserMenu';
import BottomNav from '@/components/BottomNav';
import GyaniChat from '@/components/gyani/GyaniChat';

import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
// Only hero + quick-start are above the fold — load eagerly
import { HeroSection, QuickStartSection } from '@/components/home';
import SectionNav from '@/components/home/SectionNav';
import WavyBackground from '@/components/home/WavyBackground';

// Below-fold sections — lazy loaded
const RelaxationSection = lazy(() => import('@/components/home/RelaxationSection'));
const DarshanSection = lazy(() => import('@/components/home/DarshanSection'));
const SpiritualHubSection = lazy(() => import('@/components/home/SpiritualHubSection'));
const ChildrenCartoonsSection = lazy(() => import('@/components/home/ChildrenCartoonsSection'));
const DailyHighlightsSection = lazy(() => import('@/components/home/DailyHighlightsSection'));
const PhilosophySection = lazy(() => import('@/components/home/PhilosophySection'));
const FinalCTASection = lazy(() => import('@/components/home/FinalCTASection'));
const DevoteeExperiences = lazy(() => import('@/components/DevoteeExperiences'));

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="homepage-theme relative min-h-screen bg-background overflow-x-hidden">
      <WavyBackground />
      <SectionNav />
      <main className="relative z-10 pb-24 md:pb-0">
        <div id="hero"><HeroSection user={user} /></div>
        <div id="explore"><QuickStartSection /></div>
        <Suspense fallback={null}>
          <div id="relaxation"><RelaxationSection /></div>
          <div id="darshan"><DarshanSection /></div>
          <div id="daily-aarti"><SpiritualHubSection /></div>
          <div id="cartoons"><ChildrenCartoonsSection /></div>
          <div id="highlights"><DailyHighlightsSection /></div>
          <div id="philosophy"><PhilosophySection /></div>
          <FinalCTASection />
          <div id="reviews"><DevoteeExperiences /></div>
        </Suspense>
      </main>

      {/* Navigation - Fixed Top Right */}
      <div className="fixed top-3.5 right-3.5 sm:top-4 sm:right-5 z-50 flex items-center gap-2">
         <LanguageToggle />
         {user ? (
           <UserMenu user={user} />
         ) : (
           <Link
             to="/auth"
             className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs sm:text-sm font-medium text-foreground/75 shadow-sm transition-all duration-200 hover:bg-card active:scale-95"
           >
             <LogIn className="w-4 h-4 text-primary" />
             {t('auth.signIn')}
           </Link>
         )}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

    </div>
  );
};

export default Index;
