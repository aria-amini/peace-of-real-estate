import { AgentSidebarShell } from './dashboard/-components/shell'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentSession } from '@/lib/auth/functions'

export const Route = createFileRoute('/(app)/agent/dashboard')({
	component: AgentDashboardLayout,
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({ to: '/login', search: { redirect: '/agent/dashboard' } })
		}
	},
})

function AgentDashboardLayout() {
	return (
		<AgentSidebarShell>
			<Outlet />
		</AgentSidebarShell>
	)
}
