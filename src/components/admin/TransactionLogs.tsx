import { useState } from "react";
import { Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  completed: "#22C55E", pending: "#F59E0B", failed: "#EF4444", refunded: "#6B5E4E",
};

const mockTransactions = Array.from({ length: 50 }, (_, i) => ({
  id: `TXN-${String(1000 + i).padStart(6, "0")}`,
  user: `user${i + 1}@gmail.com`,
  product: ["Premium Plan", "Spiritual Kit", "Donation", "Mantra Course"][i % 4],
  amount: [499, 1299, 251, 799][i % 4],
  status: ["completed", "completed", "pending", "failed", "refunded"][i % 5],
  time: `${Math.floor(Math.random() * 24)}h ago`,
}));

const TransactionLogs = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedTx, setSelectedTx] = useState<typeof mockTransactions[0] | null>(null);
  const perPage = 25;

  const filtered = statusFilter === "all" ? mockTransactions : mockTransactions.filter((t) => t.status === statusFilter);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const exportCSV = () => {
    const csv = "ID,User,Product,Amount,Status,Time\n" + filtered.map((t) => `${t.id},${t.user},${t.product},${t.amount},${t.status},${t.time}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Transaction Logs</h2>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm" style={{ borderColor: "rgba(201,168,76,0.3)", color: "#F5F0E8", background: "#0D0B08" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["all", "completed", "pending", "failed", "refunded"].map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
              {["ID", "User", "Product", "Amount", "Status", "Time"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wider" style={{ color: "#6B5E4E" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((t, i) => (
              <tr key={t.id} className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setSelectedTx(t)}
                style={{ background: i % 2 === 0 ? "#0D0B08" : "#13110D", borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "#C9A84C" }}>{t.id}</td>
                <td className="px-4 py-3" style={{ color: "#F5F0E8" }}>{t.user}</td>
                <td className="px-4 py-3" style={{ color: "#9C8C7C" }}>{t.product}</td>
                <td className="px-4 py-3 font-medium" style={{ color: "#F5F0E8" }}>₹{t.amount}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ background: `${statusColors[t.status]}20`, color: statusColors[t.status] }}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: "#6B5E4E" }}>{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "#6B5E4E" }}>{filtered.length} transactions</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" style={{ color: "#C9A84C" }} />
          </button>
          <span className="text-xs" style={{ color: "#9C8C7C" }}>Page {page + 1}</span>
          <button onClick={() => setPage(page + 1)} disabled={(page + 1) * perPage >= filtered.length} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" style={{ color: "#C9A84C" }} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setSelectedTx(null)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: "#C9A84C" }}>Transaction Detail</h3>
              <button onClick={() => setSelectedTx(null)}><X className="w-5 h-5" style={{ color: "#6B5E4E" }} /></button>
            </div>
            <div className="space-y-3">
              {[
                ["ID", selectedTx.id],
                ["User", selectedTx.user],
                ["Product", selectedTx.product],
                ["Amount", `₹${selectedTx.amount}`],
                ["Status", selectedTx.status],
                ["Time", selectedTx.time],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm" style={{ color: "#6B5E4E" }}>{k}</span>
                  <span className="text-sm font-medium" style={{ color: "#F5F0E8" }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" size="sm" className="flex-1" style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>Refund</Button>
              <Button variant="outline" size="sm" className="flex-1" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }}>Flag</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionLogs;
