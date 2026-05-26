import { createFileRoute } from '@tanstack/react-router'

import { ConsumerSummary, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/summary')({
	component: () => <ConsumerSummary config={buyerConfig} />,
})
