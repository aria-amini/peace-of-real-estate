import { ConsumerSidebarShell } from './dashboard/-components/shell'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/consumer/dashboard')({
	component: ConsumerDashboardLayout,
})

function ConsumerDashboardLayout() {
	return (
		<ConsumerSidebarShell>
			<Outlet />
		</ConsumerSidebarShell>
	)
}
