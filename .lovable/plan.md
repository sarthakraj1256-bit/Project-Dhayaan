

# Global Language System — Full Hindi Localization Plan

## Problem Summary

The app currently has a partial translation system: the `translations.ts` file covers ~120 keys for major pages (Home, Nav, Auth, Profile, etc.), but many components still contain **hardcoded English strings** that bypass the `t()` function entirely. This means switching to Hindi leaves dozens of English words visible across the app.

## Scope of Hardcoded English (Audit Results)

The following areas have untranslated strings:

### 1. Data Files with English Labels
- **`src/data/soundLibrary.ts`** — Category names ("Refresh & Energy"), descriptions, frequency names ("Foundation"), purpose text ("Mental refresh"), atmosphere names ("Gentle Rain", "Temple Bells")
- **`src/data/templeStreams.ts`** — `categoryLabels`, `deityLabels`, `regionLabels` (e.g., "North India", "🕉️ Jyotirlinga"), temple descriptions, live features, aarti schedule names, spiritual content titles/durations
- **`src/data/mantraLibrary.ts`** — Mantra `meaning`, `purpose`, `whenToChant`, `mentalFocus`, `category` fields, difficulty labels in card context
- **`src/data/immersiveTemples.ts`** — `categoryLabels`, temple descriptions, features
- **`src/data/childrenCartoons.ts`** — Episode titles, descriptions, duration labels

### 2. Components with Hardcoded English
- **`TempleCard.tsx`** — "LIVE", "⭐ Featured", "+N more"
- **`TempleFilters.tsx`** — "Live Only", "Clear Filters", "Temple Category", "By Deity", "By Region", "🏛️ All Temples", "✨ All Deities", "🌏 All Regions"
- **`AudioControls.tsx`** — "Now Playing", "Saved", "Save", "Frequency", "Atmosphere", "Generating atmosphere…"
- **`SessionStats.tsx`** — "Total Time", "Sessions", "Avg Session", "Favorite", "Streak", "Best Streak", "day/days", "Sign in to track…", "No sessions yet", share text
- **`GoalsPanel.tsx`** — "Weekly Goal", "Monthly Goal", "Set Goal", "Saving...", "Custom", "% complete", "days left", "Sign in to set…", "Set Weekly/Monthly Goal"
- **`FrequencyCard.tsx`** — Frequency names/purposes from data
- **`CategorySection.tsx`** — Category names/descriptions from data
- **`DevoteeExperiences.tsx`** — "Devotee Experiences", "Share Your Experience", "Your Rating", "Your Name", "Submit Experience", "Recent Experiences", "Community Rating", footer text
- **`JapLeaderboard.tsx`** — "🏆 Jap Leaderboard", "chants", "No entries yet…"
- **`KarmaDisplay.tsx`** — "Karma Points", level names ("Novice", "Seeker"), "day streak"
- **`ImmersiveDarshan.tsx`** — "Temples" badge, "Search temples…", "All Temples", "Live", "No temples found…"
- **`TempleSchedule.tsx`**, **`FavoriteButton.tsx`**, **`FavoritesPanel.tsx`**, **`ShareButton.tsx`**, **`AartiReminderSettings.tsx`**, **`DarshanChatPanel.tsx`** — Various UI labels
- **`MantraCard.tsx`**, **`MantraLesson.tsx`**, **`SyllableBreakdown.tsx`** — Learning UI labels
- **`JapCounter.tsx`**, **`JapGoals.tsx`**, **`JapLedger.tsx`**, **`JapRequests.tsx`**, **`MantraBreakdown.tsx`**, **`MiniWeekCalendar.tsx`** — Jap Bank sub-component labels
- **`AchievementsPanel.tsx`**, **`SessionHistoryList.tsx`**, **`MeditationCalendar.tsx`** — Sonic Lab sub-component labels
- **Lakshya sub-components** — Game titles, garden labels, challenge/leaderboard text
- **`IntentTagSelector.tsx`**, **`FinalStressModal.tsx`**, **`StressCheckInModal.tsx`** — Review flow labels
- **PWA components** — Install prompt, offline indicator, splash screen text

### 3. Units & Metadata Needing Localization
- "mins", "min", "m", "h" → "मिनट", "घंटे"
- "day/days" → "दिन"
- "chants" → "जप"
- "episodes" → "एपिसोड"
- "parts" → "भाग"
- "Hz" stays numeric but surrounding labels must translate
- Duration formats ("20:00") — numeric, preserved

---

## Implementation Plan

### Phase 1: Expand Translation Keys (~250+ new keys)

**File: `src/i18n/translations.ts`**

Add translation keys for every hardcoded string identified above, organized by feature area:

