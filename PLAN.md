# Agent Profile Refactor — Remaining Work

## Type narrowing

- Replace `isAgentProfileComplete` with Zod validation in `src/lib/drafts.ts`
  using `drizzle-zod` derived from `agentProfiles`.
- `createAgentProfile` in `src/lib/matching/profile.ts` should accept a full
  `AgentProfile`-shaped input, not `AgentProfileUpdate`.

## Draft shape

- `AgentDraft = Partial<AgentProfile>` in `src/lib/drafts.ts`.
- Remove the manual `zipCodes`/`answers` extras from `AgentDraft`.
- `draftToAgentProfileUpdate` promotes DB columns from the draft.

## Rename `serviceAreas` → `zipCodes`

- Rename `serviceAreas` column to `zipCodes` in `src/db/tables.ts`.
- Update `src/lib/matching/scoring.ts` to use `agent.zipCodes`.
- Update `src/lib/matching/server.ts` to return `zipCodes: row.agent.zipCodes`.
- Update `src/routes/(app)/agent/dashboard/profile.tsx` input/label.
- Update `src/routes/(app)/agent/dashboard/index.tsx` references.
- Update `src/routes/(app)/agent/signup/-steps/intake-market.tsx` to save
  `zipCodes`.
- Update `src/routes/(app)/agent/signup/-steps/preview.tsx` references.
- Update `scripts/populate-db.ts` to seed `zipCodes`.

## UI updates

- `intake-market.tsx`: save selected ZIP codes into the `zipCodes` field.
- `preview.tsx`: accept a validated `AgentProfile` shape, not `AgentDraft`.

## Final validation

- `vp check`
- `vp test run --project unit`
- `drizzle-kit push` and reseed
