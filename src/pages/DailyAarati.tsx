import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Clock, User, Sparkles, Music, Zap, BookOpen, Video, Filter, X } from 'lucide-react';
import { spiritualContent, SpiritualContent } from '@/data/templeStreams';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

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

const filters = [
  { value: 'all', label: 'All', icon: Sparkles },
  { value: 'bhajan', label: 'Bhajans', icon: Music },
  { value: 'aarti', label: 'Aarati', icon: Zap },
  { value: 'mantra', label: 'Mantras', icon: Sparkles },
  { value: 'pravachan', label: 'Pravachan', icon: BookOpen },
  { value: 'short', label: 'Shorts', icon: Video },
];

const DailyAarati = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeVideo, setActiveVideo] = useState<SpiritualContent | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return spiritualContent;
    return spiritualContent.filter(c => c.type === activeFilter);
  }, [activeFilter]);

  const handlePlay = useCallback((item: SpiritualContent) => {
    setActiveVideo(item);
  }, []);

  const handleClose = useCallback(() => {
    setActiveVideo(null);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F5F0EA] dark:bg-[#0C0A09]">
        {/* Header */}
        <header className="sticky top-0 z-[1000] h-16 md:h-[72px] flex items-center justify-between px-4 bg-[#E9E2D9]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border-b border-[#5C5145]/10 dark:border-[#E9E2D9]/10">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/8 dark:hover:bg-[#E9E2D9]/6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
          <h1 className="text-lg font-bold text-[#3C2F1F] dark:text-[#E9E2D9] tracking-wide">
            Daily Aarati
          </h1>
          <div className="w-11" />
        </header>

        <main className="px-4 pt-4 pb-28 md:pb-8 max-w-5xl mx-auto">
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
            {filters.map(f => {
              const Icon = f.icon;
              const active = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-[hsl(38_60%_55%)] text-white shadow-md'
                      : 'bg-[#5C5145]/8 dark:bg-[#E9E2D9]/8 text-[#5C5145] dark:text-[#E9E2D9]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Count */}
          <p className="text-xs text-[#9C8C7C] mb-4">
            {filtered.length} devotional {filtered.length === 1 ? 'video' : 'videos'}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((item, index) => (
              <ContentCard key={item.id} item={item} index={index} onPlay={handlePlay} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#9C8C7C]">No videos in this category yet.</p>
            </div>
          )}
        </main>

        {/* Video Player Modal */}
        <AnimatePresence>
          {activeVideo && (
            <VideoPlayerModal video={activeVideo} onClose={handleClose} />
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

function ContentCard({ item, index, onPlay }: { item: SpiritualContent; index: number; onPlay: (item: SpiritualContent) => void }) {
  const { t } = useLanguage();
  const labelKey = typeLabels[item.type];
  const label = labelKey ? t(labelKey) : item.type;
  const color = typeColors[item.type] ?? 'bg-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <button
        onClick={() => onPlay(item)}
        className="block w-full text-left rounded-2xl overflow-hidden bg-[#EDE8E0] dark:bg-[#1C1917] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] group"
      >
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute top-2 left-2">
            <Badge className={`${color} text-white border-0 text-[9px] px-1.5 py-0.5 leading-none`}>
              {label}
            </Badge>
          </div>

          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/90">
            <Clock className="w-2.5 h-2.5" />
            {item.duration}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>

        <div className="p-2.5">
          <p className="text-xs font-medium text-[#3C2F1F] dark:text-[#E9E2D9] line-clamp-2 leading-snug">
            {item.title}
          </p>
          {item.speaker && (
            <p className="text-[10px] text-[#9C8C7C] mt-1 flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              {item.speaker}
            </p>
          )}
        </div>
      </button>
    </motion.div>
  );
}

function VideoPlayerModal({ video, onClose }: { video: SpiritualContent; onClose: () => void }) {
  const { t } = useLanguage();
  const labelKey = typeLabels[video.type];
  const label = labelKey ? t(labelKey) : video.type;
  const color = typeColors[video.type] ?? 'bg-muted';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Badge className={`${color} text-white border-0 text-[10px] px-2 py-0.5 shrink-0`}>
            {label}
          </Badge>
          <span className="text-xs text-white/60 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {video.duration}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Video player - fills remaining space */}
      <div className="flex-1 relative">
        <iframe
          key={video.youtubeVideoId}
          src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1&playsinline=1&rel=0`}
          title={video.title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Bottom info */}
      <div className="px-4 py-3 bg-black/80 backdrop-blur-sm shrink-0">
        <h3 className="text-sm font-semibold text-white leading-snug break-words line-clamp-2">
          {video.title}
        </h3>
        {video.speaker && (
          <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
            <User className="w-3 h-3" />
            {video.speaker}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default DailyAarati;
