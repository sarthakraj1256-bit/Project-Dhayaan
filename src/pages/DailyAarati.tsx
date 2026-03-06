import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Clock, User, Sparkles, Music, Zap, BookOpen, Video, Filter, X, ExternalLink } from 'lucide-react';
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
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#F5F0EA] dark:bg-[#1C1917] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#5C5145]/10 dark:border-[#E9E2D9]/10">
          <div className="flex items-center gap-2">
            <Badge className={`${color} text-white border-0 text-[10px] px-2 py-0.5`}>
              {label}
            </Badge>
            <span className="text-xs text-[#9C8C7C] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#5C5145]/10 dark:bg-[#E9E2D9]/10 hover:bg-[#5C5145]/20 dark:hover:bg-[#E9E2D9]/20 transition-colors"
          >
            <X className="w-4 h-4 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
        </div>

        {/* Embedded YouTube Player */}
        <div className="aspect-[16/9] w-full bg-black">
          <iframe
            key={video.youtubeVideoId}
            src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1&playsinline=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-3">
          <h3 className="text-base font-semibold text-[#3C2F1F] dark:text-[#E9E2D9] leading-snug break-words">
            {video.title}
          </h3>
          {video.speaker && (
            <p className="text-sm text-[#9C8C7C] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {video.speaker}
            </p>
          )}

          {/* Open in YouTube button */}
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
            </svg>
            Open in YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DailyAarati;
