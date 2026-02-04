// A safe wrapper around Lovable Cloud OAuth that does not depend on the
// auto-generated backend client module.

import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/backend/client";

const lovableAuth = createLovableAuth({});

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple",
      opts?: { redirect_uri?: string }
    ) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        ...opts,
      });

      if (result.redirected) return result;
      if (result.error) return result;

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};
