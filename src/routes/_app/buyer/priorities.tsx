import { createFileRoute } from '@tanstack/react-router'

import {
	ConsumerPriorities,
	buyerConfig,
} from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/priorities')({
	component: () => <ConsumerPriorities config={buyerConfig} />,
})
