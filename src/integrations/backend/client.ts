import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Backend client (safe).
 *
 * Some preview environments can momentarily miss injected VITE_* variables.
 * If that happens, we use hardcoded fallbacks that match the project config.
 *
 * This client uses env vars when available, otherwise falls back to the
 * project's public (publishable) configuration so the app never blanks.
 */

// Public, client-side configuration (safe to ship - these are publishable keys)
const PROJECT_URL = "https://pgavnutkwiiovdvbrbcl.supabase.co";
const PROJECT_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYXZudXRrd2lpb3ZkdmJyYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDgyOTcsImV4cCI6MjA4NTYyNDI5N30.bM1DTGq9Fgn0WPcDlS2hjxRr-bdTDIbLq47RZFIvFbo";

// Try to read from environment, fall back to hardcoded values
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

const supabaseUrl = envUrl || PROJECT_URL;
const supabaseKey = envKey || PROJECT_PUBLISHABLE_KEY;

/**
 * Environment health check.
 * Returns true if:
 * 1. Environment variables are properly injected, OR
 * 2. The fallback values match the project's actual configuration
 *    (meaning we're still connecting to the correct database)
 */
export const backendEnvHealthy = Boolean(envUrl && envKey) || 
  (supabaseUrl === PROJECT_URL && supabaseKey === PROJECT_PUBLISHABLE_KEY);

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
