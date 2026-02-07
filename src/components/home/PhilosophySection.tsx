import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PhilosophySection() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-void-light/40 to-primary/5 border border-primary/20"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-primary" />
          </div>

          {/* Philosophy Text */}
          <p className="font-body text-xl md:text-2xl text-foreground leading-relaxed mb-6 italic">
            "Exploring sound, devotion, and sacred traditions as pathways to inner balance."
          </p>

          <p className="text-muted-foreground font-body text-base max-w-xl mx-auto mb-8">
            Dhyaan bridges ancient temple wisdom with modern technology, offering a space where healing frequencies and divine darshan converge for your spiritual wellbeing.
          </p>

          {/* Explore Link */}
          <Link
            to="/mantrochar"
            className="inline-flex items-center gap-2 text-primary font-display text-sm tracking-wider hover:underline underline-offset-4"
          >
            Learn Sacred Mantras
            <span className="text-lg">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
