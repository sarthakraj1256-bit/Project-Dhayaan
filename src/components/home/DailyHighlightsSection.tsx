import { Link } from 'react-router-dom';
import { Sparkles, Building2, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const highlights = [
  { icon: Sparkles, labelKey: 'highlights.todaysPick' as TranslationKey, title: 'Kashi Ganga Aarti', href: '/live-darshan' },
  { icon: Waves, labelKey: 'highlights.recommended' as TranslationKey, title: '528 Hz Healing', href: '/sonic-lab' },
  { icon: Building2, labelKey: 'highlights.featuredTemple' as TranslationKey, title: 'Tirupati Balaji', href: '/live-darshan' },
];

export default function DailyHighlightsSection() {
  const { t } = useLanguage();

  return (
    <section className="px-6 py-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
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
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98]"
            >
               <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(52,217,168,0.2)' }}>
                 <item.icon className="w-4 h-4" style={{ color: '#34D9A8' }} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-wide font-medium">
                  {t(item.labelKey)}
                </p>
                <p className="text-sm font-medium text-white/90 truncate">
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
