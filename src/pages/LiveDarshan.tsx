import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Landmark, Tv, Play, Clock, User, Sparkles, Music, Zap, BookOpen, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LIVE_TEMPLES, getTemplesByRegion } from '@/data/liveDarshanTemples';
import { spiritualContent, SpiritualContent } from '@/data/templeStreams';
import LiveTempleCard from '@/components/live-darshan/LiveTempleCard';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

type Filter = 'all' | 'live' | 'sacred';

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

const aartiFilters = [
  { value: 'all', label: 'All', icon: Sparkles },
  { value: 'bhajan', label: 'Bhajans', icon: Music },
  { value: 'aarti', label: 'Aarati', icon: Zap },
  { value: 'mantra', label: 'Mantras', icon: Sparkles },
  { value: 'pravachan', label: 'Pravachan', icon: BookOpen },
  { value: 'short', label: 'Shorts', icon: Video },
];

const LiveDarshan = () => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [aartiFilter, setAartiFilter] = useState('all');
  const [activeVideo, setActiveVideo] = useState<SpiritualContent | null>(null);

  const liveCount = LIVE_TEMPLES.filter(t => t.hasLive).length;
  const totalCount = LIVE_TEMPLES.length;

  const filtered = useMemo(() => {
    if (filter === 'live') return LIVE_TEMPLES.filter(t => t.hasLive);
    if (filter === 'sacred') return LIVE_TEMPLES.filter(t => !t.hasLive);
    return LIVE_TEMPLES;
  }, [filter]);

  const regions = useMemo(() => getTemplesByRegion(filtered), [filtered]);

  const filteredAarti = useMemo(() => {
    if (aartiFilter === 'all') return spiritualContent;
    return spiritualContent.filter(c => c.type === aartiFilter);
  }, [aartiFilter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `All ${totalCount}` },
    { key: 'live', label: `🔴 Live ${liveCount}` },
    { key: 'sacred', label: `🛕 All Temples` },
  ];

  const handlePlay = useCallback((item: SpiritualContent) => setActiveVideo(item), []);
  const handleClose = useCallback(() => setActiveVideo(null), []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F5F0EA] dark:bg-[#080604]">
        {/* Header */}
        <header className="sticky top-0 z-[1000] h-16 flex items-center justify-between px-4 bg-[#E9E2D9]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border-b border-[#5C5145]/10 dark:border-[#E9E2D9]/10">
          <button onClick={() => navigate('/')} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/10 dark:hover:bg-[#E9E2D9]/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
          <h1 className="text-lg font-bold text-[#3C2F1F] dark:text-[#E9E2D9] tracking-wide">Darshan & Devotion</h1>
          <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/10 dark:hover:bg-[#E9E2D9]/10 transition-colors">
            <Bell className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
        </header>

        <main className="px-4 pt-4 pb-28 md:pb-8 max-w-[1280px] mx-auto">

          {/* ═══════ SECTION 1: LIVE DARSHAN ═══════ */}
          <div className="flex items-center gap-2 mb-3">
            <Tv className="w-5 h-5 text-[#D39A2A]" />
            <h2 className="text-base font-bold text-[#3C2F1F] dark:text-[#E9E2D9]">Live Darshan</h2>
          </div>
          <p className="text-sm text-[#9C8C7C] italic mb-4">
            Seek blessings from sacred temples 🙏
          </p>

          {/* Stats banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl border mb-5" style={{ background: 'rgba(211,154,42,0.08)', borderColor: 'rgba(211,154,42,0.25)' }}>
            <Landmark className="w-5 h-5 text-[#D39A2A] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#3C2F1F] dark:text-[#E9E2D9] flex items-center gap-2">
                🛕 {totalCount} Temples
                <span className="text-[#9C8C7C]">|</span>
                <Tv className="w-3.5 h-3.5 text-[#D39A2A]" /> {liveCount} Live Streams
              </p>
              <p className="text-xs text-[#9C8C7C]">Tap any LIVE temple to join darshan</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-[#D39A2A] text-white shadow-md'
                    : 'bg-[#1C1917]/10 dark:bg-white/10 text-[#9C8C7C]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Offline */}
          {!isOnline ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-3">🛕</p>
              <p className="text-base font-medium text-[#3C2F1F] dark:text-[#E9E2D9]">No connection</p>
              <p className="text-sm text-[#9C8C7C] mt-1 mb-5">Please check your internet to join live darshan.</p>
              <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#C68A1A] to-[#D9A832]">
                Retry
              </button>
            </div>
          ) : (
            regions.map(region => (
              <div key={region.key}>
                <h2 className="text-[13px] uppercase tracking-[2px] text-[#D39A2A] border-b border-[rgba(211,154,42,0.2)] mt-6 mb-3 pb-1.5 font-semibold">
                  {region.label}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {region.temples.map(temple => (
                    <LiveTempleCard key={temple.id} temple={temple} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* ═══════ DIVIDER ═══════ */}
          <div className="my-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#D39A2A]/20" />
            <span className="text-xs text-[#D39A2A] font-semibold tracking-wider uppercase">✦</span>
            <div className="flex-1 h-px bg-[#D39A2A]/20" />
          </div>

          {/* ═══════ SECTION 2: DAILY AARATI ═══════ */}
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-[#D39A2A]" />
            <h2 className="text-base font-bold text-[#3C2F1F] dark:text-[#E9E2D9]">Daily Aarati & Bhajans</h2>
          </div>
          <p className="text-sm text-[#9C8C7C] italic mb-4">
            Recorded devotional content for your daily practice 🙏
          </p>

          {/* Aarti filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1 mb-2">
            {aartiFilters.map(f => {
              const Icon = f.icon;
              const active = aartiFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setAartiFilter(f.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#D39A2A] text-white shadow-md'
                      : 'bg-[#1C1917]/10 dark:bg-white/10 text-[#9C8C7C]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-[#9C8C7C] mb-4">
            {filteredAarti.length} devotional {filteredAarti.length === 1 ? 'video' : 'videos'}
          </p>

          {/* Aarti grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAarti.map((item, index) => (
              <AartiContentCard key={item.id} item={item} index={index} onPlay={handlePlay} />
            ))}
          </div>

          {filteredAarti.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#9C8C7C]">No videos in this category yet.</p>
            </div>
          )}
        </main>

        {/* Video Player Modal */}
        <AnimatePresence>
          {activeVideo && (
            <AartiVideoModal video={activeVideo} onClose={handleClose} />
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

/* ─── Aarti Content Card ─── */
function AartiContentCard({ item, index, onPlay }: { item: SpiritualContent; index: number; onPlay: (item: SpiritualContent) => void }) {
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

/* ─── Aarti Video Player Modal ─── */
function AartiVideoModal({ video, onClose }: { video: SpiritualContent; onClose: () => void }) {
  const { t } = useLanguage();
  const labelKey = typeLabels[video.type];
  const label = labelKey ? t(labelKey) : video.type;
  const color = typeColors[video.type] ?? 'bg-muted';

  const dragY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.changedTouches[0].clientY - dragY.current;
    if (diff > 80) onClose();
    isDragging.current = false;
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-[2000] bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-center pt-2 pb-1 shrink-0 md:hidden">
        <div className="w-10 h-1 rounded-full bg-white/30" />
      </div>

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

export default LiveDarshan;
