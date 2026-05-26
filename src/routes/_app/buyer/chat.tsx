import { createFileRoute } from '@tanstack/react-router'

import { ConsumerChat, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/chat')({
	component: () => <ConsumerChat config={buyerConfig} />,
})
