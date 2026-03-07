const buckets = [
  { name: "bhakti-shorts", used: 4.2, limit: 10, unit: "GB" },
  { name: "jap-proofs", used: 1.8, limit: 5, unit: "GB" },
  { name: "temple-story-photos", used: 0.234, limit: 1, unit: "GB" },
  { name: "mantra-audio", used: 0.892, limit: 2, unit: "GB" },
  { name: "avatars", used: 0.156, limit: 1, unit: "GB" },
  { name: "garden-screenshots", used: 0.089, limit: 1, unit: "GB" },
];

const StorageMonitor = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-primary">Storage Monitor</h2>

    <div className="rounded-2xl p-5 bg-card border border-border">
      <div className="grid grid-cols-4 gap-4 mb-4 pb-3 border-b-2 border-border">
        {["Bucket", "Used", "Limit", "Status"].map((h) => (
          <span key={h} className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{h}</span>
        ))}
      </div>

      <div className="space-y-4">
        {buckets.map((b) => {
          const pct = (b.used / b.limit) * 100;
          const color = pct >= 95 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#22C55E";
          return (
            <div key={b.name}>
              <div className="grid grid-cols-4 gap-4 mb-1.5">
                <span className="text-sm font-medium text-foreground">{b.name}</span>
                <span className="text-sm text-muted-foreground">
                  {b.used >= 1 ? `${b.used.toFixed(1)} ${b.unit}` : `${(b.used * 1000).toFixed(0)} MB`}
                </span>
                <span className="text-sm text-muted-foreground">{b.limit} {b.unit}</span>
                <span className="text-sm font-medium" style={{ color }}>
                  {pct >= 95 ? "❗" : pct >= 80 ? "⚠️" : "✅"} {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-primary/10">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default StorageMonitor;
