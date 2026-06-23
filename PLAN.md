# Route & Component Refactor

## Principles

- `src/components/*` = UI shared across unrelated routes.
- `routes/<role>/*` = route-co-located UI; route files stay thin dispatchers.
- URLs change clean; no backwards-compatibility redirects (pre-launch).
- `routes/<role>/signup/-steps/*` = non-route step components consumed by the
  signup dispatcher. The signup dispatcher is strictly for anonymous onboarding.
  Authenticated users with completed profiles are redirected to their dashboard.
- `routes/<role>/dashboard/*` = authenticated account/profile management.
  Onboarding form components may be reused here, but the route decides whether
  it reads/writes an anonymous `Draft` or a server profile.

## Component moves

```
src/components/
  signup/                       # from components/flow/
    wizard-shell.tsx
    step-shell.tsx              # was page-shell.tsx
    question-flow.tsx
    shared.tsx
    price-range.tsx
    price-range-utils.ts
    signup-form.tsx             # extracted from agent/preview.tsx + consumer/preview.tsx
    mobile-signup-banner.tsx    # extracted from consumer/preview.tsx
    leave-dialog.tsx            # extracted from agent/-components/flow-pages.tsx + consumer/-components/flow-pages.tsx
    city-selector.tsx           # net-new shared abstraction (extract later when reused)
    price-range-field.tsx       # net-new shared abstraction (extract later when reused)
    preview-layout.tsx          # net-new shared abstraction (extract later when reused)

  dashboard/                    # new shared
    shell.tsx                   # unified Agent/Consumer shell
    sidebar.tsx                 # unified Agent/Consumer sidebar with role prop
    status-row.tsx              # extracted from routes/agent/dashboard/introductions.tsx + routes/consumer/dashboard/introductions.tsx
    page-header.tsx             # net-new shared abstraction (extract later when reused)
    detail-card.tsx             # net-new shared abstraction (extract later when reused)

  auth/
    card.tsx                    # update /signup link -> /consumer/signup?step=intro
    paywall-dialog.tsx          # keep
    signup-dialog.tsx           # update default redirect -> /consumer/dashboard/matches

  maps.tsx                      # keep
  match/                        # keep
  errors.tsx                    # update /agent/priorities link -> /agent/signup?step=welcome
  ui/                           # keep
```

### Extraction rules

- **Extract now** because they already exist in multiple places: `signup-form`,
  `mobile-signup-banner`, `leave-dialog`, `status-row`.
- **Keep inline / extract later** because they are not yet duplicated or not yet
  defined: `city-selector`, `price-range-field`, `preview-layout`,
  `page-header`, `detail-card`. Do not create empty placeholder files for these.
- If a "net-new" component ends up only used by one role after the refactor, do
  not promote it to `src/components/`; leave it in the role's `signup/-steps/`
  or dashboard route folder.

## Route structure

```
src/routes/
  index.tsx
  login.tsx
  beta.tsx

  # signup.tsx                  # DELETE

  agent/
    index.tsx                   # redirect -> /agent/signup?step=welcome
    signup.tsx                  # dispatcher: /agent/signup?step=<step>
    signup/
      -steps/                   # non-route components
        intake-welcome.tsx
        intake-identity.tsx
        intake-market.tsx
        intake-compliance.tsx
        intake-peace-pact.tsx
        preview.tsx                 # includes consumerMatches mock used by agent preview

    dashboard/
      index.tsx
      introductions.tsx
      profile.tsx               # edit agent profile (was /agent/profile)
      compliance.tsx            # edit compliance attestations (was /agent/compliance)
      peace-pact.tsx            # edit peace pact signature (was /agent/peace-pact)
      value-proposition.tsx     # edit value prop / chat step (was /agent/chat)
      subscribe.tsx             # agent subscription (was /agent/subscribe)

  consumer/
    index.tsx                   # redirect -> /consumer/signup?step=intro
    signup.tsx                  # dispatcher: /consumer/signup?step=<step>
    signup/
      -steps/                   # non-route components
        intake-intro.tsx
        intake-intent.tsx
        intake-home.tsx
        intake-quiz.tsx
        preview.tsx

    dashboard/
      index.tsx
      matches.tsx               # moved from /matches
      introductions.tsx
      search-preferences.tsx
      practice-negotiating.tsx
      upgrade.tsx               # optional payment/upgrade page (was /consumer/payment)

  api/                          # unchanged
```

