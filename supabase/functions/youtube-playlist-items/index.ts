import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
  position: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let playlistId = url.searchParams.get("playlistId");

    // Also support POST body
    if (!playlistId && req.method === "POST") {
      try {
        const body = await req.json();
        playlistId = body.playlistId || null;
      } catch { /* ignore parse errors */ }
    }

    if (!playlistId) {
      return new Response(JSON.stringify({ error: "playlistId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allItems: PlaylistItem[] = [];
    let nextPageToken: string | null = null;

    do {
      const params = new URLSearchParams({
        part: "snippet",
        playlistId,
        maxResults: "50",
        key: apiKey,
      });
      if (nextPageToken) params.set("pageToken", nextPageToken);

      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`YouTube API error (${response.status}):`, errorBody);
        return new Response(JSON.stringify({ error: "YouTube API error", status: response.status }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();

      if (data.items) {
        for (const item of data.items) {
          const snippet = item.snippet;
          // Skip deleted/private videos
          if (snippet.title === "Deleted video" || snippet.title === "Private video") continue;

          const videoId = snippet.resourceId?.videoId;
          if (!videoId) continue;

          // De-duplicate by videoId
          if (allItems.some((v) => v.videoId === videoId)) continue;

          allItems.push({
            id: item.id,
            title: snippet.title,
            thumbnail:
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url ||
              snippet.thumbnails?.default?.url ||
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            videoId,
            position: snippet.position,
          });
        }
      }

      nextPageToken = data.nextPageToken || null;

      // Small delay to avoid rate limits
      if (nextPageToken) {
        await new Promise((r) => setTimeout(r, 150));
      }
    } while (nextPageToken);

    // Sort by position
    allItems.sort((a, b) => a.position - b.position);

    console.log(`Fetched ${allItems.length} videos for playlist ${playlistId}`);

    return new Response(JSON.stringify({ items: allItems, total: allItems.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
