import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShorts } from "@/hooks/useShorts";
import ShortCard from "./ShortCard";
import YouTubeShortCard from "./YouTubeShortCard";
import UploadModal from "./UploadModal";
import TagFilter from "./TagFilter";
import { curatedShorts, type CuratedShort } from "@/data/bhaktiShortsData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ShortsFeed = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { shorts, loading, hasMore, loadMore, removeShort, refetch } = useShorts(activeTag);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filter curated shorts by tag
  const filteredCurated = useMemo(() => {
    if (!activeTag) return curatedShorts;
    return curatedShorts.filter((s) => s.tags.includes(activeTag));
  }, [activeTag]);

  // Build combined feed: DB shorts first, then curated YouTube shorts
  const combinedFeed = useMemo(() => {
    const dbItems = shorts.map((s) => ({ type: "db" as const, data: s }));
    const ytItems = filteredCurated.map((s) => ({ type: "yt" as const, data: s }));
    return [...dbItems, ...ytItems];
  }, [shorts, filteredCurated]);

  // Reset scroll position when tag changes
  useEffect(() => {
    setActiveIndex(0);
    containerRef.current?.scrollTo({ top: 0 });
  }, [activeTag]);

  // Track active short via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) {
              setActiveIndex(idx);
              // Load more DB shorts if nearing end of DB items
              if (idx >= shorts.length - 3 && hasMore) {
                loadMore();
              }
            }
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [combinedFeed.length, shorts.length, hasMore, loadMore]);

  const handleUploadClick = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in to join the Bhakti community 🙏",
          description: "Create an account to upload shorts",
        });
        navigate("/auth");
        return;
      }
      setShowUpload(true);
    } catch {
      toast({
        title: "Sign in required",
        description: "Please sign in first to upload Bhakti Shorts 🙏",
      });
      navigate("/auth");
    }
  }, [navigate]);

  if (loading && shorts.length === 0 && filteredCurated.length === 0) {
    return (
      <div className="h-[100dvh] flex items-center justify-center" style={{ background: "#0A0604" }}>
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full animate-pulse" style={{ background: "rgba(201,168,76,0.2)" }} />
          <p className="text-sm text-[#E8C97A]/60">Loading Bhakti Shorts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ background: "#0A0604" }}>
      {/* Top bar: Back + Tag filter */}
      <div className="fixed top-0 left-0 right-0 z-30 pt-4 safe-top">
        <div className="flex items-center gap-3 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center touch-target flex-shrink-0"
            style={{
              background: "rgba(15,10,5,0.45)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#E8C97A]" />
          </button>
          <TagFilter activeTag={activeTag} onTagChange={setActiveTag} />
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-[100dvh] overflow-y-scroll scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {combinedFeed.map((item, idx) => (
          <div key={item.type === "db" ? item.data.id : (item.data as CuratedShort).id} data-index={idx}>
            {item.type === "db" ? (
              <ShortCard
                short={item.data as any}
                isActive={idx === activeIndex}
                onRemove={removeShort}
              />
            ) : (
              <YouTubeShortCard
                short={item.data as CuratedShort}
                isActive={idx === activeIndex}
              />
            )}
          </div>
        ))}
      </div>

      {/* Upload FAB */}
      <motion.button
        onClick={handleUploadClick}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg touch-target"
        style={{
          background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
          boxShadow: "0 0 20px rgba(201,168,76,0.35)",
        }}
        whileTap={{ scale: 0.9 }}
        aria-label="Upload Bhakti Short"
      >
        <Plus className="w-7 h-7 text-[#0A0604]" />
      </motion.button>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUploaded={refetch} />
    </div>
  );
};

export default ShortsFeed;
