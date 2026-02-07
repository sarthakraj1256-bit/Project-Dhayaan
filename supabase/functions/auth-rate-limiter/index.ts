import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limiting configuration
const AUTH_RATE_LIMITS = {
  // Login attempts
  login: {
    maxAttempts: 5,           // Max attempts before lockout
    windowMs: 60000,          // 1 minute window
    lockoutMs: 300000,        // 5 minute lockout after max attempts
    maxLockouts: 3,           // After 3 lockouts, extended lockout
    extendedLockoutMs: 3600000, // 1 hour extended lockout
  },
  // Signup attempts
  signup: {
    maxAttempts: 3,
    windowMs: 60000,
    lockoutMs: 600000,        // 10 minute lockout
    maxLockouts: 2,
    extendedLockoutMs: 86400000, // 24 hour extended lockout
  },
  // Password reset
  passwordReset: {
    maxAttempts: 3,
    windowMs: 300000,         // 5 minute window
    lockoutMs: 900000,        // 15 minute lockout
    maxLockouts: 2,
    extendedLockoutMs: 3600000,
  },
};

// Input validation schemas
const LoginSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

const SignupSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(8).max(128),
  displayName: z.string().max(100).optional(),
});

const PasswordResetSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
});

type AuthAction = 'login' | 'signup' | 'passwordReset';

