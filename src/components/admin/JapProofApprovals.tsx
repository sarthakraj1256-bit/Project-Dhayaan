import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { RefreshCw, Calendar, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface JapProof {
  id: string;
  proof_url: string;
  proof_type: string;
  notes: string | null;
  created_at: string;
  performer_name: string | null;
  mantra_name: string | null;
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
        <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Jap-Proof Approvals</h2>
        <Button variant="outline" size="sm" onClick={fetchProofs} disabled={loading}
          style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: "#C9A84C" }} /></div>
      ) : proofs.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
          <p style={{ color: "#6B5E4E" }}>No proofs submitted yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofs.map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
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
                  <span className="text-sm font-medium" style={{ color: "#F5F0E8" }}>{p.performer_name || "Unknown"}</span>
                  <Badge style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "none" }} className="text-[10px]">{p.proof_type}</Badge>
                </div>
                <p className="text-xs" style={{ color: "#9C8C7C" }}>{p.mantra_name || "—"}</p>
                {p.notes && <p className="text-xs italic" style={{ color: "#6B5E4E" }}>"{p.notes}"</p>}
                <div className="flex items-center gap-1 text-xs" style={{ color: "#6B5E4E" }}>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(p.created_at), "MMM d, yyyy HH:mm")}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                    <Check className="w-3.5 h-3.5" /> Verify
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button className="flex items-center justify-center p-1.5 rounded-lg"
                    style={{ background: "rgba(245,158,11,0.15)" }}>
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
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
