import { Link } from 'react-router-dom';
import { ArrowRight, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RelaxationSection() {
  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Quick Calm
        </h2>
        <Link to="/sonic-lab" className="text-xs text-primary flex items-center gap-1 hover:underline">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Link
          to="/sonic-lab"
          className="block p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border hover:border-primary/30 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Waves className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Healing Frequencies</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Relax, focus, or sleep with therapeutic sound
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
