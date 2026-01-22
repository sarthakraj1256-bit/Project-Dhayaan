import { useRef, useEffect } from 'react';

export default function VastuSection() {
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
      id="vastu"
      className="relative min-h-screen flex items-center py-24 px-6 z-10"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <div className="space-y-8">
          <div className="reveal">
            <span className="text-primary text-sm tracking-[0.3em] uppercase font-display">
              Sacred Blueprint
            </span>
          </div>

          <h2 className="reveal font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
            The <span className="text-gold-gradient">Vastu Purusha</span> Mandala
          </h2>

          <div className="reveal space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
            <p>
              Every temple begins with a sacred grid—the Vastu Purusha Mandala. This 81-square 
              (9×9) or 64-square (8×8) diagram represents the cosmic being whose body forms 
              the foundation of architectural space.
            </p>
            <p>
              The central square, <span className="text-primary font-medium">Brahmasthana</span>, 
              marks the most sacred space—the heart of the temple where the main deity resides. 
              Each surrounding square is assigned to different deities, determining the placement 
              of elements throughout the structure.
            </p>
            <p>
              This mathematical framework encodes astronomical alignments, cardinal directions, 
              and the relationship between microcosm (the temple) and macrocosm (the universe).
            </p>
          </div>

          {/* Key Points */}
          <div className="reveal grid grid-cols-2 gap-6 pt-4">
            <div className="glass-card p-4">
              <div className="text-primary font-display text-2xl mb-1">81</div>
              <div className="text-sm text-muted-foreground">Squares in Paramasayika Grid</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-primary font-display text-2xl mb-1">45</div>
              <div className="text-sm text-muted-foreground">Deities in Mandala</div>
            </div>
          </div>
        </div>

        {/* Visual Grid Representation */}
        <div className="reveal relative flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Mandala Grid Visualization */}
            <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 gap-px p-4">
              {Array.from({ length: 81 }).map((_, idx) => {
                const row = Math.floor(idx / 9);
                const col = idx % 9;
                const isBrahmasthana = row >= 3 && row <= 5 && col >= 3 && col <= 5;
                const isCorner = (row < 2 || row > 6) && (col < 2 || col > 6);
                
                return (
                  <div
                    key={idx}
                    className={`
                      aspect-square border transition-all duration-500
                      ${isBrahmasthana 
                        ? 'bg-primary/30 border-primary/60' 
                        : isCorner 
                          ? 'bg-void-light/50 border-border/30'
                          : 'bg-void-light/20 border-border/20'
                      }
                    `}
                    style={{ 
                      transitionDelay: `${idx * 10}ms`,
                    }}
                  />
                );
              })}
            </div>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-primary font-display text-sm tracking-wider">BRAHMA</div>
                <div className="text-primary/60 text-xs tracking-widest">STHANA</div>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute -inset-4 border border-primary/10" />
            <div className="absolute -inset-8 border border-primary/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
