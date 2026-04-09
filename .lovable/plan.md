

# Premium Animation Plan

A focused set of animations that add polish without visual noise. Everything uses CSS transforms/opacity for performance, respects `prefers-reduced-motion`, and stays under the 2-3 concurrent animation budget.

---

## What to include (and what to skip)

**Include:**
- Budget card hover lift + select glow pulse
- Radio option select ring pulse + checkmark scale-in
- Dashboard greeting fade+slide on load
- "Plan New Trip" button shimmer on hover
- Onboarding step transitions (fade-in-up, already partially there)
- Skeleton shimmer (already done)
- Success confirmation checkmark animation

**Skip (for now):**
- Fireworks/castle SVG — high complexity, low ROI for current stage; can revisit later
- Sparkle particle trails on greeting — risks distraction, hard to keep subtle in CSS-only
- Drag-and-drop interest reordering — feature change, not animation

---

## Changes by file

### 1. `src/index.css` — reduced-motion + new utility classes

- Add `@media (prefers-reduced-motion: reduce)` block that disables all custom animations
- Add `.hover-lift` utility: `translateY(-2px)` + shadow increase on hover (150ms ease-out)
- Add `.select-ring-pulse` utility: a 300ms ring animation for radio selections
- Add `.shimmer-button` utility: gradient shimmer sliding left-to-right on hover

### 2. `tailwind.config.ts` — new keyframes

- `ring-pulse`: border glow that expands and fades over 300ms (one-shot)
- `check-pop`: scale 0→1.15→1 over 180ms for checkmark reveals
- `slide-fade-in`: translateY(-6px)→0 + opacity 0→1 over 350ms (greeting)

### 3. `src/components/onboarding/BudgetAccommodationStep.tsx`

- Budget cards: add `hover:-translate-y-0.5 hover:shadow-lg` (subtle lift)
- Selected card: add a brief scale pulse on selection change using a local state + CSS class that triggers `animate-[check-pop_200ms_ease-out]`
- Radio options: on select, show a `Check` icon from Lucide that scales in with `animate-[check-pop_180ms_ease-out]` on the right edge
- Radio card: add `ring-2 ring-primary/0` → `ring-primary/40` transition on selection

### 4. `src/pages/Dashboard.tsx`

- Greeting: replace `animate-fade-in-up` with the new `slide-fade-in` (smoother, starts from -6px not -20px)
- "Plan New Trip" button: add `group` class and an inner `<span>` with the shimmer gradient that slides on `group-hover`
- Stat cards: stagger fade-in using `animation-delay` (0ms, 75ms, 150ms, 225ms) via inline style

### 5. `src/components/onboarding/InterestCard.tsx`

- Add `hover:-translate-y-0.5` for subtle lift
- On selection, add a brief scale animation: the priority badge fades+scales in with `animate-[check-pop_200ms]`

### 6. `src/components/ui/button.tsx`

- `premium` variant: add `overflow-hidden relative` and a `::after` pseudo-element shimmer that activates on hover (via the existing `.shimmer-button` utility or inline Tailwind)

### 7. Toast/feedback styling (minor)

- Success toasts: add a gold-tinted left border and subtle scale-in animation (already partially handled by sonner/radix)

---

## Technical details

- All animations use `transform` and `opacity` only — no layout reflows
- `prefers-reduced-motion: reduce` media query disables sparkle, shimmer, float, pulse-glow, spin-slow, and all new animations; provides static fallbacks
- New keyframes are one-shot (no infinite loops) except shimmer on hover (only active during interaction)
- Total new CSS: ~40 lines in index.css, ~15 lines in tailwind keyframes
- ~6 files modified

