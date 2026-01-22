import { useRef, useEffect } from 'react';

export default function ComparisonSection() {
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
      id="styles"
      className="relative min-h-screen flex items-center py-24 px-6 z-10"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="reveal text-primary text-sm tracking-[0.3em] uppercase font-display block mb-4">
            Architectural Lineages
          </span>
          <h2 className="reveal font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
            <span className="text-gold-gradient">Nagara</span> vs <span className="text-gold-gradient">Dravida</span>
          </h2>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Nagara Card */}
          <div className="reveal glass-card p-8 lg:p-10 relative overflow-hidden group">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                <path d="M50 10 C 50 10, 75 50, 75 50 C 75 50, 50 90, 50 90 C 50 90, 25 50, 25 50 C 25 50, 50 10, 50 10" 
                      fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M50 20 C 50 20, 65 50, 65 50 C 65 50, 50 80, 50 80 C 50 80, 35 50, 35 50 C 35 50, 50 20, 50 20" 
                      fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L4 22h16L12 2z" />
                    <path d="M12 6L6 20h12L12 6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-2xl lg:text-3xl text-foreground">Nagara</h3>
                  <p className="text-muted-foreground text-sm">North Indian Style</p>
                </div>
              </div>

              <div className="space-y-6 font-body">
                <p className="text-muted-foreground leading-relaxed">
                  Characterized by a curvilinear tower (Shikhara) that rises in a smooth, 
                  beehive-like curve towards the sky. The silhouette mimics the sacred 
                  Mount Meru—the cosmic mountain at the center of the universe.
                </p>

                <div className="space-y-3">
                  <h4 className="text-primary font-display text-sm tracking-wider uppercase">Key Features</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Curvilinear Shikhara (spire)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Amalaka (ribbed stone disc) at apex</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Square base (garbhagriha)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Ornate sculptural programs</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary">Notable Examples:</span> Khajuraho, 
                    Konark Sun Temple, Lingaraja Temple
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dravida Card */}
          <div className="reveal glass-card p-8 lg:p-10 relative overflow-hidden group">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                <rect x="20" y="70" width="60" height="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                <rect x="25" y="55" width="50" height="15" fill="none" stroke="currentColor" strokeWidth="1"/>
                <rect x="30" y="40" width="40" height="15" fill="none" stroke="currentColor" strokeWidth="1"/>
                <rect x="35" y="25" width="30" height="15" fill="none" stroke="currentColor" strokeWidth="1"/>
                <rect x="40" y="15" width="20" height="10" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="6" y="18" width="12" height="4" />
                    <rect x="7" y="13" width="10" height="5" />
                    <rect x="8" y="8" width="8" height="5" />
                    <rect x="9" y="4" width="6" height="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-2xl lg:text-3xl text-foreground">Dravida</h3>
                  <p className="text-muted-foreground text-sm">South Indian Style</p>
                </div>
              </div>

              <div className="space-y-6 font-body">
                <p className="text-muted-foreground leading-relaxed">
                  Distinguished by a pyramidal tower (Vimana) composed of progressively 
                  smaller stories, each receding as it ascends. The geometric precision 
                  creates a stepped mountain reaching towards the divine.
                </p>

                <div className="space-y-3">
                  <h4 className="text-primary font-display text-sm tracking-wider uppercase">Key Features</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Pyramidal Vimana (tower)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Gopuram (ornate gateway towers)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Octagonal or circular shikhara top</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Pillared halls (mandapas)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary">Notable Examples:</span> Brihadeeswarar, 
                    Meenakshi Temple, Shore Temple
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
