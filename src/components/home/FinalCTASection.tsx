import { Link } from 'react-router-dom';
import { Headphones, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinalCTASection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Decorative Element */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <span className="text-primary text-2xl">🙏</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          {/* Text */}
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
            Begin your journey toward calm and devotion
          </h2>
          <p className="text-muted-foreground font-body text-lg mb-10">
            Peace awaits, one breath and one moment at a time
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/sonic-lab"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-display text-base tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--gold)/0.4)]"
            >
              <Headphones className="w-5 h-5" />
              Start Relaxation
            </Link>

            <Link
              to="/live-darshan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-void-light border border-primary/30 text-foreground font-display text-base tracking-wider transition-all duration-300 hover:scale-105 hover:border-primary/60 hover:shadow-[0_0_30px_hsl(var(--gold)/0.2)]"
            >
              <Building2 className="w-5 h-5 text-primary" />
              Go to Darshan
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
