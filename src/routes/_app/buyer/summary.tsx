import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConsumerSummary, buyerConfig } from '@/components/consumer-flow-pages'
import { isUserPremium } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/buyer/summary')({
	beforeLoad: async () => {
		const premium = await isUserPremium()
		if (premium) {
			throw redirect({ to: '/matches' })
		}
	},
	component: () => <ConsumerSummary config={buyerConfig} />,
})
