import { createFileRoute } from '@tanstack/react-router'

import { ConsumerUnlock, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/unlock')({
	component: () => <ConsumerUnlock config={buyerConfig} />,
})
