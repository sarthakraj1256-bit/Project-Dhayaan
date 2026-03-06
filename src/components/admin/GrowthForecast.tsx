import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

const GrowthForecast = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Growth Forecast</h2>

    {/* Chart */}
    <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>12-Month Projection</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={forecastData}>
            <CartesianGrid stroke="rgba(201,168,76,0.1)" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#6B5E4E" fontSize={11} />
            <YAxis yAxisId="left" stroke="#6B5E4E" fontSize={10} />
            <YAxis yAxisId="right" orientation="right" stroke="#6B5E4E" fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, color: "#F5F0E8" }} />
            <Bar yAxisId="left" dataKey="users" fill="rgba(201,168,76,0.3)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F0C040" strokeWidth={2.5} dot={{ fill: "#F0C040", r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Funnel */}
    <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>Conversion Funnel</h3>
      <div className="space-y-3">
        {funnelSteps.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "#F5F0E8" }}>{s.label}</span>
              <span className="text-sm font-medium" style={{ color: "#C9A84C" }}>{s.pct}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(201,168,76,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, background: "linear-gradient(90deg, #C9A84C, #F0C040)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default GrowthForecast;
