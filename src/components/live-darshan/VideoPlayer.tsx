import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Share2,
  Users,
  MapPin,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Temple, deityLabels, categoryLabels } from '@/data/templeStreams';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';
import TempleSchedule from './TempleSchedule';
import FavoriteButton from './FavoriteButton';
import VideoStatusBadge from './VideoStatusBadge';
import LiveSwitchPrompt from './LiveSwitchPrompt';
import { useVideoFallback } from '@/hooks/useVideoFallback';

interface VideoPlayerProps {
  temple: Temple;
  onClose: () => void;
}

const VideoPlayer = ({ temple, onClose }: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Video fallback system for 24/7 uninterrupted playback
  const {
    currentVideoId,
    streamStatus,
    showLiveSwitchPrompt,
    switchToLive,
    dismissLivePrompt,
    retryConnection,
    statusMessage,
  } = useVideoFallback({
    liveVideoId: temple.youtubeVideoId,
    recordedVideoId: temple.recordedVideoId,
    backupAmbienceId: temple.backupAmbienceId,
    onLiveAvailable: () => {
      toast.info('🔴 Live Aarti has started!', {
        description: `Live stream from ${temple.name} is now available`,
        duration: 5000,
      });
    },
  });

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

  // Build YouTube embed URL with fallback video
  const youtubeEmbedUrl = currentVideoId 
    ? `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&loop=1&playlist=${currentVideoId}`
    : null;

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
                <VideoStatusBadge 
                  streamStatus={streamStatus} 
                  templeName={temple.name}
                />
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
            {/* Loading State */}
            {streamStatus === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
                  <p className="text-muted-foreground">{statusMessage}</p>
                </div>
              </div>
            )}

            {/* Fail-safe Ambience State */}
            {streamStatus === 'ambience' && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-lg p-3 flex items-center justify-between">
                  <p className="text-sm text-primary-foreground/90">{statusMessage}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={retryConnection}
                    className="gap-1 text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <AspectRatio ratio={16 / 9} className="h-full">
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={temple.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Loading darshan...</p>
                </div>
              )}
            </AspectRatio>

            {/* Live Switch Prompt */}
            <LiveSwitchPrompt
              show={showLiveSwitchPrompt}
              templeName={temple.name}
              onSwitch={switchToLive}
              onDismiss={dismissLivePrompt}
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-background/50 hover:bg-background/80"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  {temple.viewerCount && streamStatus === 'live' && (
                    <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{temple.viewerCount.toLocaleString()} watching</span>
                    </div>
                  )}
                  
                  {/* Stream Status Indicator */}
                  <div className="hidden md:block">
                    <VideoStatusBadge 
                      streamStatus={streamStatus} 
                      templeName={temple.name}
                      compact
                    />
                  </div>
                </div>
                
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
                className="absolute top-4 right-4 bg-background/50 hover:bg-background/80"
              >
                <X className="w-6 h-6" />
              </Button>
            )}
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

              {/* Open in YouTube */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${currentVideoId || temple.youtubeVideoId}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in YouTube
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;
