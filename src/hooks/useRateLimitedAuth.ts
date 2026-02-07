import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/backend/client';

interface AuthResult {
  success: boolean;
  error?: string;
  retryAfter?: number;
  data?: {
    user?: any;
    session?: any;
    message?: string;
  };
}

interface UseRateLimitedAuthReturn {
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  isLoading: boolean;
  rateLimitError: string | null;
  retryAfter: number | null;
}

// Use the Supabase URL from environment with fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pgavnutkwiiovdvbrbcl.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYXZudXRrd2lpb3ZkdmJyYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDgyOTcsImV4cCI6MjA4NTYyNDI5N30.bM1DTGq9Fgn0WPcDlS2hjxRr-bdTDIbLq47RZFIvFbo";
const AUTH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/auth-rate-limiter`;

export const useRateLimitedAuth = (): UseRateLimitedAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const callAuthEndpoint = useCallback(async (
    action: 'login' | 'signup' | 'passwordReset',
    payload: Record<string, unknown>
  ): Promise<AuthResult> => {
    setIsLoading(true);
    setRateLimitError(null);
    setRetryAfter(null);

    try {
      const response = await fetch(`${AUTH_FUNCTION_URL}?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 429) {
        // Rate limited
        setRateLimitError(result.error || 'Too many attempts. Please try again later.');
        setRetryAfter(result.retryAfter || 60);
        return {
          success: false,
          error: result.error,
          retryAfter: result.retryAfter,
        };
      }

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }

      // For login, set the session in Supabase client
      if (action === 'login' && result.data?.session) {
        await supabase.auth.setSession({
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
        });
      }

      return {
        success: true,
        data: result.data,
      };

    } catch (error) {
      console.error('Auth request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    return callAuthEndpoint('login', { email, password });
  }, [callAuthEndpoint]);

  const signup = useCallback(async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<AuthResult> => {
    return callAuthEndpoint('signup', { email, password, displayName });
  }, [callAuthEndpoint]);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    return callAuthEndpoint('passwordReset', { email });
  }, [callAuthEndpoint]);

  return {
    login,
    signup,
    resetPassword,
    isLoading,
    rateLimitError,
    retryAfter,
  };
};
