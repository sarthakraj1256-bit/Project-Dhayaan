import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { RefreshCw, Calendar, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface JapProof {
  id: string; proof_url: string; proof_type: string; notes: string | null;
  created_at: string; performer_name: string | null; mantra_name: string | null;
}

const JapProofApprovals = () => {
  const [proofs, setProofs] = useState<JapProof[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProofs = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("admin_get_jap_proofs");
    setProofs((data as JapProof[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProofs(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Jap-Proof Approvals</h2>
        <Button variant="outline" size="sm" onClick={fetchProofs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : proofs.length === 0 ? (
        <div className="rounded-2xl p-12 text-center bg-card border border-border">
          <p className="text-muted-foreground">No proofs submitted yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofs.map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden bg-card border border-border">
              <div className="aspect-video bg-black flex items-center justify-center">
                {p.proof_type === "video" ? (
                  <video src={p.proof_url} controls className="w-full h-full object-cover" />
                ) : p.proof_type === "screenshot" ? (
                  <img src={p.proof_url} alt="Proof" className="w-full h-full object-cover" />
                ) : (
                  <audio src={p.proof_url} controls className="w-3/4" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{p.performer_name || "Unknown"}</span>
                  <Badge className="text-[10px] bg-primary/15 text-primary border-0">{p.proof_type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.mantra_name || "—"}</p>
                {p.notes && <p className="text-xs italic text-muted-foreground/70">"{p.notes}"</p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(p.created_at), "MMM d, yyyy HH:mm")}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-500">
                    <Check className="w-3.5 h-3.5" /> Verify
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-500">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button className="flex items-center justify-center p-1.5 rounded-lg bg-amber-500/15">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JapProofApprovals;
