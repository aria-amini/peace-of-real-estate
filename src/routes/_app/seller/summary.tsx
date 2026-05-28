import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConsumerSummary, sellerConfig } from '@/components/consumer-flow-pages'
import { isUserPremium } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/seller/summary')({
	beforeLoad: async () => {
		const premium = await isUserPremium()
		if (premium) {
			throw redirect({ to: '/match-activity' })
		}
	},
	component: () => <ConsumerSummary config={sellerConfig} />,
})
