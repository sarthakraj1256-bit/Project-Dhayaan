import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
}

interface CommentsDrawerProps {
  shortId: string;
  open: boolean;
  onClose: () => void;
}

const CommentsDrawer = ({ shortId, open, onClose }: CommentsDrawerProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("shorts_comments")
      .select("*")
      .eq("short_id", shortId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!data || data.length === 0) {
      setComments([]);
      return;
    }

    // Enrich with profiles
    const userIds = [...new Set(data.map((c: any) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap: Record<string, any> = {};
    profiles?.forEach((p: any) => {
      profileMap[p.user_id] = p;
    });

    setComments(
      data.map((c: any) => ({
        ...c,
        display_name: profileMap[c.user_id]?.display_name || "Devotee",
        avatar_url: profileMap[c.user_id]?.avatar_url || null,
      }))
    );
  }, [shortId]);

  useEffect(() => {
    if (open) {
      fetchComments();
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [open, fetchComments]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to join the Bhakti community 🙏" });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("shorts_comments").insert({
      short_id: shortId,
      user_id: user.id,
      content: text.trim().slice(0, 500),
    });

    if (error) {
      toast({ title: "Error", description: "Could not post comment", variant: "destructive" });
    } else {
      setText("");
      fetchComments();
    }
    setSending(false);
  };

  const glassStyle = {
    background: "rgba(15,10,5,0.85)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(201,168,76,0.2)",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl max-h-[70dvh] flex flex-col"
            style={glassStyle}
          >
            {/* Handle */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,76,0.15)]">
              <h3 className="text-sm font-semibold text-[#F2EDE8]">Comments</h3>
              <button onClick={onClose} className="touch-target" aria-label="Close comments">
                <X className="w-5 h-5 text-[#E8C97A]" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-momentum">
              {comments.length === 0 && (
                <p className="text-center text-sm text-[#F2EDE8]/50 py-8">
                  No comments yet. Be the first! 🙏
                </p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[10px] text-[#E8C97A] flex-shrink-0">
                      {(c.display_name || "D")[0]}
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-medium text-[#E8C97A]">
                      {c.display_name}
                    </span>
                    <p className="text-sm text-[#F2EDE8]/85 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[rgba(201,168,76,0.15)] flex gap-2 safe-bottom">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Add a comment..."
                maxLength={500}
                className="flex-1 bg-[rgba(201,168,76,0.08)] text-sm text-[#F2EDE8] placeholder:text-[#F2EDE8]/30 rounded-full px-4 py-2.5 outline-none border border-[rgba(201,168,76,0.15)] focus:border-[rgba(201,168,76,0.4)] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-full flex items-center justify-center touch-target disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}
                aria-label="Send comment"
              >
                <Send className="w-4 h-4 text-[#0A0604]" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsDrawer;
