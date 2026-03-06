import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { TrendingUp, TrendingDown, Users, DollarSign, Wifi, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// KPI Card component
const KPICard = ({ title, value, change, changeLabel, icon: Icon, positive }: {
  title: string; value: string; change: string; changeLabel: string;
  icon: React.ElementType; positive: boolean;
}) => (
  <div className="rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.15)]"
    style={{
      background: "#13110D",
      border: "1px solid rgba(201,168,76,0.2)",
      boxShadow: "0 0 20px rgba(201,168,76,0.08)",
    }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[13px] font-medium" style={{ color: "#6B5E4E" }}>{title}</span>
      <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
    </div>
    <p className="text-[28px] font-bold mb-1" style={{ color: "#F5F0E8" }}>{value}</p>
    <div className="flex items-center gap-1.5">
      {positive ? <TrendingUp className="w-3.5 h-3.5" style={{ color: "#22C55E" }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />}
      <span className="text-xs font-medium" style={{ color: positive ? "#22C55E" : "#EF4444" }}>{change}</span>
      <span className="text-xs" style={{ color: "#6B5E4E" }}>{changeLabel}</span>
    </div>
  </div>
);

const services = [
  { name: "Auth Service", status: "operational" },
  { name: "Edge Functions", status: "operational" },
  { name: "Storage", status: "operational" },
  { name: "Realtime", status: "operational" },
  { name: "Sonic Lab", status: "operational" },
];

const recentActivity = [
  { icon: "👤", message: "New user registered", time: "2 mins ago" },
  { icon: "🧘", message: "Sonic Lab session (45m)", time: "15 mins ago" },
];

const topFeatures = [
  { name: "Sonic Lab", count: "—" },
  { name: "Live Darshan", count: "—" },
  { name: "Jap Bank", count: "—" },
  { name: "Bhakti Shorts", count: "—" },
];

const CommandCenter = () => {
  const [userCount, setUserCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [chartData, setChartData] = useState<{ day: string; revenue: number }[]>([]);

  useEffect(() => {
    // Fetch user count
    supabase.from("profiles").select("id", { count: "exact", head: true })
      .then(({ count }) => setUserCount(count || 0));

    // Fetch revenue summary
    supabase.rpc("admin_get_revenue_summary").then(({ data }) => {
      if (data) {
        const row = Array.isArray(data) ? data[0] : data;
        if (row) {
          setTodayRevenue(Number(row.today_revenue) || 0);
          setRevenueChange(Number(row.today_change) || 0);
        }
      }
    });

    // Fetch 7-day chart
    supabase.rpc("admin_get_daily_revenue", { days_back: 7 }).then(({ data }) => {
      if (data) {
        setChartData((data as any[]).map((d) => ({
          day: new Date(d.day).toLocaleDateString("en-IN", { weekday: "short" }),
          revenue: Number(d.revenue),
        })));
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Users" value={userCount.toLocaleString()} change="▲ —%" changeLabel="this week" icon={Users} positive />
        <KPICard title="Today Revenue" value={`₹ ${todayRevenue.toLocaleString("en-IN")}`}
          change={`${revenueChange >= 0 ? "▲" : "▼"} ${Math.abs(revenueChange)}%`}
          changeLabel="vs yesterday" icon={DollarSign} positive={revenueChange >= 0} />
        <KPICard title="Active Now" value="—" change="—" changeLabel="users" icon={Wifi} positive />
        <KPICard title="System Status" value="Healthy" change="99.8%" changeLabel="uptime" icon={Activity} positive />
      </div>

      {/* Charts + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue Chart - left 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>Revenue Trend (7-day)</h3>
            {chartData.length === 0 || chartData.every((d) => d.revenue === 0) ? (
              <p className="text-center py-16 text-sm" style={{ color: "#6B5E4E" }}>No revenue data yet. Add transactions to see the trend.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(201,168,76,0.1)" strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="#6B5E4E" fontSize={12} />
                    <YAxis stroke="#6B5E4E" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, color: "#F5F0E8" }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5} dot={{ fill: "#C9A84C", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Activity Heatmap placeholder */}
          <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>User Activity Heatmap</h3>
            <div className="grid grid-cols-24 gap-1">
              {Array.from({ length: 7 * 24 }, (_, i) => {
                const intensity = Math.random();
                return (
                  <div key={i} className="aspect-square rounded-sm" style={{
                    background: `rgba(201,168,76,${0.05 + intensity * 0.5})`,
                    minWidth: 8, minHeight: 8,
                  }} />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px]" style={{ color: "#6B5E4E" }}>12 AM</span>
              <span className="text-[11px]" style={{ color: "#6B5E4E" }}>6 AM</span>
              <span className="text-[11px]" style={{ color: "#6B5E4E" }}>12 PM</span>
              <span className="text-[11px]" style={{ color: "#6B5E4E" }}>6 PM</span>
              <span className="text-[11px]" style={{ color: "#6B5E4E" }}>11 PM</span>
            </div>
          </div>
        </div>

        {/* Right column - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* System Health */}
          <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#C9A84C" }}>System Health</h3>
            <div className="space-y-2.5">
              {services.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
                    <span className="text-sm" style={{ color: "#F5F0E8" }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#22C55E" }}>GOOD</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#C9A84C" }}>Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-sm">{a.icon}</span>
                  <div>
                    <p className="text-sm" style={{ color: "#F5F0E8" }}>{a.message}</p>
                    <p className="text-[11px]" style={{ color: "#6B5E4E" }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Features */}
          <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#C9A84C" }}>Top Features Today</h3>
            <div className="space-y-2.5">
              {topFeatures.map((f, i) => (
                <div key={f.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-5" style={{ color: "#C9A84C" }}>{i + 1}.</span>
                    <span className="text-sm" style={{ color: "#F5F0E8" }}>{f.name}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#9C8C7C" }}>{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
