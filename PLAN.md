# Refactor Plan

## LSP-first workflow

For every rename/move/delete, use the TypeScript language server before making
edits:

1. `lsp findReferences` on the old symbol to confirm every call site.
2. `lsp workspaceSymbol` or `lsp documentSymbol` to confirm no shadowing names.
3. Apply mechanical renames with `lsp` rename where possible; only hand-edit
   files that the LSP cannot rewrite (route configs, plain `.ts` with no active
   server, etc.).
4. Run `vp check` and `vp test run --project unit` after each batch.

---

## 1. Replace `getDb()` with a module-level `db` export

**Goal:** delete `getDb()` and export `db` directly from `src/db/connection.ts`.

**LSP steps:**

- `lsp findReferences` on `getDb` in `src/db/connection.ts` to collect all call
  sites.
- `lsp rename` the function to `db` will not work because we want a value
  export, not a function. Instead:
  - edit `src/db/connection.ts` by hand (small, one-time).
  - then `lsp findReferences` again on the import alias `getDb` and replace each
    import + call with `db`.

**Target shape:**

```ts
// src/db/connection.ts
import { serverEnv as env } from '@/env.server'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: env.DATABASE_URL })
export const db = drizzle({ client: pool })
```

**Call-site rewrites:**

```ts
// before
import { getDb } from '@/db/connection'
const db = getDb()
await db.select()...

// after
import { db } from '@/db/connection'
await db.select()...
```

Affected files (verify with LSP): `src/lib/auth/config.ts`,
`src/lib/matching/profile.ts`, `src/lib/matching/server.ts`,
`src/lib/premium.ts`, `src/lib/zip-codes.ts`.

---

## 2. Remove `reset` search flag from signup routes

**Goal:** delete `reset` from schemas and route logic.

**LSP steps:**

- `lsp findReferences` on `reset` inside each signup route and
  `signupSearchSchema`.
- Delete the `.catch(undefined)` chain member, the `if (search.reset)` block,
  and any `reset` destructuring.

**Target shape:**

```ts
// src/routes/(app)/agent/signup/index.tsx
const signupSearchSchema = z.object({
	step: z
		.enum(['welcome', 'identity', 'market', 'compliance', 'peacePact', 'preview'])
		.default('welcome')
		.catch('welcome'),
})

export const Route = createFileRoute('/(app)/agent/signup/')({
	validateSearch: signupSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = [...]
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/agent/signup', search: { step: 'welcome' } })
		}
		// no reset logic
		// ...
	},
})
```

Do the same for `src/routes/(app)/consumer/signup/index.tsx`.

---

## 3. Deduplicate Google sign-in into `useGoogleSignIn`

**Goal:** make `components/auth/card.tsx` and
`components/signup/signup-form.tsx` use the existing hook.

**LSP steps:**

- `lsp findReferences` on `useGoogleSignIn`.
- `lsp findReferences` on the inline `handleGoogleSignIn` functions in both
  files.
- Replace inline state/handlers with the hook.

**Target shape:**

```tsx
const {
	signIn,
	isLoading: isGoogleLoading,
	isAvailable,
} = useGoogleSignIn({
	callbackURL,
	fallbackRedirect: resolvedRedirect,
})
```

May need to extend the hook props to support disabling the toast or changing the
unavailable message.

---

## 4. Split geography helpers into `src/lib/geography/zip.ts` and `src/lib/geography/states.ts`

**Goal:** move zip/city logic and US-state maps out of inline route files.

**LSP steps:**

- `lsp findReferences` on `stateNames`, `resolveStateCode`, `parseCityState`,
  `isValidZipCode`, etc.
- Create `src/lib/geography/states.ts` and `src/lib/geography/zip.ts`.
- Update imports and delete the moved code.

**Target shape:**

```ts
// src/lib/geography/states.ts
export const STATE_NAMES: Record<string, string> = { AL: 'Alabama', /* ... */ }
export const STATE_ABBREVIATIONS = new Set(Object.keys(STATE_NAMES))

export function resolveStateCode(...values: Array<string | undefined>) { ... }
```

```ts
// src/lib/geography/zip.ts
export function parseCityState(location: string) { ... }
export function isValidZipCode(zipCode: string) { ... }
export const loadCitySuggestions = createServerFn(...)
// ...
```

---

## 5. Remove Zod update schemas from profile mutations

**Goal:** stop using `z.record(...)` casts for `saveConsumerProfile` /
`saveAgentProfile` payloads. Zod should only validate dynamic I/O boundaries.

**LSP steps:**

- `lsp findReferences` on `consumerProfileUpdateSchema`,
  `agentProfileUpdateSchema`, `ConsumerProfileUpdate`, `AgentProfileUpdate`.
- Delete the schemas and the exported types derived from them.
- Keep `createServerFn` validators minimal (only validate dynamic inputs if
  truly untrusted) or remove validators where the caller is already typed.

**Target shape:**

