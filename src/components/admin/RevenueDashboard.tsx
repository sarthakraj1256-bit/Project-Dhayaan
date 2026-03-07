import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const categoryColors: Record<string, string> = {
  subscription: "#C9A84C",
  product: "#F0C040",
  course: "#3B82F6",
  donation: "#22C55E",
  other: "#8B6914",
};

const categoryLabels: Record<string, string> = {
  subscription: "Subscriptions",
  product: "Spiritual Products",
  course: "Courses",
  donation: "Donations",
  other: "Other",
};

interface RevenueSummary {
  today_revenue: number;
  month_revenue: number;
  total_revenue: number;
  today_transactions: number;
  month_transactions: number;
  today_change: number;
  month_change: number;
}

interface DailyRevenue {
  day: string;
  revenue: number;
  transaction_count: number;
}

interface CategoryRevenue {
  category: string;
  total: number;
  percentage: number;
}

const RevenueDashboard = () => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyRevenue[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([]);
  const [profitData, setProfitData] = useState<{ gross: number; infra: number; marketing: number; net: number }>({ gross: 0, infra: 0, marketing: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  const chartColors = {
    grid: theme === 'dark' ? 'rgba(201,168,76,0.1)' : 'rgba(92,81,69,0.1)',
    axis: theme === 'dark' ? '#6B5E4E' : '#9C8C7C',
    tooltip_bg: theme === 'dark' ? '#13110D' : '#FFFFFF',
    tooltip_border: '#C9A84C',
    tooltip_text: theme === 'dark' ? '#F5F0E8' : '#1C1410',
  };

  const fetchAll = async () => {
    setLoading(true);
    const [summaryRes, dailyRes, categoryRes, profitRes] = await Promise.all([
      supabase.rpc("admin_get_revenue_summary"),
      supabase.rpc("admin_get_daily_revenue", { days_back: 30 }),
      supabase.rpc("admin_get_revenue_by_category"),
      supabase.from("revenue_logs")
        .select("gross_revenue, infrastructure_cost, marketing_cost, net_revenue")
        .gte("log_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
        .order("log_date", { ascending: false }),
    ]);

    if (summaryRes.data && Array.isArray(summaryRes.data) && summaryRes.data.length > 0) {
      setSummary(summaryRes.data[0] as RevenueSummary);
    } else if (summaryRes.data && !Array.isArray(summaryRes.data)) {
      setSummary(summaryRes.data as unknown as RevenueSummary);
    }

    if (dailyRes.data) {
      setDailyData((dailyRes.data as DailyRevenue[]).map((d) => ({
        ...d,
        day: new Date(d.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      })));
    }

    if (categoryRes.data) {
      setCategoryData(categoryRes.data as CategoryRevenue[]);
    }

    if (profitRes.data && profitRes.data.length > 0) {
      const totals = profitRes.data.reduce((acc: any, row: any) => ({
        gross: acc.gross + Number(row.gross_revenue),
        infra: acc.infra + Number(row.infrastructure_cost),
        marketing: acc.marketing + Number(row.marketing_cost),
        net: acc.net + Number(row.net_revenue),
      }), { gross: 0, infra: 0, marketing: 0, net: 0 });
      setProfitData(totals);
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const fmt = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

  const pieData = categoryData.map((c) => ({
    name: categoryLabels[c.category] || c.category,
    value: Number(c.percentage),
    color: categoryColors[c.category] || "#8B6914",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Revenue Dashboard</h2>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today", value: fmt(summary?.today_revenue || 0), change: summary?.today_change ? `${summary.today_change > 0 ? "▲" : "▼"} ${Math.abs(summary.today_change)}% vs yesterday` : "No data yet" },
          { label: "This Month", value: fmt(summary?.month_revenue || 0), change: summary?.month_change ? `${summary.month_change > 0 ? "▲" : "▼"} ${Math.abs(summary.month_change)}% vs last month` : "No data yet" },
          { label: "Total Revenue", value: fmt(summary?.total_revenue || 0), change: "Since launch" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-5 bg-card border border-border">
            <span className="text-[13px] text-muted-foreground">{c.label}</span>
            <p className="text-2xl font-bold mt-1 text-foreground">{c.value}</p>
            <p className={`text-xs mt-1 ${(summary?.today_change || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>{c.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5 bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4 text-primary">30-Day Revenue Trend</h3>
          {dailyData.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">No revenue data yet. Transactions will appear here.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke={chartColors.axis} fontSize={10} interval={4} />
                  <YAxis stroke={chartColors.axis} fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: chartColors.tooltip_bg, border: `1px solid ${chartColors.tooltip_border}`, borderRadius: 12, color: chartColors.tooltip_text }}
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5 bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4 text-primary">Revenue by Category</h3>
          {pieData.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">No category data yet</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: chartColors.tooltip_bg, border: `1px solid ${chartColors.tooltip_border}`, borderRadius: 12, color: chartColors.tooltip_text }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-muted-foreground">{d.name} ({d.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-card border border-border">
        <h3 className="text-sm font-semibold mb-4 text-primary">Monthly Profit Margin</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Gross Revenue", value: fmt(profitData.gross) },
            { label: "Infrastructure", value: fmt(profitData.infra) },
            { label: "Marketing", value: fmt(profitData.marketing) },
            { label: "Net Profit", value: fmt(profitData.net) },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-[12px] text-muted-foreground">{item.label}</span>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
        {profitData.gross > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Profit Margin:</span>
            <span className="text-sm font-bold text-green-500">
              {((profitData.net / profitData.gross) * 100).toFixed(1)}% ✅
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;
