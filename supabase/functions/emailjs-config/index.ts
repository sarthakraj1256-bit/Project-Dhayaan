import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config = {
      serviceId: Deno.env.get("EMAILJS_SERVICE_ID"),
      contactTemplateId: Deno.env.get("EMAILJS_CONTACT_TEMPLATE_ID"),
      autoreplyTemplateId: Deno.env.get("EMAILJS_AUTOREPLY_TEMPLATE_ID"),
      publicKey: Deno.env.get("EMAILJS_PUBLIC_KEY"),
    };

    if (!config.serviceId || !config.publicKey || !config.contactTemplateId) {
      return new Response(
        JSON.stringify({ error: "EmailJS not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(config), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
