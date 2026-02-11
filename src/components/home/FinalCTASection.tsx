import { Link } from 'react-router-dom';
import { Headphones, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinalCTASection() {
  return (
    <section className="px-5 py-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex gap-3"
      >
        <Link
          to="/sonic-lab"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 active:scale-95"
        >
          <Headphones className="w-4 h-4" />
          Relax
        </Link>
        <Link
          to="/live-darshan"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium transition-all duration-200 active:scale-95 hover:border-primary/30"
        >
          <Building2 className="w-4 h-4 text-primary" />
          Darshan
        </Link>
      </motion.div>
    </section>
  );
}
