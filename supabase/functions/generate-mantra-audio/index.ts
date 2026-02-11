import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Mantra data for pre-generation (transliterations for TTS)
const mantraAudio = [
  { id: 'om', text: 'Oṃ' },
  { id: 'gayatri', text: 'Oṃ Bhūr Bhuvaḥ Svaḥ Tat Savitur Vareṇyaṃ Bhargo Devasya Dhīmahi Dhiyo Yo Naḥ Prachodayāt' },
  { id: 'maha-mrityunjaya', text: 'Oṃ Tryambakaṃ Yajāmahe Sugandhiṃ Puṣṭi-Vardhanam Urvārukam-iva Bandhanān Mṛtyor-Mukṣīya Māmṛtāt' },
  { id: 'shanti', text: 'Oṃ Śāntiḥ Śāntiḥ Śāntiḥ' },
  { id: 'om-namah-shivaya', text: 'Oṃ Namaḥ Śivāya' },
  { id: 'ganesh', text: 'Oṃ Gaṃ Gaṇapataye Namaḥ' },
  { id: 'hare-krishna', text: 'Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare Hare Rāma Hare Rāma Rāma Rāma Hare Hare' },
  { id: 'om-mani-padme-hum', text: 'Oṃ Maṇi Padme Hūṃ' },
  { id: 'saraswati', text: 'Oṃ Aiṃ Hrīṃ Klīṃ Mahāsarasvatī Devyai Namaḥ' },
  { id: 'green-tara', text: 'Oṃ Tāre Tuttāre Ture Svāhā' },
  { id: 'mahalakshmi', text: 'Oṃ Śrīṃ Hrīṃ Śrīṃ Kamale Kamalālaye Prasīda Prasīda Oṃ Śrīṃ Hrīṃ Śrīṃ Mahālakṣmyai Namaḥ' },
  { id: 'asato-ma', text: 'Asato Mā Sadgamaya Tamaso Mā Jyotirgamaya Mṛtyormā Amṛtaṃ Gamaya' },
  { id: 'hanuman', text: 'Manojavaṃ Mārutatulyavegaṃ Jitendriyaṃ Buddhimatāṃ Variṣṭham Vātātmajaṃ Vānarayūthamukhyaṃ Śrīrāmadūtaṃ Śaraṇaṃ Prapadye' },
  { id: 'nasadiya-sukta', text: 'Nāsadāsīnno Sadāsīttadānīṃ Nāsīdrajo No Vyomā Paro Yat' },
  { id: 'nirvana-shatakam', text: 'Mano Buddhyahaṃkāra Chittāni Nāhaṃ Na Cha Śrotra Jihve Na Cha Ghrāṇa Netre Na Cha Vyoma Bhūmir Na Tejo Na Vāyuḥ Chidānanda Rūpaḥ Śivoham Śivoham' },
  { id: 'navkar', text: 'Namo Arihantāṇaṃ Namo Siddhāṇaṃ Namo Āyariyāṇaṃ Namo Uvajjhāyāṇaṃ Namo Loe Savva Sāhūṇaṃ' },
  { id: 'ik-onkar', text: 'Ik Oṅkār Satināmu Kartā Purakhu Nirbhau Nirvairu Akāl Mūrati Ajūnī Saibhaṅ Gur Prasādi' },
  { id: 'ashem-vohu', text: 'Ashem Vohu Vahishtem Asti Ushtā Asti Ushtā Ahmai Hyat Ashāi Vahishtāi Ashem' },
  { id: 'waheguru-simran', text: 'Wāhegurū Wāhegurū Wāhegurū Wāhegurū' },
  { id: 'bhaktamar-stotra', text: 'Bhaktāmara Praṇata Mauli Maṇi Prabhāṇām Udyotakaṃ Dalita Pāpa Tamo Vitānam' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { mantraIds, force = false } = await req.json();
    
    // Filter to specific mantras if provided, otherwise process all
    const mantrasToProcess = mantraIds 
      ? mantraAudio.filter(m => mantraIds.includes(m.id))
      : mantraAudio;

    const results: { id: string; status: string; url?: string; error?: string }[] = [];
    const voiceId = 'nPczCjzI2devNBz1zQrb'; // Brian - calm voice for mantras

    for (const mantra of mantrasToProcess) {
      const filePath = `full/${mantra.id}.mp3`;
      
      // Check if file already exists (unless force regenerate)
      if (!force) {
        const { data: existingFile } = await supabase.storage
          .from('mantra-audio')
          .list('full', { search: `${mantra.id}.mp3` });
        
        if (existingFile && existingFile.length > 0) {
          const { data: urlData } = supabase.storage
            .from('mantra-audio')
            .getPublicUrl(filePath);
          
          results.push({ 
            id: mantra.id, 
            status: 'exists', 
            url: urlData.publicUrl 
          });
          continue;
        }
      }

      try {
        // Generate audio via ElevenLabs
        console.log(`Generating audio for: ${mantra.id}`);
        
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: mantra.text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
                speed: 0.85,
              },
            }),
          }
        );

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          throw new Error(`ElevenLabs API error [${ttsResponse.status}]: ${errorText}`);
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('mantra-audio')
          .upload(filePath, audioBlob, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('mantra-audio')
          .getPublicUrl(filePath);

        results.push({ 
          id: mantra.id, 
          status: 'generated', 
          url: urlData.publicUrl 
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error generating ${mantra.id}:`, errorMessage);
        results.push({ 
          id: mantra.id, 
          status: 'error', 
          error: errorMessage 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Generate mantra audio error:', error);
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