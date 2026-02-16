import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, ListVideo, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { standaloneCartoons, rollNo21Cartoons, CartoonVideo } from '@/data/childrenCartoons';
import { Badge } from '@/components/ui/badge';
import ContentVideoModal from '@/components/live-darshan/ContentVideoModal';
import { SpiritualContent } from '@/data/templeStreams';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';

const deduplicatedVideos = (() => {
  const seen = new Set<string>();
  return standaloneCartoons.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
})();

export default function ChildrenCartoons() {
  const [selectedVideo, setSelectedVideo] = useState<SpiritualContent | null>(null);
  const [showRollNo21, setShowRollNo21] = useState(false);

  const videos = useMemo(() => deduplicatedVideos, []);

  const handleVideoSelect = useCallback((item: CartoonVideo) => {
    setSelectedVideo({
      id: item.id,
      title: item.title,
      type: 'short',
      youtubeVideoId: item.youtubeVideoId,
      duration: item.duration,
      thumbnail: item.thumbnail,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 border-b border-border/30" style={{ background: '#0B1D3A' }}>
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </Link>
        <h1 className="text-base font-semibold text-white/90">Spiritual Cartoons for Children</h1>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-8">
        {/* Roll No 21 Playlist Card */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Playlists</h2>
          <RollNo21PlaylistCard onOpen={() => setShowRollNo21(true)} />
        </section>

        {/* Featured Videos */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Featured Videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {videos.map((item, i) => (
              <VideoCard key={item.id} item={item} index={i} onSelect={handleVideoSelect} />
            ))}
          </div>
        </section>
      </main>

      {selectedVideo && (
        <ContentVideoModal content={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {showRollNo21 && (
        <RollNo21Modal
          onClose={() => setShowRollNo21(false)}
          onSelectVideo={(item) => { handleVideoSelect(item); setShowRollNo21(false); }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function RollNo21PlaylistCard({ onOpen }: { onOpen: () => void }) {
  const thumb = `https://img.youtube.com/vi/${rollNo21Cartoons[0]?.youtubeVideoId}/hqdefault.jpg`;
  return (
    <button
      type="button"
      aria-label="Open Roll No 21 playlist"
      onClick={onOpen}
      className="w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none"
    >
      <div className="flex gap-3 p-2">
        <div className="w-36 shrink-0 rounded-xl overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <img src={thumb} alt="Roll No 21" className="w-full h-full object-cover" loading="lazy" />
          </AspectRatio>
        </div>
        <div className="flex flex-col justify-center min-w-0 py-1">
          <p className="text-sm font-medium text-white/90 leading-snug">Roll No 21</p>
          <div className="flex items-center gap-1 mt-1 text-white/50 text-xs">
            <ListVideo className="w-3 h-3" />
            <span>{rollNo21Cartoons.length} Episodes</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function RollNo21Modal({ onClose, onSelectVideo }: { onClose: () => void; onSelectVideo: (v: CartoonVideo) => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="w-full max-w-2xl mx-auto p-4 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg md:text-xl text-foreground">Roll No 21</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {rollNo21Cartoons.map((item, i) => (
              <button
                key={item.youtubeVideoId}
                type="button"
                aria-label={`Play Episode ${i + 1}`}
                onClick={() => onSelectVideo(item)}
                className="w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none"
              >
                <div className="flex gap-3 p-2">
                  <div className="w-36 shrink-0 rounded-xl overflow-hidden">
                    <AspectRatio ratio={16 / 9}>
                      <img src={item.thumbnail} alt={`Episode ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </AspectRatio>
                  </div>
                  <div className="flex flex-col justify-center min-w-0 py-1">
                    <p className="text-sm font-medium text-white/90 leading-snug">Episode {i + 1}</p>
                    <span className="text-xs text-white/50 mt-0.5">Roll No 21</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoCard({ item, index, onSelect }: { item: CartoonVideo; index: number; onSelect: (v: CartoonVideo) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        type="button"
        aria-label={`Play ${item.title}`}
        onClick={() => onSelect(item)}
        className="w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none"
      >
        <div className="w-full aspect-[16/9] relative overflow-hidden bg-muted">
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-1.5 left-1.5">
            <Badge className="bg-pink-600 text-white border-0 text-[9px] px-1.5 py-0.5 leading-none">🎬 Video</Badge>
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
        <div className="p-2.5">
          <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug">{item.title}</p>
        </div>
      </button>
    </motion.div>
  );
}