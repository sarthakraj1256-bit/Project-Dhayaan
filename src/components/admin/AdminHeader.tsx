import { useState, useEffect, useCallback } from "react";
import { Bell, LogOut, Search, Shield, Menu } from "lucide-react";
import { supabase } from "@/integrations/backend/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  notifications: { id: string; message: string; time: string; icon: string }[];
  onClearNotifications: () => void;
}

const SESSION_DURATION = 30 * 60; // 30 minutes in seconds

const AdminHeader = ({ onToggleSidebar, notifications, onClearNotifications }: AdminHeaderProps) => {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          supabase.auth.signOut().then(() => navigate("/auth"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Re-verify admin identity every 30 minutes
  const verifySession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "dhyaanauthorities@gmail.com") {
      await supabase.auth.signOut();
      navigate("/auth");
    } else {
      setTimeLeft(SESSION_DURATION);
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(verifySession, SESSION_DURATION * 1000);
    return () => clearInterval(interval);
  }, [verifySession]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b"
      style={{ 
        background: "#0D0B08", 
        borderColor: "rgba(201,168,76,0.15)" 
      }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Menu className="w-5 h-5" style={{ color: "#C9A84C" }} />
        </button>
        <Shield className="w-5 h-5" style={{ color: "#C9A84C" }} />
        <h1 className="text-base font-bold hidden sm:block" style={{ color: "#F5F0E8" }}>
          Admin Command Center
        </h1>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6B5E4E" }} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, transactions..."
            className="pl-10 h-9 border-0 text-sm"
            style={{ 
              background: "rgba(201,168,76,0.08)", 
              color: "#F5F0E8",
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Session timer */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" 
          style={{ background: "rgba(245,158,11,0.1)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ background: timeLeft < 300 ? "#EF4444" : "#F59E0B" }} />
          <span className="text-xs font-mono font-medium" 
            style={{ color: timeLeft < 300 ? "#EF4444" : "#F59E0B" }}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell className="w-5 h-5" style={{ color: "#6B5E4E" }} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#EF4444", color: "#fff" }}>
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border shadow-2xl z-50 max-h-96 overflow-y-auto"
              style={{ background: "#13110D", borderColor: "rgba(201,168,76,0.2)" }}>
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
                <span className="text-sm font-semibold" style={{ color: "#F5F0E8" }}>Notifications</span>
                <button onClick={onClearNotifications} className="text-xs" style={{ color: "#C9A84C" }}>
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm" style={{ color: "#6B5E4E" }}>No new notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: "rgba(201,168,76,0.05)" }}>
                    <div className="flex items-start gap-2">
                      <span className="text-base">{n.icon}</span>
                      <div>
                        <p className="text-sm" style={{ color: "#F5F0E8" }}>{n.message}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B5E4E" }}>{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Admin avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
          D
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 transition-colors hidden sm:block">
          <LogOut className="w-4 h-4" style={{ color: "#6B5E4E" }} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
