import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Users, ShieldCheck, Music, Image, ArrowLeft, Loader2,
  Calendar, Award, RefreshCw, Plus, Trash2, Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// ─── Types ───────────────────────────────────────────
interface UserRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  karma_points: number;
  last_activity_date: string | null;
  created_at: string;
}

interface JapProof {
  id: string;
  proof_url: string;
  proof_type: string;
  notes: string | null;
  created_at: string;
  performer_name: string | null;
  mantra_name: string | null;
}

interface FrequencyDraft {
  id: string;
  name: string;
  freq: string;
  value: number;
  purpose: string;
  category: string;
  isNew?: boolean;
}

type Tab = "users" | "proofs" | "sonic";

const CATEGORIES = ["refresh", "healing", "focus", "stress", "meditation", "sleep"];

const Admin = () => {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [proofs, setProofs] = useState<JapProof[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ─── Fetch users ────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_get_all_users");
      if (error) throw error;
      setUsers((data as UserRow[]) || []);
    } catch (e: any) {
      toast({ title: "Error loading users", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch proofs ────────────────────────────────────
  const fetchProofs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_get_jap_proofs");
      if (error) throw error;
      setProofs((data as JapProof[]) || []);
    } catch (e: any) {
      toast({ title: "Error loading proofs", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "users") fetchUsers();
    else if (tab === "proofs") fetchProofs();
  }, [tab]);

  // ─── Tab buttons ─────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { id: "proofs", label: "Jap Proofs", icon: <Image className="w-4 h-4" /> },
    { id: "sonic", label: "Sonic Lab", icon: <Music className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background border-t-2 border-primary/40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
          <Badge variant="outline" className="ml-auto border-primary/50 text-primary text-[10px] tracking-widest uppercase">
            Super Admin
          </Badge>
        </div>
      </header>

      {/* Tab bar */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-2 border-b border-border pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "users" && <UsersTab users={users} loading={loading} onRefresh={fetchUsers} />}
          {tab === "proofs" && <ProofsTab proofs={proofs} loading={loading} onRefresh={fetchProofs} />}
          {tab === "sonic" && <SonicTab />}
        </motion.div>
      </main>
    </div>
  );
};

// ─── Users Tab ──────────────────────────────────────────
const UsersTab = ({ users, loading, onRefresh }: { users: UserRow[]; loading: boolean; onRefresh: () => void }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-foreground">User Management</h2>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
    {loading ? (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ) : (
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Karma</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        {u.display_name || "Anonymous"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Award className="w-3 h-3" />
                      {u.karma_points}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_activity_date
                      ? format(new Date(u.last_activity_date), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(u.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )}
    <p className="text-xs text-muted-foreground mt-3">
      Showing {users.length} users (max 100)
    </p>
  </div>
);

// ─── Proofs Tab ──────────────────────────────────────────
const ProofsTab = ({ proofs, loading, onRefresh }: { proofs: JapProof[]; loading: boolean; onRefresh: () => void }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-foreground">Jap-Proof Verification</h2>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
    {loading ? (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ) : proofs.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground">
        <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No proofs submitted yet</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {proofs.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {p.proof_type === "video" ? (
                <video src={p.proof_url} controls className="w-full h-full object-cover" />
              ) : p.proof_type === "screenshot" ? (
                <img src={p.proof_url} alt="Proof" className="w-full h-full object-cover" />
              ) : (
                <audio src={p.proof_url} controls className="w-3/4" />
              )}
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{p.performer_name || "Unknown"}</span>
                <Badge variant="outline" className="text-xs">{p.proof_type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{p.mantra_name || "—"}</p>
              {p.notes && <p className="text-xs text-muted-foreground italic">"{p.notes}"</p>}
              <p className="text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                {format(new Date(p.created_at), "MMM d, yyyy HH:mm")}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Sonic Lab Manager Tab ──────────────────────────────
const SonicTab = () => {
  const { toast } = useToast();
  const [frequencies, setFrequencies] = useState<FrequencyDraft[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load from soundLibrary
    import("@/data/soundLibrary").then((mod) => {
      setFrequencies(
        mod.soundLibrary.map((f, i) => ({
          id: `existing-${i}`,
          name: f.name,
          freq: f.freq,
          value: f.value,
          purpose: f.purpose,
          category: f.category,
        }))
      );
    });
  }, []);

  const addFrequency = () => {
    setFrequencies((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        freq: "",
        value: 0,
        purpose: "",
        category: "meditation",
        isNew: true,
      },
    ]);
    setHasChanges(true);
  };

  const updateField = (id: string, field: keyof FrequencyDraft, value: string | number) => {
    setFrequencies((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
    setHasChanges(true);
  };

  const removeFrequency = (id: string) => {
    setFrequencies((prev) => prev.filter((f) => f.id !== id));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast({
      title: "Frequency list updated",
      description: `${frequencies.length} frequencies in the library. Note: To persist, update the soundLibrary.ts data file.`,
    });
    setHasChanges(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Sonic Lab Manager</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addFrequency}>
            <Plus className="w-4 h-4 mr-2" />
            Add Frequency
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Display</TableHead>
              <TableHead>Hz</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frequencies.map((f) => (
              <TableRow key={f.id} className={f.isNew ? "bg-primary/5" : ""}>
                <TableCell>
                  <Input
                    value={f.name}
                    onChange={(e) => updateField(f.id, "name", e.target.value)}
                    placeholder="Name"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={f.freq}
                    onChange={(e) => updateField(f.id, "freq", e.target.value)}
                    placeholder="e.g. 432 Hz"
                    className="h-8 text-sm w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={f.value}
                    onChange={(e) => updateField(f.id, "value", parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm w-20"
                  />
                </TableCell>
                <TableCell>
                  <Select value={f.category} onValueChange={(v) => updateField(f.id, "category", v)}>
                    <SelectTrigger className="h-8 text-sm w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={f.purpose}
                    onChange={(e) => updateField(f.id, "purpose", e.target.value)}
                    placeholder="Purpose"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => removeFrequency(f.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {frequencies.length} frequencies • Changes are previewed in-memory. Update <code>soundLibrary.ts</code> to persist.
      </p>
    </div>
  );
};

export default Admin;
