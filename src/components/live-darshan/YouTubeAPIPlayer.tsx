import { useId, memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Volume2, VolumeX, Loader2, PictureInPicture2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useYouTubePlayerAPI, StreamStatus } from '@/hooks/useYouTubeAPI';
import { toast } from 'sonner';

interface YouTubeAPIPlayerProps {
  liveVideoId?: string;
  recordedVideoId?: string;
  backupAmbienceId?: string;
  templeName: string;
  onStatusChange?: (status: StreamStatus) => void;
  onError?: (error: string) => void;
}

const YouTubeAPIPlayer = memo(({
  liveVideoId,
  recordedVideoId,
  backupAmbienceId,
  templeName,
  onStatusChange,
  onError,
}: YouTubeAPIPlayerProps) => {
  const uniqueId = useId();
  const containerId = `yt-player-${uniqueId.replace(/:/g, '')}`;

  const {
    status,
    currentVideoId,
    isMuted,
    isPlayerReady,
    isAPIReady,
    apiError,
    toggleMute,
    retryConnection,
    enterPictureInPicture,
  } = useYouTubePlayerAPI({
    containerId,
    liveVideoId,
    recordedVideoId,
    backupAmbienceId,
    onStatusChange,
    onError,
  });

  // Show loading state while API loads
  if (!isAPIReady) {
    return (
      <div className="relative w-full aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading player...</p>
        </div>
      </div>
    );
  }

  // Show error if API failed to load
  if (apiError) {
    return (
      <div className="relative w-full aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load video player</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-background rounded-lg overflow-hidden">
      {/* YouTube Player Container */}
      <div id={containerId} className="absolute inset-0 w-full h-full" />

      {/* Status Badge Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <StatusBadge status={status} templeName={templeName} />
      </div>

      {/* Loading Overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Connecting to darshan...</p>
          </div>
        </div>
      )}

      {/* Recorded Mode Banner */}
      {status === 'recorded' && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-16 left-4 right-4 z-10"
        >
          <div className="bg-secondary/90 backdrop-blur-sm border border-secondary rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm text-secondary-foreground">
              📹 Recorded Aarti from {templeName}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={retryConnection}
              className="gap-1 text-secondary-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Check Live
            </Button>
          </div>
        </motion.div>
      )}

      {/* Ambience Mode Overlay */}
      {status === 'ambience' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50 flex items-end justify-center pb-20 z-10"
        >
          <div className="text-center space-y-2">
            <p className="text-lg text-foreground">
              Darshan will resume shortly 🙏
            </p>
            <p className="text-sm text-muted-foreground">
              Finding peace within...
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={retryConnection}
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check for Live Stream
            </Button>
          </div>
        </motion.div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="bg-background/50 hover:bg-background/80"
              disabled={!isPlayerReady}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            
            {/* Compact status indicator */}
            <StatusBadge status={status} templeName={templeName} compact />
          </div>
          
          {/* PiP Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    const success = await enterPictureInPicture();
                    if (success) {
                      toast.success('🪷 Darshan in mini-player', {
                        description: 'Continue browsing while watching',
                        duration: 3000,
                      });
                    } else {
                      toast.error('PiP not available', {
                        description: 'Your browser may not support this feature',
                        duration: 3000,
                      });
                    }
                  }}
                  className="bg-background/50 hover:bg-background/80"
                  disabled={!isPlayerReady}
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Watch in mini-player</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
});

YouTubeAPIPlayer.displayName = 'YouTubeAPIPlayer';

// Status Badge Component
interface StatusBadgeProps {
  status: StreamStatus;
  templeName: string;
  compact?: boolean;
}

const StatusBadge = ({ status, templeName, compact = false }: StatusBadgeProps) => {
  switch (status) {
    case 'live':
      return (
        <Badge className="bg-destructive text-destructive-foreground gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-ping" />
          {compact ? 'LIVE' : `🔴 LIVE Aarti from ${templeName}`}
        </Badge>
      );
    case 'recorded':
      return (
        <Badge className="bg-accent text-accent-foreground gap-1.5">
          {compact ? '🟡 Recorded' : `🟡 Recorded Darshan from ${templeName}`}
        </Badge>
      );
    case 'ambience':
      return (
        <Badge className="bg-primary text-primary-foreground gap-1.5">
          {compact ? '🔵 Ambience' : '🔵 Temple Ambience'}
        </Badge>
      );
    case 'loading':
      return (
        <Badge variant="secondary" className="gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          {compact ? 'Loading...' : 'Connecting...'}
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1.5">
          ⚠️ {compact ? 'Error' : 'Connection Issue'}
        </Badge>
      );
    default:
      return null;
  }
};

export default YouTubeAPIPlayer;