```ts
// src/lib/matching/profile.ts
export type ConsumerProfileUpdate = Partial<
	Omit<ConsumerProfileInsert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

export type AgentProfileUpdate = Partial<
	Omit<AgentProfileInsert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

const saveConsumerProfile = createServerFn({ method: 'POST' })
	.validator((data: ConsumerProfileUpdate) => data)
	.handler(async ({ data }) => { ... })
```

Use the same pass-through validator for `saveAgentProfile` and
`saveAgentEssentials`.

Also remove the intersected schemas from `src/lib/drafts.ts`.

---

## 6. Replace placeholder match fields with real data

**Goal:** remove `location: 'Austin, TX'` and `date: 'Just now'` from
`src/lib/matching/server.ts`.

**LSP steps:**

- `lsp findReferences` on the `AgentMatchData` interface and the mapping
  function.
- Update the interface if necessary and fill from `row.agent`.

**Target shape:**

```ts
return {
	id: row.agent.id,
	name: row.user.name,
	location: row.agent.serviceAreas[0] ?? 'Unknown',
	date: new Date(row.agent.updatedAt).toLocaleDateString(),
	// ...
}
```

---

## 7. Leave debug fill button

No change. Keep `fillDebugData` in
`src/routes/(app)/agent/signup/-steps/intake-identity.tsx`.

---

## 8. Skip agent draft migration

No change. Rejected.

---

## 9. Defer session/premium/profile bundling

No implementation yet. Keep separate `authClient.useSession`,
`useQuery({ queryFn: isUserPremium })`, and profile loaders until the data
access pattern is clearer.

---

## 10. Remove `as` casts while keeping `satisfies`

**Goal:** purge `as Question[]`, `as z.ZodType<...>`, `as const` + `as`
patterns.

**LSP steps:**

- `lsp findReferences` on `consumerQuestions`, `agentQuestions`,
  `consumerQuestionFlow`, `agentQuestionFlow`.
- Rewrite types so `satisfies` provides the contract.

**Target shape:**

```ts
export const consumerQuestions = [
	// ...
] as const satisfies readonly Question[]

export const agentQuestions = [
	// ...
] as const satisfies readonly Question[]

export const consumerQuestionFlow = {
	label: 'Consumer Matching Quiz',
	questions: [...consumerQuestions],
} satisfies QuestionFlow

export const agentQuestionFlow = {
	label: 'Agent Flow',
	questions: [...agentQuestions],
} satisfies QuestionFlow
```

Keep `as const` on the question arrays so option keys stay narrowly typed. Only
remove the redundant `as Question[]` casts from the flow objects.

Also fix `src/lib/matching/profile.ts` by deleting the `as z.ZodType<...>` casts
(see item 5).

---

## 11. Move `callbackURL` construction into the Google click handler

**Goal:** remove the `typeof window` guard in `AuthCard` while keeping SSR safe.

**Problem:**

`AuthCard` computes `callbackURL` during render and uses
`window.location.origin`. Since `AuthCard` is rendered on the server during SSR,
it needs the `typeof window` guard. The guard is ugly but not wrong.

**Fix:**

Move the construction into the click handler. Event handlers only run on the
client, so `window.location.origin` is always available there.

Both `AuthCard` and `SignupForm` should share the existing `useGoogleSignIn`
hook. Update the hook to take `fallbackRedirect` and build the URL inside
`signIn`.

**LSP steps:**

- `lsp findReferences` on `callbackURL` in `src/components/auth/card.tsx`,
  `src/components/signup/signup-form.tsx`, and
  `src/hooks/use-google-sign-in.tsx`.
- In `useGoogleSignIn`, change the options from `callbackURL` to
  `fallbackRedirect` and build `callbackURL` inside `signIn`.
- In `AuthCard` and `SignupForm`, remove the inline Google handlers and state,
  and use the hook.

**Target shape:**

```ts
// src/hooks/use-google-sign-in.tsx
export type UseGoogleSignInOptions = {
	fallbackRedirect: string
}

export function useGoogleSignIn({ fallbackRedirect }: UseGoogleSignInOptions) {
	const [isLoading, setIsLoading] = useState(false)
	const [isAvailable, setIsAvailable] = useState(true)

	const signIn = async () => {
		setIsLoading(true)
		const callbackURL = new URL(
			fallbackRedirect,
			window.location.origin,
		).toString()

		try {
			const { data, error } = await authClient.signIn.social({
				provider: 'google',
				callbackURL,
			})

			if (error) {
				throw error
			}

			window.location.assign(data?.url ?? fallbackRedirect)
		} catch (error) {
			// ...provider-not-found handling...
		}
	}

	return { signIn, isLoading, isAvailable }
}
```

```ts
// src/components/auth/card.tsx
const {
	signIn,
	isLoading: isGoogleLoading,
	isAvailable,
} = useGoogleSignIn({
	fallbackRedirect: resolvedRedirect,
})
```

`SignupForm` should use the same hook. Each component may style the button
differently.

---

## Verification order

1. `vp check`
2. `vp test run --project unit`
3. Manual smoke: `vp dev` and hit `/agent/signup`, `/consumer/signup`, `/login`,
   `/consumer/dashboard/matches`.
