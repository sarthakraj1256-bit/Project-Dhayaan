import { Link } from 'react-router-dom';
import { Headphones, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinalCTASection() {
  return (
    <section className="px-6 py-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex gap-3"
      >
        <Link
          to="/sonic-lab"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white text-sm font-medium shadow-[0_4px_16px_rgba(42,168,138,0.25)] transition-all duration-200 active:scale-[0.96]"
        >
          <Headphones className="w-4 h-4" strokeWidth={1.8} />
          Relax
        </Link>
        <Link
          to="/live-darshan"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 text-foreground text-sm font-medium shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 active:scale-[0.96] hover:bg-white/85"
        >
          <Building2 className="w-4 h-4 text-primary" strokeWidth={1.8} />
          Darshan
        </Link>
      </motion.div>
    </section>
  );
}
