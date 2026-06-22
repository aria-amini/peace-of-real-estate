import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { AgentIntake, agentConfig } from '@/components/agent-flow-pages'
import { clearAgentDraft } from '@/lib/agent-draft-storage'
import { getCurrentSession } from '@/lib/auth/functions'
import { loadAgentProfile } from '@/lib/matching/profile.db'

const intakeSearchSchema = z.object({
	step: z.enum(['intro', 'situation', 'quiz']).default('intro').catch('intro'),
	edit: z.boolean().optional().catch(undefined),
	reset: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/agent/intake')({
	validateSearch: intakeSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = ['intro', 'situation', 'quiz'] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/agent/intake', search: { step: 'intro' } })
		}

		if (search.reset) {
			clearAgentDraft()
		}

		if (!search.edit) {
			const session = await getCurrentSession()
			if (session) {
				const profile = await loadAgentProfile()

				if (profile?.workingStyle) {
					throw redirect({ to: '/account' })
				}
			}
		}
	},
	component: IntakeRoute,
})

function IntakeRoute() {
	const search = Route.useSearch()
	return (
		<AgentIntake
			config={agentConfig}
			step={search.step}
			reset={search.reset ?? false}
		/>
	)
}
