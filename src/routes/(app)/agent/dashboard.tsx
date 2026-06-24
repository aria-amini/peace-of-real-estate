import { AgentSidebar } from './dashboard/-components/sidebar'
import { DashboardShell } from '@/components/dashboard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/agent/dashboard')({
	component: AgentDashboardLayout,
})

function AgentDashboardLayout() {
	return (
		<DashboardShell sidebar={<AgentSidebar />}>
			<Outlet />
		</DashboardShell>
	)
}
