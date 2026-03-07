import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import AdminSidebar, { AdminSection } from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/integrations/backend/client";
import { toast } from "@/hooks/use-toast";

// Lazy load all sections
const CommandCenter = lazy(() => import("@/components/admin/CommandCenter"));
const SystemHealth = lazy(() => import("@/components/admin/SystemHealth"));
const WorkflowMonitor = lazy(() => import("@/components/admin/WorkflowMonitor"));
const SonicLabAnalytics = lazy(() => import("@/components/admin/SonicLabAnalytics"));
const EdgeFunctionMonitor = lazy(() => import("@/components/admin/EdgeFunctionMonitor"));
const StorageMonitor = lazy(() => import("@/components/admin/StorageMonitor"));
const RevenueDashboard = lazy(() => import("@/components/admin/RevenueDashboard"));
const TransactionLogs = lazy(() => import("@/components/admin/TransactionLogs"));
const ProductManagement = lazy(() => import("@/components/admin/ProductManagement"));
const GrowthForecast = lazy(() => import("@/components/admin/GrowthForecast"));
const UserManagement = lazy(() => import("@/components/admin/UserManagement"));
const KarmaPoints = lazy(() => import("@/components/admin/KarmaPoints"));
const BhaktiShortsReview = lazy(() => import("@/components/admin/BhaktiShortsReview"));
const JapProofApprovals = lazy(() => import("@/components/admin/JapProofApprovals"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const NotificationConfig = lazy(() => import("@/components/admin/NotificationConfig"));

// Skeleton loader with gold shimmer — theme-aware
const SectionSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl h-32 animate-pulse bg-card border border-border" />
    ))}
  </div>
);

const sectionMap: Record<AdminSection, React.LazyExoticComponent<React.ComponentType>> = {
  "command-center": CommandCenter,
  "system-health": SystemHealth,
  "workflow-monitor": WorkflowMonitor,
  "sonic-analytics": SonicLabAnalytics,
  "edge-functions": EdgeFunctionMonitor,
  "storage-monitor": StorageMonitor,
  "revenue": RevenueDashboard,
  "transactions": TransactionLogs,
  "products": ProductManagement,
  "growth-forecast": GrowthForecast,
  "user-management": UserManagement,
  "karma-points": KarmaPoints,
  "bhakti-shorts-review": BhaktiShortsReview,
  "jap-proof-approvals": JapProofApprovals,
  "admin-settings": AdminSettings,
  "notification-config": NotificationConfig,
};

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("command-center");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; time: string; icon: string }[]>([]);

  const addNotification = useCallback((icon: string, message: string) => {
    const n = { id: crypto.randomUUID(), message, time: "Just now", icon };
    setNotifications((prev) => [n, ...prev].slice(0, 50));
    toast({ title: `${icon} ${message}` });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        const name = (payload.new as any).display_name || "Someone";
        addNotification("👤", `New user registered: ${name}`);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (payload) => {
        const amount = Number((payload.new as any).amount || 0).toLocaleString("en-IN");
        addNotification("💰", `₹${amount} purchase completed`);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "shorts_metadata" }, () => {
        addNotification("📹", "New Bhakti Short uploaded for review");
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [addNotification]);

  const ActiveComponent = sectionMap[activeSection];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
      />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Suspense fallback={<SectionSkeleton />}>
            <ActiveComponent />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Admin;
