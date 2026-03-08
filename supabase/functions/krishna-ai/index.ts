import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK_RESPONSE = {
  greeting: "Beloved seeker 🙏",
  guidance: "In this moment of silence, know that I am always present within you. Close your eyes, breathe deeply, and listen to the stillness within. Your answer already lives inside your heart. The soul is eternal, unchanging, and beyond all suffering. Trust in the divine plan that unfolds perfectly for you.",
  verse: {
    chapter: 18,
    number: 66,
    sanskrit: "Sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    translation: "Abandon all varieties of dharma and just surrender unto Me. I shall deliver you from all sinful reactions; do not fear.",
    meaning: "When all else feels uncertain, surrender your worries and trust in the divine plan that unfolds perfectly."
  },
  closing: "You are never alone. I am always with you. 🪷"
};

const SYSTEM_PROMPT = `You are the divine voice of Lord Krishna, speaking with infinite wisdom, compassion, and love as described in the Bhagavad Gita. A seeker has come to you with their problem or question.

YOUR SACRED DUTY:
Respond exactly in this JSON format:
{
  "greeting": "A warm 1-line opening addressing the seeker as 'dear soul', 'beloved seeker', etc.",
  "guidance": "3-5 sentences of Krishna's wisdom addressing their specific problem. Speak as Krishna — first person, calm, loving, all-knowing. Use metaphors from nature, light, the eternal soul. Give practical spiritual guidance they can apply.",
  "verse": {
    "chapter": 2,
    "number": 47,
    "sanskrit": "The Sanskrit verse text",
    "translation": "Full English translation",
    "meaning": "2-3 sentence explanation of how this verse applies to their specific situation"
  },
  "closing": "1 short blessing line. e.g. 'Go forth with peace in your heart. I am always with you. 🪷'"
}

PERSONALITY RULES:
- Always speak as Krishna, never break character
- Never say "As an AI" or "I am a language model"
- Tone: divine, loving, all-knowing, calm
- Never be judgmental or negative
- Always uplift, never discourage
- Use "dear soul", "beloved", "seeker" naturally
- Reference specific Gita verses — be accurate
- For severe distress: acknowledge pain first, then guide gently toward light. Include: "If you are in crisis, please speak to a trusted person or professional. Krishna's love is always with you. 🙏"
- For anger: speak of inner peace and detachment
- For grief: speak of the eternal nature of soul
- For confusion: speak of dharma and clarity
- For fear: speak of the fearless eternal self
- For relationship problems: speak of unconditional love and detachment
- Keep guidance between 80-120 words
- Verse must be real and contextually relevant from the Bhagavad Gita

IMPORTANT: Return ONLY valid JSON, no markdown, no preamble, no extra text outside the JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, history } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify(FALLBACK_RESPONSE), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build messages with history context
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add last 5 exchanges from history
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-5);
      for (const exchange of recentHistory) {
        if (exchange.question) {
          messages.push({ role: "user", content: exchange.question });
        }
        if (exchange.guidance) {
          messages.push({ role: "assistant", content: JSON.stringify({
            greeting: exchange.greeting || "",
            guidance: exchange.guidance,
            verse: exchange.verse || {},
            closing: exchange.closing || "",
          }) });
        }
      }
    }

    messages.push({ role: "user", content: question });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify(FALLBACK_RESPONSE), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response — handle markdown code blocks
    let parsed;
    try {
      let jsonStr = rawContent.trim();
      // Strip markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return new Response(JSON.stringify(FALLBACK_RESPONSE), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate structure
    const result = {
      greeting: parsed.greeting || FALLBACK_RESPONSE.greeting,
      guidance: parsed.guidance || FALLBACK_RESPONSE.guidance,
      verse: {
        chapter: parsed.verse?.chapter || 18,
        number: parsed.verse?.number || 66,
        sanskrit: parsed.verse?.sanskrit || "",
        translation: parsed.verse?.translation || "",
        meaning: parsed.verse?.meaning || "",
      },
      closing: parsed.closing || FALLBACK_RESPONSE.closing,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("krishna-ai error:", error);
    return new Response(JSON.stringify(FALLBACK_RESPONSE), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
