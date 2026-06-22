import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import {
	ConsumerIntake,
	consumerConfig,
} from '@/components/consumer-flow-pages'
import { clearConsumerDraft } from '@/lib/consumer-draft-storage'
import { getCurrentSession } from '@/lib/auth/functions'
import { loadConsumerProfile } from '@/lib/matching/profile.db'

const intakeSearchSchema = z.object({
	step: z.enum(['intro', 'situation', 'quiz']).default('intro').catch('intro'),
	edit: z.boolean().optional().catch(undefined),
	reset: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/consumer/intake')({
	validateSearch: intakeSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = ['intro', 'situation', 'quiz'] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/consumer/intake', search: { step: 'intro' } })
		}

		if (search.reset) {
			clearConsumerDraft()
		}

		if (!search.edit) {
			const session = await getCurrentSession()
			if (session) {
				const profile = await loadConsumerProfile()

				if (profile) {
					throw redirect({ to: '/matches' })
				}
			}
		}
	},
	component: IntakeRoute,
})

function IntakeRoute() {
	const search = Route.useSearch()
	return (
		<ConsumerIntake
			config={consumerConfig}
			step={search.step}
			reset={search.reset ?? false}
		/>
	)
}
