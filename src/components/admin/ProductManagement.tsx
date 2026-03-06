import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockProducts = [
  { id: "1", name: "Premium Monthly", category: "Subscription", price: 499, sales: 847, revenue: 422253, active: true },
  { id: "2", name: "Spiritual Starter Kit", category: "Product", price: 1299, sales: 312, revenue: 405288, active: true },
  { id: "3", name: "Mantra Mastery Course", category: "Course", price: 799, sales: 156, revenue: 124644, active: true },
  { id: "4", name: "Divine Donation", category: "Donation", price: 251, sales: 623, revenue: 156373, active: true },
  { id: "5", name: "Annual Premium", category: "Subscription", price: 4999, sales: 89, revenue: 444911, active: true },
];

const ProductManagement = () => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Product Management</h2>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}
          style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
              {["Product", "Category", "Price", "Sales", "Revenue", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wider" style={{ color: "#6B5E4E" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((p, i) => (
              <tr key={p.id} className="hover:bg-white/[0.02]"
                style={{ background: i % 2 === 0 ? "#0D0B08" : "#13110D", borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                <td className="px-4 py-3 font-medium" style={{ color: "#F5F0E8" }}>{p.name}</td>
                <td className="px-4 py-3" style={{ color: "#9C8C7C" }}>{p.category}</td>
                <td className="px-4 py-3" style={{ color: "#F5F0E8" }}>₹{p.price}</td>
                <td className="px-4 py-3" style={{ color: "#9C8C7C" }}>{p.sales}</td>
                <td className="px-4 py-3 font-medium" style={{ color: "#C9A84C" }}>₹{p.revenue.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            {["Name", "Description", "Price (₹)", "Category"].map((f) => (
              <div key={f}>
                <label className="text-xs mb-1 block" style={{ color: "#6B5E4E" }}>{f}</label>
                <Input className="h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }} />
              </div>
            ))}
            <Button className="w-full" style={{ background: "#C9A84C", color: "#080604" }}>Create Product</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
