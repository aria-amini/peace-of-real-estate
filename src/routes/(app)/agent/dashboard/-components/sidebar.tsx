import { Home, MessageSquare, ShieldCheck, User } from 'lucide-react'

import { DashboardSidebar, type SidebarItem } from '@/components/dashboard'

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

export function AgentSidebar() {
	return (
		<DashboardSidebar
			items={agentItems}
			profileLabel="Agent dashboard"
			profileHint="Agent dashboard"
		/>
	)
}
