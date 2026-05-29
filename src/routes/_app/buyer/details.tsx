import { createFileRoute } from '@tanstack/react-router'

import { ConsumerDetails, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/details')({
	component: () => <ConsumerDetails config={buyerConfig} />,
})
