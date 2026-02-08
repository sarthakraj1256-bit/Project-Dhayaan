import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideoResponse {
  items?: {
    id: string;
    liveStreamingDetails?: {
      concurrentViewers?: string;
      activeLiveChatId?: string;
    };
    snippet?: {
      liveBroadcastContent?: string;
    };
  }[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'videoId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('[youtube-viewer-count] YOUTUBE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch video details including live streaming info
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'liveStreamingDetails,snippet');
    url.searchParams.set('id', videoId);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[youtube-viewer-count] YouTube API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch video data', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: YouTubeVideoResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ 
          viewerCount: null, 
          isLive: false,
          message: 'Video not found or not accessible' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const video = data.items[0];
    const isLive = video.snippet?.liveBroadcastContent === 'live';
    const concurrentViewers = video.liveStreamingDetails?.concurrentViewers;
    
    return new Response(
      JSON.stringify({
        videoId,
        viewerCount: concurrentViewers ? parseInt(concurrentViewers, 10) : null,
        isLive,
        hasActiveChat: !!video.liveStreamingDetails?.activeLiveChatId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[youtube-viewer-count] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
