 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
     if (!ELEVENLABS_API_KEY) {
       throw new Error('ELEVENLABS_API_KEY is not configured');
     }
 
     const { text, voiceId } = await req.json();
 
     if (!text) {
       throw new Error('Text is required');
     }
 
     // Use a calm, spiritual voice - "Brian" is good for meditative content
     // Can be customized per mantra style
     const selectedVoiceId = voiceId || 'nPczCjzI2devNBz1zQrb'; // Brian - calm, clear voice
 
     const response = await fetch(
       `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
       {
         method: 'POST',
         headers: {
           'xi-api-key': ELEVENLABS_API_KEY,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           text,
           model_id: 'eleven_multilingual_v2',
           voice_settings: {
             stability: 0.75,
             similarity_boost: 0.75,
             style: 0.3,
             use_speaker_boost: true,
             speed: 0.85, // Slower for mantra pronunciation
           },
         }),
       }
     );
 
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`ElevenLabs API error [${response.status}]: ${errorText}`);
     }
 
     const audioBuffer = await response.arrayBuffer();
 
     return new Response(audioBuffer, {
       headers: {
         ...corsHeaders,
         'Content-Type': 'audio/mpeg',
       },
     });
   } catch (error) {
    console.error('TTS Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     return new Response(
      JSON.stringify({ error: errorMessage }),
       {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       }
     );
   }
 });