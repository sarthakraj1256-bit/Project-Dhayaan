import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Backend client (safe).
 *
 * Some preview environments can momentarily miss injected VITE_* variables.
 * If that happens, the auto-generated client can crash at import-time.
 *
 * This client uses env vars when available, otherwise falls back to the
 * project's public (publishable) configuration so the app never blanks.
 */

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

// Public, client-side configuration fallback (safe to ship)
const FALLBACK_URL = "https://pgavnutkwiiovdvbrbcl.supabase.co";
const FALLBACK_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYXZudXRrd2lpb3ZkdmJyYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDgyOTcsImV4cCI6MjA4NTYyNDI5N30.bM1DTGq9Fgn0WPcDlS2hjxRr-bdTDIbLq47RZFIvFbo";

const supabaseUrl = envUrl || FALLBACK_URL;
const supabaseKey = envKey || FALLBACK_PUBLISHABLE_KEY;

export const backendEnvHealthy = Boolean(envUrl && envKey);

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage:
      typeof window !== "undefined"
        ? window.localStorage
        : (undefined as unknown as Storage),
    persistSession: true,
    autoRefreshToken: true,
  },
});
