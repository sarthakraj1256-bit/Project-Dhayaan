import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useLike = (shortId: string, initialCount: number) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Check if user already liked this short
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("shorts_likes")
        .select("id")
        .eq("short_id", shortId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setLiked(true);
    };
    check();
  }, [shortId]);

  // Sync count from parent
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const toggleLike = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in to like", description: "Join the Bhakti community to interact 🙏" });
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => c + (wasLiked ? -1 : 1));

    const { error } = await supabase.rpc("toggle_short_like", { p_short_id: shortId });

    if (error) {
      // Revert
      setLiked(wasLiked);
      setCount((c) => c + (wasLiked ? 1 : -1));
      console.error("Like error:", error);
    }

    setLoading(false);
  }, [shortId, liked, loading]);

  return { liked, count, toggleLike };
};
