import { Link } from 'react-router-dom';
import { Headphones, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-3xl mx-auto">
        {/* Brand */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-lg tracking-[0.3em] text-primary mb-6"
        >
          DHYAAN
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-wide mb-6"
        >
          <span className="text-primary">Find Peace.</span>
          <br />
          <span className="text-foreground">Experience Devotion.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Relax your mind with healing frequencies or connect with temples through live and recorded darshan.
        </motion.p>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/sonic-lab"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-display text-lg tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--gold)/0.4)]"
          >
            <Headphones className="w-5 h-5" />
            Relax with Frequencies
          </Link>

          <Link
            to="/live-darshan"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-void-light border border-primary/30 text-foreground font-display text-lg tracking-wider transition-all duration-300 hover:scale-105 hover:border-primary/60 hover:shadow-[0_0_30px_hsl(var(--gold)/0.2)]"
          >
            <Building2 className="w-5 h-5 text-primary" />
            Temple Darshan
          </Link>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-muted-foreground text-sm tracking-widest uppercase">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </section>
  );
}
