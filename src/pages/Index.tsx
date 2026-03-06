import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';
import BottomNav from '@/components/BottomNav';
import GyaniChat from '@/components/gyani/GyaniChat';

import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
// Only hero + quick-start are above the fold — load eagerly
import { HeroSection, QuickStartSection } from '@/components/home';
import SectionNav from '@/components/home/SectionNav';
import SideDrawer from '@/components/home/SideDrawer';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      <SectionNav onMenuOpen={() => setDrawerOpen(true)} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="relative z-[1] pb-24 md:pb-0 pt-16 md:pt-[72px]">
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

      {/* Language selector — Fixed Top Right */}
      <div className="fixed top-3.5 right-3.5 sm:top-4 sm:right-5 z-[1001] flex items-center gap-2">
         <LanguageToggle />
      </div>

       {/* Mobile Bottom Navigation */}
       <BottomNav />

       {/* Gyani AI Guide - Homepage Only */}
       <GyaniChat />
     </div>
   );
 };

 export default Index;
