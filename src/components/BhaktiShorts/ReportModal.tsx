import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const REASONS = [
  "Inappropriate content",
  "Misleading / False info",
  "Spam",
  "Hate speech",
  "Other",
];

interface ReportModalProps {
  shortId: string;
  open: boolean;
  onClose: () => void;
  onReported: () => void;
}

const ReportModal = ({ shortId, open, onClose, onReported }: ReportModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected || submitting) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to report content 🙏" });
      return;
    }

    setSubmitting(true);

    // Flag via RPC
    const { error: flagError } = await supabase.rpc("flag_short", {
      p_short_id: shortId,
      p_reason: selected,
    });

    // Also notify admin via edge function
    await supabase.functions.invoke("notify-admin", {
      body: { short_id: shortId, reason: selected },
    });

    if (flagError) {
      toast({ title: "Error", description: "Could not report. Try again.", variant: "destructive" });
    } else {
      toast({ title: "Reported", description: "Thank you. We'll review this content. 🙏" });
      onReported();
    }

    setSubmitting(false);
    setSelected(null);
    onClose();
  };

  const glassStyle = {
    background: "rgba(15,10,5,0.9)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(201,168,76,0.2)",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl p-5 max-w-sm mx-auto"
            style={glassStyle}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#F2EDE8]">🚩 Report this Short</h3>
              <button onClick={onClose} className="touch-target" aria-label="Close">
                <X className="w-5 h-5 text-[#E8C97A]" />
              </button>
            </div>

            <div className="space-y-2 mb-5">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    selected === reason
                      ? "bg-[rgba(201,168,76,0.2)] text-[#E8C97A] border border-[rgba(201,168,76,0.4)]"
                      : "text-[#F2EDE8]/80 border border-[rgba(201,168,76,0.1)] hover:border-[rgba(201,168,76,0.25)]"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-[#0A0604] disabled:opacity-40 transition-opacity"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}
            >
              {submitting ? "Reporting..." : "Submit Report"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
