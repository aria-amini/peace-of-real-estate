import { createFileRoute } from '@tanstack/react-router'

import { ConsumerUnlock, sellerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/seller/unlock')({
	component: () => <ConsumerUnlock config={sellerConfig} />,
})
