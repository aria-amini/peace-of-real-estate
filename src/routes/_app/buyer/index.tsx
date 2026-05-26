import { createFileRoute, redirect } from '@tanstack/react-router'

import { buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/')({
	beforeLoad: () => {
		throw redirect({ to: `${buyerConfig.basePath}/intro` })
	},
})
