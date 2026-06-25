import { Home, MessageSquare, ShieldCheck, User } from 'lucide-react'

import {
	DashboardShell,
	DashboardSidebar,
	type SidebarItem,
} from '@/components/dashboard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

const agentItems: SidebarItem[] = [
	{ label: 'Dashboard', icon: Home, href: '/agent/dashboard' },
	{
		label: 'Introductions',
		icon: MessageSquare,
		href: '/agent/dashboard/introductions',
	},
	{ label: 'Profile', icon: User, href: '/agent/dashboard/profile' },
	{
		label: 'Compliance',
		icon: ShieldCheck,
		href: '/agent/dashboard/compliance',
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
					profileLabel="Agent dashboard"
					profileHint="Agent dashboard"
				/>
			}
		>
			<Outlet />
		</DashboardShell>
	)
}
