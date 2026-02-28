import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";

const SUPER_ADMIN_EMAIL = "dhyaanauthorities@gmail.com";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) { setIsAdmin(false); setUserEmail(null); setIsLoading(false); }
          return;
        }

        if (mounted) setUserEmail(user.email ?? null);

        // Layer 2: Hardcoded email check — only the super-admin email is allowed
        if (user.email !== SUPER_ADMIN_EMAIL) {
          if (mounted) { setIsAdmin(false); setIsLoading(false); }
          return;
        }

        // Layer 3: Database role check
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (mounted) {
          setIsAdmin(!error && !!data);
          setIsLoading(false);
        }
      } catch {
        if (mounted) { setIsAdmin(false); setIsLoading(false); }
      }
    };

    checkAdmin();
    return () => { mounted = false; };
  }, []);

  return { isAdmin, isLoading, userEmail };
};
