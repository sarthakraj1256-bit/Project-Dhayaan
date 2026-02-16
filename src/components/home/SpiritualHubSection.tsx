import { Link } from 'react-router-dom';
import { ArrowRight, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { spiritualContent } from '@/data/templeStreams';
import { Badge } from '@/components/ui/badge';

const typeLabels: Record<string, { label: string; color: string }> = {
  bhajan: { label: '🎵 Bhajan', color: 'bg-purple-600' },
  aarti: { label: '🪔 Aarti', color: 'bg-orange-600' },
  meditation: { label: '🧘 Meditation', color: 'bg-green-600' },
  mantra: { label: '🕉️ Mantra', color: 'bg-amber-600' },
  pravachan: { label: '🎙️ Pravachan', color: 'bg-teal-600' },
  discourse: { label: '📖 Discourse', color: 'bg-blue-600' },
  short: { label: '📱 Short', color: 'bg-pink-600' },
};

export default function SpiritualHubSection() {
  // Pick a diverse set: one from each type available
  const seen = new Set<string>();
  const preview = spiritualContent.filter((c) => {
    if (seen.has(c.type) || seen.size >= 6) return false;
    seen.add(c.type);
    return true;
  });

  return (
    <section className="px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Daily Aarti
        </h2>
        <Link
          to="/live-darshan"
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          Explore all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {preview.map((item, index) => {
          const info = typeLabels[item.type] ?? { label: item.type, color: 'bg-muted' };
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="shrink-0 w-[172px]"
            >
              <Link
                to="/live-darshan"
                className="block rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98]"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Type badge */}
                  <div className="absolute top-1.5 left-1.5">
                    <Badge className={`${info.color} text-white border-0 text-[9px] px-1.5 py-0.5 leading-none`}>
                      {info.label}
                    </Badge>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
                    <Clock className="w-2.5 h-2.5" />
                    {item.duration}
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  {item.speaker && (
                    <p className="text-[10px] text-white/45 mt-0.5 truncate">
                      {item.speaker}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
