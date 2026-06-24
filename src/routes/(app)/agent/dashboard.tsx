import { AgentSidebarShell } from './dashboard/-components/shell'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/agent/dashboard')({
	component: AgentDashboardLayout,
})

function AgentDashboardLayout() {
	return (
		<AgentSidebarShell>
			<Outlet />
		</AgentSidebarShell>
	)
}
