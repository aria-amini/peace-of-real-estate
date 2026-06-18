import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { ConsumerIntake, buyerConfig } from '@/components/consumer-flow-pages'
import { getCurrentSession } from '@/lib/auth/functions'
import { getUserSettings } from '@/lib/matching/settings'

const intakeSearchSchema = z.object({
	step: z.enum(['intro', 'situation', 'quiz']).default('intro').catch('intro'),
	edit: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/buyer/intake')({
	validateSearch: intakeSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = ['intro', 'situation', 'quiz'] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/buyer/intake', search: { step: 'intro' } })
		}

		if (!search.edit) {
			const session = await getCurrentSession()
			if (session) {
				const userSettings = await getUserSettings()
				const hasSavedAnswers =
					Object.keys(userSettings?.answers ?? {}).length > 0

				if (hasSavedAnswers) {
					throw redirect({ to: '/matches' })
				}
			}
		}
	},
	component: IntakeRoute,
})

function IntakeRoute() {
	const search = Route.useSearch()
	return <ConsumerIntake config={buyerConfig} step={search.step} />
}
