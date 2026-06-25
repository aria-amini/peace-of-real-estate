import { ArrowRightLeft, Search, Users } from 'lucide-react'

import {
	DashboardShell,
	DashboardSidebar,
	type SidebarItem,
} from '@/components/dashboard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

const consumerItems: SidebarItem[] = [
	{ label: 'Matches', icon: Users, href: '/consumer/dashboard/matches' },
	{
		label: 'Introductions',
		icon: ArrowRightLeft,
		href: '/consumer/dashboard/introductions',
	},
	{
		label: 'Search Preferences',
		icon: Search,
		href: '/consumer/dashboard/search-preferences',
	},
]

export const Route = createFileRoute('/(app)/consumer/dashboard')({
	component: ConsumerDashboardLayout,
})

function ConsumerDashboardLayout() {
	return (
		<DashboardShell
			sidebar={
				<DashboardSidebar
					items={consumerItems}
					profileLabel="Your account"
					profileHint="Create a profile to save matches"
				/>
			}
		>
			<Outlet />
		</DashboardShell>
	)
}
