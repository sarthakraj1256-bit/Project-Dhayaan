import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import type { ShortItem } from "@/hooks/useShorts";
import ActionBar from "./ActionBar";

interface ShortCardProps {
  short: ShortItem;
  isActive: boolean;
  onRemove: (id: string) => void;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
}

const ShortCard = ({ short, isActive, onRemove }: ShortCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const lastTapRef = useRef(0);
  const heartIdRef = useRef(0);

  // Autoplay/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  // Double tap heart burst
  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap detected
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
        const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const newHearts: HeartParticle[] = Array.from({ length: 8 }, () => ({
          id: heartIdRef.current++,
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
        }));
        setHearts((prev) => [...prev, ...newHearts]);
        setTimeout(() => {
          setHearts((prev) => prev.filter((h) => !newHearts.find((n) => n.id === h.id)));
        }, 800);
      } else {
        // Single tap = toggle play
        togglePlay();
      }
      lastTapRef.current = now;
    },
    [togglePlay]
  );

  return (
    <div
      className="relative w-full snap-start select-touch-none"
      style={{ height: "100dvh" }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={isActive ? short.video_url : undefined}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          paused ? "opacity-60" : "opacity-100"
        }`}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onClick={handleTap}
        aria-label={short.caption || "Bhakti short video"}
      />

      {/* Paused play icon */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(15,10,5,0.45)", backdropFilter: "blur(18px)" }}>
              <Play className="w-10 h-10 text-[#C9A84C] ml-1" fill="#C9A84C" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center touch-target"
        style={{
          background: "rgba(15,10,5,0.45)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(201,168,76,0.25)",
        }}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <VolumeX className="w-4 h-4 text-[#E8C97A]" />
        ) : (
          <Volume2 className="w-4 h-4 text-[#E8C97A]" />
        )}
      </button>

      {/* Bottom gradient + creator info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div
          className="px-4 pb-24 pt-20"
          style={{
            background: "linear-gradient(to top, rgba(10,6,4,0.85) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            {short.creator_avatar ? (
              <img
                src={short.creator_avatar}
                alt={short.creator_name || "Creator"}
                className="w-9 h-9 rounded-full border border-[rgba(201,168,76,0.4)] object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-sm text-[#E8C97A] font-semibold">
                {(short.creator_name || "D")[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-[#F2EDE8]">
              {short.creator_name || "Devotee"}
            </span>
          </div>

          {short.caption && (
            <p className="text-sm text-[#F2EDE8]/90 leading-relaxed mb-2 line-clamp-2">
              {short.caption}
            </p>
          )}

          {short.tags && short.tags.length > 0 && (
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

      {/* Action bar */}
      <ActionBar short={short} onRemove={onRemove} />
    </div>
  );
};

export default ShortCard;
