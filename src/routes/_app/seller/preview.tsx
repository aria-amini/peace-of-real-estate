import { createFileRoute } from '@tanstack/react-router'

import { ConsumerPreview, sellerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/seller/preview')({
	component: () => <ConsumerPreview config={sellerConfig} />,
})
