import { createFileRoute } from '@tanstack/react-router'

import {
	ConsumerResumeGate,
	sellerConfig,
} from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/seller/')({
	component: () => <ConsumerResumeGate config={sellerConfig} />,
})
