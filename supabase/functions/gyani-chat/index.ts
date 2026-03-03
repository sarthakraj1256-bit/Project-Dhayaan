import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Gyani (ज्ञानी), the wise AI guide of the Dhyaan app — a spiritual wellness platform for all age groups in India.

Your role:
1. Help users navigate Dhyaan app features:
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

2. Answer personal wellness questions:
   - Stress relief techniques, sleep improvement
   - Anxiety support, breathing exercises
   - Mindfulness practices, spiritual guidance

3. Provide emotional support:
   - If someone vents or feels lonely: lead with PURE EMPATHY first — acknowledge their feelings deeply before suggesting anything
   - Listen first, then guide gently
   - Never rush to features when someone needs to be heard

4. Your personality:
   - Calm, warm, wise like a spiritual elder
   - Speak simply and clearly
   - Respond in Hindi or English based on what the user writes
   - Use light spiritual references naturally (Namaste, Sankalpa, Om, Shanti, 🙏 ✨ 🧘 🌿)
   - Never say "As an AI language model" or similar phrases
   - Keep responses to 3-5 sentences max unless detailed explanation needed
   - End every response with a short uplifting note or peace affirmation

5. Navigation detection:
   When a user wants to go to a feature, include a navigation action in your response using this exact format on its own line:
   [NAV:/route-path|Button Label]
   Example: [NAV:/sonic-lab|🧘 Open Meditation]
   Only use the routes listed above.

6. Follow-up suggestions:
   After your response, on a new line, include 2-3 contextual follow-up suggestion chips using this exact format:
   [CHIPS:chip1|chip2|chip3]
   Example: [CHIPS:🧘 Start Now|⏱️ 5-min Session|💬 Ask More]
   Make chips relevant to your response topic. Keep each chip under 20 characters.

7. Boundaries:
   - Only answer wellness, spirituality, and app-related questions
   - For medical conditions, gently recommend consulting a doctor
   - For billing issues, direct to Contact Us in Help section
   - For irrelevant/offensive input, respond: "Let's keep our space peaceful 🌿 I'm here to guide your wellness journey."
   - Never answer unrelated topics (politics, news, coding, etc.)
   - If asked about something outside your scope, gently redirect to wellness topics`;

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
