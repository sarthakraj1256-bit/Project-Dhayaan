import { useState, useCallback } from "react";
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLike } from "@/hooks/useLike";
import type { ShortItem } from "@/hooks/useShorts";
import CommentsDrawer from "./CommentsDrawer";
import ReportModal from "./ReportModal";

interface ActionBarProps {
  short: ShortItem;
  onRemove: (id: string) => void;
}

const ActionBar = ({ short, onRemove }: ActionBarProps) => {
  const { liked, count, toggleLike } = useLike(short.id, short.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "Check this Bhakti Short on Dhyaan 🙏",
      text: short.caption || "A beautiful devotional moment",
      url: `${window.location.origin}/bhakti-shorts?id=${short.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // WhatsApp fallback
        const waText = encodeURIComponent(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        window.open(`https://wa.me/?text=${waText}`, "_blank");
      }
    } catch (err) {
      // User cancelled share
    }
  }, [short]);

  const glassStyle = {
    background: "rgba(15,10,5,0.45)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(201,168,76,0.25)",
  };

  return (
    <>
      <div
        className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5"
        role="toolbar"
        aria-label="Short actions"
      >
        {/* Like */}
        <button
          onClick={toggleLike}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label={liked ? "Unlike" : "Like"}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : "text-[#E8C97A]"}`}
              />
            </motion.div>
          </div>
          <span className="text-[11px] text-[#F2EDE8] font-medium">{count}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label="Comments"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <MessageCircle className="w-5 h-5 text-[#E8C97A]" />
          </div>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 touch-target"
          aria-label="Share"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
            <Share2 className="w-5 h-5 text-[#E8C97A]" />
          </div>
        </button>

        {/* More */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center gap-1 touch-target"
            aria-label="More options"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={glassStyle}>
              <MoreVertical className="w-5 h-5 text-[#E8C97A]" />
            </div>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-14 right-0 w-44 rounded-xl p-1 z-30"
                style={glassStyle}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReport(true);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[#F2EDE8] hover:bg-[rgba(201,168,76,0.1)] rounded-lg transition-colors"
                >
                  🚩 Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CommentsDrawer
        shortId={short.id}
        open={showComments}
        onClose={() => setShowComments(false)}
      />

      <ReportModal
        shortId={short.id}
        open={showReport}
        onClose={() => setShowReport(false)}
        onReported={() => onRemove(short.id)}
      />
    </>
  );
};

export default ActionBar;
