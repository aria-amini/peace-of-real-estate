import { AgentSidebarShell } from './dashboard/-components/shell'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/agent/dashboard')({
	component: AgentDashboardLayout,
})

function AgentDashboardLayout() {
	return (
		<AgentSidebarShell>
			<Outlet />
		</AgentSidebarShell>
	)
}
