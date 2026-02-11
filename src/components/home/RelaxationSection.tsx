import { Link } from 'react-router-dom';
import { ArrowRight, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RelaxationSection() {
  return (
    <section className="px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
          Quick Calm
        </h2>
        <Link to="/sonic-lab" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Link
          to="/sonic-lab"
          className="block p-5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(45,212,168,0.15)' }}>
              <Waves className="w-6 h-6 text-primary" strokeWidth={1.8} />
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
