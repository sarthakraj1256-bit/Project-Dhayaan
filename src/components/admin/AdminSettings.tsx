import { Settings } from "lucide-react";

const AdminSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-primary">Admin Settings</h2>

    <div className="rounded-2xl p-5 space-y-4 bg-card border border-border">
      {[
        { label: "Auto-acknowledge temple reports", desc: "Automatically acknowledge temple jap reports after 24 hours", enabled: true },
        { label: "Auto-expire jap requests", desc: "Expire incomplete requests past deadline", enabled: true },
        { label: "Realtime notifications", desc: "Get live alerts for new signups, purchases, and submissions", enabled: true },
        { label: "Session auto-logout", desc: "Auto-logout admin after 30 minutes of inactivity", enabled: true },
      ].map((s) => (
        <div key={s.label} className="flex items-start justify-between py-3 border-b last:border-0 border-border/50">
          <div>
            <p className="text-sm font-medium text-foreground">{s.label}</p>
            <p className="text-xs mt-0.5 text-muted-foreground">{s.desc}</p>
          </div>
          <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors`}
            style={{ background: s.enabled ? "#C9A84C" : "rgba(201,168,76,0.2)" }}>
            <div className="w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: s.enabled ? "translateX(20px)" : "translateX(0)" }} />
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-2xl p-5 bg-card border border-border">
      <h3 className="text-sm font-semibold mb-3 text-primary">System Info</h3>
      <div className="space-y-2">
        {[
          ["Platform", "Lovable Cloud"],
          ["Auth Provider", "Email + OAuth"],
          ["Storage Buckets", "6 active"],
          ["Edge Functions", "10 deployed"],
          ["Database", "PostgreSQL 15"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-foreground font-medium">{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminSettings;
