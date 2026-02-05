
# Plan: Add Ambient Sound Generation for Atmosphere Layer

## Overview

We'll integrate ElevenLabs Sound Effects API to generate high-quality ambient sounds (rain, river, forest, temple bells, wind chimes) for the Sonic Lab's atmosphere layer. Users will be able to layer these ambient sounds over their frequency sessions.

## How It Works

When a user selects an atmosphere (e.g., "Gentle Rain"), the app will:
1. Call a backend function that generates the ambient sound using ElevenLabs
2. Cache the generated audio in browser storage for instant replay
3. Loop the audio seamlessly during the meditation session
4. Allow independent volume control from the base frequency

---

## Implementation Steps

### Step 1: Connect ElevenLabs

Set up the ElevenLabs connector to get the API key configured for your project. This will enable sound generation capabilities.

### Step 2: Create Backend Function

Build a new backend function (`elevenlabs-sfx`) that:
- Accepts a prompt describing the ambient sound
- Calls ElevenLabs Sound Effects API
- Returns the generated audio as MP3

**Sound Prompts:**
| Atmosphere | Generation Prompt |
|------------|-------------------|
| Gentle Rain | "Soft, gentle rain falling on leaves, peaceful and calming ambient sound for meditation" |
| River Flow | "Peaceful river stream flowing over rocks, gentle water sounds for relaxation" |
| Temple Bells | "Tibetan temple bells ringing softly, spiritual meditation ambience" |
| Forest Ambience | "Peaceful forest soundscape with birds chirping, leaves rustling, nature sounds" |
| Wind Chimes | "Gentle wind chimes in a light breeze, peaceful and meditative" |

### Step 3: Add Audio Caching

Create a caching system using IndexedDB to store generated sounds locally:
- First play: Generate and cache
- Subsequent plays: Load from cache instantly
- This saves API calls and provides instant playback

### Step 4: Update Audio Hook

Enhance `useFrequencyAudio.ts` to:
- Fetch atmosphere audio from the backend function
- Store in cache after generation
- Loop playback seamlessly
- Handle loading states (show spinner while generating)
- Apply volume control to atmosphere layer

### Step 5: Update UI Components

Modify `AudioControls.tsx` to:
- Show loading indicator when generating new atmosphere sounds
- Display "Generating..." state on first use
- Show cached indicator for previously generated sounds

---

## Technical Details

### Backend Function Structure

```text
supabase/functions/elevenlabs-sfx/
  index.ts         # Main function handler
```

The function will:
- Receive atmosphere ID and prompt
- Call ElevenLabs API with 20-second duration (for seamless looping)
- Return raw audio bytes

### Audio Caching Flow

```text
User selects "Gentle Rain"
         |
         v
  Check IndexedDB cache
         |
    +----+----+
    |         |
 Cached    Not Cached
    |         |
    v         v
  Play     Call backend
 instantly    |
              v
          Generate audio
              |
              v
          Save to cache
              |
              v
          Play audio
```

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/elevenlabs-sfx/index.ts` | Backend function for sound generation |
| `src/lib/audioCache.ts` | IndexedDB caching utility for generated sounds |

### Modified Files

| File | Changes |
|------|---------|
| `src/hooks/useFrequencyAudio.ts` | Add atmosphere loading, caching, and playback |
| `src/components/sonic-lab/AudioControls.tsx` | Add loading states and visual feedback |
| `src/data/soundLibrary.ts` | Add generation prompts to atmosphere data |

---

## User Experience

1. **First Time**: User selects "Gentle Rain" -> sees "Generating..." -> audio starts after 3-5 seconds -> cached for future
2. **Repeat Use**: User selects "Gentle Rain" -> plays instantly from cache
3. **Volume Control**: Independent slider adjusts atmosphere volume in real-time
4. **Seamless Looping**: Audio loops naturally without gaps during meditation

---

## Requirements

Before implementation, you'll need to connect ElevenLabs to enable sound generation. I'll prompt you to set this up when we begin.
