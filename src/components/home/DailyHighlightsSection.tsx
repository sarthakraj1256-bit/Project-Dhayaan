import { Link } from 'react-router-dom';
import { Sparkles, Building2, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const highlights = [
  { icon: Sparkles, labelKey: 'highlights.todaysPick' as TranslationKey, title: 'Kashi Ganga Aarati', href: '/live-darshan' },
  { icon: Waves, labelKey: 'highlights.recommended' as TranslationKey, title: '528 Hz Healing', href: '/sonic-lab' },
  { icon: Building2, labelKey: 'highlights.featuredTemple' as TranslationKey, title: 'Tirupati Balaji', href: '/live-darshan' },
];

export default function DailyHighlightsSection() {
  const { t } = useLanguage();

  return (
    <section className="px-6 py-5">
      <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-3">
        {t('section.highlights')}
      </h2>
      <div className="space-y-2.5">
        {highlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
          >
            <Link
              to={item.href}
              className="flex items-center gap-3 p-3.5 rounded-2xl light-card transition-all duration-200 active:scale-[0.98]"
            >
               <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                 <item.icon className="w-4 h-4 text-primary" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-foreground/35 uppercase tracking-wide font-medium">
                  {t(item.labelKey)}
                </p>
                <p className="text-sm font-medium text-foreground/85 truncate">
                  {item.title}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
