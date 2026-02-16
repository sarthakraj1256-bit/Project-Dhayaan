import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
  position: number;
}

interface PlaylistVideoModalProps {
  title: string;
  playlistId: string;
  onClose: () => void;
}

const PlaylistVideoModal = ({ title, playlistId, onClose }: PlaylistVideoModalProps) => {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use query params via fetch for GET request

      // Use supabase functions invoke with GET-style query params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-playlist-items?playlistId=${encodeURIComponent(playlistId)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch playlist (${response.status})`);
      const result = await response.json();

      if (result.items && result.items.length > 0) {
        setItems(result.items);
        setActiveVideoId(result.items[0].videoId);
      } else {
        setError('No videos found in this playlist.');
      }
    } catch (err) {
      console.error('Playlist fetch error:', err);
      setError('Could not load playlist videos. Opening on YouTube instead.');
      // Fallback: open on YouTube
      setTimeout(() => {
        window.open(`https://www.youtube.com/playlist?list=${playlistId}`, '_blank', 'noopener,noreferrer');
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  }, [playlistId, onClose]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const embedUrl = activeVideoId
    ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl mx-auto flex flex-col h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <h2 className="font-display text-lg md:text-xl text-foreground line-clamp-1">{title}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlistId}`, '_blank', 'noopener,noreferrer')}
                className="gap-1.5 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                YouTube
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Player */}
          <div className="px-4 shrink-0">
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
              <AspectRatio ratio={16 / 9}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm px-4 text-center">
                    {error}
                  </div>
                ) : embedUrl ? (
                  <iframe
                    key={activeVideoId}
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : null}
              </AspectRatio>
            </div>
          </div>

          {/* Video list — full-width vertical stack */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <p className="text-xs text-muted-foreground mb-3">{items.length} videos</p>
            <div className="flex flex-col gap-3">
              {items.map((video, i) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveVideoId(video.videoId)}
                  className={`w-full text-left rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-md border shadow-[0_2px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                    activeVideoId === video.videoId
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-white/[0.12]'
                  }`}
                >
                  {/* Full-width thumbnail */}
                  <div className="w-full aspect-[16/9] relative overflow-hidden bg-muted">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Position number */}
                    <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-[10px] font-medium text-white/90">
                      {i + 1}
                    </div>
                    {/* Now playing indicator */}
                    {activeVideoId === video.videoId && (
                      <div className="absolute top-1.5 right-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">▶ Now Playing</span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  {/* Title */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-white/90 line-clamp-2 leading-snug">{video.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlaylistVideoModal;
