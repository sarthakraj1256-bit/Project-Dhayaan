import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ReviewData {
  name: string;
  message: string;
  rating: number;
  initialStress: number | null;
  finalStress: number | null;
  stressReduction: number | null;
  intentTag: string | null;
  createdAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reviewData: ReviewData = await req.json();
    
    console.log('Processing review submission:', {
      name: reviewData.name,
      rating: reviewData.rating,
      intentTag: reviewData.intentTag,
      initialStress: reviewData.initialStress,
      finalStress: reviewData.finalStress,
      stressReduction: reviewData.stressReduction,
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
        success: true, 
        message: 'Review saved locally',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
