import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Clock, ListVideo } from 'lucide-react';
import { motion } from 'framer-motion';
import { standaloneCartoons, playlistCartoons, CartoonVideo } from '@/data/childrenCartoons';
import { Badge } from '@/components/ui/badge';
import ContentVideoModal from '@/components/live-darshan/ContentVideoModal';
import PlaylistVideoModal from '@/components/live-darshan/PlaylistVideoModal';
import { SpiritualContent } from '@/data/templeStreams';

export default function ChildrenCartoonsSection() {
  const [selectedVideo, setSelectedVideo] = useState<SpiritualContent | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ title: string; playlistId: string } | null>(null);
  const allPreview = [...standaloneCartoons, ...playlistCartoons.slice(0, 3)];

  const handleSelect = (item: CartoonVideo) => {
    if (item.source === 'playlist' && item.playlistId) {
      setSelectedPlaylist({ title: item.title, playlistId: item.playlistId });
      return;
    }
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
          {allPreview.map((item, index) => (
            <CartoonCard key={item.id} item={item} index={index} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {selectedVideo && (
        <ContentVideoModal content={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
      {selectedPlaylist && (
        <PlaylistVideoModal
          key={selectedPlaylist.playlistId}
          title={selectedPlaylist.title}
          playlistId={selectedPlaylist.playlistId}
          onClose={() => setSelectedPlaylist(null)}
        />
      )}
    </>
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
