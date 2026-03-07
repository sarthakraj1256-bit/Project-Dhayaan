import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { TrendingUp, TrendingDown, Users, DollarSign, Wifi, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

// KPI Card component — uses semantic tokens
const KPICard = ({ title, value, change, changeLabel, icon: Icon, positive }: {
  title: string; value: string; change: string; changeLabel: string;
  icon: React.ElementType; positive: boolean;
}) => (
  <div className="rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)] bg-card border border-border">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[13px] font-medium text-muted-foreground">{title}</span>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <p className="text-[28px] font-bold mb-1 text-foreground">{value}</p>
    <div className="flex items-center gap-1.5">
      {positive ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
      <span className={`text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}>{change}</span>
      <span className="text-xs text-muted-foreground">{changeLabel}</span>
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
  const { theme } = useTheme();
  const [userCount, setUserCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [chartData, setChartData] = useState<{ day: string; revenue: number }[]>([]);

  const chartColors = {
    grid: theme === 'dark' ? 'rgba(201,168,76,0.1)' : 'rgba(92,81,69,0.1)',
    axis: theme === 'dark' ? '#6B5E4E' : '#9C8C7C',
    tooltip_bg: theme === 'dark' ? '#13110D' : '#FFFFFF',
    tooltip_border: '#C9A84C',
    tooltip_text: theme === 'dark' ? '#F5F0E8' : '#1C1410',
  };

  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true })
      .then(({ count }) => setUserCount(count || 0));

    supabase.rpc("admin_get_revenue_summary").then(({ data }) => {
      if (data) {
        const row = Array.isArray(data) ? data[0] : data;
        if (row) {
          setTodayRevenue(Number(row.today_revenue) || 0);
          setRevenueChange(Number(row.today_change) || 0);
        }
      }
    });

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
        {/* Revenue Chart */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl p-5 bg-card border border-border">
            <h3 className="text-sm font-semibold mb-4 text-primary">Revenue Trend (7-day)</h3>
            {chartData.length === 0 || chartData.every((d) => d.revenue === 0) ? (
              <p className="text-center py-16 text-sm text-muted-foreground">No revenue data yet. Add transactions to see the trend.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke={chartColors.axis} fontSize={12} />
                    <YAxis stroke={chartColors.axis} fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: chartColors.tooltip_bg,
                        border: `1px solid ${chartColors.tooltip_border}`,
                        borderRadius: 12,
                        color: chartColors.tooltip_text,
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5} dot={{ fill: "#C9A84C", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Activity Heatmap */}
          <div className="rounded-2xl p-5 bg-card border border-border">
            <h3 className="text-sm font-semibold mb-4 text-primary">User Activity Heatmap</h3>
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
              {["12 AM", "6 AM", "12 PM", "6 PM", "11 PM"].map((label) => (
                <span key={label} className="text-[11px] text-muted-foreground">{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* System Health */}
          <div className="rounded-2xl p-5 bg-card border border-border">
            <h3 className="text-sm font-semibold mb-3 text-primary">System Health</h3>
            <div className="space-y-2.5">
              {services.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-foreground">{s.name}</span>
                  </div>
                  <span className="text-xs font-medium text-green-500">GOOD</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl p-5 bg-card border border-border">
            <h3 className="text-sm font-semibold mb-3 text-primary">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-sm">{a.icon}</span>
                  <div>
                    <p className="text-sm text-foreground">{a.message}</p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Features */}
          <div className="rounded-2xl p-5 bg-card border border-border">
            <h3 className="text-sm font-semibold mb-3 text-primary">Top Features Today</h3>
            <div className="space-y-2.5">
              {topFeatures.map((f, i) => (
                <div key={f.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-5 text-primary">{i + 1}.</span>
                    <span className="text-sm text-foreground">{f.name}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{f.count}</span>
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
