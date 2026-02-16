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

const typeLabels: Record<string, { label: string; color: string }> = {
  bhajan: { label: '🎵 Bhajan', color: 'bg-purple-600' },
  aarti: { label: '🪔 Aarti', color: 'bg-orange-600' },
  meditation: { label: '🧘 Meditation', color: 'bg-green-600' },
  mantra: { label: '🕉️ Mantra', color: 'bg-amber-600' },
  pravachan: { label: '🎙️ Pravachan', color: 'bg-teal-600' },
  discourse: { label: '📖 Discourse', color: 'bg-blue-600' },
  short: { label: '📱 Short', color: 'bg-pink-600' },
};

const descriptions: Record<string, string> = {
  bhajan: 'Devotional hymns to uplift your spirit and connect with the divine.',
  aarti: 'Sacred lamp ceremony performed to honor and worship the deity.',
  meditation: 'Guided meditation for inner peace and chakra alignment.',
  mantra: 'Ancient Sanskrit chants for spiritual energy and focus.',
  pravachan: 'Spiritual discourse sharing timeless wisdom and teachings.',
  discourse: 'Insightful talks on the path of devotion and self-realization.',
  short: 'Quick spiritual moments for your daily dose of divinity.',
};

const speakerBios: Record<string, string> = {
  'Premanand Ji Maharaj': 'Renowned spiritual teacher known for profound pravachans on Bhagavad Gita and Vedantic philosophy.',
  'Spiritual Master': 'A guiding voice on the path of Bhakti, sharing wisdom from ancient scriptures.',
};

export default function SpiritualHubSection() {
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
          {preview.map((item, index) => (
            <AartiCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>
    </TooltipProvider>
  );
}

function AartiCard({ item, index }: { item: SpiritualContent; index: number }) {
  const info = typeLabels[item.type] ?? { label: item.type, color: 'bg-muted' };
  const desc = descriptions[item.type] ?? '';
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
        to="/live-darshan"
        aria-label={`Play ${item.title}`}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
        className="block rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none"
      >
        {/* Thumbnail */}
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-1.5 left-1.5">
            <Badge className={`${info.color} text-white border-0 text-[9px] px-1.5 py-0.5 leading-none`}>
              {info.label}
            </Badge>
          </div>

          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
            <Clock className="w-2.5 h-2.5" />
            {item.duration}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 space-y-1">
          <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug">
            {item.title}
          </p>

          {/* Short description */}
          {desc && (
            <p className="text-[10px] text-white/35 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          )}

          {/* Speaker with bio tooltip */}
          {item.speaker && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex items-center gap-1 text-[10px] text-white/50 hover:text-white/70 transition-colors cursor-default"
                  onClick={(e) => e.preventDefault()}
                >
                  <User className="w-2.5 h-2.5" />
                  {item.speaker}
                </span>
              </TooltipTrigger>
              {bio && (
                <TooltipContent
                  side="top"
                  className="max-w-[200px] bg-[hsl(216,55%,14%)] border-white/10 text-white/80 text-[11px]"
                >
                  <p className="font-medium text-white/90 mb-0.5">{item.speaker}</p>
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
