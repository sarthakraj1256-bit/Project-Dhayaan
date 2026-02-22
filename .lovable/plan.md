
# Global UI Size & Scale Consistency Fix

## Overview
Standardize all UI element sizes across every page of the Dhyaan app to eliminate visual inconsistencies and achieve a premium, polished feel.

## Current Issues Found

| Element | Current State | Problem |
|---------|--------------|---------|
| Header height | Varies per page (py-3 to pt-10) | Feels different on every screen |
| Header titles | text-base to text-3xl | No consistent hierarchy |
| Back arrow icons | Mix of w-4/w-5 | Subtle size mismatch |
| Action buttons | Different padding, radius, sizes | Fat vs thin buttons |
| Cards | rounded-lg, rounded-xl, rounded-2xl mixed | Inconsistent corners |
| Card padding | p-4, p-5, p-6, p-8 | Thickness varies |
| Section spacing | Random gaps between sections | No rhythm |

## Design Tokens (The Ruleset)

### 1. Header Standard
- All pages: `sticky top-0 z-40 px-4 py-3` with blur background
- Height fixed at h-14 (56px) across all screens
- Title: `text-lg font-display tracking-wider` (uniform)
- Back icon: always `w-5 h-5`

### 2. Icon Sizes
- Header/nav primary icons: `w-5 h-5` (20px) -- uniform everywhere
- Small inline icons (badges, labels): `w-4 h-4` (16px)
- Feature card icons (decorative): `w-6 h-6` inside `w-12 h-12` containers
- Bottom nav: `w-5 h-5` (already correct)

### 3. Action Buttons
- Icon-only header buttons: `w-9 h-9 rounded-full` (uniform)
- Small pill buttons: `px-3 py-1.5 rounded-full text-sm`
- Standard buttons: use shadcn Button with `size="sm"` or `size="default"`

### 4. Text Scale
- Page title: `text-lg` (header bar)
- Section title: `text-lg font-display`
- Subtitle/description: `text-sm text-muted-foreground`
- Body: `text-sm` or `text-base`
- Micro labels: `text-xs`

### 5. Cards & Containers
- Standard radius: `rounded-xl` everywhere
- Standard padding: `p-4` (mobile), `p-5` (tablet), `p-6` (desktop) via `p-4 sm:p-5 md:p-6`
- Border: `border border-white/10` or `border border-border/30`

### 6. Spacing Scale
- Small gap: `gap-2` / `mb-2` (8px)
- Medium gap: `gap-4` / `mb-4` (16px)
- Large gap: `gap-6` / `mb-6` (24px)
- Section gap: `gap-8` / `mb-8` (32px)

## Files to Modify

### Pages (header + layout standardization)
1. **src/pages/SonicLab.tsx** -- Standardize header to h-14, px-4 py-3, title text-lg, icons w-5
2. **src/pages/LiveDarshan.tsx** -- Standardize header height, remove text-2xl/3xl title, use text-lg
3. **src/pages/Lakshya.tsx** -- Add sticky header bar matching standard (currently non-sticky div)
4. **src/pages/JapBank.tsx** -- Fix header from pt-10 pb-4 to standard h-14, standardize title size
5. **src/pages/Mantrochar.tsx** -- Already close; just normalize py-4 to py-3, verify icon sizes
6. **src/pages/ChildrenCartoons.tsx** -- Already close; standardize title text-base to text-lg
7. **src/pages/ImmersiveDarshan.tsx** -- Standardize header to match pattern
8. **src/pages/Profile.tsx** -- Add sticky header bar instead of loose back button
9. **src/pages/Dashboard.tsx** -- Check and standardize

### Components
10. **src/components/BottomNav.tsx** -- Already consistent, no changes needed
11. **src/index.css** -- Add utility classes for the design tokens (optional helper classes)

## Implementation Approach
- Work page by page, applying the same header template
- Standardize all card containers to rounded-xl with consistent padding
- Normalize icon sizes to w-5 h-5 for primary, w-4 h-4 for secondary
- Use the spacing scale (gap-2, gap-4, gap-6, gap-8) consistently
- Ensure all action buttons in headers follow the same size pattern

## Expected Result
- Every page header looks and feels identical
- Icons are perfectly uniform across the app
- Cards have the same visual weight
- Clean visual rhythm from consistent spacing
- Premium, professional feel throughout
