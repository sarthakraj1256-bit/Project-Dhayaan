import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Short {
  id: string; video_url: string; caption: string | null; is_flagged: boolean;
  created_at: string; likes_count: number; tags: string[] | null;
}

const BhaktiShortsReview = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("shorts_metadata").select("*").order("created_at", { ascending: false }).limit(50);
    setShorts((data as Short[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleFlag = async (id: string, flag: boolean) => {
    await supabase.from("shorts_metadata").update({ is_flagged: flag }).eq("id", id);
    toast({ title: flag ? "Short flagged" : "Short approved" });
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Bhakti Shorts Review</h2>
        <Button variant="outline" size="sm" onClick={fetch} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shorts.map((s) => (
            <div key={s.id} className={`rounded-2xl overflow-hidden bg-card border ${s.is_flagged ? 'border-red-500/30' : 'border-border'}`}>
              <div className="aspect-[9/16] max-h-48 bg-black flex items-center justify-center">
                <video src={s.video_url} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm truncate text-foreground">{s.caption || "No caption"}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {s.tags?.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">❤️ {s.likes_count}</span>
                  <div className="flex gap-1.5">
                    {s.is_flagged ? (
                      <button onClick={() => toggleFlag(s.id, false)} className="p-1.5 rounded-lg bg-green-500/15">
                        <Check className="w-4 h-4 text-green-500" />
                      </button>
                    ) : (
                      <button onClick={() => toggleFlag(s.id, true)} className="p-1.5 rounded-lg bg-red-500/15">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BhaktiShortsReview;
