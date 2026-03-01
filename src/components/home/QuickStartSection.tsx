import { Link } from 'react-router-dom';
import {
  Waves, Play, BookOpen, ScrollText, Sparkles, Eye, Flame, Tv, Clapperboard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const features = [
  { icon: Waves, labelKey: 'feature.sonicLab' as TranslationKey, descKey: 'feature.sonicLabDesc' as TranslationKey, href: '/sonic-lab', color: '#1A9D7F' },
  { icon: Play, labelKey: 'feature.liveDarshan' as TranslationKey, descKey: 'feature.liveDarshanDesc' as TranslationKey, href: '/live-darshan', color: '#D4654A' },
  { icon: BookOpen, labelKey: 'feature.mantrochar' as TranslationKey, descKey: 'feature.mantrocharDesc' as TranslationKey, href: '/mantrochar', color: '#2D9E5E' },
  { icon: ScrollText, labelKey: 'feature.japSeva' as TranslationKey, descKey: 'feature.japSevaDesc' as TranslationKey, href: '/jap-bank', color: '#C8873A' },
  { icon: Sparkles, labelKey: 'feature.lakshya' as TranslationKey, descKey: 'feature.lakshyaDesc' as TranslationKey, href: '/lakshya', color: '#8B6FC0' },
  { icon: Eye, labelKey: 'feature.immersive' as TranslationKey, descKey: 'feature.immersiveDesc' as TranslationKey, href: '/immersive-darshan', color: '#3BA8C0' },
  { icon: Flame, labelKey: 'feature.dailyAarti' as TranslationKey, descKey: 'feature.dailyAartiDesc' as TranslationKey, href: '/live-darshan?tab=content', color: '#D4872A' },
  { icon: Tv, labelKey: 'feature.kidsCartoons' as TranslationKey, descKey: 'feature.kidsCartoonsDesc' as TranslationKey, href: '/children-cartoons', color: '#D45470' },
  { icon: Clapperboard, labelKey: 'feature.bhaktiShorts' as TranslationKey, descKey: 'feature.bhaktiShortsDesc' as TranslationKey, href: '/bhakti-shorts', color: '#C9A84C' },
];

export default function QuickStartSection() {
  const { t } = useLanguage();

  return (
    <section className="px-5 py-5">
      <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-4">
        {t('section.explore')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.labelKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Link
              to={feature.href}
              className={cn(
                'flex items-center gap-3 px-4 py-[14px] rounded-2xl',
                'light-card',
                'transition-all duration-200 active:scale-[0.96]',
                'h-[72px]'
              )}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-[13px] font-semibold text-foreground/85 leading-none tracking-tight">
                  {t(feature.labelKey)}
                </p>
                <p className="text-[11px] font-normal text-muted-foreground leading-none mt-[5px]">
                  {t(feature.descKey)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
