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
      <main className="relative pb-24 md:pb-0">
        <HeroSection user={user} />
        <QuickStartSection />

        <div className="mx-6 h-px bg-border/60" />

        <RelaxationSection />
        <DarshanSection />

        <div className="mx-6 h-px bg-border/60" />

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
             className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/60 text-sm font-medium text-foreground transition-all duration-200 hover:shadow-sm active:scale-95"
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
