import { useEffect, useRef, memo } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface YouTubeEmbedProps {
  videoId: string;
  isMuted: boolean;
  onError?: () => void;
  onReady?: () => void;
  title?: string;
}

const YouTubeEmbed = memo(({ 
  videoId, 
  isMuted, 
  onError, 
  onReady,
  title = 'Temple Darshan'
}: YouTubeEmbedProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasLoadedRef = useRef(false);

  // Build YouTube embed URL with optimal parameters
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
    autoplay: '1',
    mute: isMuted ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    loop: '1',
    playlist: videoId, // Required for loop to work
    playsinline: '1', // For mobile iOS
    enablejsapi: '1',
    origin: window.location.origin,
  }).toString();

  useEffect(() => {
    // Reset load state when video changes
    hasLoadedRef.current = false;
  }, [videoId]);

  const handleLoad = () => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      onReady?.();
    }
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <AspectRatio ratio={16 / 9} className="h-full bg-background">
      <iframe
        ref={iframeRef}
        src={youtubeEmbedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
      />
    </AspectRatio>
  );
});

YouTubeEmbed.displayName = 'YouTubeEmbed';

export default YouTubeEmbed;
