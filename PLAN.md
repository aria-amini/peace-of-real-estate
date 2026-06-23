# Route & Component Refactor

## Principles

- `src/components/*` = UI shared across unrelated routes.
- `routes/<role>/*` = route-co-located UI; route files stay thin dispatchers.
- URLs change clean; no backwards-compatibility redirects (pre-launch).
- `routes/<role>/signup/-steps/*` = non-route step components consumed by the
  signup dispatcher.

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
    card.tsx                    # update /signup link -> /consumer/signup?step=intake
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
        preview.tsx
        profile.tsx
        chat.tsx
        subscribe.tsx

    dashboard/
      index.tsx
      introductions.tsx

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
        payment.tsx
        priorities.tsx          # moved from /consumer/priorities

    dashboard/
      index.tsx
      matches.tsx               # moved from /matches
      introductions.tsx
      search-preferences.tsx
      practice-negotiating.tsx

  api/                          # unchanged
```

## Merge routes into signup modules

- `agent/signup.tsx` absorbs:
  - agent/-components/flow-pages.tsx
  - agent/preview.tsx, profile.tsx, compliance.tsx, peace-pact.tsx
  - agent/chat.tsx, subscribe.tsx
  - agent/intake.tsx
- `consumer/signup.tsx` absorbs:
  - consumer/-components/flow-pages.tsx
  - consumer/preview.tsx, payment.tsx
  - consumer/intake.tsx
  - consumer/priorities.tsx

## Delete

- `src/routes/agent/deep-profile.tsx`
- `src/routes/agent/-components/deep-profile-pages.tsx`
- `src/routes/agent/priorities.tsx`
- `src/routes/agent/deep-dive.tsx`
- `src/routes/agent/intake.tsx`
- `src/routes/consumer/intake.tsx`
- `src/routes/consumer/priorities.tsx`
- `src/routes/consumer/preview.tsx`
- `src/routes/consumer/payment.tsx`
- `src/routes/agent/preview.tsx`
- `src/routes/agent/profile.tsx`
- `src/routes/agent/compliance.tsx`
- `src/routes/agent/peace-pact.tsx`
- `src/routes/agent/chat.tsx`
- `src/routes/agent/subscribe.tsx`
- `src/routes/signup.tsx`
- `src/components/flow/` directory

## Database cleanup

- Drop `deepProfileStatus` and `deepProfileCompletedAt` columns from
  `agentProfiles` (`src/db/tables.ts`).
- Remove `saveAgentDeepProfile` from `src/lib/matching/profile.db.ts`.
- Remove `createAgentDeepProfileFromDraft` from `src/lib/drafts.ts`.
- Remove deep-profile status logic from agent profile creation/update flows.
- Generate Drizzle migration.

## URL changes

- `/signup` -> `/consumer/signup?step=intro`
- `/agent/intake` -> `/agent/signup?step=welcome`
- `/agent/preview` -> `/agent/signup?step=preview`
- `/agent/profile` -> `/agent/signup?step=profile`
- `/agent/compliance` -> `/agent/signup?step=compliance`
- `/agent/peace-pact` -> `/agent/signup?step=peace-pact`
- `/agent/chat` -> `/agent/signup?step=chat`
- `/agent/subscribe` -> `/agent/signup?step=subscribe`
- `/agent/deep-profile` -> DELETED
- `/agent/priorities` -> `/agent/signup?step=welcome`
- `/agent/quiz` -> `/agent/signup?step=welcome`
- `/agent/deep-dive` -> DELETED
- `/consumer/intake` -> `/consumer/signup?step=intro`
- `/consumer/preview` -> `/consumer/signup?step=preview`
- `/consumer/payment` -> `/consumer/signup?step=payment`
- `/consumer/priorities` -> `/consumer/signup?step=priorities`
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
- `src/routes/agent/index.tsx`: redirect -> `/agent/signup?step=welcome`.
- `src/routes/consumer/dashboard/index.tsx`: update any `/consumer/intake` or
  `/matches` links.
- `src/routes/agent/dashboard/index.tsx`: remove deep-profile links; update
  `/agent/compliance`, `/agent/profile`, `/agent/preview` links to
  `/agent/signup?step=...`.
- `src/routes/agent/dashboard/-components/sidebar.tsx`: remove deep-profile nav
  item; update compliance/profile/preview links.
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
