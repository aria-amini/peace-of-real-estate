import { createFileRoute } from '@tanstack/react-router'

import { ConsumerDetails, sellerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/seller/details')({
	component: () => <ConsumerDetails config={sellerConfig} />,
})
