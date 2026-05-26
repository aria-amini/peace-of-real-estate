import { createFileRoute } from '@tanstack/react-router'

import { ConsumerIntro, sellerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/seller/intro')({
	component: () => <ConsumerIntro config={sellerConfig} />,
})
