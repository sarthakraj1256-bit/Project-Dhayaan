import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const forecastData = months.map((m, i) => ({
  month: m,
  users: Math.floor(12000 + i * 1200 + Math.random() * 500),
  revenue: Math.floor(180000 + i * 45000 + Math.random() * 10000),
  projected: i >= 4,
}));

const funnelSteps = [
  { label: "Visitors", pct: 100 },
  { label: "Sign-ups", pct: 38 },
  { label: "Active Users", pct: 24 },
  { label: "Paid Conversions", pct: 8 },
  { label: "Repeat Purchase", pct: 4 },
];

const GrowthForecast = () => {
  const { theme } = useTheme();

  const chartColors = {
    grid: theme === 'dark' ? 'rgba(201,168,76,0.1)' : 'rgba(92,81,69,0.1)',
    axis: theme === 'dark' ? '#6B5E4E' : '#9C8C7C',
    tooltip_bg: theme === 'dark' ? '#13110D' : '#FFFFFF',
    tooltip_text: theme === 'dark' ? '#F5F0E8' : '#1C1410',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-primary">Growth Forecast</h2>

      <div className="rounded-2xl p-5 bg-card border border-border">
        <h3 className="text-sm font-semibold mb-4 text-primary">12-Month Projection</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={chartColors.axis} fontSize={11} />
              <YAxis yAxisId="left" stroke={chartColors.axis} fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: chartColors.tooltip_bg, border: "1px solid #C9A84C", borderRadius: 12, color: chartColors.tooltip_text }} />
              <Bar yAxisId="left" dataKey="users" fill="rgba(201,168,76,0.3)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F0C040" strokeWidth={2.5} dot={{ fill: "#F0C040", r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-card border border-border">
        <h3 className="text-sm font-semibold mb-4 text-primary">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelSteps.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.label}</span>
                <span className="text-sm font-medium text-primary">{s.pct}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-primary/10">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, background: "linear-gradient(90deg, #C9A84C, #F0C040)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrowthForecast;
