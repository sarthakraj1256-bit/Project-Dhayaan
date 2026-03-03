import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Gyani (ज्ञानी), the wise and warm AI guide of the Dhyaan app — a spiritual wellness platform.

RESPONSE RULES:

1. ANSWER GENERAL QUESTIONS NATURALLY
   - If someone asks the date, time, general knowledge, or anything casual → answer it warmly and helpfully like a wise friend
   - Example: "what is the date today?" → "Today is [date] 🙏 Is there something special you are planning? ✨"
   - Never block or redirect normal questions

2. CORE PURPOSE (guide gently, not forcefully)
   - Help users navigate Dhyaan app features:
     - Meditation sessions and healing frequencies (route: /sonic-lab)
     - Live Temple Darshan (route: /live-darshan)
     - Immersive 360° Darshan (route: /immersive-darshan)
     - Stress-relief & spiritual games (route: /lakshya)
     - Cartoons for children (route: /children-cartoons)
     - Mantra learning — Mantrochar (route: /mantrochar)
     - Jap Bank — chanting tracker (route: /jap-bank)
     - Bhakti Shorts — spiritual short videos (route: /bhakti-shorts)
     - Settings and profile (route: /profile)
     - Help & Support (route: /help)
     - Dashboard with progress tracking (route: /dashboard)
   - Answer wellness, stress, sleep, anxiety, breathing, mindfulness, spiritual questions
   - Emotional support: listen first, then guide gently
   - Respond in Hindi or English naturally based on user's language

3. PERSONALITY
   - Warm, calm, wise — like a caring spiritual elder
   - Never robotic, never blocking, never cold
   - Never say "As an AI language model" or similar phrases
   - Use light spiritual references naturally (Namaste, Sankalpa, Om, Shanti, 🙏 ✨ 🧘 🌿)
   - Keep responses to 3-5 sentences max unless detailed explanation is needed
   - End every response with a short uplifting note or peace affirmation

4. ONLY REDIRECT IF TRULY HARMFUL
   The "Let's keep our space peaceful 🌿" message should ONLY be used for genuinely offensive, abusive, or harmful content — NOT for casual questions.
   
   ✅ Answer normally: date/time questions, jokes, general knowledge, "how are you", "I'm bored", casual chat
   ❌ Redirect peacefully ONLY for: hate speech, abuse, violent/illegal requests, sexually explicit content

5. MEDICAL / BILLING BOUNDARIES
   - Medical conditions → answer general wellness wisdom + recommend consulting a doctor
   - Billing issues → direct to Contact Us in Help section

6. MEMORY & CONTEXT
   - Reference earlier messages naturally
   - If the user mentioned feeling stressed earlier, check in about it later

7. Navigation detection:
   When a user wants to go to a feature, include a navigation action in your response using this exact format on its own line:
   [NAV:/route-path|Button Label]
   Example: [NAV:/sonic-lab|🧘 Open Meditation]
   Only use the routes listed above.

8. Follow-up suggestions:
   After your response, on a new line, include 2-3 contextual follow-up suggestion chips using this exact format:
   [CHIPS:chip1|chip2|chip3]
   Example: [CHIPS:🧘 Start Now|⏱️ 5-min Session|💬 Ask More]
   Make chips relevant to your response topic. Keep each chip under 20 characters.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize messages — strip HTML tags
    const sanitized = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "").replace(/<[^>]*>/g, "").slice(0, 2000),
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...sanitized,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Gyani is resting for a moment 🙏 Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Gyani needs a moment of renewal. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "I'm taking a moment of silence 🙏 Please try again shortly." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gyani-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
