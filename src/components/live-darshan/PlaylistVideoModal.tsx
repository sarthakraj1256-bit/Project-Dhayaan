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

          {/* Video list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <p className="text-xs text-muted-foreground mb-2">{items.length} videos</p>
            <div className="flex flex-col gap-1.5">
              {items.map((video, i) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveVideoId(video.videoId)}
                  className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors ${
                    activeVideoId === video.videoId
                      ? 'bg-primary/15 border border-primary/30'
                      : 'hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                  <div className="w-20 shrink-0 aspect-[16/9] relative overflow-hidden rounded-md bg-muted">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                    {activeVideoId === video.videoId && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/85 line-clamp-2 flex-1 leading-snug">{video.title}</p>
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
