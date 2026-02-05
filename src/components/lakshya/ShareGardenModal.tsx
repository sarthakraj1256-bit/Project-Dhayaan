import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Twitter, Facebook, Linkedin, Link2, Check, Loader2, Download, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareGardenModalProps {
  isOpen: boolean;
  onClose: () => void;
  gardenRef: React.RefObject<HTMLDivElement>;
  gardenStats: {
    plantCount: number;
    flourishingCount: number;
    gardenLevel: number;
    totalKarmaEarned: number;
  };
  userId: string | null;
}

const ShareGardenModal = ({ 
  isOpen, 
  onClose, 
  gardenRef, 
  gardenStats,
  userId 
}: ShareGardenModalProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLImageElement>(null);

  const captureGarden = useCallback(async () => {
    if (!gardenRef.current) return;
    
    setIsCapturing(true);
    
    try {
      // Capture the garden element
      const canvas = await html2canvas(gardenRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9);
      });
      
      // Create local preview URL
      const localUrl = URL.createObjectURL(blob);
      setScreenshotUrl(localUrl);
      
      // Upload to Supabase if user is logged in
      if (userId) {
        const fileName = `${userId}/${Date.now()}.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('garden-screenshots')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: true,
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Could not upload screenshot');
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('garden-screenshots')
            .getPublicUrl(fileName);
          
          // Save to shared_gardens table
          const { data: shareData, error: shareError } = await supabase
            .from('shared_gardens')
            .insert({
              user_id: userId,
              screenshot_url: urlData.publicUrl,
              plant_count: gardenStats.plantCount,
              flourishing_count: gardenStats.flourishingCount,
              garden_level: gardenStats.gardenLevel,
              total_karma_earned: gardenStats.totalKarmaEarned,
            })
            .select()
            .single();
          
          if (shareError) {
            console.error('Share error:', shareError);
          } else if (shareData) {
            const shareLink = `${window.location.origin}/garden/${shareData.id}`;
            setShareUrl(shareLink);
          }
        }
      }
      
      toast.success('Garden captured! 📸');
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Could not capture garden');
    } finally {
      setIsCapturing(false);
    }
  }, [gardenRef, userId, gardenStats]);

  const copyLink = useCallback(async () => {
    const link = shareUrl || window.location.href;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const downloadScreenshot = useCallback(() => {
    if (!screenshotUrl) return;
    
    const link = document.createElement('a');
    link.href = screenshotUrl;
    link.download = `dhyaan-garden-${Date.now()}.png`;
    link.click();
    toast.success('Screenshot downloaded!');
  }, [screenshotUrl]);

  const getShareText = () => {
    return `🌱 My Inner Calm Garden on Dhyaan\n\n🪴 ${gardenStats.plantCount} plants growing\n🌸 ${gardenStats.flourishingCount} flourishing\n✨ ${gardenStats.totalKarmaEarned} Karma earned\n\nGrow your own peaceful digital garden through meditation! 🧘‍♀️`;
  };

  const shareToTwitter = () => {
    const text = getShareText();
    const url = shareUrl || 'https://dhyaan-cosmos.lovable.app';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareToFacebook = () => {
    const url = shareUrl || 'https://dhyaan-cosmos.lovable.app';
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareToLinkedIn = () => {
    const url = shareUrl || 'https://dhyaan-cosmos.lovable.app';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl max-w-md w-full overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display text-lg text-foreground">Share Your Garden</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Screenshot Preview */}
            {screenshotUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img 
                  ref={previewRef}
                  src={screenshotUrl} 
                  alt="Garden screenshot" 
                  className="w-full"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={downloadScreenshot}
                    className="p-2 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={captureGarden}
                disabled={isCapturing}
                className="w-full py-8 rounded-xl border-2 border-dashed border-white/20 hover:border-emerald-500/50 transition-colors flex flex-col items-center gap-3"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="text-sm text-muted-foreground">Capturing garden...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-emerald-400" />
                    <span className="text-sm text-foreground">Capture Garden Screenshot</span>
                    <span className="text-xs text-muted-foreground">Click to create a shareable image</span>
                  </>
                )}
              </button>
            )}

            {/* Garden Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <p className="text-2xl">🪴</p>
                <p className="text-lg font-display text-foreground">{gardenStats.plantCount}</p>
                <p className="text-xs text-muted-foreground">Plants</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <p className="text-2xl">🌸</p>
                <p className="text-lg font-display text-foreground">{gardenStats.flourishingCount}</p>
                <p className="text-xs text-muted-foreground">Flourishing</p>
              </div>
            </div>

            {/* Share Link */}
            {shareUrl && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-foreground outline-none truncate"
                />
                <button
                  onClick={copyLink}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Link2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            )}

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Share to social media</p>
              <div className="flex gap-2">
                <button
                  onClick={shareToTwitter}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4267B2]/20 hover:bg-[#4267B2]/30 text-[#4267B2] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#0A66C2] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Copy Text Button */}
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(getShareText());
                toast.success('Share text copied!');
              }}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Copy Share Text</span>
            </button>

            {!userId && (
              <p className="text-xs text-center text-amber-400/80">
                Sign in to save and share your garden with a permanent link!
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareGardenModal;
