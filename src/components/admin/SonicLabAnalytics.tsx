import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";

const SonicLabAnalytics = () => {
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    supabase.from("meditation_sessions").select("id", { count: "exact", head: true })
      .then(({ count }) => setSessionCount(count || 0));
  }, []);

  const frequencyData = [
    { name: "432 Hz - Deep Relaxation", plays: 847, avgDuration: "24 min", loadTime: "1.1s" },
    { name: "528 Hz - DNA Repair", plays: 623, avgDuration: "19 min", loadTime: "1.3s" },
    { name: "Binaural Beats", plays: 445, avgDuration: "31 min", loadTime: "0.9s" },
    { name: "Solfeggio Series", plays: 312, avgDuration: "27 min", loadTime: "1.4s" },
    { name: "OM Frequency (136.1 Hz)", plays: 256, avgDuration: "22 min", loadTime: "1.0s" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-primary">Sonic Lab Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: sessionCount.toLocaleString() },
          { label: "Avg Duration", value: "23 min" },
          { label: "Most Played", value: "432 Hz" },
          { label: "Avg Load Time", value: "1.2s ✅" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-4 bg-card border border-border">
            <span className="text-[12px] text-muted-foreground">{c.label}</span>
            <p className="text-xl font-bold mt-1 text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden bg-card border border-border">
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b-2 border-border bg-secondary/50">
          {["Frequency", "Plays", "Avg Duration", "Load Time"].map((h) => (
            <span key={h} className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{h}</span>
          ))}
        </div>
        {frequencyData.map((f, i) => {
          const loadMs = parseFloat(f.loadTime);
          return (
            <div key={f.name} className={`grid grid-cols-4 gap-4 px-5 py-3 border-b last:border-0 border-border/50 hover:bg-foreground/[0.03] ${i % 2 === 0 ? 'bg-popover' : 'bg-card'}`}>
              <span className="text-sm text-foreground">{f.name}</span>
              <span className="text-sm text-muted-foreground">{f.plays}</span>
              <span className="text-sm text-muted-foreground">{f.avgDuration}</span>
              <span className={`text-sm font-medium ${loadMs > 2 ? 'text-amber-500' : 'text-green-500'}`}>{f.loadTime}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SonicLabAnalytics;
