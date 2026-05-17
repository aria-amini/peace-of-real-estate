import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/agent/')({
	component: AgentIndex,
})

function AgentIndex() {
	return <Navigate to="/agent/priorities" />
}
