import { MessageSquare } from 'lucide-react'

import {
	DashboardShell,
	DashboardSidebar,
	type SidebarItem,
} from '@/components/dashboard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

const agentItems: SidebarItem[] = [
	{
		label: 'Introductions',
		icon: MessageSquare,
		href: '/agent/dashboard/introductions',
	},
]

export const Route = createFileRoute('/(app)/agent/dashboard')({
	component: AgentDashboardLayout,
})

function AgentDashboardLayout() {
	return (
		<DashboardShell
			sidebar={
				<DashboardSidebar
					items={agentItems}
					aiItems={[]}
					profileLabel="Agent dashboard"
					profileHint="Agent dashboard"
				/>
			}
		>
			<Outlet />
		</DashboardShell>
	)
}
