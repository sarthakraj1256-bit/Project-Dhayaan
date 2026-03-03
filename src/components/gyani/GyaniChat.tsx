import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "gyani-chat-history";
const MAX_STORED = 20;
const MAX_CONTEXT = 10;

const WELCOME = `Namaste 🙏 I'm Gyani, your personal guide for Dhyaan. I can help you explore meditations, healing frequencies, temple darshan, games, and answer any question you have. What shall we discover today? ✨`;

const QUICK_CHIPS = [
  { emoji: "🧘", label: "How do I meditate?" },
  { emoji: "🎵", label: "What are healing frequencies?" },
  { emoji: "🛕", label: "Show me Temple Darshan" },
  { emoji: "🎮", label: "What games are available?" },
  { emoji: "😴", label: "Help me sleep better" },
  { emoji: "🆘", label: "I need support" },
];

// ─── Chat stream helper ──────────────────────────────────
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gyani-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || "I'm taking a moment of silence 🙏 Please try again shortly.");
      return;
    }
    if (!resp.body) { onError("No response"); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const p = JSON.parse(json);
          const c = p.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {
          buf = line + "\n" + buf;
          break;
        }
      }
    }
    onDone();
  } catch {
    onError("I'm taking a moment of silence 🙏 Please try again shortly.");
  }
}

// ─── Nav action parser ───────────────────────────────────
function parseNavActions(text: string) {
  const parts: (string | { route: string; label: string })[] = [];
  const regex = /\[NAV:(\/[^\]|]+)\|([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ route: m[1], label: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Component ───────────────────────────────────────────
export default function GyaniChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch { /* ignore */ }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Hide chips after first user message
  useEffect(() => {
    if (messages.some((m) => m.role === "user")) setShowChips(false);
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Msg = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);

      let assistantSoFar = "";
      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      const contextMessages = [...messages.slice(-MAX_CONTEXT), userMsg];

      await streamChat({
        messages: contextMessages,
        onDelta: upsert,
        onDone: () => setIsStreaming(false),
        onError: (msg) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: msg },
          ]);
          setIsStreaming(false);
        },
      });
    },
    [messages, isStreaming]
  );

  const clearChat = () => {
    setMessages([]);
    setShowChips(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            aria-label="Open Gyani assistant"
            className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center text-primary-foreground animate-pulse hover:animate-none hover:scale-110 transition-transform"
            style={{ boxShadow: "0 0 24px hsl(35 80% 52% / 0.35)" }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-background border-t border-border shadow-2xl md:inset-x-auto md:right-4 md:bottom-4 md:w-[400px] md:rounded-2xl md:border md:max-h-[600px]"
            style={{ height: "min(85vh, 600px)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary">Gyani</p>
                <p className="text-[10px] text-muted-foreground">Your Dhyaan Guide 🙏</p>
              </div>
              <button onClick={clearChat} className="p-2 rounded-full hover:bg-muted/60 text-muted-foreground" aria-label="Clear chat">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted/60 text-muted-foreground" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Welcome */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-card border border-border/60 px-3 py-2.5 text-sm text-foreground max-w-[85%]">
                    {WELCOME}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex gap-2", msg.role === "user" && "justify-end")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/60 text-foreground rounded-tl-sm"
                    )}
                  >
                    {msg.role === "assistant"
                      ? parseNavActions(msg.content).map((part, j) =>
                          typeof part === "string" ? (
                            <span key={j}>{part}</span>
                          ) : (
                            <button
                              key={j}
                              onClick={() => { navigate(part.route); setOpen(false); }}
                              className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                            >
                              {part.label} →
                            </button>
                          )
                        )
                      : msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-card border border-border/60 px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick chips */}
            {showChips && messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => send(chip.label)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/[0.06] hover:bg-primary/15 transition-colors"
                  >
                    {chip.emoji} {chip.label}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-border/60 shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gyani anything..."
                disabled={isStreaming}
                className="flex-1 bg-muted/50 border border-border/70 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                className="shrink-0 w-10 h-10 rounded-lg bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
