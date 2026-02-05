 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 // Atmosphere prompts for ElevenLabs SFX generation
 const atmospherePrompts: Record<string, string> = {
   rain: "Soft, gentle rain falling on leaves, peaceful and calming ambient sound for meditation, 20 second loop",
   river: "Peaceful river stream flowing over rocks, gentle water sounds for relaxation and meditation, 20 second loop",
   bells: "Tibetan temple bells ringing softly and slowly, spiritual meditation ambience, 20 second loop",
   forest: "Peaceful forest soundscape with birds chirping softly, leaves rustling gently, nature sounds for meditation, 20 second loop",
   chimes: "Gentle wind chimes in a light breeze, peaceful and meditative ambient sound, 20 second loop",
 };
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { atmosphereId } = await req.json();
 
     if (!atmosphereId || !atmospherePrompts[atmosphereId]) {
       return new Response(
         JSON.stringify({ error: "Invalid atmosphere ID" }),
         {
           status: 400,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
 
     const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
     if (!ELEVENLABS_API_KEY) {
       console.error("ELEVENLABS_API_KEY is not configured");
       return new Response(
         JSON.stringify({ error: "ElevenLabs API key not configured" }),
         {
           status: 500,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
 
     const prompt = atmospherePrompts[atmosphereId];
     console.log(`Generating SFX for atmosphere: ${atmosphereId}`);
 
     const response = await fetch(
       "https://api.elevenlabs.io/v1/sound-generation",
       {
         method: "POST",
         headers: {
           "xi-api-key": ELEVENLABS_API_KEY,
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           text: prompt,
           duration_seconds: 20,
           prompt_influence: 0.3,
         }),
       }
     );
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error(`ElevenLabs API error [${response.status}]:`, errorText);
       
       if (response.status === 429) {
         return new Response(
           JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
           {
             status: 429,
             headers: { ...corsHeaders, "Content-Type": "application/json" },
           }
         );
       }
       
       if (response.status === 402) {
         return new Response(
           JSON.stringify({ error: "ElevenLabs credits exhausted" }),
           {
             status: 402,
             headers: { ...corsHeaders, "Content-Type": "application/json" },
           }
         );
       }
 
       return new Response(
         JSON.stringify({ error: "Failed to generate sound effect" }),
         {
           status: 500,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
 
     // Return raw audio bytes
     const audioBuffer = await response.arrayBuffer();
     console.log(`Generated ${audioBuffer.byteLength} bytes of audio for ${atmosphereId}`);
 
     return new Response(audioBuffer, {
       headers: {
         ...corsHeaders,
         "Content-Type": "audio/mpeg",
       },
     });
   } catch (error) {
     console.error("Error generating sound effect:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ error: errorMessage }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });