import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Eye, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { temples, spiritualContent } from '@/data/templeStreams';
import { useLanguage } from '@/contexts/LanguageContext';

// Top 6 temples by viewer count
const trendingTemples = [...temples]
  .filter(t => t.viewerCount && t.viewerCount > 0)
  .sort((a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0))
  .slice(0, 6);

// Top 4 spiritual content (mix of types)
const trendingContent = spiritualContent.slice(0, 4);

function formatViewers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function TrendingSection() {
  const { t } = useLanguage();

  return (
    <section className="px-6 py-5 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-destructive" />
          </div>
          <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest">
            {t('section.trending')}
          </h2>
        </div>
        <Link to="/live-darshan" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          {t('link.viewAll')} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Trending Temples - Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {trendingTemples.map((temple, index) => (
          <motion.div
            key={temple.id}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="shrink-0 w-[180px]"
          >
            <Link
              to="/live-darshan"
              className="block rounded-2xl overflow-hidden light-card transition-all duration-200 active:scale-[0.98] group relative"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img
                  src={temple.thumbnail}
                  alt={temple.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Rank badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-destructive/90 text-[10px] font-bold text-white">
                    #{index + 1}
                  </span>
                </div>

                {/* Viewer count */}
                {temple.viewerCount && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] font-medium text-white/90">
                      <Eye className="w-2.5 h-2.5" />
                      {formatViewers(temple.viewerCount)}
                    </span>
                  </div>
                )}

                {/* Live badge */}
                {temple.isLive && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] font-medium text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2.5">
                <p className="text-xs font-medium text-foreground/85 truncate">
                  {temple.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {temple.location}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Trending Content - Compact list */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest">
          {t('section.popularContent')}
        </p>
        {trendingContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
          >
            <Link
              to="/daily-aarati"
              className="flex items-center gap-3 p-2.5 rounded-xl light-card transition-all duration-200 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/85 truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {item.type} {item.speaker ? `• ${item.speaker}` : ''} • {item.duration}
                </p>
              </div>
              <span className="text-[10px] font-bold text-destructive/70 shrink-0">
                #{index + 1}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
