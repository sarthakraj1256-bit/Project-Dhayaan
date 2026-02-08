import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Share2,
  MapPin,
} from 'lucide-react';
import { Temple, deityLabels, categoryLabels } from '@/data/templeStreams';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import TempleSchedule from './TempleSchedule';
import FavoriteButton from './FavoriteButton';
import OpenInYouTubeButton from './OpenInYouTubeButton';
import YouTubeAPIPlayer from './YouTubeAPIPlayer';
import DarshanChatPanel from './DarshanChatPanel';
import { StreamStatus } from '@/hooks/useYouTubeAPI';

interface VideoPlayerProps {
  temple: Temple;
  onClose: () => void;
}

const VideoPlayer = ({ temple, onClose }: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('loading');
  const [currentVideoId, setCurrentVideoId] = useState(temple.youtubeVideoId);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleStatusChange = useCallback((status: StreamStatus) => {
    setStreamStatus(status);
    
    // Notify user when live stream becomes available
    if (status === 'live') {
      toast.success('🔴 Live Aarti is now streaming!', {
        description: `Connected to ${temple.name}`,
        duration: 3000,
      });
    }
  }, [temple.name]);

  const handleError = useCallback((error: string) => {
    console.warn('[VideoPlayer] Error:', error);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: `${temple.name} - Live Darshan`,
        text: `Watch live darshan from ${temple.name} on Dhyaan`,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  }, [temple.name]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-xl ${
          isFullscreen ? '' : 'p-4 md:p-8'
        }`}
      >
        <div className={`h-full flex flex-col ${isFullscreen ? '' : 'max-w-7xl mx-auto'}`}>
          {/* Header */}
          {!isFullscreen && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl md:text-3xl text-foreground">
                  {temple.name}
                </h2>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-destructive/20"
              >
                <X className="w-6 h-6" />
              </Button>
            </motion.div>
          )}

          {/* Video Container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`relative flex-1 ${isFullscreen ? 'h-full' : 'rounded-2xl overflow-hidden border border-border/50 shadow-2xl'}`}
          >
            {/* YouTube API Player - Self-healing with automatic fallback */}
            <YouTubeAPIPlayer
              templeId={temple.id}
              liveVideoId={temple.youtubeVideoId}
              recordedVideoId={temple.recordedVideoId}
              backupAmbienceId={temple.backupAmbienceId}
              templeName={temple.name}
              onStatusChange={handleStatusChange}
              onError={handleError}
            />

            {/* Additional Controls Overlay - removed old viewer count (now in YouTubeAPIPlayer) */}
            <div className="absolute bottom-16 left-0 right-0 p-4">
              <div className="flex items-center justify-end">
                
                <div className="flex items-center gap-2">
                  <FavoriteButton 
                    templeId={temple.id} 
                    templeName={temple.name} 
                    showNotificationToggle 
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="bg-background/50 hover:bg-background/80"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-background/50 hover:bg-background/80"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Close button in fullscreen */}
            {isFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 bg-background/50 hover:bg-background/80 z-20"
              >
                <X className="w-6 h-6" />
              </Button>
            )}

            {/* Live Chat Panel */}
            <DarshanChatPanel
              templeId={temple.id}
              templeName={temple.name}
              isOpen={isChatOpen}
              onToggle={() => setIsChatOpen(!isChatOpen)}
            />
          </motion.div>

          {/* Info Section */}
          {!isFullscreen && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 space-y-4"
            >
              {/* Location & Category */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{temple.location}</span>
                </div>
                <Badge variant="secondary">{deityLabels[temple.deity]}</Badge>
                <Badge variant="outline">{categoryLabels[temple.category]}</Badge>
              </div>

              {/* Description */}
              <p className="text-foreground/80">{temple.description}</p>

              {/* Live Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Live Features</h4>
                <div className="flex flex-wrap gap-2">
                  {temple.liveFeatures.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Aarti Schedule */}
              {temple.aartiSchedule && temple.aartiSchedule.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <TempleSchedule schedule={temple.aartiSchedule} />
                </div>
              )}

              {/* Open in YouTube - Standard link with target="_blank" */}
              <OpenInYouTubeButton videoId={currentVideoId} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;
