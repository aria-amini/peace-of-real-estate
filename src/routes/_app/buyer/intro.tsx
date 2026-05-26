import { createFileRoute } from '@tanstack/react-router'

import { ConsumerIntro, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/intro')({
	component: () => <ConsumerIntro config={buyerConfig} />,
})
