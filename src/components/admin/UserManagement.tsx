import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { RefreshCw, Users, Award, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  karma_points: number;
  last_activity_date: string | null;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("admin_get_all_users");
    setUsers((data as UserRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>User Management</h2>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}
          style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6B5E4E" }} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..."
          className="pl-10 h-9 text-sm" style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)", color: "#F5F0E8" }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          {["User", "Karma", "Last Active", "Joined"].map((h) => (
            <span key={h} className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#6B5E4E" }}>{h}</span>
          ))}
        </div>
        {loading ? (
          <div className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: "#C9A84C" }} /></div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm" style={{ color: "#6B5E4E" }}>No users found</p>
        ) : filtered.map((u) => (
          <div key={u.user_id} className="grid grid-cols-4 gap-4 px-5 py-3 border-b last:border-0 hover:bg-white/[0.02]"
            style={{ borderColor: "rgba(201,168,76,0.05)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: "rgba(201,168,76,0.15)" }}>
                {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> :
                  <Users className="w-4 h-4" style={{ color: "#C9A84C" }} />}
              </div>
              <span className="text-sm font-medium" style={{ color: "#F5F0E8" }}>{u.display_name || "Anonymous"}</span>
            </div>
            <div className="flex items-center">
              <Badge className="gap-1 text-xs" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "none" }}>
                <Award className="w-3 h-3" /> {u.karma_points}
              </Badge>
            </div>
            <span className="text-sm self-center" style={{ color: "#9C8C7C" }}>
              {u.last_activity_date ? format(new Date(u.last_activity_date), "MMM d, yyyy") : "Never"}
            </span>
            <span className="text-sm self-center" style={{ color: "#9C8C7C" }}>
              {format(new Date(u.created_at), "MMM d, yyyy")}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: "#6B5E4E" }}>Showing {filtered.length} of {users.length} users</p>
    </div>
  );
};

export default UserManagement;