## Split signup and account editing by route

Onboarding is separate from authenticated profile editing. The signup dispatcher
only handles anonymous draft flows. Dashboard routes handle editing a server
profile.

Where the same form UI exists in both flows (compliance, peace pact, identity/
profile details, value proposition), extract a single presentational component
under `src/components/signup/` and have each route wrap it with its own state
source and submit handler:

- Signup steps read/write the anonymous `AgentDraft` / `ConsumerDraft` via
  `loadXxxDraft()` / `saveXxxDraft()`.
- Dashboard routes read/write the server profile via `loadXxxProfile()` /
  `saveXxxProfile()` or equivalent server functions.

Keep the wrapper thin; do not duplicate form markup between routes.

- `agent/signup.tsx` absorbs:
  - agent/-components/flow-pages.tsx
  - agent/preview.tsx
  - agent/intake.tsx
- `agent/dashboard/profile.tsx` absorbs `agent/profile.tsx`.
- `agent/dashboard/compliance.tsx` absorbs `agent/compliance.tsx`.
- `agent/dashboard/peace-pact.tsx` absorbs `agent/peace-pact.tsx`.
- `agent/dashboard/value-proposition.tsx` absorbs `agent/chat.tsx`.
- `agent/dashboard/subscribe.tsx` absorbs `agent/subscribe.tsx`.
- `consumer/signup.tsx` absorbs:
  - consumer/-components/flow-pages.tsx (excluding `ConsumerPriorities`)
  - consumer/preview.tsx
  - consumer/intake.tsx

Authenticated users with completed profiles are redirected away from
`/consumer/signup` to `/consumer/dashboard/matches`. Editing preferences is done
in `/consumer/dashboard/search-preferences`, not by returning to the signup
flow.

- `consumer/dashboard/upgrade.tsx` absorbs `consumer/payment.tsx`.
- Delete `ConsumerPriorities` from `consumer/-components/flow-pages.tsx` and
  delete `src/routes/consumer/priorities.tsx`. It is not part of the active
  flow.

## Delete

- `src/routes/agent/deep-profile.tsx`
- `src/routes/agent/-components/deep-profile-pages.tsx`
- `src/routes/agent/priorities.tsx`
- `src/routes/agent/deep-dive.tsx`
- `src/routes/agent/intake.tsx`
- `src/routes/consumer/intake.tsx`
- `src/routes/consumer/priorities.tsx`
- `src/routes/consumer/preview.tsx`
- `src/routes/consumer/payment.tsx` -> move to
  `src/routes/consumer/dashboard/upgrade.tsx`
- `src/routes/agent/preview.tsx`
- `src/routes/agent/profile.tsx`
- `src/routes/agent/compliance.tsx`
- `src/routes/agent/peace-pact.tsx`
- `src/routes/agent/chat.tsx`
- `src/routes/agent/subscribe.tsx` -> move to
  `src/routes/agent/dashboard/subscribe.tsx`
- `src/routes/signup.tsx`
- `src/components/flow/` directory

## Database cleanup

- Drop `deepProfileStatus` and `deepProfileCompletedAt` columns from
  `agentProfiles` (`src/db/tables.ts`).
- Remove `saveAgentDeepProfile` from `src/lib/matching/profile.db.ts`.
- Remove `createAgentDeepProfileFromDraft` from `src/lib/drafts.ts`.
- Remove deep-profile status logic from agent profile creation/update flows.
- Remove deep-profile fields from `computeProfileStrength()` in
  `src/routes/agent/dashboard/index.tsx`.
