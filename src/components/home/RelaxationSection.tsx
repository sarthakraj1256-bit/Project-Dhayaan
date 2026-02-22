import { Link } from 'react-router-dom';
import { ArrowRight, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RelaxationSection() {
  const { t } = useLanguage();

  return (
    <section className="px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest">
          {t('section.quickCalm')}
        </h2>
        <Link to="/sonic-lab" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          {t('link.seeAll')} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Link
          to="/sonic-lab"
          className="block p-5 rounded-2xl light-card transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10">
               <Waves className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-medium text-foreground/85">{t('relax.title')}</p>
               <p className="text-sm text-muted-foreground mt-0.5">
                {t('relax.desc')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-foreground/30 shrink-0" />
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
