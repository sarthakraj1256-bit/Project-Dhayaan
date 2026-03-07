const NotificationConfig = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-primary">Notification Config</h2>

    <div className="rounded-2xl p-5 bg-card border border-border">
      <h3 className="text-sm font-semibold mb-4 text-primary">Real-time Alert Channels</h3>
      <div className="space-y-3">
        {[
          { icon: "🔔", label: "New user registered", enabled: true },
          { icon: "💰", label: "New purchase completed", enabled: true },
          { icon: "⚠️", label: "Edge function error", enabled: true },
          { icon: "📹", label: "Bhakti Short submitted", enabled: true },
          { icon: "🙏", label: "Jap-proof submitted", enabled: true },
          { icon: "❗", label: "Storage bucket above 80%", enabled: true },
          { icon: "❗", label: "Service goes down", enabled: true },
        ].map((n) => (
          <div key={n.label} className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
            <div className="flex items-center gap-2.5">
              <span className="text-sm">{n.icon}</span>
              <span className="text-sm text-foreground">{n.label}</span>
            </div>
            <div className="w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer"
              style={{ background: n.enabled ? "#C9A84C" : "rgba(201,168,76,0.2)" }}>
              <div className="w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: n.enabled ? "translateX(20px)" : "translateX(0)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default NotificationConfig;