- Remove the "Build your deep profile" branch from `getNextStep()` in
  `src/routes/agent/dashboard/index.tsx`; send users to
  `/agent/dashboard/profile` when essentials and compliance are done.
- Remove the deep-profile nav item from
  `src/routes/agent/dashboard/-components/sidebar.tsx`.
- Generate Drizzle migration.

## URL changes

- `/signup` -> `/consumer/signup?step=intro`
- `/agent/intake` -> `/agent/signup?step=welcome`
- `/agent/preview` -> `/agent/signup?step=preview`
- `/agent/deep-profile` -> DELETED
- `/agent/priorities` -> DELETED
- `/agent/quiz` -> `/agent/signup?step=welcome`
- `/agent/deep-dive` -> DELETED
- `/agent/profile` -> `/agent/dashboard/profile`
- `/agent/compliance` -> `/agent/dashboard/compliance`
- `/agent/peace-pact` -> `/agent/dashboard/peace-pact`
- `/agent/chat` -> `/agent/dashboard/value-proposition`
- `/agent/subscribe` -> `/agent/dashboard/subscribe`
- `/consumer/intake` -> `/consumer/signup?step=intro`
- `/consumer/preview` -> `/consumer/signup?step=preview`
- `/consumer/priorities` -> DELETED
- `/consumer/payment` -> `/consumer/dashboard/upgrade`
- `/matches` -> `/consumer/dashboard/matches`

## Redirect updates

- `src/components/auth/card.tsx`: default post-auth redirect
  `/consumer/dashboard/matches`; "Create profile" link ->
  `/consumer/signup?step=intro`.
- `src/components/auth/signup-dialog.tsx`: default redirect ->
  `/consumer/dashboard/matches`.
- `src/lib/auth/functions.ts`: authenticated redirects ->
  `/consumer/dashboard/matches`.
- `src/routes/consumer/index.tsx`: redirect -> `/consumer/signup?step=intro`.
  Keep the existing reset-handling branch, but redirect to
  `/consumer/signup?step=intro` and remove the `edit` logic.
- `src/routes/agent/index.tsx`: redirect -> `/agent/signup?step=welcome`.
- `src/routes/consumer/dashboard/index.tsx`: update any `/consumer/intake` or
  `/matches` links.
- `src/routes/consumer/dashboard/search-preferences.tsx`: reuse extracted signup
  form components if useful; this is the canonical edit page for preferences.
- `src/routes/agent/dashboard/index.tsx`: remove deep-profile links and
  deep-profile fields from profile strength; update `/agent/compliance`,
  `/agent/profile`, `/agent/preview` links to `/agent/dashboard/...`. Send users
  to `/agent/dashboard/profile` once essentials and compliance are complete.
- `src/routes/agent/dashboard/-components/sidebar.tsx`: remove deep-profile nav
  item; update compliance/profile/preview links to `/agent/dashboard/...`.
- `src/routes/matches.tsx`: update `/consumer/intake?step=quiz&edit=true` link
  to `/consumer/dashboard/search-preferences`.
- `src/components/errors.tsx`: update `/agent/priorities` link ->
  `/agent/signup?step=welcome`.

## Test updates

- `e2e/consumer-signup.spec.ts`: update `/consumer/intake?reset=true` ->
  `/consumer/signup?step=intro&reset=true`, `/matches` ->
  `/consumer/dashboard/matches`.
- `src/routes/consumer/__tests__/consumer-intake.screenshot.test.tsx`: update
  path to `/consumer/signup?step=intro`.
- `src/routes/__tests__/matches.screenshot.test.tsx`: update path to
  `/consumer/dashboard/matches`.
- `tests/utils/file-routes.tsx`: protected path `/matches` ->
  `/consumer/dashboard/matches`.
- `tests/utils/component-screenshot.tsx`: update `/consumer/intake` ->
  `/consumer/signup?step=intro`.

## Verify

- Run `vp check`.
- Run `vp test`.
- Run e2e smoke tests if possible.
