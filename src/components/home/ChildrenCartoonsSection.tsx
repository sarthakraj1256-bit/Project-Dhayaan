import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Clock, ListVideo, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { standaloneCartoons, rollNo21Cartoons, chhotaBheemKrishnaCartoons, CartoonVideo } from '@/data/childrenCartoons';
import { Badge } from '@/components/ui/badge';
import ContentVideoModal from '@/components/live-darshan/ContentVideoModal';
import { SpiritualContent } from '@/data/templeStreams';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';

export default function ChildrenCartoonsSection() {
  const [selectedVideo, setSelectedVideo] = useState<SpiritualContent | null>(null);
  const [showRollNo21, setShowRollNo21] = useState(false);
  const [showBheemKrishna, setShowBheemKrishna] = useState(false);

  // Standalone videos + 1 Roll No 21 playlist card
  const previewItems = standaloneCartoons.slice(0, 3);

  const handleSelect = (item: CartoonVideo) => {
    setSelectedVideo({
      id: item.id,
      title: item.title,
      type: 'short',
      youtubeVideoId: item.youtubeVideoId,
      duration: item.duration,
      thumbnail: item.thumbnail,
    });
  };

  return (
    <>
      <section className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Spiritual Cartoons for Children
          </h2>
          <Link
            to="/children-cartoons"
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {/* Roll No 21 playlist card */}
          <RollNo21PlaylistCard onOpen={() => setShowRollNo21(true)} />

          {/* Chhota Bheem aur Krishna ki Jodi playlist card */}
          <PlaylistCard
            title="Chhota Bheem aur Krishna ki Jodi"
            episodes={chhotaBheemKrishnaCartoons}
            onOpen={() => setShowBheemKrishna(true)}
          />

          {previewItems.map((item, index) => (
            <CartoonCard key={item.id} item={item} index={index + 2} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {selectedVideo && (
        <ContentVideoModal content={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {showRollNo21 && (
        <EpisodeListModal
          title="Roll No 21"
          episodes={rollNo21Cartoons}
          onClose={() => setShowRollNo21(false)}
          onSelectVideo={handleSelect}
        />
      )}

      {showBheemKrishna && (
        <EpisodeListModal
          title="Chhota Bheem aur Krishna ki Jodi"
          episodes={chhotaBheemKrishnaCartoons}
          onClose={() => setShowBheemKrishna(false)}
          onSelectVideo={handleSelect}
        />
      )}
    </>
  );
}

/* Roll No 21 playlist thumbnail card */
function RollNo21PlaylistCard({ onOpen }: { onOpen: () => void }) {
  const thumb = `https://img.youtube.com/vi/${rollNo21Cartoons[0]?.youtubeVideoId}/hqdefault.jpg`;
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0 }}
      className="shrink-0 w-[172px]"
    >
      <button
        type="button"
        aria-label="Open Roll No 21 playlist"
        onClick={onOpen}
        className="block w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none"
      >
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img src={thumb} alt="Roll No 21" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-1.5 left-1.5">
            <Badge className="bg-indigo-600 text-white border-0 text-[9px] px-1.5 py-0.5 leading-none">
              📚 {rollNo21Cartoons.length} Episodes
            </Badge>
          </div>
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
            <ListVideo className="w-2.5 h-2.5" />
            Playlist
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            </div>
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug">Roll No 21</p>
        </div>
      </button>
    </motion.div>
  );
}

/* Generic playlist card for homepage horizontal scroll */
function PlaylistCard({ title, episodes, onOpen }: { title: string; episodes: CartoonVideo[]; onOpen: () => void }) {
  const thumb = `https://img.youtube.com/vi/${episodes[0]?.youtubeVideoId}/hqdefault.jpg`;
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="shrink-0 w-[172px]"
    >
      <button
        type="button"
        aria-label={`Open ${title} playlist`}
        onClick={onOpen}
        className="block w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none"
      >
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img src={thumb} alt={title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-1.5 left-1.5">
            <Badge className="bg-indigo-600 text-white border-0 text-[9px] px-1.5 py-0.5 leading-none">
              📚 {episodes.length} Episodes
            </Badge>
          </div>
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
            <ListVideo className="w-2.5 h-2.5" />
            Playlist
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug">{title}</p>
        </div>
      </button>
    </motion.div>
  );
}

/* Generic episode list modal */
function EpisodeListModal({ title, episodes, onClose, onSelectVideo }: { title: string; episodes: CartoonVideo[]; onClose: () => void; onSelectVideo: (v: CartoonVideo) => void }) {
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
            <h2 className="font-display text-lg md:text-xl text-foreground">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {episodes.map((item, i) => (
              <button
                key={item.youtubeVideoId}
                type="button"
                aria-label={`Play Episode ${i + 1}`}
                onClick={() => { onSelectVideo(item); onClose(); }}
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
                    <span className="text-xs text-white/50 mt-0.5">{title}</span>
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
function CartoonCard({ item, index, onSelect }: { item: CartoonVideo; index: number; onSelect: (v: CartoonVideo) => void }) {
  const isPlaylist = item.source === 'playlist';

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="shrink-0 w-[172px]"
    >
      <button
        type="button"
        aria-label={isPlaylist ? `Open playlist: ${item.title}` : `Play ${item.title}`}
        onClick={() => onSelect(item)}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            onSelect(item);
          }
        }}
        className="block w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none"
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
            <Badge className={`${isPlaylist ? 'bg-indigo-600' : 'bg-pink-600'} text-white border-0 text-[9px] px-1.5 py-0.5 leading-none`}>
              {isPlaylist ? '📚 Playlist' : '🎬 Video'}
            </Badge>
          </div>

          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
            {isPlaylist ? <ListVideo className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
            {item.duration}
          </div>

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
        </div>
      </button>
    </motion.div>
  );
}
