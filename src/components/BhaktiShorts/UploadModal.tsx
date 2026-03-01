import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TAGS = ["bhajan", "aarti", "meditation", "satsang", "mantra", "story", "festival"];

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadModal = ({ open, onClose, onUploaded }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum 100MB allowed", variant: "destructive" });
      return;
    }
    if (!["video/mp4", "video/quicktime"].includes(f.type)) {
      toast({ title: "Invalid format", description: "Only .mp4 files accepted", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file || uploading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to upload Bhakti Shorts 🙏" });
      return;
    }

    setUploading(true);
    setProgress(10);

    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("bhakti-shorts")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    setProgress(70);

    const { data: urlData } = supabase.storage
      .from("bhakti-shorts")
      .getPublicUrl(fileName);

    setProgress(85);

    const { error: insertError } = await supabase.from("shorts_metadata").insert({
      video_url: urlData.publicUrl,
      creator_id: user.id,
      caption: caption.trim().slice(0, 200) || null,
      tags: selectedTags,
    });

    if (insertError) {
      toast({ title: "Error", description: "Failed to save short metadata", variant: "destructive" });
    } else {
      setProgress(100);
      toast({ title: "Uploaded! 🙏", description: "Your Bhakti Short is now live" });
      onUploaded();
      resetForm();
      onClose();
    }

    setUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setCaption("");
    setSelectedTags([]);
    setProgress(0);
  };

  const glassStyle = {
    background: "rgba(15,10,5,0.92)",
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
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl max-h-[85dvh] overflow-y-auto"
            style={glassStyle}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(201,168,76,0.15)]">
              <h3 className="text-base font-semibold text-[#F2EDE8]">Upload Bhakti Short</h3>
              <button onClick={onClose} className="touch-target" aria-label="Close upload">
                <X className="w-5 h-5 text-[#E8C97A]" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* File picker */}
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-[rgba(201,168,76,0.3)] rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-[rgba(201,168,76,0.5)] transition-colors"
              >
                {file ? (
                  <>
                    <Film className="w-10 h-10 text-[#C9A84C]" />
                    <span className="text-sm text-[#F2EDE8]/80 truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-[#E8C97A]/60">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-[#C9A84C]/50" />
                    <span className="text-sm text-[#F2EDE8]/50">
                      Tap to select video (.mp4, max 100MB)
                    </span>
                  </>
                )}
              </button>

              {/* Caption */}
              <div>
                <label className="text-xs font-medium text-[#E8C97A] mb-1.5 block">
                  Caption ({caption.length}/200)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 200))}
                  placeholder="Describe your devotional content..."
                  rows={3}
                  className="w-full bg-[rgba(201,168,76,0.06)] text-sm text-[#F2EDE8] placeholder:text-[#F2EDE8]/25 rounded-xl px-4 py-3 outline-none border border-[rgba(201,168,76,0.15)] focus:border-[rgba(201,168,76,0.4)] transition-colors resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-medium text-[#E8C97A] mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? "text-[#0A0604]"
                          : "text-[#E8C97A] border border-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.5)]"
                      }`}
                      style={
                        selectedTags.includes(tag)
                          ? { background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }
                          : undefined
                      }
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="w-full h-2 rounded-full bg-[rgba(201,168,76,0.1)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #C9A84C, #E8C97A)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-[#0A0604] disabled:opacity-40 transition-opacity safe-bottom"
                style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}
              >
                {uploading ? "Uploading..." : "Share Bhakti Short 🙏"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
