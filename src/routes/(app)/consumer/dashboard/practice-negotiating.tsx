import { createFileRoute } from '@tanstack/react-router'

import { WipMessage } from '@/components/wip-message'

export const Route = createFileRoute(
	'/(app)/consumer/dashboard/practice-negotiating',
)({
	component: PracticeNegotiating,
})

function PracticeNegotiating() {
	return <WipMessage title="Practice Negotiating" />
}
