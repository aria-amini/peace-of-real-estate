import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConsumerResults, buyerConfig } from '@/components/consumer-flow-pages'
import { getCurrentSession } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/buyer/results')({
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({
				to: '/signup',
				search: { redirect: '/buyer/results' },
			})
		}
	},
	component: () => <ConsumerResults config={buyerConfig} />,
})
