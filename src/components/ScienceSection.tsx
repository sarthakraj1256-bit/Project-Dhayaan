import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOmSound } from '@/hooks/useOmSound';

interface ScienceSectionProps {
  onToggleParticles: () => void;
  particlesActive: boolean;
}

// Floating particle component
function FloatingParticle({ delay, duration, size, left }: { delay: number; duration: number; size: number; left: number }) {
  return (
    <div
      className="absolute rounded-full bg-primary/60 animate-particle-float"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: '20%',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        boxShadow: '0 0 10px hsl(38 70% 50% / 0.5)',
      }}
    />
  );
}

// Energy wave component
function EnergyWave({ index, active }: { index: number; active: boolean }) {
  return (
    <div
      className={`absolute rounded-full border-2 transition-all duration-700 ${
        active 
          ? 'border-primary/50 scale-100 opacity-100' 
          : 'border-primary/0 scale-50 opacity-0'
      }`}
      style={{
        width: `${(index + 1) * 60}px`,
        height: `${(index + 1) * 60}px`,
        animationDelay: `${index * 0.3}s`,
        animation: active ? `pulse-glow ${2 + index * 0.5}s ease-in-out infinite` : 'none',
      }}
    />
  );
}

export default function ScienceSection({ onToggleParticles, particlesActive }: ScienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { startOm, stopOm } = useOmSound();
  const [particles] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      size: 3 + Math.random() * 6,
      left: 10 + Math.random() * 80,
    }))
  );

  // Handle Om sound based on particlesActive state
  useEffect(() => {
    if (particlesActive) {
      startOm();
    } else {
      stopOm();
    }
  }, [particlesActive, startOm, stopOm]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, idx) => {
              setTimeout(() => {
                el.classList.add('active');
              }, idx * 150);
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="science"
      className="relative min-h-screen flex items-center py-24 px-6 z-10 overflow-hidden"
    >
      {/* Background energy effect when active */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
        particlesActive ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(38_70%_50%/0.08)_0%,transparent_60%)]" />
        
        {/* Floating particles */}
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
        
        {/* Ambient light rays */}
        <div className="absolute top-1/2 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-primary/30 to-transparent rotate-12 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent -rotate-12 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-px h-24 bg-gradient-to-b from-transparent via-primary/25 to-transparent rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto w-full relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual Side */}
          <div className="reveal order-2 lg:order-1 relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Outer glow when active */}
              <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                particlesActive 
                  ? 'bg-[radial-gradient(circle,hsl(38_70%_50%/0.15)_0%,transparent_70%)] scale-110' 
                  : 'bg-transparent scale-100'
              }`} />

              {/* Concentric Circles representing sound waves */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3, 4, 5, 6, 7].map((ring) => (
                  <div
                    key={ring}
                    className={`absolute rounded-full border transition-all ${
                      particlesActive 
                        ? 'border-primary/50' 
                        : 'border-primary/10'
                    }`}
                    style={{
                      width: `${ring * 13}%`,
                      height: `${ring * 13}%`,
                      animation: particlesActive 
                        ? `pulse-glow ${2 + ring * 0.3}s ease-in-out infinite` 
                        : 'none',
                      animationDelay: `${ring * 0.15}s`,
                      boxShadow: particlesActive 
                        ? `0 0 ${ring * 3}px hsl(38 70% 50% / ${0.2 - ring * 0.02})` 
                        : 'none',
                    }}
                  />
                ))}
                
                {/* Energy waves emanating from center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {particlesActive && [0, 1, 2].map((wave) => (
                    <div
                      key={wave}
                      className="absolute rounded-full border border-primary/30"
                      style={{
                        width: '30%',
                        height: '30%',
                        animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) infinite`,
                        animationDelay: `${wave * 0.7}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Center - Garbhagriha representation */}
                <div className={`
                  w-20 h-20 rounded-sm border-2 transition-all duration-500 relative
                  ${particlesActive 
                    ? 'border-primary bg-primary/30 shadow-[0_0_60px_hsl(38,70%,50%,0.6)]' 
                    : 'border-primary/40 bg-primary/10'
                  }
                `}>
                  {/* Inner glow */}
                  <div className={`absolute inset-0 transition-opacity duration-500 ${
                    particlesActive ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent" />
                  </div>
                  
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Om symbol when active */}
                    <div className={`text-primary font-display text-2xl transition-all duration-500 ${
                      particlesActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}>
                      ॐ
                    </div>
                    {/* Dot when inactive */}
                    <div className={`absolute w-4 h-4 rounded-full bg-primary transition-all duration-500 ${
                      particlesActive ? 'opacity-0 scale-0' : 'opacity-50 scale-100'
                    }`} />
                  </div>
                  
                  {/* Corner accents */}
                  {particlesActive && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary animate-pulse" style={{ animationDelay: '0.25s' }} />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary animate-pulse" style={{ animationDelay: '0.75s' }} />
                    </>
                  )}
                </div>
              </div>

              {/* Rotating outer ring */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${
                particlesActive ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="absolute inset-[-10%] border border-dashed border-primary/20 rounded-full animate-spin-slow" />
                <div className="absolute inset-[-5%] border border-dotted border-primary/15 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
              </div>

              {/* Labels */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                <span className={`text-xs tracking-wider uppercase transition-colors duration-500 ${
                  particlesActive ? 'text-primary' : 'text-muted-foreground'
                }`}>Sound Waves</span>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className={`text-xs tracking-wider uppercase transition-all duration-500 ${
                  particlesActive ? 'text-primary font-semibold' : 'text-primary/70'
                }`}>Garbhagriha</span>
              </div>
              
              {/* Side labels when active */}
              {particlesActive && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
                    <span className="text-xs text-primary/60 tracking-wider uppercase writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>Energy Flow</span>
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
                    <span className="text-xs text-primary/60 tracking-wider uppercase" style={{ writingMode: 'vertical-rl' }}>Resonance</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="reveal">
              <span className="text-primary text-sm tracking-[0.3em] uppercase font-display">
                Hidden Science
              </span>
            </div>

            <h2 className="reveal font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Acoustics & <span className="text-gold-gradient">Energy</span>
            </h2>

            <div className="reveal space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
              <p>
                The <span className="text-primary font-medium">Garbhagriha</span> (sanctum sanctorum) 
                is not merely a spiritual center—it's an acoustic marvel. The parabolic dome 
                concentrates and amplifies sound waves, creating a resonance chamber where 
                mantras achieve maximum vibrational impact.
              </p>
              <p>
                Temple bells, when rung, produce frequencies that align with the chamber's 
                natural resonance. The resulting standing waves are believed to clear the 
                mind and align the body's energy centers (chakras) with cosmic vibrations.
              </p>
              <p>
                Modern acoustic analysis has confirmed these temples operate at frequencies 
                between <span className="text-primary">100-400 Hz</span>—the same range 
                associated with deep meditation and healing states.
              </p>
            </div>

            {/* Interactive Toggle */}
            <div className="reveal pt-4">
              <Button
                onClick={onToggleParticles}
                variant="outline"
                size="lg"
                className={`
                  font-display tracking-wider uppercase text-sm relative overflow-hidden
                  border-primary/50 hover:border-primary 
                  ${particlesActive 
                    ? 'bg-primary/20 text-primary border-primary shadow-[0_0_30px_hsl(38,70%,50%,0.4)]' 
                    : 'bg-transparent text-foreground hover:text-primary hover:bg-primary/10'
                  }
                  transition-all duration-300
                `}
              >
                {/* Button glow effect */}
                {particlesActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
                )}
                <span className={`relative z-10 flex items-center`}>
                  <span className={`w-3 h-3 rounded-full mr-3 transition-all duration-300 ${
                    particlesActive 
                      ? 'bg-primary animate-pulse shadow-[0_0_10px_hsl(38,70%,50%,0.8)]' 
                      : 'bg-muted-foreground'
                  }`} />
                  {particlesActive ? 'Visualizing Energy' : 'Visualize Sound Energy'}
                </span>
              </Button>
            </div>

            {/* Stats */}
            <div className="reveal grid grid-cols-3 gap-4 pt-6">
              <div className={`glass-card p-4 text-center transition-all duration-500 ${
                particlesActive ? 'border-primary/40 shadow-[0_0_20px_hsl(38,70%,50%,0.15)]' : ''
              }`}>
                <div className={`font-display text-xl mb-1 transition-all duration-500 ${
                  particlesActive ? 'text-primary scale-110' : 'text-primary'
                }`}>100-400</div>
                <div className="text-xs text-muted-foreground">Hz Frequency</div>
              </div>
              <div className={`glass-card p-4 text-center transition-all duration-500 ${
                particlesActive ? 'border-primary/40 shadow-[0_0_20px_hsl(38,70%,50%,0.15)]' : ''
              }`} style={{ transitionDelay: '0.1s' }}>
                <div className={`font-display text-xl mb-1 transition-all duration-500 ${
                  particlesActive ? 'text-primary scale-110' : 'text-primary'
                }`}>7.83</div>
                <div className="text-xs text-muted-foreground">Hz Earth Resonance</div>
              </div>
              <div className={`glass-card p-4 text-center transition-all duration-500 ${
                particlesActive ? 'border-primary/40 shadow-[0_0_20px_hsl(38,70%,50%,0.15)]' : ''
              }`} style={{ transitionDelay: '0.2s' }}>
                <div className={`font-display text-2xl mb-1 transition-all duration-500 ${
                  particlesActive ? 'text-primary scale-125 animate-pulse' : 'text-primary'
                }`}>ॐ</div>
                <div className="text-xs text-muted-foreground">Primordial Sound</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
