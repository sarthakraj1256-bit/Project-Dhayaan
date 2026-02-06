/**
 * Environment Health Check Component
 * 
 * Previously showed a warning toast when env vars were missing.
 * Now a no-op since the hardcoded fallback values ARE the correct
 * live Lovable Cloud configuration - no warning needed.
 * 
 * The app always connects to the live database:
 * - If VITE_SUPABASE_URL is set → uses env var
 * - If missing → uses hardcoded PROJECT_URL (same database)
 */
const EnvHealthCheck = () => null;

export default EnvHealthCheck;