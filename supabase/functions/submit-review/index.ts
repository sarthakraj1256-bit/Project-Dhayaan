import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
      console.error('Validation error:', parseResult.error.flatten());
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
    
    console.log('Processing validated review submission:', {
      name: reviewData.name.substring(0, 20), // Log truncated for privacy
      rating: reviewData.rating,
      intentTag: reviewData.intentTag,
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
            console.error('Database insert error:', dbError);
          } else {
            console.log('Stress metrics saved to database');
          }
        }
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }
    }

    // Also send to Google Sheets if configured
    const GOOGLE_SHEETS_SCRIPT_URL = Deno.env.get('GOOGLE_SHEETS_SCRIPT_URL');
    
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

        const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetData),
        });

        if (!response.ok) {
          console.error('Google Sheets error:', response.status);
        } else {
          console.log('Review synced to Google Sheets');
        }
      } catch (sheetErr) {
        console.error('Google Sheets error:', sheetErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Review submitted successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in submit-review function:', error);
    
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