import { ArrowRightLeft, Search, Users } from 'lucide-react'

import { DashboardSidebar, type SidebarItem } from '@/components/dashboard'

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

export function ConsumerSidebar() {
	return (
		<DashboardSidebar
			items={consumerItems}
			profileLabel="Your account"
			profileHint="Create a profile to save matches"
		/>
	)
}
