import { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';
import TempleScene from '@/components/TempleScene';
import UserMenu from '@/components/UserMenu';
import BottomNav from '@/components/BottomNav';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import {
  HeroSection,
  QuickStartSection,
  RelaxationSection,
  DarshanSection,
  DailyHighlightsSection,
  PhilosophySection,
  FinalCTASection,
} from '@/components/home';

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTemple, setShowTemple] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check auth state
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

  // Handle scroll progress for 3D scene
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
      
      // Hide temple after scrolling past hero section
      setShowTemple(scrollTop < window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* 3D Background - Only visible on hero section */}
      <div 
        className={`transition-opacity duration-700 ${showTemple ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <Suspense fallback={
          <div className="fixed inset-0 bg-background flex items-center justify-center">
            <div className="text-primary font-display text-xl tracking-wider animate-pulse">
              Loading...
            </div>
          </div>
        }>
          <TempleScene 
            scrollProgress={scrollProgress} 
            showMandala={false}
            showParticles={false}
          />
        </Suspense>
      </div>

      {/* Sacred Pattern Overlay */}
      <div className="fixed inset-0 sacred-pattern pointer-events-none opacity-20 z-[1]" />

      {/* Gradient Overlays for readability */}
      <div className="fixed inset-0 pointer-events-none z-[2]">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)] opacity-40" />
      </div>

      {/* Scrollable Content */}
      <main className="relative z-10 pb-24 md:pb-0">
        {/* 1. Hero Section */}
        <HeroSection />
        
        {/* Divider */}
        <div className="flex items-center justify-center py-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* 2. Quick Start Section */}
        <QuickStartSection />

        {/* 3. Relaxation Section */}
        <RelaxationSection />

        {/* 4. Darshan Section */}
        <DarshanSection />

        {/* 5. Daily Highlights */}
        <DailyHighlightsSection />

        {/* 6. Philosophy Section */}
        <PhilosophySection />

        {/* 7. Final CTA */}
        <FinalCTASection />
      </main>

      {/* Navigation - Fixed Top Right */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
         {user ? (
           <UserMenu user={user} />
         ) : (
           <Link
             to="/auth"
             className="group"
           >
             <div
               className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 bg-void-light/60 backdrop-blur-xl border border-primary/30 shadow-[0_0_20px_hsl(var(--gold)/0.1)]"
             >
               <LogIn className="w-4 h-4 text-primary transition-transform duration-300 group-hover:translate-x-0.5" />
               <span className="font-body text-sm tracking-wider text-primary">
                 Enter Sanctum
               </span>
             </div>
           </Link>
         )}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
