import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConsumerResults, sellerConfig } from '@/components/consumer-flow-pages'
import { getCurrentSession } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/seller/results')({
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({
				to: '/signup',
				search: { redirect: '/seller/results' },
			})
		}
	},
	component: () => <ConsumerResults config={sellerConfig} />,
})
