import { createFileRoute, redirect } from '@tanstack/react-router'

import { sellerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/seller/')({
	beforeLoad: () => {
		throw redirect({ to: `${sellerConfig.basePath}/intro` })
	},
})
