const functions = [
  { name: "gyani-chat", status: "active", callsPerHr: 1247, errors: 2, lastExec: "2 min ago" },
  { name: "notify-admin", status: "active", callsPerHr: 89, errors: 0, lastExec: "15 min ago" },
  { name: "elevenlabs-sfx", status: "active", callsPerHr: 156, errors: 1, lastExec: "5 min ago" },
  { name: "elevenlabs-tts", status: "active", callsPerHr: 234, errors: 0, lastExec: "3 min ago" },
  { name: "submit-review", status: "active", callsPerHr: 45, errors: 0, lastExec: "30 min ago" },
  { name: "emailjs-config", status: "active", callsPerHr: 12, errors: 0, lastExec: "1 hr ago" },
  { name: "youtube-playlist-items", status: "active", callsPerHr: 89, errors: 0, lastExec: "10 min ago" },
  { name: "youtube-viewer-count", status: "active", callsPerHr: 67, errors: 0, lastExec: "8 min ago" },
  { name: "auth-rate-limiter", status: "active", callsPerHr: 312, errors: 0, lastExec: "1 min ago" },
  { name: "generate-mantra-audio", status: "active", callsPerHr: 34, errors: 0, lastExec: "20 min ago" },
];

const EdgeFunctionMonitor = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Edge Function Status</h2>

    <div className="rounded-2xl overflow-hidden" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
      <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
        {["Function", "Status", "Calls/hr", "Errors", "Last Run"].map((h) => (
          <span key={h} className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#6B5E4E" }}>{h}</span>
        ))}
      </div>
      {functions.map((f) => {
        const errorRate = f.callsPerHr > 0 ? (f.errors / f.callsPerHr) * 100 : 0;
        const errorColor = errorRate > 5 ? "#EF4444" : errorRate > 1 ? "#F59E0B" : "#22C55E";
        return (
          <div key={f.name} className="grid grid-cols-5 gap-4 px-5 py-3 border-b last:border-0 hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: "rgba(201,168,76,0.05)" }}>
            <span className="text-sm font-mono" style={{ color: "#F5F0E8" }}>{f.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
              <span className="text-sm" style={{ color: "#22C55E" }}>Active</span>
            </div>
            <span className="text-sm" style={{ color: "#9C8C7C" }}>{f.callsPerHr.toLocaleString()}</span>
            <span className="text-sm font-medium" style={{ color: errorColor }}>{f.errors}</span>
            <span className="text-sm" style={{ color: "#6B5E4E" }}>{f.lastExec}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default EdgeFunctionMonitor;
