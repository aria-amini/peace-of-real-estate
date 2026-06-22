import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConsumerPayment } from '@/components/consumer-flow-pages'
import { getCurrentSession } from '@/lib/auth/functions'

export const Route = createFileRoute('/consumer/payment')({
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({
				to: '/matches',
			})
		}
	},
	component: () => <ConsumerPayment />,
})
