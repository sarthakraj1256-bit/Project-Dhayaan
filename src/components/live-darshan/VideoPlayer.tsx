import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Share2,
  Heart,
  Bell,
  Users,
  Radio,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Temple, deityLabels, categoryLabels } from '@/data/templeStreams';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';

interface VideoPlayerProps {
  temple: Temple;
  onClose: () => void;
}

const VideoPlayer = ({ temple, onClose }: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  const handleShare = async () => {
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
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleNotify = () => {
    setIsNotified(!isNotified);
    toast.success(isNotified ? 'Notifications disabled' : 'You will be notified for live streams');
  };

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${temple.youtubeVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1`;

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
                {temple.isLive && (
                  <Badge className="bg-red-600 text-white border-0 gap-1 animate-pulse">
                    <Radio className="w-3 h-3" />
                    LIVE
                  </Badge>
                )}
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
            <AspectRatio ratio={16 / 9} className="h-full">
              <iframe
                src={youtubeEmbedUrl}
                title={temple.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </AspectRatio>

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
                  
                  {temple.viewerCount && (
                    <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{temple.viewerCount.toLocaleString()} watching</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className={`bg-background/50 hover:bg-background/80 ${isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNotify}
                    className={`bg-background/50 hover:bg-background/80 ${isNotified ? 'text-primary' : ''}`}
                  >
                    <Bell className={`w-5 h-5 ${isNotified ? 'fill-current' : ''}`} />
                  </Button>
                  
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

              {/* Open in YouTube */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${temple.youtubeVideoId}`, '_blank')}
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
