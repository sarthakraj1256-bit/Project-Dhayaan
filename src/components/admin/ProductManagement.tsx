import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { Plus, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string; name: string; description: string | null; category: string; price: number;
  is_active: boolean; stock_limited: boolean; stock_count: number; total_sales: number;
  total_revenue: number; created_at: string;
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
    if (!form.name || !form.price) { toast({ title: "Name and price are required", variant: "destructive" }); return; }
    const { error } = await supabase.from("products").insert({
      name: form.name, description: form.description || null, price: parseFloat(form.price),
      category: form.category, image_url: form.image_url || null,
    });
    if (error) { toast({ title: "Error creating product", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Product created" }); setShowAdd(false); setForm({ name: "", description: "", price: "", category: "subscription", image_url: "" }); fetchProducts(); }
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
        <h2 className="text-lg font-semibold text-primary">Product Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto bg-card border border-border">
        {loading ? (
          <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : products.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No products yet. Add your first product.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                {["Product", "Category", "Price", "Sales", "Revenue", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`hover:bg-foreground/[0.03] border-b border-border/50 ${i % 2 === 0 ? 'bg-popover' : 'bg-card'}`}>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-foreground">{p.name}</span>
                      {p.description && <p className="text-xs mt-0.5 text-muted-foreground">{p.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-foreground">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.total_sales}</td>
                  <td className="px-4 py-3 font-medium text-primary">₹{Number(p.total_revenue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p.id, p.is_active)}>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer ${p.is_active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteProduct(p.id)} className="text-xs px-2 py-1 rounded hover:bg-foreground/5 text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4 bg-card border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-primary">Add Product</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div>
              <label className="text-xs mb-1 block text-muted-foreground">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs mb-1 block text-muted-foreground">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block text-muted-foreground">Price (₹) *</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs mb-1 block text-muted-foreground">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block text-muted-foreground">Image URL</label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="h-9 text-sm" />
            </div>
            <Button className="w-full" onClick={createProduct}>Create Product</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
