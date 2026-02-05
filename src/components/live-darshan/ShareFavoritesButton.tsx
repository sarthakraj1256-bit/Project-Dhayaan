import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Copy, Check, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Temple } from '@/data/templeStreams';

interface ShareFavoritesButtonProps {
  favoriteTemples: { temple: Temple }[];
}

const ShareFavoritesButton = ({ favoriteTemples }: ShareFavoritesButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/live-darshan` : '';
  
  const templeNames = favoriteTemples.slice(0, 3).map(f => f.temple.name).join(', ');
  const moreCount = favoriteTemples.length > 3 ? ` and ${favoriteTemples.length - 3} more` : '';
  
  const shareText = favoriteTemples.length > 0
    ? `🙏 My favorite temples for daily darshan: ${templeNames}${moreCount}. Experience live aarti and spiritual bliss with Dhyaan!`
    : '🙏 Discover live temple darshan and aarti timings with Dhyaan!';

  const hashtags = 'Dhyaan,LiveDarshan,Temple,Aarti,Spirituality';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
  };

  const handleCopy = async () => {
    try {
      const fullText = `${shareText}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Favorite Temples - Dhyaan',
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    }
  };

  if (favoriteTemples.length === 0) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share List</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
            Share {favoriteTemples.length} favorite temple{favoriteTemples.length > 1 ? 's' : ''}
          </p>
          
          {navigator.share && (
            <>
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
              >
                <Share2 className="w-4 h-4 text-primary" />
                <span>Share via...</span>
              </button>
              <div className="border-t border-border my-1" />
            </>
          )}
          
          <button
            onClick={() => handleShare('whatsapp')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp</span>
          </button>
          
          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
          >
            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
            <span>Twitter / X</span>
          </button>
          
          <button
            onClick={() => handleShare('facebook')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
          >
            <Facebook className="w-4 h-4 text-[#4267B2]" />
            <span>Facebook</span>
          </button>
          
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
          >
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            <span>LinkedIn</span>
          </button>
          
          <div className="border-t border-border my-1" />
          
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareFavoritesButton;
