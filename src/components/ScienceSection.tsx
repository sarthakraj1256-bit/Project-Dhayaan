import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ScienceSectionProps {
  onToggleParticles: () => void;
  particlesActive: boolean;
}

export default function ScienceSection({ onToggleParticles, particlesActive }: ScienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

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
      className="relative min-h-screen flex items-center py-24 px-6 z-10"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual Side */}
          <div className="reveal order-2 lg:order-1 relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Concentric Circles representing sound waves */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((ring) => (
                  <div
                    key={ring}
                    className={`absolute rounded-full border transition-all duration-1000 ${
                      particlesActive 
                        ? 'border-primary/40 animate-pulse-glow' 
                        : 'border-primary/10'
                    }`}
                    style={{
                      width: `${ring * 18}%`,
                      height: `${ring * 18}%`,
                      animationDelay: `${ring * 0.2}s`,
                    }}
                  />
                ))}
                
                {/* Center - Garbhagriha representation */}
                <div className={`
                  w-16 h-16 rounded-sm border-2 transition-all duration-500
                  ${particlesActive 
                    ? 'border-primary bg-primary/30 shadow-[0_0_40px_hsl(38,70%,50%,0.5)]' 
                    : 'border-primary/40 bg-primary/10'
                  }
                `}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      particlesActive ? 'bg-primary animate-pulse' : 'bg-primary/50'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
                <span className="text-xs text-muted-foreground tracking-wider uppercase">Sound Waves</span>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <span className="text-xs text-primary tracking-wider uppercase">Garbhagriha</span>
              </div>
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
                  font-display tracking-wider uppercase text-sm
                  border-primary/50 hover:border-primary 
                  ${particlesActive 
                    ? 'bg-primary/20 text-primary border-primary shadow-[0_0_20px_hsl(38,70%,50%,0.3)]' 
                    : 'bg-transparent text-foreground hover:text-primary hover:bg-primary/10'
                  }
                  transition-all duration-300
                `}
              >
                <span className={`w-2 h-2 rounded-full mr-3 transition-colors ${
                  particlesActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                }`} />
                {particlesActive ? 'Visualizing Energy' : 'Visualize Sound Energy'}
              </Button>
            </div>

            {/* Stats */}
            <div className="reveal grid grid-cols-3 gap-4 pt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-primary font-display text-xl mb-1">100-400</div>
                <div className="text-xs text-muted-foreground">Hz Frequency</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-primary font-display text-xl mb-1">7.83</div>
                <div className="text-xs text-muted-foreground">Hz Earth Resonance</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-primary font-display text-xl mb-1">ॐ</div>
                <div className="text-xs text-muted-foreground">Primordial Sound</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