- `sonic.totalTime`, `sonic.sessions`, `sonic.avgSession`, `sonic.favorite`, `sonic.streak`, `sonic.bestStreak`, `sonic.day`, `sonic.days`, `sonic.signInToTrack`, `sonic.noSessions`, `sonic.nowPlaying`, `sonic.saved`, `sonic.save`, `sonic.frequency`, `sonic.atmosphere`, `sonic.generatingAtmosphere`, `sonic.custom`, `sonic.weeklyGoal`, `sonic.monthlyGoal`, `sonic.setGoal`, `sonic.saving`, `sonic.complete`, `sonic.daysLeft`, `sonic.signInForGoals`, `sonic.shareJourney`
- `temple.live`, `temple.featured`, `temple.more`, `temple.liveOnly`, `temple.clearFilters`, `temple.category`, `temple.byDeity`, `temple.byRegion`, `temple.allTemples`, `temple.allDeities`, `temple.allRegions`
- `darshan.searchTemples` (immersive), `darshan.templesCount`
- `jap.leaderboard`, `jap.noEntries`
- `karma.points`, `karma.dayStreak`, level name keys
- `devotee.title`, `devotee.subtitle`, `devotee.shareExperience`, `devotee.yourRating`, `devotee.yourName`, `devotee.yourExperience`, `devotee.submit`, `devotee.submitting`, `devotee.recentExperiences`, `devotee.communityRating`, `devotee.experience`, `devotee.experiences`, `devotee.basedOn`
- Category/deity/region label keys for filters
- Sound library: category names, descriptions, atmosphere names
- Footer/brand text keys
- All remaining component-level strings

Each key will have both `en` and `hi` values with accurate Hindi translations.

### Phase 2: Localize Data Files

**Approach**: Instead of duplicating entire data files, create a translation layer. Data files keep English as keys/IDs, and a helper function provides localized display text.

**File: `src/data/soundLibrary.ts`**
- Add `nameKey` and `purposeKey` fields to `FrequencyItem` and `CategoryInfo`
- OR create a parallel translation map in `translations.ts` using category IDs as key prefixes (e.g., `sound.cat.refresh.name`, `sound.cat.refresh.desc`)
- Add atmosphere name keys

**File: `src/data/templeStreams.ts`**
- Convert `categoryLabels`, `deityLabels`, `regionLabels` to functions that accept language or use translation keys
- Temple names stay as-is (proper nouns), but descriptions and liveFeatures get keys

**File: `src/data/mantraLibrary.ts`**
- Add `meaningHi`, `purposeHi`, `whenToChantHi`, `mentalFocusHi` fields to each mantra
- OR use a translation map keyed by mantra ID

### Phase 3: Wire Components to `t()`

Update every component listed in the audit to:
1. Import `useLanguage`
2. Replace hardcoded strings with `t('key.name')`
3. For data-driven labels, use the localized getter functions

**Key components to update** (approximately 30+ files):
- `TempleCard.tsx`, `TempleFilters.tsx`
- `AudioControls.tsx`, `SessionStats.tsx`, `GoalsPanel.tsx`
- `FrequencyCard.tsx`, `CategorySection.tsx`
- `DevoteeExperiences.tsx`, `IntentTagSelector.tsx`, `FinalStressModal.tsx`
- `JapLeaderboard.tsx`, `JapCounter.tsx`, `JapGoals.tsx`, `JapLedger.tsx`, `JapRequests.tsx`, `MantraBreakdown.tsx`
- `KarmaDisplay.tsx`, `ChakraProgress.tsx`
- `MantraCard.tsx`, `MantraLesson.tsx`, `SyllableBreakdown.tsx`
- `ImmersiveDarshan.tsx` page
- `AchievementsPanel.tsx`, `SessionHistoryList.tsx`, `MeditationCalendar.tsx`
- `ShareButton.tsx`, `FavoritesPanel.tsx`
- PWA components
- All Lakshya game/garden components

### Phase 4: Unit & Metadata Localization

Create a utility helper:
```typescript
// src/i18n/units.ts
export function localizeUnit(value: number, unit: string, language: Language): string
```

This will handle:
- `5 mins` → `5 मिनट`
- `3 days` → `3 दिन`
- `12 episodes` → `12 एपिसोड`
- Singular/plural forms in both languages

### Phase 5: Date & Number Formatting

- Use `toLocaleDateString('hi-IN')` when Hindi is active (already done in JapBank for one case — extend everywhere)
- Ensure `toLocaleString()` uses appropriate locale

---

## Technical Details

- **No new dependencies needed** — the existing `LanguageContext` + `translations.ts` pattern is sufficient
- **Translation file will grow to ~600+ keys** (currently ~120 per language)
- **All changes are backward-compatible** — English keys serve as fallback
- **Performance**: The `t()` function is already memoized via `useCallback`; adding more keys has negligible impact
- **Data file approach**: Use translation key maps rather than duplicating data, keeping a single source of truth for non-text fields (URLs, IDs, numeric values)

---

## Execution Order

1. Expand `translations.ts` with all new keys (en + hi)
2. Create unit localization helper
3. Update data files to support bilingual labels
4. Update all 30+ component files to use `t()` calls
5. Verify zero English text appears in Hindi mode across every screen

