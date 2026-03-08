

## Plan: Remove Gyani AI

Remove the Gyani AI chat widget from the app. This involves three small changes:

### Changes

1. **`src/pages/Index.tsx`** — Remove the `GyaniChat` import and its `<GyaniChat />` usage (lines 7, 71-72).

2. **`supabase/config.toml`** — Remove the `[functions.gyani-chat]` config block (lines 7-8).

3. **Optionally leave alone**: `src/components/gyani/GyaniChat.tsx`, `supabase/functions/gyani-chat/index.ts`, and translation keys — these become dead code but cause no harm. Can be deleted for cleanliness if preferred.

That's it — two file edits to fully remove the floating Gyani button and chat from the app.

