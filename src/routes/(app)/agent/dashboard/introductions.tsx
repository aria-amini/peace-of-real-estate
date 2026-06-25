import { createFileRoute } from '@tanstack/react-router'

import { WipMessage } from '@/components/wip-message'

export const Route = createFileRoute('/(app)/agent/dashboard/introductions')({
	component: AgentIntroductions,
})

function AgentIntroductions() {
	return <WipMessage title="Introductions" />
}
