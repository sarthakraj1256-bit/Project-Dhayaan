import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShortItem {
  id: string;
  video_url: string;
  creator_id: string;
  caption: string | null;
  likes_count: number;
  tags: string[];
  created_at: string;
  creator_name?: string;
  creator_avatar?: string;
}

const PAGE_SIZE = 10;

export const useShorts = () => {
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const fetchShorts = useCallback(async (reset = false) => {
    if (reset) {
      pageRef.current = 0;
      setHasMore(true);
    }

    const from = pageRef.current * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("shorts_metadata")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching shorts:", error);
      setLoading(false);
      return;
    }

    // Fetch creator profiles
    const creatorIds = [...new Set((data || []).map((s: any) => s.creator_id))];
    let profilesMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};

    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", creatorIds);

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
        });
      }
    }

    const enriched: ShortItem[] = (data || []).map((s: any) => ({
      ...s,
      creator_name: profilesMap[s.creator_id]?.display_name || "Devotee",
      creator_avatar: profilesMap[s.creator_id]?.avatar_url || null,
    }));

    if (reset) {
      setShorts(enriched);
    } else {
      setShorts((prev) => [...prev, ...enriched]);
    }

    setHasMore((data || []).length === PAGE_SIZE);
    pageRef.current += 1;
    setLoading(false);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchShorts(false);
    }
  }, [hasMore, loading, fetchShorts]);

  const removeShort = useCallback((id: string) => {
    setShorts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateLikeCount = useCallback((id: string, delta: number) => {
    setShorts((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, likes_count: Math.max(0, s.likes_count + delta) } : s
      )
    );
  }, []);

  useEffect(() => {
    fetchShorts(true);
  }, [fetchShorts]);

  return { shorts, loading, hasMore, loadMore, removeShort, updateLikeCount, refetch: () => fetchShorts(true) };
};
