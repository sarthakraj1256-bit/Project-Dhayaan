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
      <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Sonic Lab Analytics</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: sessionCount.toLocaleString() },
          { label: "Avg Duration", value: "23 min" },
          { label: "Most Played", value: "432 Hz" },
          { label: "Avg Load Time", value: "1.2s ✅" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-4" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
            <span className="text-[12px]" style={{ color: "#6B5E4E" }}>{c.label}</span>
            <p className="text-xl font-bold mt-1" style={{ color: "#F5F0E8" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          {["Frequency", "Plays", "Avg Duration", "Load Time"].map((h) => (
            <span key={h} className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#6B5E4E" }}>{h}</span>
          ))}
        </div>
        {frequencyData.map((f) => {
          const loadMs = parseFloat(f.loadTime);
          return (
            <div key={f.name} className="grid grid-cols-4 gap-4 px-5 py-3 border-b last:border-0 hover:bg-white/[0.02]"
              style={{ borderColor: "rgba(201,168,76,0.05)" }}>
              <span className="text-sm" style={{ color: "#F5F0E8" }}>{f.name}</span>
              <span className="text-sm" style={{ color: "#9C8C7C" }}>{f.plays}</span>
              <span className="text-sm" style={{ color: "#9C8C7C" }}>{f.avgDuration}</span>
              <span className="text-sm font-medium" style={{ color: loadMs > 2 ? "#F59E0B" : "#22C55E" }}>{f.loadTime}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SonicLabAnalytics;
