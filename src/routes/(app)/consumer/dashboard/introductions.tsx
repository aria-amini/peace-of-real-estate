import { createFileRoute } from '@tanstack/react-router'

import { WipMessage } from '@/components/wip-message'

export const Route = createFileRoute('/(app)/consumer/dashboard/introductions')(
	{
		component: Introductions,
	},
)

function Introductions() {
	return <WipMessage title="Introductions" />
}
