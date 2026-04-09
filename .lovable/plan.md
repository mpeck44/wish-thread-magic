
Goal: after the family step, the user should go to `/trip-planning`, not bounce back to the first onboarding question.

What I found:
- The save itself is working: the family creation RPC succeeds and `profile_complete` is being set to `true`.
- The loop is happening after that.
- The biggest bug is in `src/pages/TripPlanning.tsx`: it fetches the family with `maybeSingle()` for the current profile. Your user already has multiple family rows, so that lookup becomes invalid and the code redirects back to `/profile-onboarding`.
- There are also stale onboarding references (`/onboarding`) and a service worker caching old route shells, which can make old redirect behavior persist.

Implementation plan:
1. Send onboarding to the correct page
   - Update `src/pages/ProfileOnboarding.tsx` so successful completion navigates to `/trip-planning?firstTime=true&familyId=<returnedFamilyId>` instead of `/`.

2. Make trip planning handle multiple families safely
   - Update `src/pages/TripPlanning.tsx` to:
     - use `familyId` from the URL when present
     - otherwise fetch the newest family with ordering + `limit(1)`
     - only redirect to onboarding if no family exists at all
   - Remove the brittle “all rows + maybeSingle” behavior.

3. Prevent repeat onboarding from creating more duplicate families
   - In `ProfileOnboarding.tsx`, check whether the user already has a family.
   - Reuse/update the latest family instead of always creating a brand new one.
   - If needed, add a small backend RPC to replace members atomically so this remains reliable with RLS.

4. Separate first-time onboarding from profile editing
   - Keep `/profile-onboarding` for first-time completion.
   - Use something like `/profile-onboarding?mode=edit` for later edits.
   - Update dashboard/profile links that still point to old onboarding paths.

5. Clear stale cache behavior
   - Update `public/sw.js` to stop pinning old HTML route responses and bump the cache version.
   - Remove old `/onboarding` cache entries so users get the latest navigation logic.

Technical details:
- I would not auto-delete old family rows in this fix.
- Safer approach:
  - always route with the returned/newest `familyId`
  - stop creating new duplicates going forward
- Files likely involved:
  - `src/pages/ProfileOnboarding.tsx`
  - `src/pages/TripPlanning.tsx`
  - `src/pages/Dashboard.tsx`
  - `public/sw.js`
  - possibly one backend migration for an upsert/replace-family-members RPC

Verification:
- Complete onboarding with a new user and confirm Continue lands on `/trip-planning`.
- Re-test with a user who already has multiple family rows and confirm it no longer bounces back to onboarding.
- Refresh after completion to confirm cache no longer restores the old route behavior.
