import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, ExternalLink, Play } from "lucide-react";
import type { CuratedShort } from "@/data/bhaktiShortsData";

interface YouTubeShortCardProps {
  short: CuratedShort;
  isActive: boolean;
}

const YouTubeShortCard = ({ short, isActive }: YouTubeShortCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 500) + 50);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const heartIdRef = useRef(0);

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${short.caption} - Dhyaan Bhakti Shorts 🙏`,
      text: short.caption,
      url: `https://youtube.com/shorts/${short.videoId}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const waText = encodeURIComponent(`${shareData.title}\n${shareData.url}`);
        window.open(`https://wa.me/?text=${waText}`, "_blank");
      }
    } catch {}
  }, [short]);

  const openOnYouTube = useCallback(() => {
    window.open(`https://youtube.com/shorts/${short.videoId}`, "_blank");
  }, [short.videoId]);

  // Double tap heart burst
  const lastTapRef = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) toggleLike();
      const newHearts = Array.from({ length: 6 }, () => ({
        id: heartIdRef.current++,
        x: 150 + (Math.random() - 0.5) * 80,
        y: 300 + (Math.random() - 0.5) * 80,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => !newHearts.find((n) => n.id === h.id)));
      }, 800);
    }
    lastTapRef.current = now;
  }, [liked, toggleLike]);

  const glassStyle = {
    background: "rgba(15,10,5,0.45)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(201,168,76,0.25)",
  };

  const embedUrl = `https://www.youtube.com/embed/${short.videoId}?autoplay=${isActive ? 1 : 0}&loop=1&playlist=${short.videoId}&playsinline=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=0&enablejsapi=1`;

  return (
    <div
      className="relative w-full snap-start select-none"
      style={{ height: "100dvh", background: "#0A0604" }}
      onClick={handleTap}
    >
      {/* YouTube Embed */}
      {isActive ? (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none", pointerEvents: "auto" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={short.caption}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={`https://img.youtube.com/vi/${short.videoId}/0.jpg`}
            alt={short.caption}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="w-16 h-16 rounded-full flex items-center justify-center z-10" style={glassStyle}>
            <Play className="w-8 h-8 text-[#C9A84C] ml-1" fill="#C9A84C" />
          </div>
        </div>
      )}

      {/* Heart burst particles */}
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0, x: h.x, y: h.y }}
            animate={{
              opacity: 0,
              scale: 1.5,
              x: h.x + (Math.random() - 0.5) * 120,
              y: h.y - 60 - Math.random() * 80,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute pointer-events-none text-2xl z-30"
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Right side action bar */}
      <div
        className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5"
        role="toolbar"
        aria-label="Short actions"
      >
        {/* Like */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(); }}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label={liked ? "Unlike" : "Like"}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : "text-[#E8C97A]"}`} />
            </motion.div>
          </div>
          <span className="text-[11px] text-[#F2EDE8] font-medium">{likeCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label="Comments"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <MessageCircle className="w-5 h-5 text-[#E8C97A]" />
          </div>
        </button>

        {/* Save */}
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <motion.div animate={saved ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
              <Bookmark className={`w-5 h-5 ${saved ? "text-[#E8C97A] fill-[#E8C97A]" : "text-[#E8C97A]"}`} />
            </motion.div>
          </div>
        </button>

        {/* Share */}
        <button
          onClick={(e) => { e.stopPropagation(); handleShare(); }}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label="Share"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <Share2 className="w-5 h-5 text-[#E8C97A]" />
          </div>
        </button>

        {/* Open on YouTube */}
        <button
          onClick={(e) => { e.stopPropagation(); openOnYouTube(); }}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label="Open on YouTube"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E8C97A">
              <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.5.5c-1 .3-1.7 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.5 9.5.5 9.5.5s7.6 0 9.5-.5c1-.3 1.7-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Bottom gradient + caption + channel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div
          className="px-4 pb-24 pt-20"
          style={{ background: "linear-gradient(to top, rgba(10,6,4,0.85) 0%, transparent 100%)" }}
        >
          {/* Channel */}
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-sm text-[#E8C97A] font-semibold">
              {short.channelName[0]}
            </div>
            <span className="text-sm font-medium text-[#F2EDE8]">{short.channelName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); openOnYouTube(); }}
              className="ml-auto px-3 py-1 rounded-full text-[10px] font-semibold text-[#0A0604]"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}
            >
              Subscribe
            </button>
          </div>

          {/* Caption */}
          <p className="text-sm text-[#F2EDE8]/90 leading-relaxed mb-2">{short.caption}</p>

          {/* Tags */}
          {short.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {short.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full text-[#E8C97A] font-medium"
                  style={{
                    background: "rgba(201,168,76,0.15)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments mini drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={(e) => { e.stopPropagation(); setShowComments(false); }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl max-h-[50dvh] flex flex-col"
              style={{
                background: "rgba(15,10,5,0.9)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,76,0.15)]">
                <h3 className="text-sm font-semibold text-[#F2EDE8]">Comments</h3>
                <button onClick={() => setShowComments(false)} className="text-[#E8C97A] text-sm">✕</button>
              </div>
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-sm text-[#F2EDE8]/50">
                  View comments on YouTube 🙏
                </p>
              </div>
              <div className="px-4 py-3 border-t border-[rgba(201,168,76,0.15)] safe-bottom">
                <button
                  onClick={openOnYouTube}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#0A0604]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}
                >
                  Open on YouTube
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeShortCard;
