import {
  LayoutDashboard, Activity, GitBranch, Music, Zap, HardDrive,
  DollarSign, Receipt, ShoppingBag, TrendingUp,
  Users, Award, Film, Image, Settings, BellRing, X
} from "lucide-react";

export type AdminSection =
  | "command-center"
  | "system-health" | "workflow-monitor" | "sonic-analytics" | "edge-functions" | "storage-monitor"
  | "revenue" | "transactions" | "products" | "growth-forecast"
  | "user-management" | "karma-points" | "bhakti-shorts-review" | "jap-proof-approvals"
  | "admin-settings" | "notification-config";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuGroups = [
  {
    label: "OVERVIEW",
    emoji: "📊",
    items: [
      { id: "command-center" as AdminSection, label: "Command Center", icon: LayoutDashboard },
    ],
  },
  {
    label: "OPERATIONS",
    emoji: "⚙️",
    items: [
      { id: "system-health" as AdminSection, label: "System Health", icon: Activity },
      { id: "workflow-monitor" as AdminSection, label: "Workflow Monitor", icon: GitBranch },
      { id: "sonic-analytics" as AdminSection, label: "Sonic Lab Analytics", icon: Music },
      { id: "edge-functions" as AdminSection, label: "Edge Function Status", icon: Zap },
      { id: "storage-monitor" as AdminSection, label: "Storage Monitor", icon: HardDrive },
    ],
  },
  {
    label: "FINANCIAL",
    emoji: "💰",
    items: [
      { id: "revenue" as AdminSection, label: "Revenue Dashboard", icon: DollarSign },
      { id: "transactions" as AdminSection, label: "Transaction Logs", icon: Receipt },
      { id: "products" as AdminSection, label: "Product Management", icon: ShoppingBag },
      { id: "growth-forecast" as AdminSection, label: "Growth Forecast", icon: TrendingUp },
    ],
  },
  {
    label: "USERS",
    emoji: "👥",
    items: [
      { id: "user-management" as AdminSection, label: "User Management", icon: Users },
      { id: "karma-points" as AdminSection, label: "Karma Points", icon: Award },
      { id: "bhakti-shorts-review" as AdminSection, label: "Bhakti Shorts Review", icon: Film },
      { id: "jap-proof-approvals" as AdminSection, label: "Jap-Proof Approvals", icon: Image },
    ],
  },
  {
    label: "SETTINGS",
    emoji: "🛠️",
    items: [
      { id: "admin-settings" as AdminSection, label: "Admin Settings", icon: Settings },
      { id: "notification-config" as AdminSection, label: "Notification Config", icon: BellRing },
    ],
  },
];

const AdminSidebar = ({ activeSection, onSectionChange, isOpen, onClose }: AdminSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-full z-50 w-[260px] flex-shrink-0 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#0D0B08", borderRight: "1px solid rgba(201,168,76,0.1)" }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-sm font-bold" style={{ color: "#C9A84C" }}>Navigation</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5">
            <X className="w-5 h-5" style={{ color: "#6B5E4E" }} />
          </button>
        </div>

        <nav className="p-3 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-xs">{group.emoji}</span>
                <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#6B5E4E" }}>
                  {group.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSectionChange(item.id); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: isActive ? "rgba(201,168,76,0.15)" : "transparent",
                        color: isActive ? "#C9A84C" : "#6B5E4E",
                        borderLeft: isActive ? "3px solid #C9A84C" : "3px solid transparent",
                      }}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
