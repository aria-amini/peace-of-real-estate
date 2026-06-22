import { ConsumerSidebarShell } from './dashboard/-shell'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/consumer/dashboard')({
	component: ConsumerDashboardLayout,
})

function ConsumerDashboardLayout() {
	return (
		<ConsumerSidebarShell>
			<Outlet />
		</ConsumerSidebarShell>
	)
}
