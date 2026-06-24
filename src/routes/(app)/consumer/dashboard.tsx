import { ConsumerSidebar } from './dashboard/-components/sidebar'
import { DashboardShell } from '@/components/dashboard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/consumer/dashboard')({
	component: ConsumerDashboardLayout,
})

function ConsumerDashboardLayout() {
	return (
		<DashboardShell sidebar={<ConsumerSidebar />}>
			<Outlet />
		</DashboardShell>
	)
}
