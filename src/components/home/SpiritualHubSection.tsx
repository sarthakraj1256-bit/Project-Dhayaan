import { Link } from 'react-router-dom';
import { ArrowRight, Play, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { spiritualContent, SpiritualContent } from '@/data/templeStreams';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const typeLabels: Record<string, TranslationKey> = {
  bhajan: 'content.bhajan',
  aarti: 'content.aarti',
  meditation: 'content.meditation',
  mantra: 'content.mantra',
  pravachan: 'content.pravachan',
  discourse: 'content.discourse',
  short: 'content.short',
};

const typeColors: Record<string, string> = {
  bhajan: 'bg-purple-600',
  aarti: 'bg-orange-600',
  meditation: 'bg-green-600',
  mantra: 'bg-amber-600',
  pravachan: 'bg-teal-600',
  discourse: 'bg-blue-600',
  short: 'bg-pink-600',
};

const descriptionKeys: Record<string, TranslationKey> = {
  bhajan: 'contentDesc.bhajan',
  aarti: 'contentDesc.aarti',
  meditation: 'contentDesc.meditation',
  mantra: 'contentDesc.mantra',
  pravachan: 'contentDesc.pravachan',
  discourse: 'contentDesc.discourse',
  short: 'contentDesc.short',
};

const speakerBios: Record<string, string> = {
  'Premanand Ji Maharaj': 'Renowned spiritual teacher known for profound pravachans on Bhagavad Gita and Vedantic philosophy.',
  'Spiritual Master': 'A guiding voice on the path of Bhakti, sharing wisdom from ancient scriptures.',
};

export default function SpiritualHubSection() {
  const { t } = useLanguage();

  const seen = new Set<string>();
  const preview = spiritualContent.filter((c) => {
    if (seen.has(c.type) || seen.size >= 6) return false;
    seen.add(c.type);
    return true;
  });

  return (
    <TooltipProvider delayDuration={300}>
      <section className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest">
            {t('section.dailyAarti')}
          </h2>
           <Link
             to="/live-darshan"
             className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
           >
             {t('link.exploreAll')} <ArrowRight className="w-3 h-3" />
           </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {preview.map((item, index) => (
            <AartiCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>
    </TooltipProvider>
  );
}

function AartiCard({ item, index }: { item: SpiritualContent; index: number }) {
  const { t } = useLanguage();
  const labelKey = typeLabels[item.type];
  const label = labelKey ? t(labelKey) : item.type;
  const color = typeColors[item.type] ?? 'bg-muted';
  const descKey = descriptionKeys[item.type];
  const desc = descKey ? t(descKey) : '';
  const bio = item.speaker ? speakerBios[item.speaker] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="shrink-0 w-[172px]"
    >
      <Link
        to="/live-darshan?tab=content"
        aria-label={`Play ${item.title}`}
        className="block rounded-2xl overflow-hidden light-card transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none"
      >
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-1.5 left-1.5">
            <Badge className={`${color} text-white border-0 text-[9px] px-1.5 py-0.5 leading-none`}>{label}</Badge>
          </div>
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
            <Clock className="w-2.5 h-2.5" />{item.duration}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            </div>
          </div>
        </div>
        <div className="p-2.5 space-y-1">
          <p className="text-xs font-medium text-foreground/85 line-clamp-2 leading-snug">{item.title}</p>
          {desc && <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{desc}</p>}
          {item.speaker && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[10px] text-foreground/40 hover:text-foreground/60 transition-colors cursor-default" onClick={(e) => e.preventDefault()}>
                  <User className="w-2.5 h-2.5" />{item.speaker}
                </span>
              </TooltipTrigger>
              {bio && (
                <TooltipContent side="top" className="max-w-[200px] bg-card border-border text-foreground/80 text-[11px]">
                  <p className="font-medium text-foreground/90 mb-0.5">{item.speaker}</p>
                  <p className="leading-snug">{bio}</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
