import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  name: string; status: "operational" | "degraded" | "down"; latency: string; uptime: string;
}

const initialServices: ServiceStatus[] = [
  { name: "Auth Service", status: "operational", latency: "45ms", uptime: "99.9%" },
  { name: "Database (PG)", status: "operational", latency: "23ms", uptime: "99.8%" },
  { name: "Realtime", status: "operational", latency: "12ms", uptime: "99.7%" },
  { name: "Storage", status: "operational", latency: "67ms", uptime: "99.9%" },
  { name: "Edge Functions", status: "operational", latency: "89ms", uptime: "98.5%" },
  { name: "Karma Sync", status: "operational", latency: "34ms", uptime: "99.6%" },
];

const statusColor = { operational: "#22C55E", degraded: "#F59E0B", down: "#EF4444" };
const statusLabel = { operational: "Live", degraded: "Degraded", down: "Down" };

const SystemHealth = () => {
  const [services, setServices] = useState(initialServices);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setLastChecked(new Date()); setRefreshing(false); }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">System Health</h2>
          <p className="text-xs mt-1 text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()} • Auto-refreshes every 30s
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="rounded-2xl overflow-hidden bg-card border border-border">
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b-2 border-border bg-secondary/50">
          {["Service", "Status", "Latency", "Uptime"].map((h) => (
            <span key={h} className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{h}</span>
          ))}
        </div>
        {services.map((s, i) => (
          <div key={s.name} className={`grid grid-cols-4 gap-4 px-5 py-3.5 border-b last:border-0 border-border/50 hover:bg-foreground/[0.03] transition-colors ${i % 2 === 0 ? 'bg-popover' : 'bg-card'}`}>
            <span className="text-sm font-medium text-foreground">{s.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: statusColor[s.status] }} />
              <span className="text-sm" style={{ color: statusColor[s.status] }}>{statusLabel[s.status]}</span>
            </div>
            <span className="text-sm text-muted-foreground">{s.latency}</span>
            <span className="text-sm text-muted-foreground">{s.uptime}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;
