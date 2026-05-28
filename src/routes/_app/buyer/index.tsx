import { createFileRoute } from '@tanstack/react-router'

import {
	ConsumerResumeGate,
	buyerConfig,
} from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/')({
	component: () => <ConsumerResumeGate config={buyerConfig} />,
})
