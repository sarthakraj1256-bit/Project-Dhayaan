import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Loader2, MessageCircle, Twitter, Link2, Check, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ShareOfferingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  title?: string;
  children: ReactNode; // The receipt/card to capture
}

const ShareOfferingModal = ({
  isOpen,
  onClose,
  shareText,
  title = 'Share Offering',
  children,
}: ShareOfferingModalProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const captureImage = useCallback(async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 0.92);
      });
      const url = URL.createObjectURL(blob);
      setScreenshotUrl(url);
      toast.success('Image captured! 📸');
    } catch {
      toast.error('Could not capture image');
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const downloadImage = useCallback(() => {
    if (!screenshotUrl) return;
    const a = document.createElement('a');
    a.href = screenshotUrl;
    a.download = `dhyaan-offering-${Date.now()}.png`;
    a.click();
    toast.success('Image downloaded!');
  }, [screenshotUrl]);

  const shareToWhatsApp = () => {
    const url = 'https://dhyaan-cosmos.lovable.app';
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + url)}`,
      '_blank'
    );
  };

  const shareToTwitter = () => {
    const url = 'https://dhyaan-cosmos.lovable.app';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      copyText();
      return;
    }
    try {
      const shareData: ShareData = {
        title: 'Dhyaan Spiritual Offering',
        text: shareText,
        url: 'https://dhyaan-cosmos.lovable.app',
      };
      // If screenshot is available, try sharing the file
      if (screenshotUrl) {
        const res = await fetch(screenshotUrl);
        const blob = await res.blob();
        const file = new File([blob], 'dhyaan-offering.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          shareData.files = [file];
        }
      }
      await navigator.share(shareData);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        copyText();
      }
    }
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
          className="bg-card rounded-2xl max-w-md w-full overflow-hidden border border-border max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              <h2 className="font-[Cinzel] text-lg text-foreground">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Capturable receipt area */}
            <div ref={captureRef} className="p-3 rounded-xl bg-background">
              {children}
            </div>

            {/* Capture / Preview */}
            {screenshotUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={screenshotUrl} alt="Offering preview" className="w-full" />
                <button
                  onClick={downloadImage}
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={captureImage}
                disabled={isCapturing}
                className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">Capturing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 text-primary" />
                    <span className="text-sm text-foreground">Capture as Image</span>
                    <span className="text-[10px] text-muted-foreground">Save or share as a picture</span>
                  </>
                )}
              </button>
            )}

            {/* Share buttons */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Share via</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <span className="text-[10px] text-[#25D366] font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                  <span className="text-[10px] text-[#1DA1F2] font-medium">Twitter</span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-primary" />
                  <span className="text-[10px] text-primary font-medium">More</span>
                </button>
              </div>
            </div>

            {/* Copy text */}
            <button
              onClick={copyText}
              className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Share Text'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareOfferingModal;
