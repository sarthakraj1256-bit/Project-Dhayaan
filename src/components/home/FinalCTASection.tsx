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
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-[0_4px_20px_rgba(45,212,168,0.3)] transition-all duration-200 active:scale-[0.96]"
        >
          <Headphones className="w-4 h-4" strokeWidth={2.2} />
          Relax
        </Link>
        <Link
          to="/live-darshan"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] text-white/90 text-sm font-medium shadow-[0_2px_16px_rgba(0,0,0,0.2)] transition-all duration-200 active:scale-[0.96] hover:bg-white/[0.12]"
        >
          <Building2 className="w-4 h-4" style={{ color: '#34D9A8' }} strokeWidth={2.2} />
          Darshan
        </Link>
      </motion.div>
    </section>
  );
}
