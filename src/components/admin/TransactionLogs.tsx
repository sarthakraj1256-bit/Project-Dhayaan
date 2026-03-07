import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { Download, ChevronLeft, ChevronRight, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  completed: "#22C55E", pending: "#F59E0B", failed: "#EF4444", refunded: "#6B5E4E",
};

interface Transaction {
  id: string; user_email: string | null; product_name: string; amount: number;
  status: string; payment_method: string | null; created_at: string; notes: string | null;
}

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const perPage = 25;

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(500);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    setTransactions((data as Transaction[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, [statusFilter]);

  const paged = transactions.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(transactions.length / perPage);

  const exportCSV = () => {
    const csv = "ID,User,Product,Amount,Status,Payment Method,Time\n" +
      transactions.map((t) => `${t.id},${t.user_email || ""},${t.product_name},${t.amount},${t.status},${t.payment_method || ""},${t.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("transactions").update({ status: newStatus }).eq("id", id);
    setSelectedTx(null);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary">Transaction Logs</h2>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["all", "completed", "pending", "failed", "refunded"].map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={transactions.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto bg-card border border-border">
        {loading ? (
          <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : transactions.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No transactions found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                {["ID", "User", "Product", "Amount", "Status", "Method", "Time"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((t, i) => (
                <tr key={t.id} className={`cursor-pointer hover:bg-foreground/[0.03] transition-colors border-b border-border/50 ${i % 2 === 0 ? 'bg-popover' : 'bg-card'}`}
                  onClick={() => setSelectedTx(t)}>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{t.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-foreground">{t.user_email || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.product_name}</td>
                  <td className="px-4 py-3 font-medium text-foreground">₹{Number(t.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: `${statusColors[t.status] || "#6B5E4E"}20`, color: statusColors[t.status] || "#6B5E4E" }}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.payment_method || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(t.created_at), "MMM d, HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{transactions.length} transactions</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-foreground/5 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 text-primary" />
            </button>
            <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages} className="p-1.5 rounded hover:bg-foreground/5 disabled:opacity-30">
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      )}

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setSelectedTx(null)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 bg-card border border-border"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary">Transaction Detail</h3>
              <button onClick={() => setSelectedTx(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[
                ["ID", selectedTx.id], ["User", selectedTx.user_email || "—"],
                ["Product", selectedTx.product_name], ["Amount", `₹${Number(selectedTx.amount).toLocaleString("en-IN")}`],
                ["Status", selectedTx.status], ["Payment Method", selectedTx.payment_method || "—"],
                ["Time", format(new Date(selectedTx.created_at), "MMM d, yyyy HH:mm:ss")], ["Notes", selectedTx.notes || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-sm font-medium text-right max-w-[60%] break-all text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              {selectedTx.status !== "refunded" && (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => updateStatus(selectedTx.id, "refunded")}>Refund</Button>
              )}
              {selectedTx.status !== "failed" && (
                <Button variant="outline" size="sm" className="flex-1 border-red-500/30 text-red-500" onClick={() => updateStatus(selectedTx.id, "failed")}>Flag</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionLogs;
