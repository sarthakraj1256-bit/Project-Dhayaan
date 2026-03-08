import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Checks whether YouTube channels are currently live-streaming.
 * Accepts POST { urls: string[] } where each URL is a YouTube /live link.
 * Returns { results: Record<string, { isLive: boolean; videoId?: string }> }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json() as { urls: string[] };
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit to 20 URLs per request
    const limited = urls.slice(0, 20);

    const results: Record<string, { isLive: boolean; videoId?: string }> = {};

    await Promise.all(
      limited.map(async (url) => {
        try {
          // Fetch the /live page — YouTube will either show a live video page
          // or redirect/show the channel page if not live
          const resp = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html",
              "Accept-Language": "en-US,en;q=0.9",
            },
            redirect: "follow",
          });

          const html = await resp.text();

          // Check for live indicators in the HTML
          const isLive =
            html.includes('"isLive":true') ||
            html.includes('"isLiveBroadcast":true') ||
            html.includes('"style":"LIVE"') ||
            html.includes('"liveBadge"');

          // Try to extract the video ID
          let videoId: string | undefined;
          const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (videoIdMatch) {
            videoId = videoIdMatch[1];
          }

          results[url] = { isLive, videoId };
        } catch {
          results[url] = { isLive: false };
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
