import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';
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
import WavyBackground from '@/components/home/WavyBackground';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

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
      <main className="relative z-10 pb-24 md:pb-0">
        <HeroSection user={user} />
        <QuickStartSection />
        <RelaxationSection />
        <DarshanSection />


        <DailyHighlightsSection />
        <PhilosophySection />
        <FinalCTASection />
      </main>

      {/* Navigation - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
         {user ? (
           <UserMenu user={user} />
         ) : (
           <Link
             to="/auth"
             className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 text-sm font-medium text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:bg-white/85 active:scale-95"
           >
             <LogIn className="w-4 h-4 text-primary" />
             Sign in
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
