import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { temples } from '@/data/templeStreams';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DarshanSection() {
  const previewTemples = temples.slice(0, 4);
  const { t } = useLanguage();
  const { t } = useLanguage();

  return (
    <section className="px-6 py-5 space-y-6">
      {/* Live Darshan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest">
            {t('section.templeDarshan')}
          </h2>
          <Link to="/live-darshan" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            {t('link.viewAll')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {previewTemples.map((temple, index) => (
            <motion.div
              key={temple.id}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="shrink-0 w-[156px]"
            >
              <Link
                to="/live-darshan"
                className="block rounded-2xl overflow-hidden light-card transition-all duration-200 active:scale-[0.98]"
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img
                    src={temple.thumbnail}
                    alt={temple.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] font-medium text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      {t('darshan.live')}
                    </span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-foreground/85 truncate">
                    {temple.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {temple.location}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Daily Aarati */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            Daily Aarati
          </h2>
          <Link to="/daily-aarati" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            {t('link.viewAll')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {previewAarati.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="shrink-0 w-[156px]"
            >
              <Link
                to="/daily-aarati"
                className="block rounded-2xl overflow-hidden light-card transition-all duration-200 active:scale-[0.98] group"
              >
                <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[9px] text-white/90">
                    {item.duration}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-foreground/85 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{item.type}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}