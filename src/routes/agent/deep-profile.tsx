import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { AgentDeepProfile } from '@/components/agent-deep-profile-pages'
import { getCurrentSession } from '@/lib/auth/functions'
import { loadAgentProfile } from '@/lib/matching/profile.db'

const deepProfileSearchSchema = z.object({
	step: z
		.enum([
			'communication',
			'values',
			'personality',
			'service',
			'story',
			'priorities',
			'complete',
		])
		.default('communication')
		.catch('communication'),
})

export const Route = createFileRoute('/agent/deep-profile')({
	validateSearch: deepProfileSearchSchema,
	beforeLoad: async ({ search }) => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({ to: '/login' })
		}

		const profile = await loadAgentProfile()
		if (!profile) {
			throw redirect({ to: '/agent/intake' })
		}

		const validSteps = [
			'communication',
			'values',
			'personality',
			'service',
			'story',
			'priorities',
			'complete',
		] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({
				to: '/agent/deep-profile',
				search: { step: 'communication' },
			})
		}
	},
	component: DeepProfileRoute,
})

function DeepProfileRoute() {
	const search = Route.useSearch()
	return <AgentDeepProfile step={search.step} />
}
