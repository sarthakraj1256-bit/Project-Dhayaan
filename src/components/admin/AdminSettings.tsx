import { Settings } from "lucide-react";

const AdminSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Admin Settings</h2>

    <div className="rounded-2xl p-5 space-y-4" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
      {[
        { label: "Auto-acknowledge temple reports", desc: "Automatically acknowledge temple jap reports after 24 hours", enabled: true },
        { label: "Auto-expire jap requests", desc: "Expire incomplete requests past deadline", enabled: true },
        { label: "Realtime notifications", desc: "Get live alerts for new signups, purchases, and submissions", enabled: true },
        { label: "Session auto-logout", desc: "Auto-logout admin after 30 minutes of inactivity", enabled: true },
      ].map((s) => (
        <div key={s.label} className="flex items-start justify-between py-3 border-b last:border-0" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "#F5F0E8" }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#6B5E4E" }}>{s.desc}</p>
          </div>
          <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${s.enabled ? "" : ""}`}
            style={{ background: s.enabled ? "#C9A84C" : "rgba(201,168,76,0.2)" }}>
            <div className="w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: s.enabled ? "translateX(20px)" : "translateX(0)" }} />
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: "#C9A84C" }}>System Info</h3>
      <div className="space-y-2">
        {[
          ["Admin Email", "dhyaanauthorities@gmail.com"],
          ["Project ID", "pgavnutkwiiovdvbrbcl"],
          ["Region", "ap-south-1"],
          ["Version", "2.0.0"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-sm" style={{ color: "#6B5E4E" }}>{k}</span>
            <span className="text-sm font-mono" style={{ color: "#9C8C7C" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminSettings;
