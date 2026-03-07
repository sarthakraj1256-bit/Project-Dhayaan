import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkflowMonitor = () => {
  const [shortsStats, setShortsStats] = useState({ total: 0, flagged: 0, unflagged: 0 });
  const [proofStats, setProofStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const [shortsRes, proofsRes] = await Promise.all([
      supabase.from("shorts_metadata").select("id, is_flagged", { count: "exact" }),
      supabase.from("jap_proofs").select("id", { count: "exact", head: true }),
    ]);
    const shorts = shortsRes.data || [];
    setShortsStats({
      total: shorts.length,
      flagged: shorts.filter((s: any) => s.is_flagged).length,
      unflagged: shorts.filter((s: any) => !s.is_flagged).length,
    });
    setProofStats({ total: proofsRes.count || 0 });
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{label}</span>
          <span className="text-sm font-medium text-primary">{value}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-primary/10">
          <div className="h-full rounded-full transition-all duration-500 bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Workflow Monitor</h2>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4 text-primary">Bhakti Shorts Pipeline</h3>
          <p className="text-2xl font-bold mb-4 text-foreground">
            {shortsStats.total} <span className="text-sm font-normal text-muted-foreground">total uploads</span>
          </p>
          <div className="space-y-3">
            <ProgressBar value={shortsStats.unflagged} max={shortsStats.total} label="✅ Approved" />
            <ProgressBar value={shortsStats.flagged} max={shortsStats.total} label="❌ Flagged" />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4 text-primary">Jap-Proof Submissions</h3>
          <p className="text-2xl font-bold mb-4 text-foreground">
            {proofStats.total} <span className="text-sm font-normal text-muted-foreground">total proofs</span>
          </p>
          <div className="space-y-3">
            <ProgressBar value={proofStats.total} max={proofStats.total} label="📋 Submitted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowMonitor;
