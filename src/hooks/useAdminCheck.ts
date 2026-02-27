import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) { setIsAdmin(false); setIsLoading(false); }
          return;
        }

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

  return { isAdmin, isLoading };
};
