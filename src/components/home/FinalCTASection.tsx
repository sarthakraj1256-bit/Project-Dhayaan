import { Link } from 'react-router-dom';
import { Headphones, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FinalCTASection() {
  const { t } = useLanguage();

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
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-[0_4px_20px_hsl(35_80%_52%_/_0.2)] transition-all duration-200 active:scale-[0.96]"
        >
          <Headphones className="w-4 h-4" strokeWidth={2.2} />
          {t('cta.relax')}
        </Link>
        <Link
          to="/live-darshan"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl light-card text-foreground/80 text-sm font-medium transition-all duration-200 active:scale-[0.96]"
        >
          <Building2 className="w-4 h-4 text-primary" strokeWidth={2.2} />
          {t('cta.darshan')}
        </Link>
      </motion.div>
    </section>
  );
}
