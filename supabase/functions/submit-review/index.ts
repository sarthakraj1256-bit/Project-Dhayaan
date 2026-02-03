import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute per fingerprint
const UNKNOWN_IP_RATE_LIMIT = 2; // Stricter limit for unknown IPs

// Input validation schema
const ReviewSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim(),
  message: z.string().min(1, "Message is required").max(1000, "Message must be less than 1000 characters").trim(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  initialStress: z.number().int().min(1).max(10).nullable(),
  finalStress: z.number().int().min(1).max(10).nullable(),
  stressReduction: z.number().min(-100).max(100).nullable(),
  intentTag: z.string().max(50).nullable(),
  createdAt: z.string().max(100),
});

type ReviewData = z.infer<typeof ReviewSchema>;

// Generate a fingerprint from multiple request signals for better rate limiting
function generateFingerprint(req: Request): { fingerprint: string; isUnknown: boolean } {
  // Get IP from headers - use last IP in chain (closest to server, harder to spoof)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  // Use last IP in forwarded chain (added by trusted proxies)
  const ipFromChain = forwardedFor?.split(',').pop()?.trim();
  const ip = ipFromChain || realIp || '';
  
  // Collect additional signals for fingerprinting
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  
  // Create a composite fingerprint
  const signals = [ip, userAgent.substring(0, 100), acceptLanguage.substring(0, 50)];
  const fingerprint = signals.filter(Boolean).join('|');
  
  // If we have minimal signals, mark as unknown (stricter limits apply)
  const isUnknown = !ip && !userAgent;
  
  return { 
    fingerprint: fingerprint || 'unknown',
    isUnknown 
  };
}

// Rate limiting using Deno KV with fingerprinting
async function checkRateLimit(fingerprint: string, isUnknown: boolean): Promise<{ allowed: boolean; remaining: number }> {
  const limit = isUnknown ? UNKNOWN_IP_RATE_LIMIT : MAX_REQUESTS_PER_WINDOW;
  
  try {
    const kv = await Deno.openKv();
    const key = ['rate_limit', 'submit_review', fingerprint];
    const result = await kv.get<number>(key);
    
    const currentCount = result.value || 0;
    
    if (currentCount >= limit) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment counter with expiry
    await kv.set(key, currentCount + 1, { expireIn: RATE_LIMIT_WINDOW_MS });
    
    return { allowed: true, remaining: limit - currentCount - 1 };
  } catch (err) {
    // If KV fails, use stricter fallback for unknown fingerprints
    console.warn('RATE_LIMIT_KV_ERROR');
    if (isUnknown) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: limit };
  }
}

// Generate HMAC signature for Google Sheets authentication
async function generateHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Generate fingerprint for rate limiting (harder to spoof than single IP header)
  const { fingerprint, isUnknown } = generateFingerprint(req);

  // Check rate limit with stricter limits for unknown fingerprints
  const rateLimitResult = await checkRateLimit(fingerprint, isUnknown);
  
  if (!rateLimitResult.allowed) {
    console.warn('RATE_LIMIT_EXCEEDED', { timestamp: Date.now() });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Too many submissions. Please wait a minute before trying again.' 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0'
        } 
      }
    );
  }

  try {
    // Parse and validate input
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = ReviewSchema.safeParse(rawData);
    if (!parseResult.success) {
      // Log minimal info - just error count, not full schema details
      console.warn('VALIDATION_ERROR', { 
        timestamp: Date.now(),
        errorCount: parseResult.error.errors.length 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviewData: ReviewData = parseResult.data;
    
    // Log only non-sensitive operational info
    console.log('REVIEW_PROCESSING', {
      timestamp: Date.now(),
      hasStressData: reviewData.initialStress !== null && reviewData.finalStress !== null,
    });

    // Save to Supabase database for statistics aggregation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Only save if we have stress data
        if (reviewData.initialStress !== null && reviewData.finalStress !== null) {
          const { error: dbError } = await supabase
            .from('stress_metrics')
            .insert({
              name: reviewData.name,
              initial_stress: reviewData.initialStress,
              final_stress: reviewData.finalStress,
              stress_reduction: reviewData.stressReduction,
              intent_tag: reviewData.intentTag,
              rating: reviewData.rating,
            });
          
          if (dbError) {
            // Log error code only, not full error details
            console.error('DB_INSERT_ERROR', { timestamp: Date.now() });
          } else {
            console.log('DB_INSERT_SUCCESS');
          }
        }
      } catch (dbErr) {
        console.error('DB_CONNECTION_ERROR', { timestamp: Date.now() });
      }
    }

    // Send to Google Sheets if configured (with HMAC authentication)
    const GOOGLE_SHEETS_SCRIPT_URL = Deno.env.get('GOOGLE_SHEETS_SCRIPT_URL');
    const GOOGLE_SHEETS_HMAC_SECRET = Deno.env.get('GOOGLE_SHEETS_HMAC_SECRET');
    
    if (GOOGLE_SHEETS_SCRIPT_URL) {
      try {
        const sheetData = {
          name: reviewData.name,
          message: reviewData.message,
          rating: reviewData.rating,
          initialStress: reviewData.initialStress ?? 'N/A',
          finalStress: reviewData.finalStress ?? 'N/A',
          stressReduction: reviewData.stressReduction !== null 
            ? `${reviewData.stressReduction}%` 
            : 'N/A',
          intentTag: reviewData.intentTag ?? 'Not specified',
          timestamp: reviewData.createdAt,
        };

        const payload = JSON.stringify(sheetData);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        
        // Add HMAC signature if secret is configured
        if (GOOGLE_SHEETS_HMAC_SECRET) {
          const signature = await generateHmacSignature(payload, GOOGLE_SHEETS_HMAC_SECRET);
          headers['X-Signature'] = signature;
        }

        const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
          method: 'POST',
          headers,
          body: payload,
        });

        if (!response.ok) {
          console.warn('SHEETS_SYNC_ERROR', { status: response.status });
        } else {
          console.log('SHEETS_SYNC_SUCCESS');
        }
      } catch (sheetErr) {
        console.warn('SHEETS_CONNECTION_ERROR', { timestamp: Date.now() });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Review submitted successfully'
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        } 
      }
    );

  } catch (error) {
    // Log generic error code, not full error details
    console.error('FUNCTION_ERROR', { timestamp: Date.now() });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});