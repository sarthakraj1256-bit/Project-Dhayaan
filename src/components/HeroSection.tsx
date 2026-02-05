import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Radio, BookOpen, Sparkles, Play } from 'lucide-react';

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
         <div className="animate-fade-in-up opacity-0 space-y-6" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
           {/* CTAs */}
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             {/* Sonic Lab CTA */}
             <Link
               to="/sonic-lab"
               className="group inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 hover:scale-105"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.6), hsl(var(--void) / 0.4))',
                 backdropFilter: 'blur(12px)',
                 WebkitBackdropFilter: 'blur(12px)',
                 border: '1px solid hsl(var(--gold) / 0.3)',
                 boxShadow: '0 0 30px hsl(var(--gold) / 0.1)',
               }}
             >
               <Radio className="w-4 h-4 text-primary group-hover:animate-pulse" />
               <span className="font-display text-sm tracking-wider text-gold-gradient">
                 Enter The Sonic Lab
               </span>
             </Link>
 
             {/* Mantrochar CTA */}
             <Link
               to="/mantrochar"
               className="group inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 hover:scale-105"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.4), hsl(var(--void) / 0.2))',
                 backdropFilter: 'blur(12px)',
                 WebkitBackdropFilter: 'blur(12px)',
                 border: '1px solid hsl(var(--gold) / 0.2)',
               }}
             >
               <BookOpen className="w-4 h-4 text-primary/80 group-hover:text-primary transition-colors" />
               <span className="font-display text-sm tracking-wider text-foreground/80 group-hover:text-foreground transition-colors">
                  Learn Mantras
                </span>
              </Link>

              {/* Lakshya CTA */}
              <Link
                to="/lakshya"
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, hsl(270, 60%, 20% / 0.6), hsl(280, 50%, 15% / 0.4))',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid hsl(270, 60%, 50% / 0.3)',
                }}
              >
                <Sparkles className="w-4 h-4 text-violet-400 group-hover:animate-pulse" />
                <span className="font-display text-sm tracking-wider text-violet-300 group-hover:text-violet-200 transition-colors">
                  Lakshya Journey
                </span>
              </Link>

              {/* Live Darshan CTA */}
              <Link
                to="/live-darshan"
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, hsl(0, 70%, 25% / 0.6), hsl(25, 80%, 20% / 0.4))',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid hsl(25, 80%, 50% / 0.3)',
                }}
              >
                <Play className="w-4 h-4 text-orange-400 group-hover:animate-pulse" />
                <span className="font-display text-sm tracking-wider text-orange-300 group-hover:text-orange-200 transition-colors">
                  Live Darshan
                </span>
              </Link>
            </div>
 
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
