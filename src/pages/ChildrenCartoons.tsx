import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { standaloneCartoons, playlistCartoons, CartoonVideo } from '@/data/childrenCartoons';
import { Badge } from '@/components/ui/badge';
import ContentVideoModal from '@/components/live-darshan/ContentVideoModal';
import PlaylistVideoModal from '@/components/live-darshan/PlaylistVideoModal';
import { SpiritualContent } from '@/data/templeStreams';
import BottomNav from '@/components/BottomNav';

export default function ChildrenCartoons() {
  const [selectedVideo, setSelectedVideo] = useState<SpiritualContent | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ title: string; playlistId: string } | null>(null);

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
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 border-b border-border/30" style={{ background: '#0B1D3A' }}>
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </Link>
        <h1 className="text-base font-semibold text-white/90">Spiritual Cartoons for Children</h1>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-8">
        {/* Standalone Videos */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Featured Videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {standaloneCartoons.map((item, i) => (
              <VideoCard key={item.id} item={item} index={i} onSelect={handleSelect} />
            ))}
          </div>
        </section>

        {/* Playlists */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Playlists</h2>
          <div className="flex flex-col gap-3">
            {playlistCartoons.map((item, i) => (
              <VideoCard key={item.id} item={item} index={i} onSelect={handleSelect} />
            ))}
          </div>
        </section>
      </main>

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

      <BottomNav />
    </div>
  );
}

function VideoCard({ item, index, onSelect }: { item: CartoonVideo; index: number; onSelect: (v: CartoonVideo) => void }) {
  const isPlaylist = item.source === 'playlist';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        type="button"
        aria-label={isPlaylist ? `Open playlist: ${item.title}` : `Play ${item.title}`}
        onClick={() => onSelect(item)}
        className={`w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none ${isPlaylist ? 'flex flex-row items-center' : ''}`}
      >
        <div className={`${isPlaylist ? 'w-32 shrink-0' : 'w-full'} aspect-[16/9] relative overflow-hidden bg-muted`}>
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-1.5 left-1.5">
            <Badge className={`${isPlaylist ? 'bg-indigo-600' : 'bg-pink-600'} text-white border-0 text-[9px] px-1.5 py-0.5 leading-none`}>
              {isPlaylist ? '📚 Playlist' : '🎬 Video'}
            </Badge>
          </div>
          {!isPlaylist && (
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
              <Clock className="w-2.5 h-2.5" />
              {item.duration}
            </div>
          )}
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
