import { useState, useEffect, useCallback, Suspense } from 'react';
import TempleScene from '@/components/TempleScene';
import HeroSection from '@/components/HeroSection';
import VastuSection from '@/components/VastuSection';
import ComparisonSection from '@/components/ComparisonSection';
import ScienceSection from '@/components/ScienceSection';
import DevoteeExperiences from '@/components/DevoteeExperiences';

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMandala, setShowMandala] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTemple, setShowTemple] = useState(true);

  // Handle scroll progress for 3D scene
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);

      // Show mandala when past hero section
      setShowMandala(scrollTop > window.innerHeight * 0.5);
      
      // Hide temple after scrolling past hero section (fade out)
      setShowTemple(scrollTop < window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeroMounted = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const toggleParticles = useCallback(() => {
    setShowParticles(prev => !prev);
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
              Loading Sacred Geometry...
            </div>
          </div>
        }>
          <TempleScene 
            scrollProgress={scrollProgress} 
            showMandala={showMandala}
            showParticles={showParticles}
          />
        </Suspense>
      </div>

      {/* Sacred Pattern Overlay */}
      <div className="fixed inset-0 sacred-pattern pointer-events-none opacity-30 z-[1]" />

      {/* Gradient Overlays for readability */}
      <div className="fixed inset-0 pointer-events-none z-[2]">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)] opacity-40" />
      </div>

      {/* Scrollable Content */}
      <main className={`relative z-10 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <HeroSection onMounted={handleHeroMounted} />
        
        {/* Divider */}
        <div className="temple-divider">
          <span className="text-primary text-2xl">◆</span>
        </div>

        <VastuSection />

        {/* Divider */}
        <div className="temple-divider">
          <span className="text-primary text-2xl">◆</span>
        </div>

        <ComparisonSection />

        {/* Divider */}
        <div className="temple-divider">
          <span className="text-primary text-2xl">◆</span>
        </div>

        <ScienceSection 
          onToggleParticles={toggleParticles}
          particlesActive={showParticles}
        />

        {/* Divider */}
        <div className="temple-divider">
          <span className="text-primary text-2xl">◆</span>
        </div>

        <DevoteeExperiences />
      </main>

      {/* Navigation Dots (Side) */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
        {['Hero', 'Vastu', 'Styles', 'Science'].map((section, idx) => (
          <a
            key={section}
            href={`#${section.toLowerCase()}`}
            className={`
              group flex items-center gap-3 transition-all duration-300
            `}
            onClick={(e) => {
              e.preventDefault();
              const target = idx === 0 
                ? document.body 
                : document.getElementById(section.toLowerCase());
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity tracking-wider uppercase">
              {section}
            </span>
            <span className={`
              w-2 h-2 rounded-full border border-primary/50 transition-all duration-300
              ${scrollProgress > (idx * 0.25) && scrollProgress <= ((idx + 1) * 0.25)
                ? 'bg-primary scale-150'
                : 'bg-transparent group-hover:bg-primary/50'
              }
            `} />
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Index;
