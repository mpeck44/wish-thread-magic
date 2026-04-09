

# Premium UI Overhaul Plan

This is a large visual upgrade touching every page and the core design system. The work breaks into 6 phases.

---

## Phase 1: Design System Foundation

**Files**: `src/index.css`, `tailwind.config.ts`, `index.html`

- **Color palette**: Replace current purple primary with royal purple (`#4A148C` → HSL `270 80% 18%`), add warm gold accent (`#D4AF37` → HSL `43 62% 52%`), vibrant blue secondary (`#1E88E5` → HSL `210 78% 51%`)
- **Typography**: Import Poppins (headings) + Inter (body) via Google Fonts in `index.html`. Add `fontFamily` entries in Tailwind config. Increase base body size to 16px, add `letterSpacing` utilities for headings
- **New CSS custom properties**: `--gold`, `--glow-gold`, `--glow-purple` for reusable glow/shadow effects
- **Sparkle background**: Add a subtle CSS starfield/sparkle pattern as a utility class (pure CSS radial gradients, no images)
- **Enhanced shadows**: Card shadow with purple tint, gold glow for selected/premium elements

## Phase 2: Core UI Component Upgrades

**Files**: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/progress.tsx`, `src/components/ui/skeleton.tsx`

- **Button**: Add hover scale+shadow transitions, gradient variants, gold "premium" variant
- **Card**: Increase padding ~20-30%, add subtle gradient backgrounds, refined border with slight glow on hover, ensure `border-radius` uses the updated `--radius`
- **Badge**: Create pill-shaped variant with gradient backgrounds and small icon support
- **Progress**: Style with gradient fill (purple to gold), add subtle shimmer animation
- **Skeleton**: Add shimmer/sparkle animation instead of plain pulse

## Phase 3: Dashboard Premium Redesign

**File**: `src/pages/Dashboard.tsx`

- **Hero section**: Personalized greeting with animation on load ("Welcome back, {name}! Ready to plan your magical getaway?"), subtle sparkle background
- **Stat cards**: Add themed icons (compass, fireworks, wand, ticket — all from Lucide), hover glow effects, gradient icon backgrounds
- **Family member cards**: Refined with more padding, gradient avatar backgrounds, hover elevation
- **Interest tags**: Pill-shaped with small thematic icons, gradient on "must-do" tags
- **Trip cards**: Add status badges (planning/completed), progress indicator, hover border glow
- **Empty states**: Appealing illustrations using abstract magical iconography with CTAs
- **Menu items**: Add icons, hover animations, active state indicators
- **Remove**: Any debug/placeholder text

## Phase 4: Auth Page Polish

**File**: `src/pages/Auth.tsx`

- Update to use new color system with royal purple gradient background
- Add subtle sparkle/star pattern behind the form
- Gold accent on primary CTA button
- Smooth fade-in animation on load

## Phase 5: Onboarding & Trip Planning Polish

**Files**: `src/pages/ProfileOnboarding.tsx`, `src/pages/TripPlanning.tsx`, `src/components/onboarding/BudgetAccommodationStep.tsx`, `src/components/onboarding/InterestsStep.tsx`, `src/components/onboarding/InterestCard.tsx`, `src/components/onboarding/ThemeDaysStep.tsx`, `src/components/onboarding/TripVisionStep.tsx`, `src/components/onboarding/FinalReviewStep.tsx`

- **Budget selection**: Gold glow border on "Luxury" tier, abstract crown icon, smooth transition animations between tiers
- **Interest cards**: Hover scale+shadow micro-animations, gradient backgrounds on selected state
- **Progress bar**: Gradient fill with shimmer
- **All step transitions**: Add fade-in-up animations
- **Replace hardcoded colors** (e.g. `text-purple-900`, `bg-purple-100` in TripPlanning) with design system tokens

## Phase 6: Loading & Feedback States

**Files**: Various pages + possibly a new `src/components/ui/magical-loader.tsx`

- **Loading animation**: Create a reusable sparkle/swirl loader component using CSS animations (rotating stars, pulsing glow)
- **Skeleton screens**: Use shimmer variant everywhere data loads
- **Success toasts**: Style with gold accent and subtle animation
- **Error states**: Maintain premium feel with softer destructive colors

---

## Technical Details

- All new colors in HSL format in CSS custom properties
- Google Fonts loaded via `<link>` in `index.html` (Poppins 600/700, Inter 400/500)
- Tailwind `fontFamily` extended: `heading: ['Poppins', 'sans-serif']`, `body: ['Inter', 'sans-serif']`
- New Tailwind keyframes: `sparkle`, `glow-pulse`, `shimmer-sweep`
- Hover effects via Tailwind `transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`
- No external animation libraries needed — pure CSS/Tailwind
- Approximately 12-15 files modified

