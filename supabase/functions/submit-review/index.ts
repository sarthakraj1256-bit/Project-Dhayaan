import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const GOOGLE_SHEETS_SCRIPT_URL = Deno.env.get('GOOGLE_SHEETS_SCRIPT_URL');
    
    if (!GOOGLE_SHEETS_SCRIPT_URL) {
      console.error('GOOGLE_SHEETS_SCRIPT_URL is not configured');
      // Return success anyway - don't block the user experience
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Review saved locally (Google Sheets not configured)',
          sheetsConfigured: false 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const reviewData: ReviewData = await req.json();
    
    console.log('Submitting review to Google Sheets:', {
      name: reviewData.name,
      rating: reviewData.rating,
      intentTag: reviewData.intentTag,
      initialStress: reviewData.initialStress,
      finalStress: reviewData.finalStress,
      stressReduction: reviewData.stressReduction,
    });

    // Prepare data for Google Sheets
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

    // Send to Google Apps Script
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);
      // Still return success - we don't want to block the user
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Review saved locally (Google Sheets sync pending)',
          sheetsConfigured: true,
          syncError: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.text();
    console.log('Google Sheets response:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Review submitted successfully',
        sheetsConfigured: true,
        synced: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in submit-review function:', error);
    
    // Return success anyway - user experience is priority
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
