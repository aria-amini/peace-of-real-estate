import { createFileRoute } from '@tanstack/react-router'

import { ConsumerPreview, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/preview')({
	component: () => <ConsumerPreview config={buyerConfig} />,
})