interface RateLimitState {
  attempts: number;
  lockoutCount: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

// Generate fingerprint from request signals
function generateFingerprint(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ipFromChain = forwardedFor?.split(',').pop()?.trim();
  const ip = ipFromChain || realIp || 'unknown';
  
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  
  // Create composite fingerprint
  return [ip, userAgent.substring(0, 100), acceptLanguage.substring(0, 30)]
    .filter(Boolean)
    .join('|') || 'unknown';
}

// Check and update rate limit state
async function checkAuthRateLimit(
  action: AuthAction,
  identifier: string,
  fingerprint: string
): Promise<{ allowed: boolean; retryAfter?: number; message?: string }> {
  const config = AUTH_RATE_LIMITS[action];
  const now = Date.now();
  
  try {
    const kv = await Deno.openKv();
    
    // Use both email and fingerprint for rate limiting (prevents bypass)
    const emailKey = ['auth_rate', action, 'email', identifier];
    const fpKey = ['auth_rate', action, 'fp', fingerprint];
    
    // Get current state for both
    const [emailResult, fpResult] = await Promise.all([
      kv.get<RateLimitState>(emailKey),
      kv.get<RateLimitState>(fpKey),
    ]);
    
    const defaultState: RateLimitState = {
      attempts: 0,
      lockoutCount: 0,
      lockedUntil: null,
      lastAttempt: 0,
    };
    
    const emailState = emailResult.value || defaultState;
    const fpState = fpResult.value || defaultState;
    
    // Check if either is locked
    if (emailState.lockedUntil && emailState.lockedUntil > now) {
      const retryAfter = Math.ceil((emailState.lockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Account temporarily locked. Try again in ${formatDuration(retryAfter)}.`,
      };
    }
    
    if (fpState.lockedUntil && fpState.lockedUntil > now) {
      const retryAfter = Math.ceil((fpState.lockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Too many attempts from this device. Try again in ${formatDuration(retryAfter)}.`,
      };
    }
    
    // Reset attempts if window has passed
    const emailAttempts = (now - emailState.lastAttempt > config.windowMs) ? 0 : emailState.attempts;
    const fpAttempts = (now - fpState.lastAttempt > config.windowMs) ? 0 : fpState.attempts;
    
    // Check if at limit
    if (emailAttempts >= config.maxAttempts || fpAttempts >= config.maxAttempts) {
      // Increment lockout count
      const newLockoutCount = Math.max(emailState.lockoutCount, fpState.lockoutCount) + 1;
      
      // Calculate lockout duration (exponential backoff)
      let lockoutDuration = config.lockoutMs;
      if (newLockoutCount >= config.maxLockouts) {
        lockoutDuration = config.extendedLockoutMs;
      } else {
        // Double lockout time for each subsequent lockout
        lockoutDuration = config.lockoutMs * Math.pow(2, newLockoutCount - 1);
      }
      
      const lockedUntil = now + lockoutDuration;
      
      // Update both states with lockout
      const newState: RateLimitState = {
        attempts: 0,
        lockoutCount: newLockoutCount,
        lockedUntil,
        lastAttempt: now,
      };
      
      await Promise.all([
        kv.set(emailKey, newState, { expireIn: lockoutDuration + 60000 }),
        kv.set(fpKey, newState, { expireIn: lockoutDuration + 60000 }),
      ]);
      
      const retryAfter = Math.ceil(lockoutDuration / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Too many ${action} attempts. Account locked for ${formatDuration(retryAfter)}.`,
      };
    }
    
    // Increment attempts
    const updatedEmailState: RateLimitState = {
      attempts: emailAttempts + 1,
      lockoutCount: emailState.lockoutCount,
      lockedUntil: null,
      lastAttempt: now,
    };
    
    const updatedFpState: RateLimitState = {
      attempts: fpAttempts + 1,
      lockoutCount: fpState.lockoutCount,
      lockedUntil: null,
      lastAttempt: now,
    };
    
    await Promise.all([
      kv.set(emailKey, updatedEmailState, { expireIn: config.windowMs + 60000 }),
      kv.set(fpKey, updatedFpState, { expireIn: config.windowMs + 60000 }),
    ]);
    
    return { allowed: true };
    
  } catch (err) {
    console.warn('RATE_LIMIT_KV_ERROR', { timestamp: Date.now() });
    // Fail open but log - prefer availability over blocking legitimate users
    return { allowed: true };
  }
}

// Reset rate limit on successful auth
async function resetRateLimit(action: AuthAction, identifier: string): Promise<void> {
  try {
    const kv = await Deno.openKv();
    const emailKey = ['auth_rate', action, 'email', identifier];
    await kv.delete(emailKey);
  } catch (err) {
    // Silent fail - not critical
  }
}

// Format duration for user-friendly messages
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.ceil(seconds / 3600)} hours`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const fingerprint = generateFingerprint(req);
  
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') as AuthAction;
    
    if (!action || !['login', 'signup', 'passwordReset'].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate based on action
    let email: string;
    let password: string | undefined;
    let displayName: string | undefined;
    
    if (action === 'login') {
      const result = LoginSchema.safeParse(rawData);
      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      email = result.data.email;
      password = result.data.password;
    } else if (action === 'signup') {
      const result = SignupSchema.safeParse(rawData);
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid signup data',
            details: result.error.flatten().fieldErrors
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      email = result.data.email;
      password = result.data.password;
      displayName = result.data.displayName;
    } else {
      const result = PasswordResetSchema.safeParse(rawData);
      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      email = result.data.email;
    }
    
    // Check rate limit
    const rateLimitResult = await checkAuthRateLimit(action, email, fingerprint);
    
    if (!rateLimitResult.allowed) {
      console.warn('AUTH_RATE_LIMITED', { action, timestamp: Date.now() });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: rateLimitResult.message,
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          } 
        }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    let authResult: { success: boolean; error?: string; data?: unknown };
    
    // Perform auth action
    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password!,
      });
      
      if (error) {
        console.warn('LOGIN_FAILED', { timestamp: Date.now() });
        authResult = { 
          success: false, 
          error: 'Invalid email or password'
        };
      } else {
        // Reset rate limit on successful login
        await resetRateLimit(action, email);
        console.log('LOGIN_SUCCESS', { timestamp: Date.now() });
        authResult = { 
          success: true, 
          data: {
            user: data.user,
            session: data.session
          }
        };
      }
    } else if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password!,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
        },
      });
      
      if (error) {
        console.warn('SIGNUP_FAILED', { timestamp: Date.now() });
        // Don't reveal if email exists
        authResult = { 
          success: false, 
          error: error.message.includes('already registered') 
            ? 'Unable to create account. Please try a different email.'
            : error.message
        };
      } else {
        await resetRateLimit(action, email);
        console.log('SIGNUP_SUCCESS', { timestamp: Date.now() });
        authResult = { 
          success: true, 
          data: {
            user: data.user,
            message: 'Please check your email to verify your account.'
          }
        };
      }
    } else {
      // Password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.get('origin')}/auth/callback?type=recovery`,
      });
      
      if (error) {
        console.warn('PASSWORD_RESET_FAILED', { timestamp: Date.now() });
      }
      
      // Always return success to prevent email enumeration
      await resetRateLimit(action, email);
      authResult = { 
        success: true, 
        data: {
          message: 'If an account exists with this email, you will receive a password reset link.'
        }
      };
    }
    
    return new Response(
      JSON.stringify(authResult),
      { 
        status: authResult.success ? 200 : 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('AUTH_FUNCTION_ERROR', { timestamp: Date.now() });
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
