import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { ConsumerIntake, buyerConfig } from '@/components/consumer-flow-pages'

const intakeSearchSchema = z.object({
	step: z.enum(['intro', 'situation', 'quiz']).default('intro').catch('intro'),
})

export const Route = createFileRoute('/_app/buyer/intake')({
	validateSearch: intakeSearchSchema,
	beforeLoad: ({ search }) => {
		const validSteps = ['intro', 'situation', 'quiz'] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/buyer/intake', search: { step: 'intro' } })
		}
	},
	component: IntakeRoute,
})

function IntakeRoute() {
	const search = Route.useSearch()
	return <ConsumerIntake config={buyerConfig} step={search.step} />
}
