import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  revenue: Math.floor(15000 + Math.random() * 15000),
  avg: Math.floor(18000 + Math.random() * 5000),
}));

const pieData = [
  { name: "Premium Subscriptions", value: 45, color: "#C9A84C" },
  { name: "Spiritual Products", value: 28, color: "#F0C040" },
  { name: "One-time Purchases", value: 18, color: "#3B82F6" },
  { name: "Donations", value: 9, color: "#22C55E" },
];

const RevenueDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Revenue Dashboard</h2>

    {/* KPI Row */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Today", value: "₹ 24,350", change: "▲ 12% vs yesterday" },
        { label: "This Month", value: "₹ 3,84,200", change: "▲ 24% vs last month" },
        { label: "Total Revenue", value: "₹ 18,47,600", change: "Since launch" },
      ].map((c) => (
        <div key={c.label} className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
          <span className="text-[13px]" style={{ color: "#6B5E4E" }}>{c.label}</span>
          <p className="text-2xl font-bold mt-1" style={{ color: "#F5F0E8" }}>{c.value}</p>
          <p className="text-xs mt-1" style={{ color: "#22C55E" }}>{c.change}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Revenue Chart */}
      <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>30-Day Revenue Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid stroke="rgba(201,168,76,0.1)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#6B5E4E" fontSize={10} interval={4} />
              <YAxis stroke="#6B5E4E" fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, color: "#F5F0E8" }} />
              <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="avg" stroke="#8B6914" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut */}
      <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>Revenue by Product</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, color: "#F5F0E8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 mt-2">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-xs" style={{ color: "#9C8C7C" }}>{d.name} ({d.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Profit Panel */}
    <div className="rounded-2xl p-5" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "#C9A84C" }}>Profit Margin</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue", value: "₹ 3,84,200" },
          { label: "Infrastructure", value: "₹ 42,000" },
          { label: "Marketing", value: "₹ 28,000" },
          { label: "Net Profit", value: "₹ 3,14,200" },
        ].map((item) => (
          <div key={item.label}>
            <span className="text-[12px]" style={{ color: "#6B5E4E" }}>{item.label}</span>
            <p className="text-lg font-bold" style={{ color: "#F5F0E8" }}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm" style={{ color: "#6B5E4E" }}>Profit Margin:</span>
        <span className="text-sm font-bold" style={{ color: "#22C55E" }}>81.7% ✅</span>
      </div>
    </div>
  </div>
);

export default RevenueDashboard;
