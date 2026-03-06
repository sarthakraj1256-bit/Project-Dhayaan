import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { Plus, X, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  is_active: boolean;
  stock_limited: boolean;
  stock_count: number;
  total_sales: number;
  total_revenue: number;
  created_at: string;
}

const CATEGORIES = ["subscription", "product", "course", "donation"];

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "subscription", image_url: "" });
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const createProduct = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("products").insert({
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category: form.category,
      image_url: form.image_url || null,
    });
    if (error) {
      toast({ title: "Error creating product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product created" });
      setShowAdd(false);
      setForm({ name: "", description: "", price: "", category: "subscription", image_url: "" });
      fetchProducts();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Product Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}
            style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}
            style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        {loading ? (
          <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: "#C9A84C" }} /></div>
        ) : products.length === 0 ? (
          <p className="p-12 text-center text-sm" style={{ color: "#6B5E4E" }}>No products yet. Add your first product.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                {["Product", "Category", "Price", "Sales", "Revenue", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wider" style={{ color: "#6B5E4E" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/[0.02]"
                  style={{ background: i % 2 === 0 ? "#0D0B08" : "#13110D", borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium" style={{ color: "#F5F0E8" }}>{p.name}</span>
                      {p.description && <p className="text-xs mt-0.5" style={{ color: "#6B5E4E" }}>{p.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9C8C7C" }}>{p.category}</td>
                  <td className="px-4 py-3" style={{ color: "#F5F0E8" }}>₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3" style={{ color: "#9C8C7C" }}>{p.total_sales}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#C9A84C" }}>₹{Number(p.total_revenue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p.id, p.is_active)}>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer"
                        style={{ background: p.is_active ? "rgba(34,197,94,0.15)" : "rgba(107,94,78,0.15)", color: p.is_active ? "#22C55E" : "#6B5E4E" }}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteProduct(p.id)} className="text-xs px-2 py-1 rounded hover:bg-white/5"
                      style={{ color: "#EF4444" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: "#C9A84C" }}>Add Product</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" style={{ color: "#6B5E4E" }} /></button>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B5E4E" }}>Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B5E4E" }}>Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#6B5E4E" }}>Price (₹) *</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#6B5E4E" }}>Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B5E4E" }}>Image URL</label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }} />
            </div>
            <Button className="w-full" onClick={createProduct} style={{ background: "#C9A84C", color: "#080604" }}>Create Product</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
