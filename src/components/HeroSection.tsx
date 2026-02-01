import { useEffect, useRef } from 'react';

interface HeroSectionProps {
  onMounted: () => void;
}

export default function HeroSection({ onMounted }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    onMounted();
  }, [onMounted]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-6 z-10"
    >
      <div className="text-center max-w-4xl mx-auto">
        {/* Sanskrit Invocation */}
        <p className="text-primary/80 text-sm tracking-[0.4em] uppercase mb-6 font-body animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          ॐ वास्तोष्पते प्रति जानीह्यस्मान्
        </p>

        {/* Brand Logo */}
        <p className="font-display text-lg tracking-[0.3em] text-gold-gradient gold-glow mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          DHYAAN
        </p>

        {/* Main Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-wide mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <span className="text-gold-gradient">Resonate</span>
          <br />
          <span className="text-foreground">with the Cosmos</span>
        </h1>

        {/* Subheadline */}
        <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          Decoding the fractal geometry, acoustic science, and sacred mathematics of ancient Indian temples.
        </p>

        {/* Scroll Indicator */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground text-sm tracking-widest uppercase">Explore</span>
            <div className="w-px h-16 bg-gradient-to-b from-primary/50 to-transparent animate-pulse-glow" />
          </div>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/20" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/20" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/20" />
    </section>
  );
}
