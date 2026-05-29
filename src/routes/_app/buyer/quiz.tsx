import { createFileRoute } from '@tanstack/react-router'

import { ConsumerQuiz, buyerConfig } from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/_app/buyer/quiz')({
	component: () => <ConsumerQuiz config={buyerConfig} />,
})
