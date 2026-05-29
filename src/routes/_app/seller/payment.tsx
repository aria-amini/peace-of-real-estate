import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConsumerPayment, sellerConfig } from '@/components/consumer-flow-pages'
import { getCurrentSession } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/seller/payment')({
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({
				to: '/signup',
				search: { redirect: '/seller/summary' },
			})
		}
	},
	component: () => <ConsumerPayment config={sellerConfig} />,
})
