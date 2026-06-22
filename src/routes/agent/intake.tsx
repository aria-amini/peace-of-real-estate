import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { AgentIntake } from './-components/flow-pages'
import { clearAgentDraft } from '@/lib/drafts'
import { getCurrentSession } from '@/lib/auth/functions'
import { loadAgentProfile } from '@/lib/matching/profile.db'

const intakeSearchSchema = z.object({
	step: z
		.enum(['welcome', 'identity', 'market', 'compliance', 'peacePact'])
		.default('welcome')
		.catch('welcome'),
	reset: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/agent/intake')({
	validateSearch: intakeSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = [
			'welcome',
			'identity',
			'market',
			'compliance',
			'peacePact',
		] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/agent/intake', search: { step: 'welcome' } })
		}

		if (search.reset) {
			clearAgentDraft()
		}

		const session = await getCurrentSession()
		if (session) {
			const profile = await loadAgentProfile()
			if (
				profile?.status === 'active' ||
				profile?.status === 'enriched' ||
				profile?.status === 'essentials_submitted'
			) {
				throw redirect({ to: '/agent/dashboard' })
			}
		}
	},
	component: IntakeRoute,
})

function IntakeRoute() {
	const search = Route.useSearch()
	return <AgentIntake step={search.step} reset={search.reset ?? false} />
}
